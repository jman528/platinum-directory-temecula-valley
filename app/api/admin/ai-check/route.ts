import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TIER_FEATURES: Record<string, any> = {
  free: { maxImages: 0, maxOffers: 0, hasHours: false, hasSocial: false, hasDescription: false },
  verified_platinum: { maxImages: 5, maxOffers: 3, hasHours: true, hasSocial: true, hasDescription: true },
  platinum_partner: { maxImages: 15, maxOffers: 10, hasHours: true, hasSocial: true, hasDescription: true },
  platinum_elite: { maxImages: 50, maxOffers: -1, hasHours: true, hasSocial: true, hasDescription: true },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles").select("user_type").eq("id", user.id).single();
  if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { business } = await request.json();
  if (!business) return NextResponse.json({ error: "No business data" }, { status: 400 });

  const tier = business.tier || "free";
  const features = TIER_FEATURES[tier] || TIER_FEATURES.free;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Missing fields check
  if (!business.phone) issues.push("Missing phone number");
  if (!business.email) issues.push("Missing email address");
  if (!business.website) issues.push("Missing website URL");
  if (!business.address) issues.push("Missing address");
  if (!business.description || business.description.length < 50) {
    issues.push(`Description is ${business.description?.length || 0} characters. Aim for 150-300 for better search results.`);
  }
  if (!business.hours || Object.keys(business.hours).length === 0) {
    issues.push("No business hours set");
  }
  if (features.hasSocial && (!business.social_media || Object.values(business.social_media).filter(Boolean).length === 0)) {
    issues.push("No social media links set (available for this tier)");
  }
  if (!business.amenities || business.amenities.length === 0) {
    suggestions.push("Consider adding amenities for better discovery");
  }

  // Category-based suggestions
  const catName = business.categories?.name || "";
  if (catName.toLowerCase().includes("winer") && !(business.amenities || []).includes("Wine Tasting")) {
    suggestions.push('Wineries should have "Wine Tasting" amenity');
  }
  if (catName.toLowerCase().includes("restaurant") && !(business.amenities || []).includes("Takeout")) {
    suggestions.push('Restaurants should consider adding "Takeout" amenity');
  }

  // Tier-specific recommendations
  if (tier === "verified_platinum" || tier === "platinum_partner" || tier === "platinum_elite") {
    if (!business.hours || Object.keys(business.hours).length < 7) {
      suggestions.push("Paid tier businesses should have complete hours for all 7 days");
    }
    const socialCount = business.social_media ? Object.values(business.social_media).filter(Boolean).length : 0;
    if (socialCount < 2) {
      suggestions.push("Paid tier businesses should have at least 2-3 social media links for best visibility");
    }
  }

  const result = [
    issues.length > 0 ? `Issues found:\n${issues.map(i => `- ${i}`).join("\n")}` : "No critical issues found.",
    suggestions.length > 0 ? `\nSuggestions:\n${suggestions.map(s => `- ${s}`).join("\n")}` : "",
    `\nData Quality Score: ${business.data_quality_score || 0}/100`,
    business.is_hot_lead ? `Hot Lead: Yes (${business.hot_lead_reason || "unknown reason"})` : "",
  ].filter(Boolean).join("\n");

  return NextResponse.json({ result });
}
