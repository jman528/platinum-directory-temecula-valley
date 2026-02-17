"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Shield, Zap, Crown, Check, X } from "lucide-react";
import { PRICING, PAYMENT_LINKS, TIER_CARDS, FEATURE_MATRIX } from "@/lib/constants";

type BillingPeriod = "monthly" | "quarterly" | "sixMonth" | "annual";

const billingPeriods: { key: BillingPeriod; label: string; savings?: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly", savings: "10% off" },
  { key: "sixMonth", label: "6-Month", savings: "15% off" },
  { key: "annual", label: "Annual", savings: "20% off" },
];

const tierIcons: Record<string, any> = {
  MapPin, Shield, Zap, Crown,
};

function getPaymentLink(tier: string, period: BillingPeriod): string {
  const periodMap: Record<BillingPeriod, string> = {
    monthly: "monthly", quarterly: "quarterly", sixMonth: "6month", annual: "annual",
  };
  const key = `${tier}_${periodMap[period]}` as keyof typeof PAYMENT_LINKS;
  return PAYMENT_LINKS[key] || "/pricing";
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Platinum Directory Temecula Valley
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Get found. Get customers. Keep more revenue. Join the ultimate local business directory.
        </p>
        <div className="mt-6 inline-block rounded-xl bg-pd-card px-6 py-3">
          <span className="text-3xl font-bold text-pd-gold">$1.1B</span>
          <span className="ml-2 text-gray-400">Annual Visitor Spending</span>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2 rounded-xl bg-pd-card p-1">
        {billingPeriods.map((bp) => (
          <button
            key={bp.key}
            onClick={() => setBilling(bp.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              billing === bp.key
                ? "bg-pd-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {bp.label}
            {bp.savings && <span className="ml-1 text-xs text-pd-gold">({bp.savings})</span>}
          </button>
        ))}
      </div>

      {billing === "annual" && (
        <div className="mx-auto mt-4 max-w-lg rounded-lg bg-pd-gold/10 px-4 py-2 text-center text-sm text-pd-gold">
          Annual billing selected &middot; Save up to $8,400/year on Elite tier!
        </div>
      )}

      {/* Now Included Banner */}
      <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <p className="text-center text-sm font-medium text-green-400">
          NOW INCLUDED IN ALL PLANS (Even FREE!): Contact & Lead Management &bull; Deal Pipeline &bull; Lead Source Tracking &bull; Conversion & ROI Reports &bull; Referral Program Tracking &bull; Coupon & Promo Management
        </p>
      </div>

      {/* Tier Cards */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4">
        {/* FREE */}
        <div className="glass-card relative flex flex-col p-6">
          <MapPin className="h-8 w-8 text-gray-400" />
          <h3 className="mt-3 font-heading text-xl font-bold text-white">FREE</h3>
          <p className="text-sm text-gray-400">Always free, no billing</p>
          <p className="mt-4 text-3xl font-bold text-white">$0<span className="text-sm text-gray-400">/mo</span></p>
          <div className="mt-4 rounded-lg bg-green-500/10 p-2 text-xs text-green-400">
            Organic Traffic, Smart Offers Affiliate
          </div>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {["Basic Business Listing", "Contact & Lead Management", "Deal Pipeline & Sales Tracking", "Lead Source Tracking", "Conversion & ROI Reports"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-300">
                <Check className="h-4 w-4 shrink-0 text-green-400" /> {f}
              </li>
            ))}
            <li className="flex items-center gap-2 text-gray-500">
              <X className="h-4 w-4 shrink-0" /> No profile features
            </li>
            <li className="flex items-center gap-2 text-gray-500">
              <X className="h-4 w-4 shrink-0" /> Not entered in $3,500 sweepstakes
            </li>
          </ul>
          <Link href="/sign-up" className="mt-6 block rounded-lg border border-gray-600 py-2 text-center text-sm font-medium text-white hover:bg-white/5">
            Get Started Free
          </Link>
        </div>

        {/* VERIFIED */}
        <div className="glass-card relative flex flex-col p-6">
          <Shield className="h-8 w-8 text-pd-blue" />
          <h3 className="mt-3 font-heading text-xl font-bold text-white">VERIFIED PLATINUM</h3>
          <p className="text-sm text-gray-400">Get found locally</p>
          <p className="mt-4 text-3xl font-bold text-white">
            {billing === "monthly" ? "$99" : `$${PRICING.verified_platinum[billing].monthly?.toFixed(0) || PRICING.verified_platinum[billing].price}`}
            <span className="text-sm text-gray-400">/mo</span>
          </p>
          {billing !== "monthly" && (
            <p className="text-xs text-pd-gold">{PRICING.verified_platinum[billing].display} — save {PRICING.verified_platinum[billing].savings}</p>
          )}
          <div className="mt-4 rounded-lg bg-green-500/10 p-2 text-xs text-green-400">
            Organic SEO, Directory, Social Discovery
          </div>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {["All FREE features", "Verified Badge & Priority Ranking", "Full profile (photos, hours, map)", "AI Personal Assistant (24/7)", "Smart Offers (25% fee)", "Auto-entered in $3,500 sweepstakes"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-300">
                <Check className="h-4 w-4 shrink-0 text-green-400" /> {f}
              </li>
            ))}
          </ul>
          <a href={getPaymentLink("verified", billing)} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-lg bg-green-600 py-2 text-center text-sm font-medium text-white hover:bg-green-700">
            Get VERIFIED PLATINUM
          </a>
        </div>

        {/* PARTNER */}
        <div className="glass-card relative flex flex-col border-green-500/30 p-6">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold text-white">
            MORE PROFITABLE
          </span>
          <Zap className="h-8 w-8 text-pd-blue" />
          <h3 className="mt-3 font-heading text-xl font-bold text-white">PLATINUM PARTNER</h3>
          <p className="text-sm text-gray-400">Dominate your market</p>
          <p className="mt-4 text-3xl font-bold text-white">
            {billing === "monthly" ? "$799" : `$${PRICING.platinum_partner[billing].monthly?.toFixed(0) || PRICING.platinum_partner[billing].price}`}
            <span className="text-sm text-gray-400">/mo</span>
          </p>
          {billing !== "monthly" && (
            <p className="text-xs text-pd-gold">{PRICING.platinum_partner[billing].display} — save {PRICING.platinum_partner[billing].savings}</p>
          )}
          <div className="mt-4 rounded-lg bg-green-500/10 p-2 text-xs text-green-400">
            SEO, Paid Ads, Email, SMS, Social
          </div>
          <p className="mt-2 text-xs font-medium text-green-400">25 guaranteed leads/month</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {["All VERIFIED features", "AI Call Assistant ($0.15/min)", "Email Campaigns (Unlimited)", "SMS Marketing (1,000/mo)", "Monthly Strategy Calls", "Smart Offers (20% fee)"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-300">
                <Check className="h-4 w-4 shrink-0 text-green-400" /> {f}
              </li>
            ))}
          </ul>
          <a href={getPaymentLink("partner", billing)} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-lg bg-pd-blue py-2 text-center text-sm font-medium text-white hover:bg-pd-blue-dark">
            Get PLATINUM PARTNER
          </a>
        </div>

        {/* ELITE */}
        <div className="glass-card relative flex flex-col border-pd-purple/50 p-6 shadow-glow-purple">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pd-purple px-3 py-0.5 text-xs font-bold text-white">
            MOST PROFITABLE
          </span>
          <Crown className="h-8 w-8 text-pd-purple" />
          <h3 className="mt-3 font-heading text-xl font-bold text-white">PLATINUM ELITE</h3>
          <p className="text-sm text-gray-400">Exclusive dominance</p>
          <p className="mt-4 text-3xl font-bold text-white">
            {billing === "monthly" ? "$3,500" : `$${PRICING.platinum_elite[billing].monthly?.toLocaleString() || PRICING.platinum_elite[billing].price.toLocaleString()}`}
            <span className="text-sm text-gray-400">/mo</span>
          </p>
          {billing !== "monthly" && (
            <p className="text-xs text-pd-gold">{PRICING.platinum_elite[billing].display} — save {PRICING.platinum_elite[billing].savings}</p>
          )}
          <div className="mt-4 rounded-lg bg-pd-purple/10 p-2 text-xs text-pd-purple-light">
            All Channels, Dedicated Campaigns, Category Ownership
          </div>
          <p className="mt-2 text-xs font-medium text-pd-purple-light">Category exclusivity + unlimited leads</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {["All PARTNER features", "AI Call & SMS (UNLIMITED)", "Category Exclusivity", "White Label CRM", "Professional Photo/Video", "Dedicated Account Manager"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-300">
                <Check className="h-4 w-4 shrink-0 text-pd-purple-light" /> {f}
              </li>
            ))}
          </ul>
          <a href={getPaymentLink("elite", billing)} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-lg bg-pd-purple py-2 text-center text-sm font-medium text-white hover:bg-pd-purple-dark">
            Get PLATINUM ELITE
          </a>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-center font-heading text-2xl font-bold text-white">Complete Feature Matrix</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pd-purple/20">
                <th className="pb-3 pr-4 text-left text-gray-400">Feature</th>
                <th className="pb-3 px-4 text-center text-gray-400">Free</th>
                <th className="pb-3 px-4 text-center text-gray-400">Verified</th>
                <th className="pb-3 px-4 text-center text-gray-400">Partner</th>
                <th className="pb-3 px-4 text-center text-gray-400">Elite</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((section) => (
                <>
                  <tr key={section.category}>
                    <td colSpan={5} className="pb-2 pt-6 font-heading font-semibold text-pd-purple-light">
                      {section.category}
                    </td>
                  </tr>
                  {section.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-pd-purple/10">
                      <td className="py-2 pr-4 text-gray-300">{feature.name}</td>
                      {(["free", "verified", "partner", "elite"] as const).map((tier) => (
                        <td key={tier} className="px-4 py-2 text-center">
                          {typeof feature[tier] === "boolean" ? (
                            feature[tier] ? (
                              <Check className="mx-auto h-4 w-4 text-green-400" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-600" />
                            )
                          ) : (
                            <span className="text-xs text-pd-gold">{feature[tier]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business Sweepstakes CTA */}
      <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-pd-gold/30 bg-gradient-to-r from-pd-purple/10 to-pd-gold/10 p-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-white">
          Win a FREE $3,500 Platinum Elite Package
        </h3>
        <p className="mt-2 text-gray-400">
          Complete verification + subscribe to any paid plan to be automatically entered
        </p>
        <Link href="/giveaway/business" className="mt-4 inline-block rounded-lg bg-pd-gold px-6 py-3 font-medium text-pd-dark hover:bg-pd-gold-light">
          Learn More
        </Link>
      </div>
    </div>
  );
}
