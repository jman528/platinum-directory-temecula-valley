import { createClient } from "@/lib/supabase/server";

interface TrackEventProps {
  event_type: string;
  visitor_id?: string;
  user_id?: string;
  referral_code?: string;
  event_data?: Record<string, unknown>;
  page_url?: string;
  page_path?: string;
  business_id?: string;
  offer_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  click_id_type?: string;
  click_id_value?: string;
  device_type?: string;
  browser?: string;
  ip_address?: string;
}

export async function trackEvent(props: TrackEventProps) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("events").insert({
      ...props,
      event_data: props.event_data ?? {},
      created_at: new Date().toISOString(),
    });
    if (error) console.error("Track event error:", error);
  } catch (e) {
    console.error("Track event failed:", e);
  }
}
