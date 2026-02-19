import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { giveawayId, fullName, email, phone, zipCode, referredBy } = body;

    if (!fullName || !email || !zipCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check for existing entry by email (and optionally by giveaway_type)
    // The giveaway_entries table does not have a giveaway_id FK --
    // entries are distinguished by giveaway_type. We use the giveawayId
    // as a way to determine the type, defaulting to 'consumer'.
    const giveawayType = giveawayId === "giveaway-business-elite" ? "business" : "consumer";

    const { data: existing } = await supabase
      .from("giveaway_entries")
      .select("id")
      .eq("email", email)
      .eq("giveaway_type", giveawayType)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already entered" }, { status: 409 });
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: entry, error } = await supabase
      .from("giveaway_entries")
      .insert({
        giveaway_type: giveawayType,
        full_name: fullName,
        email,
        phone: phone || "",
        city: zipCode, // Using city field for zip code storage (closest match in schema)
        referral_code: referredBy || null,
        total_entries: 1,
        bonus_entries: 0,
        agreed_to_rules: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Giveaway entry error:", error);
      return NextResponse.json({ error: "Failed to enter giveaway" }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: { ...entry, referralCode } });
  } catch (error) {
    console.error("Giveaway entry error:", error);
    return NextResponse.json({ error: "Failed to enter giveaway" }, { status: 500 });
  }
}
