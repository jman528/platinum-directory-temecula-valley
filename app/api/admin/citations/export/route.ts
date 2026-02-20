import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateCitationData,
  citationToCSVRow,
  CITATION_CSV_HEADER,
} from "@/lib/citations/generate-citation";

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get business IDs from query params
  const businessIds = req.nextUrl.searchParams.get("businessIds");
  let query = adminClient
    .from("businesses")
    .select("id, name, address, city, zip_code, phone, website, description, slug, categories(name)")
    .eq("is_active", true);

  if (businessIds) {
    const ids = businessIds.split(",").filter(Boolean);
    query = query.in("id", ids);
  }

  const { data: businesses, error } = await query.limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate CSV
  const rows = (businesses || []).map((biz: any) => {
    const citationData = generateCitationData({
      ...biz,
      category: (biz.categories as any)?.name || "Local Business",
    });
    return citationToCSVRow(citationData);
  });

  const csv = [CITATION_CSV_HEADER, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="pd-citations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
