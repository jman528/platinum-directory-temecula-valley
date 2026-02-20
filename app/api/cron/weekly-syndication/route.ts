import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postToReddit } from "@/lib/syndication/platforms/reddit";
import { postToDiscord, buildDealEmbed } from "@/lib/syndication/platforms/discord";
import { SYNDICATION_CONFIG } from "@/lib/syndication-config";

// Runs every Monday at 9:00 AM PST via Vercel Cron
// vercel.json: { "crons": [{ "path": "/api/cron/weekly-syndication", "schedule": "0 17 * * 1" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    // 1. Gather top Smart Offers from the past week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: offers } = await adminClient
      .from("smart_offers")
      .select("*, businesses(name, slug)")
      .eq("status", "active")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    const dealsList = (offers || [])
      .map(
        (o: any) =>
          `- **${o.title || o.name}** at ${(o.businesses as any)?.name || "Local Business"} — [View Offer](https://platinumdirectorytemeculavalley.com/offers/${o.slug})`
      )
      .join("\n");

    // 2. Post deal roundup to Reddit
    if (dealsList) {
      const roundupTemplate =
        SYNDICATION_CONFIG.templates.deal_roundup?.reddit || "";
      const roundupText = roundupTemplate.replace("{{deals_list}}", dealsList);

      await postToReddit(
        SYNDICATION_CONFIG.platforms.reddit.subreddit,
        `[Weekly Deals] Best Smart Offers in Temecula Valley - ${new Date().toLocaleDateString()}`,
        roundupText
      );
    }

    // 3. Post to Discord
    const discordWebhook =
      SYNDICATION_CONFIG.platforms.discord.webhooks.weeklyDeals;
    if (discordWebhook && offers && offers.length > 0) {
      const embeds = offers.slice(0, 5).map((o: any) =>
        buildDealEmbed({
          name: o.title || o.name,
          businessName: (o.businesses as any)?.name || "Local Business",
          price: o.price ? `$${o.price}` : undefined,
          description: o.description?.slice(0, 200),
          slug: o.slug,
        })
      );

      await postToDiscord(discordWebhook, "**This Week's Top Smart Offers**", embeds);
    }

    // 4. Post giveaway reminder
    const giveawayWebhook =
      SYNDICATION_CONFIG.platforms.discord.webhooks.giveawayAlerts;
    if (giveawayWebhook) {
      await postToDiscord(giveawayWebhook, null, [
        {
          title: "Weekly $250 Giveaway is LIVE!",
          description:
            "Enter now at platinumdirectorytemeculavalley.com/giveaway\n\nShare with friends to earn bonus entries!",
          color: 0x059669,
          footer: { text: "Platinum Directory Giveaway" },
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // 5. Log to syndication_log
    await adminClient.from("syndication_log").insert({
      platform: "cron",
      post_type: "weekly_roundup",
      post_content: `Weekly roundup: ${(offers || []).length} deals posted`,
      status: "posted",
      posted_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      dealsPosted: (offers || []).length,
    });
  } catch (err) {
    console.error("Weekly syndication cron error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
