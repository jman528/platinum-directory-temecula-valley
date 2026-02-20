import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/router";
import { AI_SALES_SYSTEM_PROMPT, CATEGORY_AVG_TRANSACTION, TIER_PRICING } from "@/lib/ai/system-prompt";

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

    const { business_id, tier } = await req.json();
    if (!business_id || !tier) {
      return NextResponse.json({ error: "business_id and tier required" }, { status: 400 });
    }

    const { data: biz } = await adminClient
      .from("businesses")
      .select("name, categories(name), city, rating, review_count")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const category = (biz.categories as any)?.name || "Unknown";
    const avgTransaction = CATEGORY_AVG_TRANSACTION[category] || CATEGORY_AVG_TRANSACTION.default;
    const tierData = TIER_PRICING[tier as keyof typeof TIER_PRICING];

    if (!tierData) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const breakEvenCustomers = Math.ceil(tierData.monthly / avgTransaction);

    const prompt = `Generate a quick ROI calculation for Frank to read to the business owner.

BUSINESS: ${biz.name} (${category}) in ${biz.city}
TIER: ${tier.replace(/_/g, " ")} at $${tierData.monthly}/month
AVERAGE ${category} TRANSACTION: $${avgTransaction}
BREAK-EVEN: ${breakEvenCustomers} new customers per month

Calculate:
1. Monthly cost: $${tierData.monthly}
2. Break-even: ${breakEvenCustomers} customers at $${avgTransaction} average
3. Realistic upside: if we bring 2-3x that many customers
4. Annual ROI projection

Make it conversational — something Frank can SAY on the phone, not read from a spreadsheet. Use specific dollar amounts. Keep it under 5 sentences.`;

    const result = await callAI(
      [{ role: "user", content: prompt }],
      { systemPrompt: AI_SALES_SYSTEM_PROMPT, maxTokens: 400, temperature: 0.7, preferredProvider: "groq" }
    );

    return NextResponse.json({
      calculation: result.text,
      data: { avgTransaction, breakEvenCustomers, monthlyPrice: tierData.monthly },
      provider: result.provider,
    });
  } catch (err) {
    console.error("AI ROI calc error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
