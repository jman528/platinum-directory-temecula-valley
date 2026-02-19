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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (
      profile?.user_type !== "admin" &&
      profile?.user_type !== "super_admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { rows, columnMapping, force } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No data to import" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mapped: Record<string, string> = {};

      // Apply column mapping
      for (const [csvCol, dbCol] of Object.entries(columnMapping)) {
        if (dbCol && row[csvCol] !== undefined) {
          mapped[dbCol as string] = row[csvCol];
        }
      }

      const name = mapped.name?.trim();
      if (!name) {
        errors.push(`Row ${i + 1}: Missing business name`);
        continue;
      }

      const city = mapped.city?.trim() || "Temecula";

      // Check for duplicates (name + city)
      const { data: existing } = await adminClient
        .from("businesses")
        .select("id")
        .ilike("name", name)
        .ilike("city", city)
        .limit(1);

      if (existing && existing.length > 0 && !force) {
        skipped++;
        continue;
      }

      // Generate slug
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + `-${Date.now()}-${i}`;

      const { error: insertError } = await adminClient
        .from("businesses")
        .insert({
          name,
          slug,
          address: mapped.address?.trim() || null,
          city,
          state: mapped.state?.trim() || "CA",
          zip_code: mapped.zip_code?.trim() || null,
          phone: mapped.phone?.trim() || null,
          email: mapped.email?.trim() || null,
          website: mapped.website?.trim() || null,
          description: mapped.description?.trim() || null,
          tier: "free",
          is_active: true,
          is_featured: false,
          is_claimed: false,
          average_rating: 0,
          review_count: 0,
        });

      if (insertError) {
        errors.push(`Row ${i + 1} (${name}): ${insertError.message}`);
      } else {
        imported++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 50),
      total: rows.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
