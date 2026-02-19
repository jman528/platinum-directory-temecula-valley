import { createAdminClient } from "@/lib/supabase/admin";

export async function processReferralSignup(
  referralCode: string,
  newUserId: string
) {
  const supabase = createAdminClient();

  // Find referrer
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, referral_code")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) return;

  // Create conversion record
  await supabase.from("referral_conversions").insert({
    referral_code: referralCode,
    referrer_user_id: referrer.id,
    referred_user_id: newUserId,
    conversion_type: "registration",
    points_awarded: 100,
  });

  // Award points to referrer
  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance")
    .eq("id", referrer.id)
    .single();

  if (profile) {
    const newBalance = profile.points_balance + 100;
    await supabase
      .from("profiles")
      .update({ points_balance: newBalance, total_points_earned: newBalance })
      .eq("id", referrer.id);

    await supabase.from("points_ledger").insert({
      user_id: referrer.id,
      referral_code: referralCode,
      action: "earned_registration",
      points: 100,
      balance_after: newBalance,
      description: "Referral signup bonus",
      is_available: true,
    });
  }

  // Update referral_codes stats
  await supabase
    .from("referral_codes")
    .update({
      total_registrations: (referrer as any).total_registrations
        ? (referrer as any).total_registrations + 1
        : 1,
    })
    .eq("code", referralCode);
}
