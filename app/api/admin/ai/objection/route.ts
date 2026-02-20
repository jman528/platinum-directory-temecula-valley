import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/router";
import { AI_SALES_SYSTEM_PROMPT, TIER_PRICING } from "@/lib/ai/system-prompt";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles").select("user_type").eq("id", user.id).single();
    if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { business_id, objection_type } = await req.json();
    if (!objection_type) {
      return NextResponse.json({ error: "objection_type required" }, { status: 400 });
    }

    let bizContext = "";
    if (business_id) {
      const { data: biz } = await adminClient
        .from("businesses")
        .select("name, tier, categories(name), city, rating, review_count")
        .eq("id", business_id)
        .single();
      if (biz) {
        bizContext = `
CURRENT BUSINESS:
Name: ${biz.name}
Category: ${(biz.categories as any)?.name || "Unknown"}
City: ${biz.city || "Unknown"}
Current Tier: ${biz.tier || "free"}
Rating: ${biz.rating || "N/A"} (${biz.review_count || 0} reviews)`;
      }
    }

    const tierInfo = Object.entries(TIER_PRICING)
      .map(([k, v]) => `${k}: $${v.monthly}/mo + $${v.setup} setup`)
      .join(", ");

    const prompt = `The business owner just said: "${objection_type}"
${bizContext}

TIER PRICING: ${tierInfo}

Generate a natural, conversational response Frank can say RIGHT NOW to handle this objection. Make it specific to this business's category and situation. Keep it to 3-4 sentences max. Start with empathy, then pivot to value.`;

    const result = await callAI(
      [{ role: "user", content: prompt }],
      { systemPrompt: AI_SALES_SYSTEM_PROMPT, maxTokens: 400, temperature: 0.7, preferredProvider: "groq" }
    );

    return NextResponse.json({ response: result.text, provider: result.provider });
  } catch (err) {
    console.error("AI objection error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
