import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI, type AIMessage } from "@/lib/ai/router";
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

    const { message, business_id, history } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    // Build context with business data if provided
    let bizContext = "";
    if (business_id) {
      const { data: biz } = await adminClient
        .from("businesses")
        .select("name, phone, email, website, city, tier, categories(name), rating, review_count, lead_score, outreach_status, outreach_notes, description")
        .eq("id", business_id)
        .single();
      if (biz) {
        bizContext = `\n\nCURRENT BUSINESS CONTEXT:
Name: ${biz.name}
Category: ${(biz.categories as any)?.name || "Unknown"}
City: ${biz.city || "Unknown"}
Phone: ${biz.phone || "N/A"}
Email: ${biz.email || "N/A"}
Website: ${biz.website || "None"}
Tier: ${biz.tier || "free"}
Rating: ${biz.rating || "N/A"} (${biz.review_count || 0} reviews)
Lead Score: ${biz.lead_score || 0}/100
Outreach Status: ${biz.outreach_status || "not_contacted"}
Notes: ${biz.outreach_notes || "None"}`;
      }
    }

    // Fetch some platform stats for context
    const [
      { count: totalBiz },
      { count: paidBiz },
      { count: totalUsers },
    ] = await Promise.all([
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("is_active", true),
      adminClient.from("businesses").select("id", { count: "exact", head: true }).neq("tier", "free").eq("subscription_status", "active"),
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const statsContext = `\n\nPLATFORM STATS:
Total active businesses: ${totalBiz || 0}
Paid subscribers: ${paidBiz || 0}
Total users: ${totalUsers || 0}`;

    const systemPrompt = AI_SALES_SYSTEM_PROMPT + bizContext + statsContext;

    // Build conversation messages from history
    const messages: AIMessage[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    const result = await callAI(messages, {
      systemPrompt,
      maxTokens: 600,
      temperature: 0.7,
      preferredProvider: "groq",
    });

    return NextResponse.json({ response: result.text, provider: result.provider });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "AI assistant is offline. Check connection." }, { status: 500 });
  }
}
