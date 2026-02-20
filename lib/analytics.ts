/**
 * Client-side analytics event tracking.
 * Fires to GA4 (via GTM dataLayer), Meta Pixel, TikTok Pixel, and internal API.
 */

import { getStoredTrackingParams, getVisitorId } from "@/lib/utm-persistence";

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
    fbq?: (...args: any[]) => void;
    ttq?: { track: (...args: any[]) => void };
    gtag?: (...args: any[]) => void;
  }
}

const META_EVENT_MAP: Record<string, string> = {
  signup: "CompleteRegistration",
  purchase: "Purchase",
  add_to_cart: "AddToCart",
  claim_business: "Lead",
  page_view: "PageView",
  share: "Share",
};

export function trackEvent(eventName: string, data: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  const tracking = getStoredTrackingParams();
  const enrichedData = { ...data, ...tracking, visitor_id: getVisitorId() };

  // 1. GA4 via GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...enrichedData });
  }

  // 2. Meta Pixel
  if (window.fbq) {
    const metaEvent = META_EVENT_MAP[eventName];
    if (metaEvent) {
      window.fbq("track", metaEvent, enrichedData);
    }
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, enrichedData);
  }

  // 4. Internal analytics API (fire and forget)
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventName, ...enrichedData }),
  }).catch(() => {});
}
