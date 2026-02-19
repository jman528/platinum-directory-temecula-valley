import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";

  try {
    const supabase = await createClient();

    let queryBuilder = supabase
      .from("businesses")
      .select(`
        id, name, slug, city, tier, average_rating,
        categories(slug)
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("average_rating", { ascending: false })
      .limit(20);

    if (city) {
      queryBuilder = queryBuilder.ilike("city", city);
    }
    if (category) {
      queryBuilder = queryBuilder.eq("categories.slug", category);
    }

    const { data: businesses, error } = await queryBuilder;

    if (error) {
      console.error("Businesses fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
    }

    // Normalize response shape
    const normalized = (businesses || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city,
      tier: b.tier,
      average_rating: b.average_rating,
    }));

    return NextResponse.json({ businesses: normalized });
  } catch (err) {
    console.error("Businesses fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const adminClient = createAdminClient();

    // Generate slug from name
    const slug = body.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `business-${Date.now()}`;

    const { data: business, error } = await adminClient
      .from("businesses")
      .insert({
        ...body,
        slug,
        owner_user_id: user.id,
        tier: "free",
        is_active: false, // pending review
        is_featured: false,
        average_rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Business creation error:", error);
      return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
    }

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error("Business creation error:", error);
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }
}
