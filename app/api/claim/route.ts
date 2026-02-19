import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, ownerName } = body;

    if (!businessId) {
      return NextResponse.json({ error: "Missing business ID" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check that the business exists and is not already claimed
    const { data: business, error: fetchError } = await adminClient
      .from("businesses")
      .select("id, owner_user_id")
      .eq("id", businessId)
      .is("owner_user_id", null)
      .single();

    if (fetchError || !business) {
      return NextResponse.json(
        { error: "Business not found or already claimed" },
        { status: 404 }
      );
    }

    // Get user profile for name fallback
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Update the business with the new owner
    const { data: updated, error: updateError } = await adminClient
      .from("businesses")
      .update({
        owner_user_id: user.id,
        is_claimed: true,
        claimed_by: ownerName || profile?.full_name || user.email || "",
      })
      .eq("id", businessId)
      .select()
      .single();

    if (updateError) {
      console.error("Claim error:", updateError);
      return NextResponse.json({ error: "Failed to claim business" }, { status: 500 });
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to claim business" }, { status: 500 });
  }
}
