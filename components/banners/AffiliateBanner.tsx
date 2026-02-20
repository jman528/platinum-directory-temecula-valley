"use client";

import Link from "next/link";
import PromoBanner from "./PromoBanner";

export default function AffiliateBanner() {
  return (
    <PromoBanner type="affiliate" position="inline" dismissable>
      <div className="glass-card border-green-500/20 mx-auto max-w-5xl overflow-hidden">
        <div className="relative p-6 sm:p-8">
          {/* Floating background elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -left-4 top-4 text-4xl animate-bounce" style={{ animationDuration: "3s" }}>💰</div>
            <div className="absolute right-8 top-2 text-3xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>🪙</div>
            <div className="absolute bottom-4 left-1/3 text-3xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>💵</div>
          </div>

          <div className="relative">
            <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
              💰 Get Paid to Send Traffic Here
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Earn points for every person you refer. Cash out anytime.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              {[
                { pts: "10 pts", label: "per click" },
                { pts: "100 pts", label: "per signup" },
                { pts: "500 pts", label: "per entry" },
              ].map(item => (
                <div key={item.label} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="text-lg font-bold text-pd-gold">{item.pts}</span>
                  <span className="ml-2 text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/rewards"
                className="rounded-lg bg-green-600/20 px-5 py-2.5 text-sm font-medium text-green-400 hover:bg-green-600/30 transition-colors"
              >
                Get Your Referral Link →
              </Link>
              <Link
                href="/partners"
                className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PromoBanner>
  );
}
