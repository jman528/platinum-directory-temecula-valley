import { createAdminClient } from "@/lib/supabase/admin";
import { POINTS_CONFIG } from "@/lib/points-config";

/**
 * Generate a referral code for a user.
 * Format: USR_ + first 8 chars of uuid
 */
export function generateUserRefCode(): string {
  return `USR_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

/**
 * Generate a referral code for a business.
 * Format: BIZ_ + first 8 chars of uuid
 */
export function generateBusinessRefCode(): string {
  return `BIZ_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

/**
 * Generate an affiliate code.
 * Format: AFF_ + first 8 chars of uuid
 */
export function generateAffiliateCode(): string {
  return `AFF_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

/**
 * Process a referral signup — called when a new user signs up
 * and a pd_ref cookie was present.
 */
export async function processReferralSignup(
  referralCode: string,
  newUserId: string,
  metadata?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    source_url?: string;
  }
) {
  const supabase = createAdminClient();

  // Find referrer by code in profiles or businesses
  let referrerId: string | null = null;

  // Check profiles first (USR_ codes)
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, referral_code")
    .eq("referral_code", referralCode)
    .single();

  if (referrer) {
    referrerId = referrer.id;
  } else {
    // Check businesses (BIZ_ codes)
    const { data: bizRef } = await supabase
      .from("businesses")
      .select("owner_user_id, referral_code")
      .eq("referral_code", referralCode)
      .single();
    if (bizRef?.owner_user_id) {
      referrerId = bizRef.owner_user_id;
    }
  }

  if (!referrerId) return;

  // Set referred_by on new user's profile
  await supabase
    .from("profiles")
    .update({ referred_by: referralCode })
    .eq("id", newUserId);

  // Create referral tracking record
  await supabase.from("referral_tracking").insert({
    referrer_id: referrerId,
    referred_user_id: newUserId,
    referral_code_used: referralCode,
    conversion_type: "signup",
    converted_at: new Date().toISOString(),
    utm_source: metadata?.utm_source || null,
    utm_medium: metadata?.utm_medium || null,
    utm_campaign: metadata?.utm_campaign || null,
    utm_content: metadata?.utm_content || null,
    utm_term: metadata?.utm_term || null,
    source_url: metadata?.source_url || null,
  });

  // Award referrer REFERRAL_SIGNUP points
  const points = POINTS_CONFIG.REFERRAL_SIGNUP;

  await supabase.from("points_ledger").insert({
    user_id: referrerId,
    points,
    action: "referral_signup",
    related_entity_id: newUserId,
  });

  // Update referrer's balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance, total_points_earned")
    .eq("id", referrerId)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        points_balance: (profile.points_balance || 0) + points,
        total_points_earned: (profile.total_points_earned || 0) + points,
      })
      .eq("id", referrerId);
  }
}

/**
 * Process a referral offer purchase — award referrer 5% as points.
 */
export async function processReferralOfferPurchase(
  buyerUserId: string,
  offerPrice: number,
  offerId: string,
  directRefCode?: string
) {
  const supabase = createAdminClient();

  // Check if buyer was referred (permanent referral)
  const { data: buyer } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", buyerUserId)
    .single();

  const referralCode = directRefCode || buyer?.referred_by;
  if (!referralCode) return;

  // Find referrer
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) return;

  // Calculate 5% commission as points
  const points = Math.round(offerPrice * POINTS_CONFIG.REFERRAL_OFFER_COMMISSION * POINTS_CONFIG.POINTS_PER_DOLLAR);
  if (points <= 0) return;

  await supabase.from("points_ledger").insert({
    user_id: referrer.id,
    points,
    action: "referral_offer_purchase",
    related_entity_id: offerId,
  });

  // Update referrer balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance, total_points_earned")
    .eq("id", referrer.id)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        points_balance: (profile.points_balance || 0) + points,
        total_points_earned: (profile.total_points_earned || 0) + points,
      })
      .eq("id", referrer.id);
  }
}
