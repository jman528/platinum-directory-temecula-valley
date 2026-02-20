import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (
    profile?.user_type !== "admin" &&
    profile?.user_type !== "super_admin"
  ) {
    return null;
  }
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await verifyAdmin(supabase);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const city = url.searchParams.get("city") || "";
    const tab = url.searchParams.get("tab") || "all";

    // Build query — service role sees ALL rows (bypasses RLS)
    let query = adminClient
      .from("businesses")
      .select("id, name, slug, city, tier, is_active, is_claimed, claim_status, phone, email, created_at, category_id, categories(name)", { count: "exact" });

    // Tab filters
    if (tab === "pending") {
      query = query.eq("is_active", false);
    } else if (tab === "active") {
      query = query.eq("is_active", true);
    } else if (tab === "free") {
      query = query.eq("tier", "free");
    } else if (tab === "verified_platinum") {
      query = query.eq("tier", "verified_platinum");
    } else if (tab === "platinum_partner") {
      query = query.eq("tier", "platinum_partner");
    } else if (tab === "platinum_elite") {
      query = query.eq("tier", "platinum_elite");
    } else if (tab === "suspended") {
      query = query.eq("is_active", false);
    } else if (tab === "hot_leads") {
      query = query.eq("is_hot_lead", true);
    } else if (tab === "paid") {
      query = query.neq("tier", "free");
    }

    // Search filter
    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // City filter
    if (city) {
      query = query.eq("city", city);
    }

    // Pagination + ordering
    const from = page * limit;
    const to = from + limit - 1;
    if (tab === "hot_leads") {
      query = query.order("lead_score", { ascending: false }).range(from, to);
    } else {
      query = query.order("created_at", { ascending: false }).range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin businesses query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten category name
    const businesses = (data || []).map((b: any) => ({
      ...b,
      category_name: b.categories?.name || null,
      categories: undefined,
    }));

    // Get summary counts (separate queries for accuracy across all filters)
    const [totalRes, activeRes, pendingRes] = await Promise.all([
      adminClient.from("businesses").select("id", { count: "exact", head: true }),
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("is_active", true),
      adminClient.from("businesses").select("id", { count: "exact", head: true }).eq("is_active", false),
    ]);

    return NextResponse.json({
      businesses,
      total: count || 0,
      summary: {
        total: totalRes.count || 0,
        active: activeRes.count || 0,
        pending: pendingRes.count || 0,
      },
    });
  } catch (error) {
    console.error("GET admin businesses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
