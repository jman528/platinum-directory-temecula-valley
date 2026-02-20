"use client";

import { useEffect, useRef } from "react";

interface VideoPlayTrackerProps {
  businessId: string;
  videoUrl: string;
}

export default function VideoPlayTracker({ businessId, videoUrl }: VideoPlayTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (tracked.current) return;
      // YouTube iframe API sends postMessage events
      if (typeof e.data === "string") {
        try {
          const data = JSON.parse(e.data);
          if (data.event === "onStateChange" && data.info === 1) {
            trackPlay();
          }
        } catch {
          // not JSON, ignore
        }
      }
      // YouTube also sends object messages
      if (typeof e.data === "object" && e.data?.event === "infoDelivery") {
        const ps = e.data?.info?.playerState;
        if (ps === 1) trackPlay();
      }
    }

    function trackPlay() {
      if (tracked.current) return;
      tracked.current = true;

      const visitorId = getVisitorId();

      // Internal analytics
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "video_play",
          business_id: businessId,
          video_url: videoUrl,
          visitor_id: visitorId,
        }),
      }).catch(() => {});

      // GA4
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "video_play", { business_id: businessId, video_url: videoUrl });
      }

      // Meta Pixel
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "ViewContent", { content_type: "video", content_ids: [businessId] });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [businessId, videoUrl]);

  return null;
}

function getVisitorId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/pd_visitor_id=([^;]+)/);
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `pd_visitor_id=${id};path=/;max-age=${365 * 86400}`;
  return id;
}
