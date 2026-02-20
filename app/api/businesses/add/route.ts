import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Simple metadata extraction from HTML
function extractMeta(html: string) {
  const get = (pattern: RegExp) => {
    const match = html.match(pattern);
    return match?.[1]?.trim() || "";
  };

  const title =
    get(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
    get(/<title[^>]*>([^<]+)<\/title>/i);

  const description =
    get(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
    get(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);

  // Try to find phone numbers
  const phoneMatch = html.match(
    /(?:tel:|phone|call)[^"]*?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i
  ) || html.match(/(\(\d{3}\)\s?\d{3}-\d{4})/);
  const phone = phoneMatch?.[1] || "";

  // Try to find address
  const addressMatch = html.match(
    /(\d+\s+[\w\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Ln|Ct|Pkwy|Hwy)[.,]?\s*(?:Suite|Ste|#)?\s*\d*)/i
  );
  const address = addressMatch?.[1] || "";

  return {
    name: title.replace(/\s*[-|–—].*$/, "").slice(0, 100),
    description: description.slice(0, 500),
    phone,
    address,
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();

    // ─── Scrape URL ──────────────────────────────────────
    if (body.action === "scrape") {
      const { url } = body;
      if (!url) {
        return NextResponse.json({ error: "URL required" }, { status: 400 });
      }

      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; PlatinumDirectory/1.0)",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          return NextResponse.json(
            { error: "Could not reach that website" },
            { status: 400 }
          );
        }

        const html = await res.text();
        const meta = extractMeta(html);

        return NextResponse.json(meta);
      } catch {
        return NextResponse.json(
          { error: "Could not fetch that URL. Check the address and try again." },
          { status: 400 }
        );
      }
    }

    // ─── Create Business ─────────────────────────────────
    if (body.action === "create") {
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { name, category, address, city, state, zip_code, phone, website, description } = body;

      if (!name?.trim()) {
        return NextResponse.json({ error: "Business name is required" }, { status: 400 });
      }

      const admin = createAdminClient();
      const slug = slugify(name) + "-" + Date.now().toString(36);

      // Resolve category_id from slug
      let category_id = null;
      if (category) {
        const { data: cat } = await admin
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        category_id = cat?.id || null;
      }

      const { data: business, error: insertError } = await admin
        .from("businesses")
        .insert({
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          category_id,
          address: address?.trim() || null,
          city: city?.trim() || "Temecula",
          state: state?.trim() || "CA",
          zip_code: zip_code?.trim() || null,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          tier: "free",
          is_active: false,
          is_featured: false,
          is_claimed: true,
          claimed_by: user.id,
          owner_user_id: user.id,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          average_rating: 0,
          review_count: 0,
          outreach_status: "pending_verification",
        })
        .select("id, slug")
        .single();

      if (insertError) {
        console.error("Business insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Ensure owner_user_id is set (guard against RLS/triggers stripping it)
      if (user?.id && business?.id) {
        await admin
          .from("businesses")
          .update({ owner_user_id: user.id })
          .eq("id", business.id);
      }

      // Update user profile to business_owner
      await admin
        .from("profiles")
        .update({ user_type: "business_owner" })
        .eq("id", user.id)
        .eq("user_type", "customer");

      return NextResponse.json({ success: true, business });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Business add error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
