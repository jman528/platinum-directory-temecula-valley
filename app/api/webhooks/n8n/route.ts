import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syndicatePost } from "@/lib/syndication/syndicate";

export async function POST(req: NextRequest) {
  // Verify n8n webhook secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "action required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    switch (action) {
      case "syndicate": {
        if (!data?.businessId) {
          return NextResponse.json({ error: "businessId required" }, { status: 400 });
        }

        const { data: biz } = await adminClient
          .from("businesses")
          .select("*, categories(name)")
          .eq("id", data.businessId)
          .single();

        if (!biz) {
          return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const postType = data.postType || "welcome_verified";
        const results = await syndicatePost(postType, {
          id: biz.id,
          name: biz.name,
          slug: biz.slug,
          category: (biz.categories as any)?.name,
          city: biz.city,
          description: biz.description,
          tier: biz.tier,
          cover_image_url: biz.cover_image_url,
        });

        return NextResponse.json({ action, results });
      }

      case "update_citation_status": {
        if (!data?.citationId || !data?.status) {
          return NextResponse.json({ error: "citationId and status required" }, { status: 400 });
        }

        const { error } = await adminClient
          .from("citation_submissions")
          .update({ status: data.status })
          .eq("id", data.citationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ action, success: true });
      }

      case "generate_image": {
        if (!data?.businessId) {
          return NextResponse.json({ error: "businessId required" }, { status: 400 });
        }

        const { data: biz } = await adminClient
          .from("businesses")
          .select("name, slug, city, tier, categories(name)")
          .eq("id", data.businessId)
          .single();

        if (!biz) {
          return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://platinumdirectorytemeculavalley.com"}/api/syndication/generate-image?name=${encodeURIComponent(biz.name)}&category=${encodeURIComponent((biz.categories as any)?.name || "Local Business")}&city=${encodeURIComponent(biz.city || "Temecula")}&tier=${encodeURIComponent(biz.tier || "verified")}`;

        return NextResponse.json({ action, imageUrl });
      }

      case "send_email": {
        // Placeholder for email integration via Postmark
        return NextResponse.json({
          action,
          success: true,
          message: "Email trigger received — connect to Postmark in settings",
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("N8N webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
