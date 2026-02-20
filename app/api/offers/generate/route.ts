import { NextRequest, NextResponse } from "next/server";
import { callAI, type AIMessage } from "@/lib/ai/router";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are an expert marketing strategist for local businesses in Temecula Valley, California.
Generate compelling Smart Offer ideas that drive foot traffic and conversions.

When given a business name, category, and description, return EXACTLY 3 offer suggestions in JSON format.
Each offer should have:
- title: A compelling, action-oriented title (max 60 chars)
- description: A persuasive 1-2 sentence description highlighting value
- offer_type: "voucher" or "local_deal"
- original_price: The regular price (number)
- offer_price: The discounted price (number)
- terms: Brief terms and conditions
- redemption_instructions: How the customer redeems the offer
- suggested_duration_days: How many days the offer should run (30, 60, or 90)

Guidelines:
- Discounts should be 15-40% off to be attractive but sustainable
- Wineries: focus on tasting experiences, tours, bottle deals
- Restaurants: focus on prix fixe, happy hours, brunch specials
- Retail: focus on gift cards at discount, bundle deals
- Services: focus on intro packages, consultation deals
- Make offers feel exclusive and time-limited
- Keep language warm, inviting, and local

Return ONLY valid JSON array, no markdown, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Get business details
    const { data: business } = await supabase
      .from("businesses")
      .select("name, description, tier, city, categories(name)")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const biz = business as any;
    const categoryName = biz.categories?.name || "Local Business";

    const messages: AIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate 3 Smart Offer ideas for:

Business: ${biz.name}
Category: ${categoryName}
City: ${biz.city || "Temecula"}
Description: ${biz.description || "A local business in Temecula Valley."}
Tier: ${biz.tier}

Return JSON array only.`,
      },
    ];

    const result = await callAI(messages, {
      temperature: 0.8,
      maxTokens: 1500,
    });

    // Parse the AI response
    let offers;
    try {
      // Try to extract JSON from the response
      const content = result.text.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        offers = JSON.parse(jsonMatch[0]);
      } else {
        offers = JSON.parse(content);
      }
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ offers, model: result.model, provider: result.provider });
  } catch (err: any) {
    console.error("Offer generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate offers" },
      { status: 500 }
    );
  }
}
