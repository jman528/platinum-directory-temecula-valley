import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { businessId, templateType = "welcome" } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: biz } = await adminClient
      .from("businesses")
      .select("*, categories(name)")
      .eq("id", businessId)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const tierLabels: Record<string, string> = {
      verified_platinum: "Verified",
      platinum_partner: "Partner",
      platinum_elite: "Elite",
    };
    const tierLabel = tierLabels[biz.tier as string] || "Member";

    const tierEmojis: Record<string, string> = {
      verified_platinum: "✓",
      platinum_partner: "⭐",
      platinum_elite: "👑",
    };
    const tierEmoji = tierEmojis[biz.tier as string] || "✓";

    const category = (biz.categories as any)?.name || "Local Business";
    const description = (biz.description || "").slice(0, 120);

    // Generate OG image (1200x630)
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #0A0E1A 0%, #1a1040 50%, #0D1321 100%)",
            fontFamily: "system-ui, sans-serif",
            padding: "60px",
          }}
        >
          {/* Glass card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "24px",
              padding: "48px 64px",
              maxWidth: "900px",
            }}
          >
            {/* Tier badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                borderRadius: "24px",
                padding: "8px 20px",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{tierEmoji}</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0A0F1A" }}>
                {tierLabel.toUpperCase()} MEMBER
              </span>
            </div>

            {/* Business name */}
            <h1
              style={{
                fontSize: "42px",
                fontWeight: 800,
                color: "#C9A84C",
                textAlign: "center",
                margin: "0",
                lineHeight: 1.2,
              }}
            >
              {biz.name}
            </h1>

            {/* Category */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              <span
                style={{
                  background: "rgba(124, 58, 237, 0.3)",
                  color: "#A78BFA",
                  borderRadius: "12px",
                  padding: "6px 16px",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {category}
              </span>
              <span style={{ color: "#6B7280", fontSize: "16px" }}>
                {biz.city || "Temecula Valley"}, CA
              </span>
            </div>

            {/* Description */}
            {description && (
              <p
                style={{
                  color: "#9CA3AF",
                  fontSize: "16px",
                  textAlign: "center",
                  marginTop: "16px",
                  maxWidth: "600px",
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            )}

            {/* Tagline */}
            <p
              style={{
                color: "#6B7280",
                fontSize: "14px",
                marginTop: "24px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Now on Platinum Directory
            </p>
          </div>

          {/* Branding */}
          <p
            style={{
              color: "rgba(201, 168, 76, 0.6)",
              fontSize: "14px",
              marginTop: "24px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Platinum Directory Temecula Valley
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    return imageResponse;
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
