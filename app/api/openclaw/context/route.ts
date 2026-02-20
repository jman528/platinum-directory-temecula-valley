import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_TYPES = ["stats", "businesses", "offers", "search"] as const;
type QueryType = (typeof VALID_TYPES)[number];

// ── Reject non-GET methods ───────────────────────────────────

export async function POST() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
export async function PATCH() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}

// ── Helpers ──────────────────────────────────────────────────

function respond(data: any, meta: Record<string, any>) {
  return NextResponse.json({ success: true, data, meta });
}

function errorResponse(msg: string, status: number) {
  return NextResponse.json({ success: false, error: msg }, { status });
}

// ── GET handler ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Auth
  const apiKey = process.env.OPENCLAW_API_KEY;
  if (!apiKey) {
    return errorResponse("OPENCLAW_API_KEY not configured on server", 503);
  }

  const provided = req.headers.get("x-openclaw-key");
  if (!provided || provided !== apiKey) {
    return errorResponse("Unauthorized — invalid or missing X-OpenClaw-Key", 401);
  }

  // Params
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as QueryType | null;
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
  const limit = Math.min(Math.max(1, rawLimit), 100);

  if (!type || !VALID_TYPES.includes(type)) {
    return errorResponse(
      `Missing or invalid "type" param. Must be one of: ${VALID_TYPES.join(", ")}`,
      400
    );
  }

  const db = createAdminClient();

  try {
    let result: { data: any; count: number };

    switch (type) {
      case "stats":
        result = await handleStats(db);
        break;
      case "businesses":
        result = await handleBusinesses(db, { city, category, limit });
        break;
      case "offers":
        result = await handleOffers(db, { city, limit });
        break;
      case "search":
        if (!q.trim()) {
          return errorResponse('Missing "q" param for search type', 400);
        }
        result = await handleSearch(db, { q, city, category, limit });
        break;
    }

    return respond(result!.data, {
      type,
      count: result!.count,
      query_time_ms: Date.now() - start,
    });
  } catch (err) {
    console.error("OpenClaw context error:", err);
    return errorResponse("Internal server error", 500);
  }
}

// ── stats ────────────────────────────────────────────────────

async function handleStats(db: ReturnType<typeof createAdminClient>) {
  const [
    { count: totalBusinesses },
    { count: claimedBusinesses },
    { count: unclaimedBusinesses },
    { count: activeOffers },
    { data: cities },
    { count: recentSignups },
  ] = await Promise.all([
    db.from("businesses").select("*", { count: "exact", head: true }).eq("is_active", true),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("is_active", true).eq("is_claimed", true),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("is_active", true).or("is_claimed.is.null,is_claimed.eq.false"),
    db.from("offers").select("*", { count: "exact", head: true }).eq("is_active", true),
    db.from("businesses").select("city").eq("is_active", true).not("city", "is", null),
    db.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  const uniqueCities = [...new Set((cities || []).map((r: any) => r.city).filter(Boolean))];

  return {
    count: 1,
    data: {
      total_businesses: totalBusinesses || 0,
      claimed: claimedBusinesses || 0,
      unclaimed: unclaimedBusinesses || 0,
      active_offers: activeOffers || 0,
      cities_covered: uniqueCities.length,
      cities: uniqueCities,
      recent_signups_30d: recentSignups || 0,
    },
  };
}

// ── businesses ───────────────────────────────────────────────

async function handleBusinesses(
  db: ReturnType<typeof createAdminClient>,
  opts: { city: string; category: string; limit: number }
) {
  let query = db
    .from("businesses")
    .select("id, name, city, state, tier, is_claimed, slug, phone, website, is_active, categories(name)")
    .eq("is_active", true)
    .order("name")
    .limit(opts.limit);

  if (opts.city) {
    query = query.ilike("city", opts.city);
  }
  if (opts.category) {
    query = query.ilike("categories.name", `%${opts.category}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const businesses = (data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    city: b.city,
    state: b.state,
    category: b.categories?.name || null,
    tier: b.tier,
    claimed: b.is_claimed || false,
    slug: b.slug,
    phone: b.phone,
    website: b.website,
    is_active: b.is_active,
  }));

  return { count: businesses.length, data: businesses };
}

// ── offers ───────────────────────────────────────────────────

async function handleOffers(
  db: ReturnType<typeof createAdminClient>,
  opts: { city: string; limit: number }
) {
  const { data, error } = await db
    .from("offers")
    .select("id, title, original_price, offer_price, slug, is_active, businesses(name, city)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(opts.limit);

  if (error) throw error;

  let offers = (data || []).map((o: any) => ({
    id: o.id,
    business_name: o.businesses?.name || null,
    title: o.title,
    original_price: o.original_price,
    sale_price: o.offer_price,
    city: o.businesses?.city || null,
    slug: o.slug,
  }));

  if (opts.city) {
    offers = offers.filter(
      (o) => o.city && o.city.toLowerCase() === opts.city.toLowerCase()
    );
  }

  return { count: offers.length, data: offers };
}

// ── search ───────────────────────────────────────────────────

async function handleSearch(
  db: ReturnType<typeof createAdminClient>,
  opts: { q: string; city: string; category: string; limit: number }
) {
  const term = `%${opts.q}%`;

  let query = db
    .from("businesses")
    .select("id, name, description, city, state, tier, slug, phone, website, is_claimed, categories(name)")
    .eq("is_active", true)
    .or(`name.ilike.${term},description.ilike.${term}`)
    .order("name")
    .limit(opts.limit);

  if (opts.city) {
    query = query.ilike("city", opts.city);
  }

  const { data, error } = await query;
  if (error) throw error;

  let results = (data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    city: b.city,
    state: b.state,
    category: b.categories?.name || null,
    tier: b.tier,
    claimed: b.is_claimed || false,
    slug: b.slug,
    phone: b.phone,
    website: b.website,
  }));

  if (opts.category) {
    const cat = opts.category.toLowerCase();
    results = results.filter(
      (r) => r.category && r.category.toLowerCase().includes(cat)
    );
  }

  return { count: results.length, data: results };
}
