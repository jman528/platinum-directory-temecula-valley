"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PromoBanner from "./PromoBanner";

interface MultiplierEvent {
  id: string;
  name: string;
  multiplier: number;
  end_date: string;
}

export default function FlashDealBanner() {
  const [event, setEvent] = useState<MultiplierEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/public/activity-feed");
        if (!res.ok) return;
        const data = await res.json();
        if (data.activeMultiplier) {
          setEvent(data.activeMultiplier);
        }
      } catch {}
    }
    check();
  }, []);

  useEffect(() => {
    if (!event?.end_date) return;
    function tick() {
      const now = new Date().getTime();
      const end = new Date(event!.end_date).getTime();
      const diff = end - now;
      if (diff <= 0) { setEvent(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    }
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [event?.end_date]);

  if (!event) return null;

  return (
    <PromoBanner type="flash-deal" position="top-sticky" dismissable>
      <div className="bg-gradient-to-r from-red-900/90 via-orange-900/90 to-red-900/90 backdrop-blur-md border-b border-orange-500/20">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5">
          <span className="text-lg animate-pulse">🔥</span>
          <span className="text-sm font-bold text-white">
            FLASH EVENT: {event.multiplier}x Points{event.name ? ` — ${event.name}` : ""}!
          </span>
          <span className="hidden text-xs text-gray-300 sm:inline">
            Ends in {timeLeft}
          </span>
          <Link
            href="/rewards"
            className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300 hover:bg-orange-500/30"
          >
            Earn Points →
          </Link>
        </div>
      </div>
    </PromoBanner>
  );
}
