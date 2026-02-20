// lib/syndication-config.ts
// Syndication platform configuration and post templates

export const SYNDICATION_CONFIG = {
  platforms: {
    facebook: {
      enabled: true,
      apiType: 'meta_graph' as const,
      pageId: process.env.FB_PAGE_ID,
      accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    },
    instagram: {
      enabled: true,
      apiType: 'meta_graph' as const,
      accountId: process.env.IG_BUSINESS_ACCOUNT_ID,
      accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    },
    x: {
      enabled: true,
      apiType: 'x_api_v2' as const,
      apiKey: process.env.X_API_KEY,
      apiSecret: process.env.X_API_SECRET,
      accessToken: process.env.X_ACCESS_TOKEN,
      accessSecret: process.env.X_ACCESS_SECRET,
    },
    linkedin: {
      enabled: true,
      apiType: 'linkedin_api' as const,
      orgId: process.env.LINKEDIN_ORG_ID,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    },
    reddit: {
      enabled: true,
      apiType: 'reddit_api' as const,
      subreddit: 'TemeculaValleyDeals',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    },
    discord: {
      enabled: true,
      apiType: 'webhook' as const,
      webhooks: {
        newBusinesses: process.env.DISCORD_WEBHOOK_NEW_BUSINESSES,
        weeklyDeals: process.env.DISCORD_WEBHOOK_WEEKLY_DEALS,
        giveawayAlerts: process.env.DISCORD_WEBHOOK_GIVEAWAY,
        systemStatus: process.env.DISCORD_WEBHOOK_SYSTEM,
        stripeAlerts: process.env.DISCORD_WEBHOOK_STRIPE,
      },
    },
    pinterest: {
      enabled: false,
      apiType: 'pinterest_api' as const,
    },
  },

  templates: {
    welcome_verified: {
      facebook: `🎉 Welcome to the Platinum Directory family!\n\n{{business_name}} just joined as a Verified business in {{city}}.\n\n{{description}}\n\nCheck out their listing and Smart Offers:\n👉 {{listing_url}}\n\n#TemeculaValley #{{category_hashtag}} #SupportLocal #PlatinumDirectory`,
      instagram: `🎉 Welcome to the family! {{business_name}} just joined Platinum Directory as a Verified business.\n\n{{description}}\n\nLink in bio to check out their listing! 🔗\n\n#TemeculaValley #WineCountry #SupportLocal #{{category_hashtag}} #TemeculaCA #PlatinumDirectory #LocalBusiness #ShopLocal`,
      x: `🎉 Welcome {{business_name}} to @PlatDirTV!\n\n{{short_description}}\n\nCheck out their Smart Offers 👉 {{listing_url}}\n\n#TemeculaValley #SupportLocal`,
      linkedin: `We're excited to welcome {{business_name}} to the Platinum Directory Temecula Valley network!\n\n{{description}}\n\nAs a Verified business, they now have access to our Smart Offers marketplace, lead generation tools, and premium directory placement.\n\nExplore their listing: {{listing_url}}\n\n#TemeculaValley #LocalBusiness #SupportLocal`,
      reddit: `**[New Business] {{business_name}} just joined Platinum Directory!**\n\n{{description}}\n\nCategory: {{category}}\nLocation: {{city}}, CA\n\nCheck out their listing and any Smart Offers: [{{business_name}} on Platinum Directory]({{listing_url}})`,
      discord: null,
    },
    welcome_partner: {
      facebook: `⭐ Premium Partner Alert! ⭐\n\n{{business_name}} just upgraded to Partner status on Platinum Directory!\n\nThis means exclusive Smart Offers, priority placement, and more.\n\n{{description}}\n\n👉 {{listing_url}}\n\n#TemeculaValley #PremiumPartner #{{category_hashtag}} #PlatinumDirectory`,
    },
    welcome_elite: {
      facebook: `👑 ELITE MEMBER 👑\n\n{{business_name}} is now one of only 3 Elite businesses in {{category}} on Platinum Directory!\n\n{{description}}\n\nExclusive Smart Offers available now:\n👉 {{listing_url}}\n\n#TemeculaValley #Elite #{{category_hashtag}} #PlatinumDirectory`,
    },
    smart_offer_new: {
      facebook: `🔥 New Smart Offer Alert!\n\n{{offer_name}} from {{business_name}}\n💰 {{offer_price}} ({{discount_text}})\n\n{{offer_description}}\n\nGrab it before it's gone:\n👉 {{offer_url}}\n\n#TemeculaDeals #SmartOffer #{{category_hashtag}} #PlatinumDirectory`,
      reddit: `**[Deal] {{offer_name}} — {{offer_price}} at {{business_name}}**\n\n{{offer_description}}\n\n[Get this Smart Offer]({{offer_url}})`,
    },
    weekly_giveaway: {
      facebook: `🎁 WEEKLY GIVEAWAY 🎁\n\nThis week's $250 giveaway is LIVE on Platinum Directory!\n\nEnter now — it takes 30 seconds:\n👉 {{giveaway_url}}\n\nShare with friends to earn bonus entries! Every friend who enters = 1,000 bonus points for YOU.\n\n#TemeculaGiveaway #FreeStuff #TemeculaValley #PlatinumDirectory`,
    },
    deal_roundup: {
      reddit: `**[Weekly Deals] Best Smart Offers in Temecula Valley This Week**\n\nHere are the top deals available right now on Platinum Directory:\n\n{{deals_list}}\n\nAll deals available at [Platinum Directory](https://platinumdirectorytemeculavalley.com/offers)`,
    },
  },
} as const;

export const BASE_URL = 'https://platinumdirectorytemeculavalley.com';

export type Platform = keyof typeof SYNDICATION_CONFIG.platforms;
export type PostType = keyof typeof SYNDICATION_CONFIG.templates;
