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

    const { business_id, context, email_type } = await req.json();
    if (!business_id || !email_type) {
      return NextResponse.json({ error: "business_id and email_type required" }, { status: 400 });
    }

    const { data: biz } = await adminClient
      .from("businesses")
      .select("name, email, slug, categories(name), city, tier")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://platinumdirectorytemeculavalley.com";
    const listingUrl = `${baseUrl}/business/${biz.slug}`;
    const pricingUrl = `${baseUrl}/pricing`;

    const typePrompts: Record<string, string> = {
      follow_up: `Draft a follow-up email after Frank's call with ${biz.name}.
Context from call: ${context || "General follow-up"}
Include: personalized recap, link to their listing (${listingUrl}), link to pricing (${pricingUrl}), reminder of value discussed.`,
      intro: `Draft an introduction email for ${biz.name} — Frank hasn't spoken to them yet.
Their listing: ${listingUrl}
Include: who we are, why they should care, soft CTA to schedule a call.`,
      demo_recap: `Draft a demo recap email for ${biz.name} after they saw a presentation.
Context: ${context || "Standard demo"}
Include: recap of features shown, their listing link (${listingUrl}), pricing link (${pricingUrl}), next steps.`,
    };

    const prompt = typePrompts[email_type] || typePrompts.follow_up;

    const fullPrompt = `${prompt}

BUSINESS: ${biz.name} (${(biz.categories as any)?.name || "local business"} in ${biz.city})
Current tier: ${biz.tier || "free"}

Return EXACTLY in this format:
SUBJECT: [subject line]

BODY:
[email body]

Sign off as Frank from Platinum Directory. Keep it warm, professional, and under 200 words.`;

    const result = await callAI(
      [{ role: "user", content: fullPrompt }],
      { systemPrompt: AI_SALES_SYSTEM_PROMPT, maxTokens: 600, temperature: 0.7, preferredProvider: "groq" }
    );

    // Parse subject and body from response
    const subjectMatch = result.text.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = result.text.match(/BODY:\s*([\s\S]+)/i);

    return NextResponse.json({
      subject: subjectMatch?.[1]?.trim() || `Following up — ${biz.name} on Platinum Directory`,
      body: bodyMatch?.[1]?.trim() || result.text,
      to: biz.email,
      provider: result.provider,
    });
  } catch (err) {
    console.error("AI draft-email error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
