export const POINTS_CONFIG = {
  // Exchange rate
  POINTS_PER_DOLLAR: 1000, // 1,000 pts = $1.00

  // One-time onboarding bonuses
  SIGNUP_BONUS: 2500,           // $2.50 — awarded on account creation
  PHONE_VERIFY_BONUS: 1000,     // $1.00 — awarded when phone verified
  COMPLETE_PROFILE_BONUS: 500,  // $0.50 — awarded when profile 100% complete
  FIRST_SHARE_BONUS: 1000,      // $1.00 — awarded on first-ever social share
  FIRST_GIVEAWAY_ENTRY: 500,    // $0.50 — awarded on first giveaway entry

  // Repeatable actions
  SHARE_LISTING: 25,            // per share, max 100/day
  SHARE_DAILY_MAX: 100,
  REFERRAL_CLICK: 10,           // per unique visitor click, 1x per person per day
  REFERRAL_SIGNUP: 500,         // when referred user creates account
  REFERRAL_GIVEAWAY: 1000,     // when referred user enters giveaway
  REFERRAL_OFFER_COMMISSION: 0.05, // 5% of offer value as points
  DAILY_LOGIN: 10,
  STREAK_7_DAY: 250,           // $0.25
  STREAK_30_DAY: 2500,         // $2.50
  GOOGLE_REVIEW: 1000,         // $1.00, once
  SOCIAL_FOLLOW: 250,          // $0.25, once per platform
  OFFER_PURCHASE_LOYALTY: 1,    // 1 pt per $1 spent on Smart Offers
  REFERRAL_BIZ_SUBSCRIBE: 50000, // $50 when referred business subscribes

  // Redemption rules
  CASHOUT_MINIMUM: 10000,       // $10.00 minimum to cash out
  OFFER_REDEMPTION_MIN_VALUE: 3000, // $30 minimum Smart Offer value to use points
  // Points can be applied to ANY Smart Offer $30+ at any amount (no minimum points)

  // Wallet top-up tiers (buy points with cash)
  TOPUP_TIERS: [
    { price: 10, points: 10000, bonus: 0, label: "$10" },
    { price: 25, points: 25000, bonus: 0, label: "$25" },
    { price: 50, points: 50000, bonus: 2500, label: "$50 + 2,500 bonus" },
    { price: 100, points: 100000, bonus: 10000, label: "$100 + 10,000 bonus" },
  ],
} as const;

export function pointsToDollars(points: number): string {
  return (points / POINTS_CONFIG.POINTS_PER_DOLLAR).toFixed(2);
}

export function dollarsToPoints(dollars: number): number {
  return Math.round(dollars * POINTS_CONFIG.POINTS_PER_DOLLAR);
}
