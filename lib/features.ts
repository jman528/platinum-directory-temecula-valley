export const TIER_FEATURES = {
  free: {
    showBasicListing: true,
    showAddress: false, showPhone: false, showWebsite: false, showEmail: false,
    showSocialLinks: false, showDescription: false, showHours: false,
    showImages: false, showVideo: false, showGoogleReviews: false,
    showGoogleMap: false, showBlog: false, showEvents: false,
    showJobs: false, showTeam: false,
    verifiedBadge: false, featuredPlacement: false,
    smartOfferFee: 0.30, leadsPerMonth: 0,
    aiAssistant: false, aiCallAssistant: false,
    emailCampaigns: false, smsCampaigns: false,
    categoryExclusivity: false, dedicatedManager: false,
    enteredInBusinessSweepstakes: false,
  },
  verified_platinum: {
    showBasicListing: true,
    showAddress: true, showPhone: true, showWebsite: true, showEmail: true,
    showSocialLinks: true, showDescription: true, showHours: true,
    showImages: true, showVideo: true, showGoogleReviews: true,
    showGoogleMap: true, showBlog: true, showEvents: true,
    showJobs: true, showTeam: true,
    verifiedBadge: true, featuredPlacement: false,
    smartOfferFee: 0.25, leadsPerMonth: 'AI-enhanced' as const,
    aiAssistant: true, aiCallAssistant: false,
    emailCampaigns: false, smsCampaigns: false,
    categoryExclusivity: false, dedicatedManager: false,
    enteredInBusinessSweepstakes: true,
  },
  platinum_partner: {
    showBasicListing: true,
    showAddress: true, showPhone: true, showWebsite: true, showEmail: true,
    showSocialLinks: true, showDescription: true, showHours: true,
    showImages: true, showVideo: true, showGoogleReviews: true,
    showGoogleMap: true, showBlog: true, showEvents: true,
    showJobs: true, showTeam: true,
    verifiedBadge: true, featuredPlacement: true,
    smartOfferFee: 0.20, leadsPerMonth: 25,
    aiAssistant: true, aiCallAssistant: '$0.15/min' as const,
    emailCampaigns: true, smsCampaigns: '1000/mo' as const,
    categoryExclusivity: false, dedicatedManager: false,
    enteredInBusinessSweepstakes: true,
  },
  platinum_elite: {
    showBasicListing: true,
    showAddress: true, showPhone: true, showWebsite: true, showEmail: true,
    showSocialLinks: true, showDescription: true, showHours: true,
    showImages: true, showVideo: true, showGoogleReviews: true,
    showGoogleMap: true, showBlog: true, showEvents: true,
    showJobs: true, showTeam: true,
    verifiedBadge: true, featuredPlacement: true,
    smartOfferFee: 0.20, leadsPerMonth: 'unlimited' as const,
    aiAssistant: true, aiCallAssistant: 'unlimited' as const,
    emailCampaigns: true, smsCampaigns: '5000/mo' as const,
    categoryExclusivity: true, dedicatedManager: true,
    enteredInBusinessSweepstakes: true,
  },
} as const;

export type TierName = keyof typeof TIER_FEATURES;

export function getTierFeatures(tier: string) {
  return TIER_FEATURES[tier as TierName] || TIER_FEATURES.free;
}
