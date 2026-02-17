"use client";

import { useState, useEffect } from "react";
import { Gift, Users, Facebook, Twitter } from "lucide-react";

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="countdown-digit flex flex-col items-center px-4 py-3">
          <span className="font-heading text-2xl font-bold text-white tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs capitalize text-gray-400">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function GiveawayPage() {
  const [submitted, setSubmitted] = useState(false);
  const nextWeekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="premium-bg container py-12">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="animate-float mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
          <Gift className="h-8 w-8 text-pd-gold" />
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Win <span className="text-gold-shimmer">$250</span> in Gift Cards This Week!
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Gift cards from local Temecula Valley businesses &mdash; new winner every week
        </p>

        <div className="mt-8 flex justify-center">
          <CountdownTimer endDate={nextWeekEnd} />
        </div>
      </div>

      {/* Entry Form */}
      <div className="mx-auto mt-12 max-w-md">
        {submitted ? (
          <div className="glass-card-premium p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20">
              <Gift className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">You&apos;re Entered!</h2>
            <p className="mt-2 text-gray-400">Good luck! Winners announced every Friday.</p>

            {/* Get More Entries */}
            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-gray-300">Get More Entries:</p>
              <button className="glass-card flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-white transition-all hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10">
                <Facebook className="h-4 w-4 text-[#1877F2]" /> Share on Facebook <span className="text-pd-gold">(+5 entries)</span>
              </button>
              <button className="glass-card flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-white transition-all hover:border-gray-400/40 hover:bg-white/5">
                <Twitter className="h-4 w-4" /> Share on X <span className="text-pd-gold">(+5 entries)</span>
              </button>
              <button className="glass-card flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-white transition-all hover:border-pd-purple/40 hover:bg-pd-purple/10">
                <Users className="h-4 w-4 text-pd-purple-light" /> Refer a Friend <span className="text-pd-gold">(+10 entries)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card-premium p-8">
            <h2 className="font-heading text-xl font-bold text-white text-center">Enter the Giveaway</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-gray-400">Full Name</label>
                <input type="text" required className="glass-input w-full px-4 py-2.5 text-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Email Address</label>
                <input type="email" required className="glass-input w-full px-4 py-2.5 text-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Phone Number</label>
                <input type="tel" required className="glass-input w-full px-4 py-2.5 text-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">ZIP Code</label>
                <input type="text" required pattern="[0-9]{5}" className="glass-input w-full px-4 py-2.5 text-white focus:outline-none" />
              </div>
              <button type="submit" className="btn-glow wine-accent-gradient w-full rounded-xl py-3 font-heading font-bold text-white transition-opacity hover:opacity-90">
                ENTER GIVEAWAY
              </button>
              <p className="text-center text-xs text-gray-500">
                Giveaway eligible for Temecula Valley residents. See official rules.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
