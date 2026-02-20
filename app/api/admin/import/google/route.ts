import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
      return NextResponse.json({ error: "Search query required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_PLACES_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use Places API Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      q + " Temecula Valley CA"
    )}&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      console.error("Google Places error:", searchData.status, searchData.error_message);
      return NextResponse.json(
        { error: `Google Places API error: ${searchData.status}` },
        { status: 500 }
      );
    }

    const results = (searchData.results || []).slice(0, 20).map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      review_count: place.user_ratings_total,
      types: place.types,
      business_status: place.business_status,
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Google import search error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
