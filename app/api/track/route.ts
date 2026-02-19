import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const visitorId = request.cookies.get("pd_visitor_id")?.value;
    const trackingRaw = request.cookies.get("pd_tracking")?.value;
    const tracking = trackingRaw ? JSON.parse(trackingRaw) : {};
    const refCode = request.cookies.get("pd_ref")?.value;

    const { error } = await supabase.from("events").insert({
      visitor_id: visitorId,
      user_id: body.user_id || null,
      referral_code: refCode || body.referral_code || null,
      event_type: body.event_type,
      event_data: body.event_data || {},
      page_url: body.page_url,
      page_path: body.page_path,
      business_id: body.business_id || null,
      offer_id: body.offer_id || null,
      utm_source: tracking.utm_source || null,
      utm_medium: tracking.utm_medium || null,
      utm_campaign: tracking.utm_campaign || null,
      utm_term: tracking.utm_term || null,
      utm_content: tracking.utm_content || null,
      click_id_type: tracking.gclid
        ? "gclid"
        : tracking.fbclid
          ? "fbclid"
          : tracking.ttclid
            ? "ttclid"
            : null,
      click_id_value:
        tracking.gclid || tracking.fbclid || tracking.ttclid || null,
      device_type: body.device_type || null,
      browser: body.browser || null,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
