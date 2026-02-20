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

    // Verify super_admin
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "super_admin") {
      return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
    }

    const { flag_key, is_enabled } = await req.json();

    if (!flag_key || typeof is_enabled !== "boolean") {
      return NextResponse.json({ error: "flag_key and is_enabled required" }, { status: 400 });
    }

    // Upsert the flag
    const { error } = await adminClient
      .from("feature_flags")
      .upsert(
        {
          flag_key,
          is_enabled,
          last_changed_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "flag_key" }
      );

    if (error) {
      console.error("Feature flag update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, flag_key, is_enabled });
  } catch (err: any) {
    console.error("Feature flags error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
