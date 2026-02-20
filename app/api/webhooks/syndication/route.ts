import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syndicatePost } from "@/lib/syndication/syndicate";

export async function POST(req: NextRequest) {
  try {
    const { event, businessId, offerId, data: eventData } = await req.json();

    if (!event) {
      return NextResponse.json({ error: "event required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    switch (event) {
      case "business_verified":
      case "business_upgraded": {
        if (!businessId) {
          return NextResponse.json({ error: "businessId required" }, { status: 400 });
        }

        const { data: biz } = await adminClient
          .from("businesses")
          .select("*, categories(name)")
          .eq("id", businessId)
          .single();

        if (!biz || biz.tier === "free") {
          return NextResponse.json({ error: "Business not found or free tier" }, { status: 400 });
        }

        const postType = `welcome_${biz.tier === "platinum_elite" ? "elite" : biz.tier === "platinum_partner" ? "partner" : "verified"}`;
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

        return NextResponse.json({ event, results });
      }

      case "offer_published": {
        if (!offerId) {
          return NextResponse.json({ error: "offerId required" }, { status: 400 });
        }

        const { data: offer } = await adminClient
          .from("smart_offers")
          .select("*, businesses(id, name, slug, city, description, tier, cover_image_url, categories(name))")
          .eq("id", offerId)
          .single();

        if (!offer || !offer.businesses) {
          return NextResponse.json({ error: "Offer not found" }, { status: 404 });
        }

        const biz = offer.businesses as any;
        const results = await syndicatePost("smart_offer_new", {
          id: biz.id,
          name: biz.name,
          slug: biz.slug,
          category: biz.categories?.name,
          city: biz.city,
          description: biz.description,
          tier: biz.tier,
          cover_image_url: biz.cover_image_url,
        });

        return NextResponse.json({ event, results });
      }

      case "giveaway_started": {
        const results = await syndicatePost("weekly_giveaway", {
          id: "system",
          name: "Platinum Directory",
          slug: "giveaway",
          description: "Weekly $250 giveaway is live!",
        });

        return NextResponse.json({ event, results });
      }

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 });
    }
  } catch (err) {
    console.error("Syndication webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
