import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check admin
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Run queries in parallel
    const [
      { count: verifiedCount },
      { count: partnerCount },
      { count: eliteCount },
      { count: totalUsers },
      { count: activeUsers30d },
      { data: pointsIssuedData },
      { data: pointsRedeemedData },
      { count: referralSignups },
      { data: topReferrersData },
    ] = await Promise.all([
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("tier", "verified_platinum").eq("subscription_status", "active"),
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("tier", "platinum_partner").eq("subscription_status", "active"),
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("tier", "platinum_elite").eq("subscription_status", "active"),
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
      adminClient.from("profiles").select("id", { count: "exact", head: true }).gte("last_sign_in_at", new Date(now.getTime() - 30 * 86400000).toISOString()),
      adminClient.from("points_ledger").select("points").gte("created_at", monthStart).gt("points", 0),
      adminClient.from("points_ledger").select("points").gte("created_at", monthStart).lt("points", 0),
      adminClient.from("referral_tracking").select("id", { count: "exact", head: true }).eq("conversion_type", "signup").gte("converted_at", monthStart),
      adminClient.from("profiles").select("full_name, referral_code, points_balance, total_points_earned").not("referral_code", "is", null).order("total_points_earned", { ascending: false }).limit(10),
    ]);

    const v = verifiedCount || 0;
    const p = partnerCount || 0;
    const e = eliteCount || 0;
    const mrr = v * 99 + p * 799 + e * 3500;

    const pointsIssued = (pointsIssuedData || []).reduce((sum: number, row: any) => sum + (row.points || 0), 0);
    const pointsRedeemed = Math.abs((pointsRedeemedData || []).reduce((sum: number, row: any) => sum + (row.points || 0), 0));

    return NextResponse.json({
      subscribers: { verified: v, partner: p, elite: e },
      mrr,
      totalUsers: totalUsers || 0,
      activeUsers30d: activeUsers30d || 0,
      pointsIssued,
      pointsRedeemed,
      referralSignups: referralSignups || 0,
      topReferrers: (topReferrersData || []).map((r: any) => ({
        name: r.full_name || "Anonymous",
        code: r.referral_code,
        points_earned: r.total_points_earned || 0,
      })),
    });
  } catch (err) {
    console.error("Revenue stats error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
