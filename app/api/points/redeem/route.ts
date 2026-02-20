import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { POINTS_CONFIG } from "@/lib/points-config";

export async function POST(req: NextRequest) {
  try {
    const { type, amount_points, offer_id } = await req.json();

    if (!type || !amount_points || amount_points <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get current balance
    const { data: profile } = await adminClient
      .from("profiles")
      .select("points_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.points_balance < amount_points) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    if (type === "cashout") {
      if (amount_points < POINTS_CONFIG.CASHOUT_MINIMUM) {
        return NextResponse.json({
          error: `Minimum cashout is ${POINTS_CONFIG.CASHOUT_MINIMUM.toLocaleString()} points ($${(POINTS_CONFIG.CASHOUT_MINIMUM / POINTS_CONFIG.POINTS_PER_DOLLAR).toFixed(2)})`,
        }, { status: 400 });
      }

      // Create payout request
      await adminClient.from("points_redemptions").insert({
        user_id: user.id,
        type: "cashout",
        points_spent: amount_points,
        dollar_value: amount_points / POINTS_CONFIG.POINTS_PER_DOLLAR,
        status: "pending",
      });

      // Deduct points
      await adminClient.from("points_ledger").insert({
        user_id: user.id,
        points: -amount_points,
        action: "cashout",
      });

      await adminClient
        .from("profiles")
        .update({ points_balance: profile.points_balance - amount_points })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        new_balance: profile.points_balance - amount_points,
        payout_amount: amount_points / POINTS_CONFIG.POINTS_PER_DOLLAR,
      });
    }

    if (type === "offer_discount") {
      if (!offer_id) {
        return NextResponse.json({ error: "offer_id required" }, { status: 400 });
      }

      const discount_dollars = amount_points / POINTS_CONFIG.POINTS_PER_DOLLAR;

      // Don't deduct yet — deduction happens after successful Stripe payment
      return NextResponse.json({
        success: true,
        discount_amount: discount_dollars,
        points_to_deduct: amount_points,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Points redeem error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
