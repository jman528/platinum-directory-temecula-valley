import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/router";

interface AuditFactor {
  factor: string;
  status: boolean;
  score: number;
  maxScore: number;
}

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

    const { data: biz } = await adminClient
      .from("businesses")
      .select("*, categories(name)")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Calculate audit score
    const factors: AuditFactor[] = [
      { factor: "Google Listing", status: true, score: 20, maxScore: 20 }, // We have them listed
      { factor: "Listing Claimed", status: !!biz.is_claimed, score: biz.is_claimed ? 15 : 0, maxScore: 15 },
      { factor: "Photos Present", status: !!biz.cover_image_url, score: biz.cover_image_url ? 15 : 0, maxScore: 15 },
      { factor: "Hours Set", status: !!biz.hours && Object.keys(biz.hours).length > 0, score: biz.hours && Object.keys(biz.hours).length > 0 ? 15 : 0, maxScore: 15 },
      { factor: "Rating (4+)", status: (biz.rating || 0) >= 4, score: (biz.rating || 0) >= 4 ? 15 : Math.round(((biz.rating || 0) / 4) * 15), maxScore: 15 },
      { factor: "Reviews (10+)", status: (biz.review_count || 0) >= 10, score: (biz.review_count || 0) >= 10 ? 10 : Math.min(10, biz.review_count || 0), maxScore: 10 },
      { factor: "Description", status: !!biz.description && biz.description.length > 50, score: biz.description && biz.description.length > 50 ? 10 : 0, maxScore: 10 },
    ];

    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const scoreColor = totalScore >= 61 ? "#22c55e" : totalScore >= 31 ? "#eab308" : "#ef4444";

    // Generate AI recommendations
    const missingFactors = factors.filter(f => !f.status).map(f => f.factor);
    let recommendations = "";
    try {
      const prompt = `Generate 3-4 short, actionable recommendations for a local business (${biz.name}, ${(biz.categories as any)?.name || "local business"}) that is missing these from their Google/online presence: ${missingFactors.join(", ") || "nothing major"}.

For each recommendation, include a specific stat or benefit. Keep each to 1-2 sentences. Format as bullet points.`;

      const result = await callAI(
        [{ role: "user", content: prompt }],
        { maxTokens: 400, temperature: 0.7, preferredProvider: "groq" }
      );
      recommendations = result.text;
    } catch {
      recommendations = missingFactors.map(f => {
        const tips: Record<string, string> = {
          "Listing Claimed": "Claim your Google Business listing to control your information and respond to reviews.",
          "Photos Present": "Add business photos — listings with photos get 42% more direction requests.",
          "Hours Set": "Set your business hours — customers skip businesses with no hours listed.",
          "Rating (4+)": "Improve your rating by encouraging happy customers to leave reviews.",
          "Reviews (10+)": "Get more reviews — businesses with 10+ reviews see 50% more traffic.",
          "Description": "Add a detailed description — helps Google understand and rank your business.",
        };
        return `• ${tips[f] || `Address missing: ${f}`}`;
      }).join("\n");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://platinumdirectorytemeculavalley.com";
    const listingUrl = `${baseUrl}/business/${biz.slug}`;
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Generate audit HTML
    const auditHtml = generateAuditHtml({
      businessName: biz.name,
      category: (biz.categories as any)?.name || "Local Business",
      city: biz.city || "Temecula Valley",
      totalScore,
      scoreColor,
      factors,
      recommendations,
      listingUrl,
      date,
    });

    // Store audit data on the business record
    await adminClient
      .from("businesses")
      .update({
        google_presence_score: totalScore,
        metadata: {
          ...(biz.metadata || {}),
          last_audit_date: new Date().toISOString(),
          last_audit_score: totalScore,
        },
      })
      .eq("id", business_id);

    return NextResponse.json({
      score: totalScore,
      factors,
      recommendations,
      audit_html: auditHtml,
      listing_url: listingUrl,
    });
  } catch (err) {
    console.error("Audit generation error:", err);
    return NextResponse.json({ error: "Failed to generate audit" }, { status: 500 });
  }
}

function generateAuditHtml(data: {
  businessName: string;
  category: string;
  city: string;
  totalScore: number;
  scoreColor: string;
  factors: AuditFactor[];
  recommendations: string;
  listingUrl: string;
  date: string;
}): string {
  const factorRows = data.factors
    .map(f => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${f.factor}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;text-align:center;">
          ${f.status ? "✅" : "❌"}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;text-align:center;">
          ${f.score} / ${f.maxScore}
        </td>
      </tr>
    `)
    .join("");

  const recHtml = data.recommendations
    .split("\n")
    .filter(l => l.trim())
    .map(l => `<li style="margin-bottom:8px;">${l.replace(/^[•\-*]\s*/, "")}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Google Presence Audit — ${data.businessName}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a1a; color: #e5e5e5; margin: 0; padding: 40px; }
    .container { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { color: #d4a843; font-size: 28px; margin: 0; letter-spacing: 2px; }
    .header p { color: #999; margin: 8px 0 0; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; border: 4px solid ${data.scoreColor}; display: flex; align-items: center; justify-content: center; margin: 24px auto; }
    .score-number { font-size: 36px; font-weight: bold; color: ${data.scoreColor}; }
    .score-label { font-size: 12px; color: #999; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { background: #1a1a2e; padding: 10px 12px; text-align: left; color: #d4a843; font-size: 13px; border-bottom: 2px solid #d4a843; }
    td { font-size: 13px; }
    .recommendations { background: #1a1a2e; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .recommendations h3 { color: #d4a843; margin: 0 0 12px; font-size: 16px; }
    .recommendations ul { margin: 0; padding-left: 20px; }
    .recommendations li { color: #ccc; font-size: 13px; line-height: 1.6; }
    .cta { background: linear-gradient(135deg, #1a1a2e, #2a1a3e); border: 1px solid #d4a843; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
    .cta a { color: #d4a843; font-size: 14px; word-break: break-all; }
    .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #333; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GOOGLE PRESENCE AUDIT</h1>
      <p>Prepared for: <strong style="color:#fff;">${data.businessName}</strong></p>
      <p>${data.category} — ${data.city}</p>
      <p>By Platinum Directory Temecula Valley</p>
      <p style="font-size:12px;">${data.date}</p>
    </div>

    <div class="score-circle">
      <div>
        <div class="score-number">${data.totalScore}</div>
      </div>
    </div>
    <p class="score-label">out of 100</p>

    <table>
      <thead>
        <tr>
          <th>Factor</th>
          <th style="text-align:center;">Status</th>
          <th style="text-align:center;">Score</th>
        </tr>
      </thead>
      <tbody>
        ${factorRows}
      </tbody>
    </table>

    <div class="recommendations">
      <h3>Recommendations</h3>
      <ul>${recHtml}</ul>
    </div>

    <div class="cta">
      <p style="color:#ccc;margin:0 0 8px;font-size:14px;">Your Platinum Directory listing is already live at:</p>
      <a href="${data.listingUrl}">${data.listingUrl}</a>
      <p style="color:#999;margin:12px 0 0;font-size:13px;">
        Upgrade to Verified ($99/mo) to unlock your full listing with photos,<br>
        verified badge, lead alerts, and Smart Offers.
      </p>
    </div>

    <div class="footer">
      <p><strong>Frank</strong> — Sales Representative</p>
      <p>Platinum Directory Temecula Valley</p>
      <p>platinumdirectorytemeculavalley.com</p>
    </div>
  </div>
</body>
</html>`;
}
