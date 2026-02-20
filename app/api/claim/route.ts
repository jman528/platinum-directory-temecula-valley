import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId, verificationMethod } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Missing business ID" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check that the business exists
    const { data: business, error: fetchError } = await adminClient
      .from("businesses")
      .select("id, name, owner_user_id, is_claimed")
      .eq("id", businessId)
      .single();

    if (fetchError || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (business.owner_user_id || business.is_claimed) {
      return NextResponse.json(
        { error: "This business has already been claimed" },
        { status: 409 }
      );
    }

    // Get user profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Update the business with the new owner
    const { error: updateError } = await adminClient
      .from("businesses")
      .update({
        owner_user_id: user.id,
        is_claimed: true,
        claimed_by: user.id,
        claim_status: "pending",
        claimed_at: new Date().toISOString(),
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq("id", businessId);

    if (updateError) {
      console.error("Claim update error:", updateError);
      return NextResponse.json(
        { error: "Failed to claim business. Please try again." },
        { status: 500 }
      );
    }

    // Add claimer as owner in business_members
    await adminClient
      .from("business_members")
      .upsert({
        business_id: businessId,
        profile_id: user.id,
        role: "owner",
        status: "active",
        accepted_at: new Date().toISOString(),
      }, { onConflict: "business_id,profile_id" });

    // Set user profile to business_owner if they are currently a customer
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ user_type: "business_owner" })
      .eq("id", user.id)
      .eq("user_type", "customer");

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Non-fatal — the claim succeeded
    }

    return NextResponse.json({
      success: true,
      message: `Your claim for "${business.name}" is under review. We'll notify you once it's approved.`,
      business: {
        id: business.id,
        name: business.name,
      },
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
