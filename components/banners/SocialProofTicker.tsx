"use client";

import { useState, useEffect } from "react";

interface ActivityItem {
  type: string;
  text: string;
  timestamp?: string;
}

const FALLBACK_ITEMS: ActivityItem[] = [
  { type: "stat", text: "🏪 7,831 businesses listed across Temecula Valley" },
  { type: "stat", text: "🌎 11 cities covered in the Valley" },
  { type: "stat", text: "🎰 $250 giveaway this week — enter free!" },
  { type: "stat", text: "🎉 New: Smart Offers let you save before you visit" },
  { type: "stat", text: "⭐ Premium listings now available for local businesses" },
];

export default function SocialProofTicker() {
  const [items, setItems] = useState<ActivityItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/public/activity-feed", { next: { revalidate: 300 } } as any);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch {
        // Keep fallback items
      }
    }
    fetchFeed();
  }, []);

  // Double the items for seamless loop
  const tickerItems = [...items, ...items];

  return (
    <div className="overflow-hidden bg-white/[0.02] backdrop-blur-sm border-b border-white/5">
      <div className="flex animate-ticker whitespace-nowrap py-1.5">
        {tickerItems.map((item, i) => (
          <span
            key={i}
            className="mx-8 inline-block text-xs text-gray-400"
          >
            {item.text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
