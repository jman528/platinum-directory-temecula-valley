import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TIER_MAP: Record<string, string> = {
  "verified_platinum": "verified_platinum",
  "verified platinum": "verified_platinum",
  "platinum_partner": "platinum_partner",
  "platinum partner": "platinum_partner",
  "platinum_elite": "platinum_elite",
  "platinum elite": "platinum_elite",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, plan_name, status } = body;

    const tier = TIER_MAP[plan_name?.toLowerCase()] || "free";
    const supabase = createAdminClient();

    // Find user by email and update their business tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profile) {
      // Update business tier
      await supabase
        .from("businesses")
        .update({
          tier,
          is_featured: tier === "platinum_partner" || tier === "platinum_elite",
          subscription_status: status || "active",
        })
        .eq("owner_user_id", profile.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GHL webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
