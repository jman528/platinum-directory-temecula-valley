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

    const { business_id, raw_notes, disposition } = await req.json();
    if (!business_id || !raw_notes) {
      return NextResponse.json({ error: "business_id and raw_notes required" }, { status: 400 });
    }

    const { data: biz } = await adminClient
      .from("businesses")
      .select("name, email, categories(name), city, tier")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const prompt = `Frank just finished a call with ${biz.name} (${(biz.categories as any)?.name || "business"} in ${biz.city}).

DISPOSITION: ${disposition || "unknown"}

FRANK'S RAW NOTES:
"${raw_notes}"

Do two things:

1. STRUCTURE THE NOTES into this format:
- Contact: [name and title if mentioned]
- Interest Level: [High/Medium/Low]
- Tier Interest: [which tier and price if discussed]
- Objection: [any objections or concerns]
- Follow-up: [when to call back, what to send]
- Key Detail: [anything personal or useful for next call]

2. DRAFT A FOLLOW-UP EMAIL:
Subject line and body. Keep it short and warm. Reference specifics from the call. Include a soft CTA.

Return both sections clearly labeled.`;

    const result = await callAI(
      [{ role: "user", content: prompt }],
      { systemPrompt: AI_SALES_SYSTEM_PROMPT, maxTokens: 800, temperature: 0.7, preferredProvider: "groq" }
    );

    // Update business outreach
    const updateData: Record<string, unknown> = {
      outreach_status: disposition || "follow_up",
      outreach_last_contacted_at: new Date().toISOString(),
      outreach_notes: raw_notes,
    };

    // Try to extract follow-up date from AI response
    const followUpMatch = result.text.match(/(?:Follow.?up|Call back|callback).*?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week)/i);
    if (followUpMatch) {
      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const mention = followUpMatch[1].toLowerCase();
      if (mention === "tomorrow") {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        updateData.outreach_next_follow_up = d.toISOString().split("T")[0];
      } else if (mention === "next week") {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        updateData.outreach_next_follow_up = d.toISOString().split("T")[0];
      } else if (dayMap[mention] !== undefined) {
        const d = new Date();
        const target = dayMap[mention];
        const today = d.getDay();
        const diff = (target - today + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        updateData.outreach_next_follow_up = d.toISOString().split("T")[0];
      }
    }

    await adminClient.from("businesses").update(updateData).eq("id", business_id);

    return NextResponse.json({
      structured_notes: result.text,
      business_name: biz.name,
      business_email: biz.email,
      provider: result.provider,
    });
  } catch (err) {
    console.error("AI post-call error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
