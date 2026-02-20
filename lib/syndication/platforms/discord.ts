// lib/syndication/platforms/discord.ts
// Discord posting via webhooks

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  url?: string;
}

interface PostResult {
  success: boolean;
  error?: string;
}

const COLORS = {
  gold: 0xd4af37,
  purple: 0x7c3aed,
  green: 0x059669,
  blue: 0x3b82f6,
  red: 0xdc2626,
  gray: 0x6b7280,
};

export async function postToDiscord(
  webhookUrl: string,
  content: string | null,
  embeds: DiscordEmbed[] = []
): Promise<PostResult> {
  if (!webhookUrl) {
    return { success: false, error: "Discord webhook URL not configured" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        embeds: embeds.length > 0 ? embeds : undefined,
      }),
    });

    if (res.ok || res.status === 204) {
      return { success: true };
    }
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.message || `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export function buildBusinessEmbed(business: {
  name: string;
  category?: string;
  city?: string;
  description?: string;
  tier?: string;
  slug?: string;
  cover_image_url?: string;
}): DiscordEmbed {
  const tierLabel = {
    verified_platinum: "Verified",
    platinum_partner: "Partner",
    platinum_elite: "Elite",
  }[business.tier || ""] || "Member";

  return {
    title: `${business.name}`,
    description: business.description?.slice(0, 256) || "New business on Platinum Directory!",
    color: COLORS.gold,
    thumbnail: business.cover_image_url ? { url: business.cover_image_url } : undefined,
    fields: [
      { name: "Category", value: business.category || "Local Business", inline: true },
      { name: "City", value: business.city || "Temecula Valley", inline: true },
      { name: "Tier", value: tierLabel, inline: true },
    ],
    footer: {
      text: "Platinum Directory Temecula Valley",
    },
    url: business.slug
      ? `https://platinumdirectorytemeculavalley.com/business/${business.slug}`
      : undefined,
    timestamp: new Date().toISOString(),
  };
}

export function buildDealEmbed(deal: {
  name: string;
  businessName: string;
  price?: string;
  description?: string;
  slug?: string;
}): DiscordEmbed {
  return {
    title: `${deal.name}`,
    description: `**${deal.businessName}**\n${deal.price ? `Price: ${deal.price}\n` : ""}${deal.description?.slice(0, 200) || ""}`,
    color: COLORS.purple,
    footer: { text: "Platinum Directory Smart Offers" },
    url: deal.slug
      ? `https://platinumdirectorytemeculavalley.com/offers/${deal.slug}`
      : undefined,
    timestamp: new Date().toISOString(),
  };
}

export function buildSystemEmbed(
  title: string,
  description: string,
  type: "info" | "warning" | "error" | "success" = "info"
): DiscordEmbed {
  const colorMap = {
    info: COLORS.blue,
    warning: COLORS.gold,
    error: COLORS.red,
    success: COLORS.green,
  };

  return {
    title,
    description,
    color: colorMap[type],
    footer: { text: "PD System" },
    timestamp: new Date().toISOString(),
  };
}
