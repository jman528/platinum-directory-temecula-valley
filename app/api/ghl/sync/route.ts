import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEnabled } from "@/lib/feature-flags";

const GHL_API = "https://rest.gohighlevel.com/v1";

export async function POST(req: NextRequest) {
  try {
    const flag = await isEnabled("ghl_integration");
    if (!flag) {
      return NextResponse.json({ error: "GHL integration not enabled" }, { status: 400 });
    }

    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GHL API key not configured" }, { status: 500 });
    }

    const { business_id, action } = await req.json();
    const adminClient = createAdminClient();

    if (action === "sync_all") {
      // Bulk sync: push all businesses with outreach_status changes to GHL
      const { data: businesses } = await adminClient
        .from("businesses")
        .select("id, name, phone, email, city, category_id, tier, outreach_status, ghl_contact_id")
        .not("outreach_status", "eq", "not_contacted")
        .limit(100);

      let synced = 0;
      for (const biz of businesses || []) {
        try {
          if (biz.ghl_contact_id) {
            // Update existing contact
            await fetch(`${GHL_API}/contacts/${biz.ghl_contact_id}`, {
              method: "PUT",
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                name: biz.name,
                phone: biz.phone,
                email: biz.email,
                tags: [biz.tier, biz.outreach_status],
              }),
            });
          } else {
            // Create new contact
            const res = await fetch(`${GHL_API}/contacts/`, {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                name: biz.name,
                phone: biz.phone,
                email: biz.email,
                tags: [biz.tier, biz.outreach_status, "platinum_directory"],
              }),
            });
            const data = await res.json();
            if (data.contact?.id) {
              await adminClient
                .from("businesses")
                .update({ ghl_contact_id: data.contact.id })
                .eq("id", biz.id);
            }
          }
          synced++;
        } catch {
          // Continue with next business on error
        }
      }
      return NextResponse.json({ success: true, synced });
    }

    if (business_id) {
      // Sync single business
      const { data: biz } = await adminClient
        .from("businesses")
        .select("*")
        .eq("id", business_id)
        .single();

      if (!biz) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      const contactData = {
        name: biz.name,
        phone: biz.phone,
        email: biz.email,
        address1: biz.address,
        city: biz.city,
        state: biz.state,
        tags: [biz.tier, biz.outreach_status, "platinum_directory"],
      };

      if (biz.ghl_contact_id) {
        await fetch(`${GHL_API}/contacts/${biz.ghl_contact_id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        });
      } else {
        const res = await fetch(`${GHL_API}/contacts/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        });
        const data = await res.json();
        if (data.contact?.id) {
          await adminClient
            .from("businesses")
            .update({ ghl_contact_id: data.contact.id })
            .eq("id", business_id);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing business_id or action" }, { status: 400 });
  } catch (err) {
    console.error("GHL sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
