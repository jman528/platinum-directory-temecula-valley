import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const POINTS_MAP: Record<string, number> = {
  share_facebook: 100,
  share_twitter: 100,
  share_linkedin: 100,
  review_google: 250,
  review_yelp: 250,
  review_tripadvisor: 250,
  follow_facebook: 50,
  follow_instagram: 50,
  follow_tiktok: 50,
  follow_youtube: 50,
};

export async function POST(req: NextRequest) {
  try {
    const { action_type } = await req.json();

    if (!action_type || !POINTS_MAP[action_type]) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Check if already claimed
    const { data: existing } = await adminClient
      .from("social_actions")
      .select("id")
      .eq("user_id", user.id)
      .eq("action_type", action_type)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already claimed", success: false });
    }

    const points = POINTS_MAP[action_type];

    // Create social action record
    await adminClient.from("social_actions").insert({
      user_id: user.id,
      action_type,
      points_awarded: points,
    });

    // Award points
    const { data: profile } = await adminClient
      .from("profiles")
      .select("points_balance, total_points_earned")
      .eq("id", user.id)
      .single();

    const newBalance = (profile?.points_balance || 0) + points;
    const newTotal = (profile?.total_points_earned || 0) + points;

    await adminClient
      .from("profiles")
      .update({
        points_balance: newBalance,
        total_points_earned: newTotal,
      })
      .eq("id", user.id);

    // Log points transaction
    await adminClient.from("points_transactions").insert({
      user_id: user.id,
      amount: points,
      type: "earned",
      reason: `Social action: ${action_type.replace(/_/g, " ")}`,
    });

    return NextResponse.json({
      success: true,
      points_awarded: points,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("Social action claim error:", err);
    return NextResponse.json({ error: "Failed to claim" }, { status: 500 });
  }
}
