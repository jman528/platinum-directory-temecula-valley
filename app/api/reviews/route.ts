import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// NOTE: A "reviews" table must exist in Supabase with columns:
//   id (UUID PK), business_id (UUID FK -> businesses), user_id (UUID FK -> profiles),
//   author_name (TEXT), author_avatar (TEXT), rating (INTEGER), title (TEXT),
//   body (TEXT), status (TEXT default 'pending'), published_at (TIMESTAMPTZ),
//   created_at (TIMESTAMPTZ default NOW())
// If it does not yet exist, run the migration to create it.

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, rating, title, body: reviewBody } = body;

    if (!businessId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user profile for author info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    const adminClient = createAdminClient();

    const { data: review, error } = await adminClient
      .from("reviews")
      .insert({
        business_id: businessId,
        user_id: user.id,
        author_name: profile?.full_name || user.email?.split("@")[0] || "Anonymous",
        author_avatar: profile?.avatar_url || "",
        rating: Number(rating),
        title: title || "",
        body: reviewBody || "",
        status: "pending",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Review creation error:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
