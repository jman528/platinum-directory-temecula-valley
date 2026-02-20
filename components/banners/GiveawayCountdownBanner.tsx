"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PromoBanner from "./PromoBanner";

function getNextMonday(): Date {
  const now = new Date();
  const pst = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const day = pst.getDay();
  const diff = (8 - day) % 7 || 7;
  const next = new Date(pst);
  next.setDate(pst.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor((ms / 60000) % 60);
  const h = Math.floor((ms / 3600000) % 24);
  const d = Math.floor(ms / 86400000);
  return { d, h, m, s };
}

export default function GiveawayCountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = getNextMonday();
    function tick() {
      const now = new Date();
      const pstNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      setTimeLeft(formatCountdown(target.getTime() - pstNow.getTime()));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PromoBanner type="giveaway" position="top-sticky" dismissable>
      <div className="bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:gap-4">
          <span className="text-lg">🎰</span>
          <span className="hidden text-sm font-medium text-white sm:inline">
            Win <span className="font-bold text-pd-gold" style={{ textShadow: "0 0 10px rgba(218,165,32,0.5)" }}>$250</span> This Week!
          </span>
          <span className="text-sm font-medium text-white sm:hidden">
            <span className="font-bold text-pd-gold">$250</span> Giveaway
          </span>
          <span className="hidden items-center gap-1 text-xs text-gray-300 sm:flex">
            ⏰ {timeLeft.d}d {timeLeft.h}h {String(timeLeft.m).padStart(2, "0")}m {String(timeLeft.s).padStart(2, "0")}s
          </span>
          <Link
            href="/giveaway"
            className="rounded-full bg-pd-gold/20 px-3 py-1 text-xs font-bold text-pd-gold hover:bg-pd-gold/30 transition-colors"
          >
            Enter FREE →
          </Link>
        </div>
      </div>
    </PromoBanner>
  );
}
