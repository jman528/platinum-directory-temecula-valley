import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/router";
import { AI_SALES_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

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

    const { business_id } = await req.json();
    if (!business_id) {
      return NextResponse.json({ error: "business_id required" }, { status: 400 });
    }

    // Fetch business data
    const { data: biz } = await adminClient
      .from("businesses")
      .select("*, categories(name)")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Fetch outreach history from the business record
    const outreachInfo = biz.outreach_notes
      ? `Last contact: ${biz.outreach_last_contacted_at || "Unknown"} — Notes: ${biz.outreach_notes}`
      : "No previous contact";

    const prompt = `Generate a concise pre-call briefing for the sales rep.

BUSINESS DATA:
Name: ${biz.name}
Category: ${(biz.categories as any)?.name || "Unknown"}
City: ${biz.city || "Unknown"}
Phone: ${biz.phone || "N/A"}
Website: ${biz.website || "None"}
Rating: ${biz.rating || "No rating"} (${biz.review_count || 0} reviews)
Current Tier: ${biz.tier || "free"}
Lead Score: ${biz.lead_score || 0}/100
Data Quality: ${biz.data_quality_score || 0}/100
Google Presence Score: ${biz.google_presence_score || 0}/100
Hot Lead: ${biz.is_hot_lead ? "Yes" : "No"} — Reason: ${biz.hot_lead_reason || "N/A"}
Has Hours: ${biz.hours ? "Yes" : "Missing"}
Has Photos: ${biz.cover_image_url ? "Yes" : "Missing"}
Has Description: ${biz.description ? "Yes" : "Missing"}

PREVIOUS INTERACTIONS:
${outreachInfo}

Generate:
1. **Opening Line** — personalized for this specific business (reference their category, rating, or what's missing)
2. **Key Talking Points** — 3 bullet points specific to WHY this business needs us
3. **Recommended Tier** — which tier and why, with a one-line ROI pitch
4. **Watch Out** — any red flags or things to be careful about
5. **Suggested Offer** — what kind of Smart Offer would work for this business type

Keep it concise. Frank reads this in 30 seconds before dialing.`;

    const result = await callAI(
      [{ role: "user", content: prompt }],
      { systemPrompt: AI_SALES_SYSTEM_PROMPT, maxTokens: 800, temperature: 0.7, preferredProvider: "groq" }
    );

    return NextResponse.json({ briefing: result.text, provider: result.provider });
  } catch (err) {
    console.error("AI pre-call error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
