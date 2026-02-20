// lib/syndication/syndicate.ts
// Master syndication orchestrator

import { createAdminClient } from "@/lib/supabase/admin";
import { SYNDICATION_CONFIG, BASE_URL, type Platform } from "@/lib/syndication-config";
import { postToFacebook, postToInstagram } from "./platforms/meta";
import { postToX } from "./platforms/x";
import { postToLinkedIn } from "./platforms/linkedin";
import { postToReddit } from "./platforms/reddit";
import { postToDiscord, buildBusinessEmbed } from "./platforms/discord";

interface SyndicationData {
  business_name: string;
  category: string;
  category_hashtag: string;
  city: string;
  description: string;
  short_description: string;
  listing_url: string;
  offer_url?: string;
  offer_name?: string;
  offer_price?: string;
  offer_description?: string;
  discount_text?: string;
  giveaway_url?: string;
  deals_list?: string;
}

interface SyndicationResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

function fillTemplate(template: string, data: SyndicationData): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
  }
  return result;
}

export async function syndicatePost(
  postType: string,
  businessData: {
    id: string;
    name: string;
    slug: string;
    category?: string;
    city?: string;
    description?: string;
    tier?: string;
    cover_image_url?: string;
  },
  platforms?: Platform[],
  imageUrl?: string
): Promise<SyndicationResult[]> {
  const adminClient = createAdminClient();

  // Check feature flag
  try {
    const { data: flag } = await adminClient
      .from("feature_flags")
      .select("enabled")
      .eq("flag_key", "social_syndication")
      .single();

    if (!flag?.enabled) {
      return [{ platform: "all", success: false, error: "Social syndication is disabled" }];
    }
  } catch {
    // feature_flags table may not exist
  }

  const data: SyndicationData = {
    business_name: businessData.name,
    category: businessData.category || "Local Business",
    category_hashtag: (businessData.category || "LocalBusiness").replace(/[\s&]/g, ""),
    city: businessData.city || "Temecula Valley",
    description: businessData.description || "",
    short_description: (businessData.description || "").slice(0, 100),
    listing_url: `${BASE_URL}/business/${businessData.slug}`,
  };

  const templates =
    SYNDICATION_CONFIG.templates[postType as keyof typeof SYNDICATION_CONFIG.templates] || {};

  const enabledPlatforms = platforms || (Object.keys(SYNDICATION_CONFIG.platforms) as Platform[]);
  const results: SyndicationResult[] = [];

  const postPromises = enabledPlatforms.map(async (platform) => {
    const config = SYNDICATION_CONFIG.platforms[platform];
    if (!config?.enabled) {
      return { platform, success: false, error: "Platform disabled" };
    }

    const template = (templates as Record<string, string | null>)[platform];
    if (!template && platform !== "discord") {
      return { platform, success: false, error: "No template for this post type" };
    }

    const content = template ? fillTemplate(template, data) : "";

    try {
      let result: { success: boolean; postId?: string; postUrl?: string; error?: string };

      switch (platform) {
        case "facebook":
          result = await postToFacebook(content, data.listing_url, imageUrl);
          break;
        case "instagram":
          result = imageUrl
            ? await postToInstagram(content, imageUrl)
            : { success: false, error: "Instagram requires an image" };
          break;
        case "x":
          result = await postToX(content);
          break;
        case "linkedin":
          result = await postToLinkedIn(content, data.listing_url);
          break;
        case "reddit":
          result = await postToReddit(
            SYNDICATION_CONFIG.platforms.reddit.subreddit,
            `${businessData.name} - Now on Platinum Directory`,
            content
          );
          break;
        case "discord": {
          const webhookUrl =
            SYNDICATION_CONFIG.platforms.discord.webhooks.newBusinesses;
          if (!webhookUrl) {
            result = { success: false, error: "Discord webhook not configured" };
          } else {
            const embed = buildBusinessEmbed(businessData);
            result = await postToDiscord(webhookUrl, null, [embed]);
          }
          break;
        }
        default:
          result = { success: false, error: "Unknown platform" };
      }

      // Log to syndication_log
      try {
        await adminClient.from("syndication_log").insert({
          business_id: businessData.id,
          platform,
          post_type: postType,
          post_content: content,
          post_url: result.postUrl || null,
          image_url: imageUrl || null,
          status: result.success ? "posted" : "failed",
          error_message: result.error || null,
          posted_at: result.success ? new Date().toISOString() : null,
        });
      } catch {
        // logging failure shouldn't break syndication
      }

      return { platform, ...result };
    } catch (err) {
      return {
        platform,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });

  const settled = await Promise.allSettled(postPromises);
  for (const r of settled) {
    if (r.status === "fulfilled") {
      results.push(r.value);
    } else {
      results.push({ platform: "unknown", success: false, error: r.reason?.message });
    }
  }

  // Update business syndication_status
  const anySuccess = results.some((r) => r.success);
  if (anySuccess) {
    try {
      await adminClient
        .from("businesses")
        .update({ syndication_status: "active" })
        .eq("id", businessData.id);
    } catch {
      // ignore
    }
  }

  return results;
}
