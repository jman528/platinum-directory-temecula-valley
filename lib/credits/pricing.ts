// lib/credits/pricing.ts
export const CREDIT_PACKS = [
  {
    id: 'pack_200',
    name: 'Starter Pack',
    credits: 200,
    price_cents: 999,
    price_display: '$9.99',
    popular: false,
    description: 'Good for ~13 enrichments or 200 AI messages',
  },
  {
    id: 'pack_500',
    name: 'Growth Pack',
    credits: 500,
    price_cents: 1999,
    price_display: '$19.99',
    popular: true,
    description: 'Good for ~33 enrichments or 500 AI messages',
    bonus: 50,
  },
  {
    id: 'pack_1500',
    name: 'Power Pack',
    credits: 1500,
    price_cents: 4999,
    price_display: '$49.99',
    popular: false,
    description: 'Best value — good for ~100 enrichments or 1,500 AI messages',
    bonus: 250,
  },
] as const

// Monthly credit allotments by tier (included in subscription)
export const TIER_MONTHLY_CREDITS: Record<string, number> = {
  free: 0,
  verified_platinum: 0,
  platinum_partner: 100,
  platinum_elite: 500,
}

// Credit costs per action
export const CREDIT_COSTS = {
  enrichment_run: 15,
  ai_message: 1,
  social_post_generate: 5,
  listing_optimizer_run: 10,
  competitive_intel_report: 25,
  seo_audit: 20,
} as const
