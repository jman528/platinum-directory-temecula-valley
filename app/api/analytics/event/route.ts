import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, business_id, video_url, visitor_id, session_id, ...extra } = body;

    if (!event_type) {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    await adminClient.from("page_analytics").insert({
      event_type,
      business_id: business_id || null,
      visitor_id: visitor_id || null,
      session_id: session_id || null,
      metadata: { video_url, ...extra },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error("Analytics event error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
