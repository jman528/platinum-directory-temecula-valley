"use client";

import { useEffect, useState } from "react";

function getNextSunday() {
  const now = new Date();
  const day = now.getDay();
  const daysUntil = day === 0 ? 7 : 7 - day;
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil, 20, 0, 0);
  return next;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = getNextSunday();
    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 sm:gap-3">
      {(["days", "hours", "minutes", "seconds"] as const).map((label) => (
        <div key={label} className="countdown-digit flex flex-col items-center px-2.5 py-2 sm:px-3.5">
          <span className="font-heading text-xl font-bold text-white tabular-nums sm:text-2xl">
            {String(timeLeft[label]).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gray-500 sm:text-[10px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
