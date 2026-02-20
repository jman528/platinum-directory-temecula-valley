import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { POINTS_CONFIG } from "@/lib/points-config";

const ACTION_POINTS: Record<string, number> = {
  share_listing: POINTS_CONFIG.SHARE_LISTING,
  daily_login: POINTS_CONFIG.DAILY_LOGIN,
  referral_signup: POINTS_CONFIG.REFERRAL_SIGNUP,
  google_review: POINTS_CONFIG.GOOGLE_REVIEW,
  social_follow: POINTS_CONFIG.SOCIAL_FOLLOW,
  first_share: POINTS_CONFIG.FIRST_SHARE_BONUS,
  first_giveaway: POINTS_CONFIG.FIRST_GIVEAWAY_ENTRY,
  complete_profile: POINTS_CONFIG.COMPLETE_PROFILE_BONUS,
  phone_verify: POINTS_CONFIG.PHONE_VERIFY_BONUS,
};

const ONE_TIME_ACTIONS = new Set([
  "google_review", "first_share", "first_giveaway",
  "complete_profile", "phone_verify",
]);

export async function POST(req: NextRequest) {
  try {
    const { action, entity_id, metadata } = await req.json();

    if (!action || !ACTION_POINTS[action]) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const points = ACTION_POINTS[action];

    // Check one-time actions
    if (ONE_TIME_ACTIONS.has(action)) {
      const { data: existing } = await adminClient
        .from("points_ledger")
        .select("id")
        .eq("user_id", user.id)
        .eq("action", action)
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: "Already claimed", points_awarded: 0 });
      }
    }

    // Check daily limits for share_listing
    if (action === "share_listing") {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await adminClient
        .from("points_ledger")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "share_listing")
        .gte("created_at", `${today}T00:00:00`);
      if ((count || 0) >= POINTS_CONFIG.SHARE_DAILY_MAX) {
        return NextResponse.json({ error: "Daily limit reached", points_awarded: 0 });
      }
    }

    // Award points
    await adminClient.from("points_ledger").insert({
      user_id: user.id,
      points,
      action,
      related_entity_id: entity_id || null,
      metadata: metadata || null,
    });

    // Update profile balance
    const { data: profile } = await adminClient
      .from("profiles")
      .select("points_balance, total_points_earned")
      .eq("id", user.id)
      .single();

    const newBalance = (profile?.points_balance || 0) + points;
    const newTotal = (profile?.total_points_earned || 0) + points;

    await adminClient
      .from("profiles")
      .update({ points_balance: newBalance, total_points_earned: newTotal })
      .eq("id", user.id);

    return NextResponse.json({
      points_awarded: points,
      new_balance: newBalance,
      action,
    });
  } catch (err) {
    console.error("Points award error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
