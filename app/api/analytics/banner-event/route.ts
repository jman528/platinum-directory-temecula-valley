import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { banner_type, action, page_url, visitor_id, metadata } = await req.json();

    if (!banner_type || !action) {
      return NextResponse.json({ error: "banner_type and action required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    await adminClient.from("page_analytics").insert({
      event_type: `banner_${action}`,
      visitor_id: visitor_id || null,
      metadata: {
        banner_type,
        action,
        page_url: page_url || null,
        ...metadata,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error("Banner event error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
