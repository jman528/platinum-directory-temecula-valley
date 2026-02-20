import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const page = Number(searchParams.get("page")) || 1;
  const perPage = 12;
  const offset = (page - 1) * perPage;

  try {
    const supabase = await createClient();

    // Use the search_businesses RPC function defined in the migration
    const { data: businesses, error } = await supabase.rpc("search_businesses", {
      search_term: query || null,
      filter_category: null, // We resolve the category slug to UUID below if needed
      filter_city: city || null,
      filter_tier: null,
      result_limit: perPage,
      result_offset: offset,
    });

    if (error) {
      // Fallback to direct query if RPC is not available
      let queryBuilder = supabase
        .from("businesses")
        .select(`
          id, name, slug, description, tier,
          phone, website, address, city,
          average_rating, review_count,
          cover_image_url, is_featured, category_id,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("average_rating", { ascending: false })
        .range(offset, offset + perPage - 1);

      if (query) {
        // Also match category names
        const { data: matchingCats } = await supabase
          .from("categories")
          .select("id")
          .ilike("name", `%${query}%`);
        const catIds = (matchingCats || []).map((c: any) => c.id);

        if (catIds.length > 0) {
          queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,description.ilike.%${query}%,category_id.in.(${catIds.join(",")})`
          );
        } else {
          queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,description.ilike.%${query}%`
          );
        }
      }
      if (category) {
        queryBuilder = queryBuilder.eq("categories.slug", category);
      }
      if (city) {
        queryBuilder = queryBuilder.ilike("city", city);
      }

      const { data: fallbackBusinesses, error: fallbackError } = await queryBuilder;

      if (fallbackError) {
        console.error("Search error:", fallbackError);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
      }

      // Normalize the joined category data
      const normalized = (fallbackBusinesses || []).map((b: any) => ({
        ...b,
        category_name: b.categories?.name,
        category_slug: b.categories?.slug,
        categories: undefined,
      }));

      return NextResponse.json({ businesses: normalized, page, perPage });
    }

    return NextResponse.json({ businesses: businesses || [], page, perPage });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
