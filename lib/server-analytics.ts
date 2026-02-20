/**
 * Server-side Conversions API tracking.
 * Bypasses ad blockers by sending events directly to Meta/TikTok servers.
 */

export async function trackServerEvent(eventName: string, data: Record<string, any> = {}) {
  const promises: Promise<void>[] = [];

  // Meta Conversions API
  if (process.env.META_CAPI_TOKEN && process.env.META_PIXEL_ID) {
    promises.push(
      fetch(`https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            ...data,
          }],
          access_token: process.env.META_CAPI_TOKEN,
        }),
      }).then(() => {}).catch(() => {})
    );
  }

  // TikTok Events API
  if (process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_PIXEL_CODE) {
    promises.push(
      fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": process.env.TIKTOK_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          pixel_code: process.env.TIKTOK_PIXEL_CODE,
          event: eventName,
          event_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          ...data,
        }),
      }).then(() => {}).catch(() => {})
    );
  }

  await Promise.allSettled(promises);
}
