import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Cache for 5 minutes
let cachedResponse: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    // Return cached response if fresh
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedResponse.data);
    }

    const adminClient = createAdminClient();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 3600000).toISOString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    // Run queries in parallel
    const [
      pointsResult,
      upgradesResult,
      offerClaimsResult,
      newBusinessResult,
      multiplierResult,
      giveawayResult,
    ] = await Promise.all([
      // Recent points earned (last 24h, top earners by first name)
      adminClient
        .from("points_ledger")
        .select("points, user_id, profiles(full_name)")
        .gte("created_at", oneDayAgo)
        .gt("points", 0)
        .order("points", { ascending: false })
        .limit(5),

      // Recent business tier upgrades (last 7 days)
      adminClient
        .from("businesses")
        .select("name, tier")
        .gte("updated_at", oneWeekAgo)
        .neq("tier", "free")
        .order("updated_at", { ascending: false })
        .limit(3),

      // Smart offer claims count (today)
      adminClient
        .from("smart_offer_claims")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneDayAgo),

      // New business signups (this week)
      adminClient
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo),

      // Active multiplier events
      adminClient
        .from("points_multiplier_events")
        .select("id, name, multiplier, end_date")
        .lte("start_date", now.toISOString())
        .gte("end_date", now.toISOString())
        .limit(1),

      // Giveaway entry count (this week)
      adminClient
        .from("giveaway_entries")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo),
    ]);

    const items: Array<{ type: string; text: string; timestamp: string }> = [];

    // Points earned
    if (pointsResult.data) {
      for (const entry of pointsResult.data) {
        const profile = entry.profiles as any;
        const firstName = profile?.full_name?.split(" ")[0] || "Someone";
        items.push({
          type: "points_earned",
          text: `🎉 ${firstName} just earned ${entry.points.toLocaleString()} points!`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Business upgrades
    if (upgradesResult.data) {
      for (const biz of upgradesResult.data) {
        const tierLabel = biz.tier === "verified_platinum" ? "Verified"
          : biz.tier === "platinum_partner" ? "Partner"
          : biz.tier === "platinum_elite" ? "Elite" : biz.tier;
        items.push({
          type: "business_upgrade",
          text: `🏪 ${biz.name} upgraded to ${tierLabel}!`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Smart offer sales
    const offerCount = offerClaimsResult.count || 0;
    if (offerCount > 0) {
      items.push({
        type: "smart_offer_sales",
        text: `🎫 ${offerCount} Smart Offer${offerCount !== 1 ? "s" : ""} sold today`,
        timestamp: new Date().toISOString(),
      });
    }

    // New businesses
    const newBizCount = newBusinessResult.count || 0;
    if (newBizCount > 0) {
      items.push({
        type: "new_business",
        text: `👥 ${newBizCount} new business${newBizCount !== 1 ? "es" : ""} joined this week`,
        timestamp: new Date().toISOString(),
      });
    }

    // Active multiplier
    const activeMultiplier = multiplierResult.data?.[0] || null;
    if (activeMultiplier) {
      items.push({
        type: "multiplier",
        text: `🔥 ${activeMultiplier.multiplier}x points${activeMultiplier.name ? ` — ${activeMultiplier.name}` : ""}!`,
        timestamp: new Date().toISOString(),
      });
    }

    // Giveaway entries
    const giveawayCount = giveawayResult.count || 0;
    if (giveawayCount > 0) {
      items.push({
        type: "giveaway",
        text: `🎰 ${giveawayCount.toLocaleString()} giveaway entries this week`,
        timestamp: new Date().toISOString(),
      });
    }

    // Supplement with platform stats if sparse
    if (items.length < 3) {
      items.push(
        { type: "stat", text: "🏪 7,831 businesses listed across Temecula Valley", timestamp: now.toISOString() },
        { type: "stat", text: "🌎 11 cities covered in the Valley", timestamp: now.toISOString() },
        { type: "stat", text: "🎰 $250 giveaway this week — enter free!", timestamp: now.toISOString() },
      );
    }

    const response = { items, activeMultiplier };

    // Cache the response
    cachedResponse = { data: response, timestamp: Date.now() };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Activity feed error:", err);
    // Return fallback items on error
    return NextResponse.json({
      items: [
        { type: "stat", text: "🏪 7,831 businesses listed across Temecula Valley", timestamp: new Date().toISOString() },
        { type: "stat", text: "🌎 11 cities covered in the Valley", timestamp: new Date().toISOString() },
        { type: "stat", text: "🎰 $250 giveaway this week — enter free!", timestamp: new Date().toISOString() },
        { type: "stat", text: "🎉 New: Smart Offers let you save before you visit", timestamp: new Date().toISOString() },
        { type: "stat", text: "⭐ Premium listings now available for local businesses", timestamp: new Date().toISOString() },
      ],
      activeMultiplier: null,
    });
  }
}
