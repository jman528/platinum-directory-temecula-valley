"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { POINTS_CONFIG } from "@/lib/points-config";
import {
  Loader2,
  DollarSign,
  Coins,
  TrendingUp,
  BarChart3,
  Link2,
  Share2,
  Calculator,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Gift,
  Star,
  Globe,
  Smartphone,
  ShoppingCart,
  Eye,
  MousePointer,
  UserPlus,
  Repeat,
  Target,
  Trophy,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RevenueStats {
  subscribers: { verified: number; partner: number; elite: number };
  mrr: number;
  totalUsers: number;
  activeUsers30d: number;
  pointsIssued: number;
  pointsRedeemed: number;
  referralSignups: number;
  topReferrers: { name: string; code: string; points_earned: number }[];
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
const TABS = [
  { id: "fees", label: "Fee Structure", icon: DollarSign },
  { id: "points", label: "Points Structure", icon: Coins },
  { id: "traffic", label: "Traffic Projections", icon: TrendingUp },
  { id: "tracking", label: "Tracking & UTM", icon: Link2 },
  { id: "share", label: "Share UX", icon: Share2 },
  { id: "calculator", label: "Internal ROI Calculator", icon: Calculator },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function RevenueArchitecturePage() {
  const [tab, setTab] = useState<TabId>("fees");
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const supabase = createClient();

  // Auth + data fetch
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (
        !profile ||
        !["admin", "super_admin"].includes(profile.user_type)
      ) {
        window.location.href = "/dashboard";
        return;
      }
      setAuthorized(true);

      try {
        const res = await fetch("/api/admin/revenue-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // API may not be ready yet; page still works with defaults
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Gate: not authorized yet
  // -----------------------------------------------------------------------
  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">
            Revenue Architecture
          </h2>
          <p className="mt-1 text-gray-400">
            Internal reference &mdash; fee structure, projections &amp; ROI
          </p>
        </div>
        {stats && (
          <div className="hidden items-center gap-4 md:flex">
            <div className="text-right">
              <p className="text-xs text-gray-500">Live MRR</p>
              <p className="text-lg font-bold text-green-400">
                {fmtCurrency(stats.mrr)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Subscribers</p>
              <p className="text-lg font-bold text-pd-gold">
                {stats.subscribers.verified +
                  stats.subscribers.partner +
                  stats.subscribers.elite}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Live stat pills */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading live data...
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="mt-6 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-pd-purple/20 text-white"
                  : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"
              }`}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <div className="mt-6">
        {tab === "fees" && <FeeStructureTab stats={stats} />}
        {tab === "points" && <PointsStructureTab />}
        {tab === "traffic" && <TrafficProjectionsTab />}
        {tab === "tracking" && <TrackingTab />}
        {tab === "share" && <ShareUXTab />}
        {tab === "calculator" && <CalculatorTab stats={stats} />}
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 1: Fee Structure
// ==========================================================================
function FeeStructureTab({ stats }: { stats: RevenueStats | null }) {
  const tiers = [
    {
      name: "Free",
      monthly: 0,
      setup: 0,
      platform: 35,
      affiliate: 5,
      color: "text-gray-400",
    },
    {
      name: "Verified",
      monthly: 99,
      setup: 199,
      platform: 30,
      affiliate: 5,
      color: "text-blue-400",
    },
    {
      name: "Partner",
      monthly: 799,
      setup: 499,
      platform: 25,
      affiliate: 5,
      color: "text-purple-400",
    },
    {
      name: "Elite",
      monthly: 3500,
      setup: 999,
      platform: 20,
      affiliate: 5,
      color: "text-pd-gold",
    },
  ];

  const roiCards = [
    {
      tier: "Verified",
      price: "$99/mo",
      color: "border-blue-500/30",
      items: [
        "Verified badge + priority placement",
        "Platform fee drops from 35% to 30%",
        "Enhanced analytics dashboard",
        "AI-powered listing optimization",
      ],
      roi: "Just 2 Smart Offer sales/mo covers the subscription cost",
    },
    {
      tier: "Partner",
      price: "$799/mo",
      color: "border-purple-500/30",
      items: [
        "Featured placement across site",
        "Platform fee drops to 25%",
        "Dedicated account manager",
        "Custom landing pages & promotions",
        "Priority lead routing",
      ],
      roi: "5% lower fee on $16K+ monthly offer volume = break even",
    },
    {
      tier: "Elite",
      price: "$3,500/mo",
      color: "border-pd-gold/30",
      items: [
        "Homepage hero placement",
        "Lowest platform fee at 20%",
        "White-glove concierge service",
        "Exclusive sponsorship placements",
        "Custom integrations & API access",
        "Co-marketing campaigns",
      ],
      roi: "15% savings vs Free on $23K+ monthly volume = net positive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Fee Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Tier Pricing Matrix
          </h3>
          {stats && (
            <p className="mt-1 text-sm text-gray-500">
              Live: {stats.subscribers.verified} Verified &middot;{" "}
              {stats.subscribers.partner} Partner &middot;{" "}
              {stats.subscribers.elite} Elite
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Tier
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Monthly
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Setup Fee
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Platform Fee %
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Affiliate Fee %
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Total Take %
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr
                  key={t.name}
                  className={
                    i % 2 === 0
                      ? "bg-white/[0.01]"
                      : "bg-white/[0.03]"
                  }
                >
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${t.color}`}>
                      {t.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {t.monthly === 0
                      ? "$0"
                      : `$${fmt(t.monthly)}/mo`}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {t.setup === 0 ? "$0" : fmtCurrency(t.setup)}
                  </td>
                  <td className="px-6 py-4 text-white">{t.platform}%</td>
                  <td className="px-6 py-4 text-white">{t.affiliate}%</td>
                  <td className="px-6 py-4 font-semibold text-pd-gold">
                    {t.platform + t.affiliate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Connect Flow */}
      <div className="glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Zap className="h-5 w-5 text-pd-gold" /> Stripe Connect Flow
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {[
            {
              label: "Customer pays for Smart Offer",
              icon: ShoppingCart,
              color: "text-green-400",
            },
            {
              label: "Platform takes fee %",
              icon: DollarSign,
              color: "text-blue-400",
            },
            {
              label: "Affiliate gets 5% if applicable",
              icon: Users,
              color: "text-purple-400",
            },
            {
              label: "Net deposited to business",
              icon: CheckCircle,
              color: "text-pd-gold",
            },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2">
                <step.icon className={`h-4 w-4 ${step.color}`} />
                <span className="text-gray-300">{step.label}</span>
              </div>
              {i < 3 && (
                <ArrowRight className="h-4 w-4 text-gray-600" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Payments flow through Stripe Connect. The business receives the
          offer payment minus the platform fee. If the buyer was referred by
          an affiliate, 5% of the offer value is allocated as affiliate
          commission (paid in points or cash).
        </p>
      </div>

      {/* ROI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {roiCards.map((card) => (
          <div
            key={card.tier}
            className={`glass-card border ${card.color} p-6`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-white">
                {card.tier}
              </h4>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                {card.price}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {card.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-white/[0.05] p-3">
              <p className="text-xs font-medium text-pd-gold">
                ROI breakeven
              </p>
              <p className="mt-1 text-xs text-gray-400">{card.roi}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 2: Points Structure
// ==========================================================================
function PointsStructureTab() {
  const P = POINTS_CONFIG;

  const onboardingSteps = [
    {
      step: "Sign Up",
      points: P.SIGNUP_BONUS,
      dollars: (P.SIGNUP_BONUS / P.POINTS_PER_DOLLAR).toFixed(2),
      icon: UserPlus,
    },
    {
      step: "Phone Verify",
      points: P.PHONE_VERIFY_BONUS,
      dollars: (P.PHONE_VERIFY_BONUS / P.POINTS_PER_DOLLAR).toFixed(2),
      icon: Smartphone,
    },
    {
      step: "Complete Profile",
      points: P.COMPLETE_PROFILE_BONUS,
      dollars: (P.COMPLETE_PROFILE_BONUS / P.POINTS_PER_DOLLAR).toFixed(
        2
      ),
      icon: CheckCircle,
    },
    {
      step: "Giveaway Entry",
      points: P.FIRST_GIVEAWAY_ENTRY,
      dollars: (P.FIRST_GIVEAWAY_ENTRY / P.POINTS_PER_DOLLAR).toFixed(2),
      icon: Gift,
    },
    {
      step: "First Share",
      points: P.FIRST_SHARE_BONUS,
      dollars: (P.FIRST_SHARE_BONUS / P.POINTS_PER_DOLLAR).toFixed(2),
      icon: Share2,
    },
  ];

  const totalOnboarding =
    P.SIGNUP_BONUS +
    P.PHONE_VERIFY_BONUS +
    P.COMPLETE_PROFILE_BONUS +
    P.FIRST_GIVEAWAY_ENTRY +
    P.FIRST_SHARE_BONUS;

  const allActions = [
    {
      action: "Sign Up",
      points: fmt(P.SIGNUP_BONUS),
      frequency: "Once",
      value: `$${(P.SIGNUP_BONUS / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Phone Verify",
      points: fmt(P.PHONE_VERIFY_BONUS),
      frequency: "Once",
      value: `$${(P.PHONE_VERIFY_BONUS / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Complete Profile",
      points: fmt(P.COMPLETE_PROFILE_BONUS),
      frequency: "Once",
      value: `$${(P.COMPLETE_PROFILE_BONUS / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "First Giveaway Entry",
      points: fmt(P.FIRST_GIVEAWAY_ENTRY),
      frequency: "Once",
      value: `$${(P.FIRST_GIVEAWAY_ENTRY / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "First Share",
      points: fmt(P.FIRST_SHARE_BONUS),
      frequency: "Once",
      value: `$${(P.FIRST_SHARE_BONUS / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Share Listing",
      points: fmt(P.SHARE_LISTING),
      frequency: `Repeatable (max ${P.SHARE_DAILY_MAX}/day)`,
      value: `$${(P.SHARE_LISTING / P.POINTS_PER_DOLLAR).toFixed(3)}`,
    },
    {
      action: "Referral Click",
      points: fmt(P.REFERRAL_CLICK),
      frequency: "1x per person/day",
      value: `$${(P.REFERRAL_CLICK / P.POINTS_PER_DOLLAR).toFixed(3)}`,
    },
    {
      action: "Referral Signup",
      points: fmt(P.REFERRAL_SIGNUP),
      frequency: "Per referred user",
      value: `$${(P.REFERRAL_SIGNUP / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Referral Giveaway",
      points: fmt(P.REFERRAL_GIVEAWAY),
      frequency: "Per referred entry",
      value: `$${(P.REFERRAL_GIVEAWAY / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Referral Offer Commission",
      points: `${P.REFERRAL_OFFER_COMMISSION * 100}% of offer`,
      frequency: "Per purchase",
      value: "Variable",
    },
    {
      action: "Daily Login",
      points: fmt(P.DAILY_LOGIN),
      frequency: "Daily",
      value: `$${(P.DAILY_LOGIN / P.POINTS_PER_DOLLAR).toFixed(3)}`,
    },
    {
      action: "7-Day Streak",
      points: fmt(P.STREAK_7_DAY),
      frequency: "Weekly",
      value: `$${(P.STREAK_7_DAY / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "30-Day Streak",
      points: fmt(P.STREAK_30_DAY),
      frequency: "Monthly",
      value: `$${(P.STREAK_30_DAY / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Google Review",
      points: fmt(P.GOOGLE_REVIEW),
      frequency: "Once",
      value: `$${(P.GOOGLE_REVIEW / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Social Follow",
      points: fmt(P.SOCIAL_FOLLOW),
      frequency: "Once per platform",
      value: `$${(P.SOCIAL_FOLLOW / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
    {
      action: "Offer Purchase Loyalty",
      points: `${P.OFFER_PURCHASE_LOYALTY} per $1`,
      frequency: "Per purchase",
      value: "1 pt/$1",
    },
    {
      action: "Referred Biz Subscribes",
      points: fmt(P.REFERRAL_BIZ_SUBSCRIBE),
      frequency: "Per business",
      value: `$${(P.REFERRAL_BIZ_SUBSCRIBE / P.POINTS_PER_DOLLAR).toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Journey */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          Onboarding Journey
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          5 steps &rarr; {fmt(totalOnboarding)} points = $
          {(totalOnboarding / P.POINTS_PER_DOLLAR).toFixed(2)} value
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {onboardingSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-3">
                <s.icon className="h-4 w-4 text-pd-gold" />
                <div>
                  <p className="text-xs font-medium text-white">
                    {s.step}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fmt(s.points)} pts (${s.dollars})
                  </p>
                </div>
              </div>
              {i < onboardingSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-600" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-gray-600" />
            <div className="rounded-lg border border-pd-gold/30 bg-pd-gold/10 px-4 py-3">
              <p className="text-xs font-bold text-pd-gold">
                Total: ${(totalOnboarding / P.POINTS_PER_DOLLAR).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Rules */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-2">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="font-heading font-bold text-white">Cash Out</h4>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Minimum {fmt(P.CASHOUT_MINIMUM)} points ($
            {(P.CASHOUT_MINIMUM / P.POINTS_PER_DOLLAR).toFixed(2)}) to cash
            out to bank account or PayPal.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <ShoppingCart className="h-5 w-5 text-purple-400" />
            </div>
            <h4 className="font-heading font-bold text-white">
              Smart Offer Discount
            </h4>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Apply points as discount on any Smart Offer $
            {(P.OFFER_REDEMPTION_MIN_VALUE / P.POINTS_PER_DOLLAR).toFixed(
              0
            )}
            +. Any amount of points can be used per transaction.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Coins className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="font-heading font-bold text-white">
              Wallet Top-Up
            </h4>
          </div>
          <div className="mt-3 space-y-1">
            {P.TOPUP_TIERS.map((tier, i) => (
              <p key={i} className="text-sm text-gray-300">
                ${tier.price} &rarr; {fmt(tier.points)} pts
                {tier.bonus > 0 && (
                  <span className="text-pd-gold">
                    {" "}
                    + {fmt(tier.bonus)} bonus
                  </span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Full Earning Actions Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            All Earning Actions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            From POINTS_CONFIG &mdash; every way users earn points
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Points
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Dollar Value
                </th>
              </tr>
            </thead>
            <tbody>
              {allActions.map((a, i) => (
                <tr
                  key={a.action}
                  className={
                    i % 2 === 0
                      ? "bg-white/[0.01]"
                      : "bg-white/[0.03]"
                  }
                >
                  <td className="px-6 py-3 font-medium text-white">
                    {a.action}
                  </td>
                  <td className="px-6 py-3 text-pd-gold">{a.points}</td>
                  <td className="px-6 py-3 text-gray-400">{a.frequency}</td>
                  <td className="px-6 py-3 text-gray-300">{a.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viral Loop */}
      <div className="glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Repeat className="h-5 w-5 text-pd-gold" /> Viral Loop
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {[
            {
              label: "User shares listing/offer",
              icon: Share2,
              color: "text-blue-400",
              sub: `+${P.SHARE_LISTING} pts`,
            },
            {
              label: "Friend visits via link",
              icon: Eye,
              color: "text-purple-400",
              sub: `+${P.REFERRAL_CLICK} pts`,
            },
            {
              label: "Friend signs up",
              icon: UserPlus,
              color: "text-green-400",
              sub: `+${fmt(P.REFERRAL_SIGNUP)} pts`,
            },
            {
              label: "Friend buys offer",
              icon: ShoppingCart,
              color: "text-pd-gold",
              sub: "+5% commission",
            },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="rounded-lg bg-white/[0.05] px-3 py-2">
                <div className="flex items-center gap-2">
                  <step.icon className={`h-4 w-4 ${step.color}`} />
                  <span className="text-gray-300">{step.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-pd-gold">{step.sub}</p>
              </div>
              {i < 3 && (
                <ArrowRight className="h-4 w-4 text-gray-600" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Both parties earn points &mdash; the referrer gets signup and
          commission rewards, while the new user gets the full onboarding
          bonus. This creates a self-reinforcing growth loop.
        </p>
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 3: Traffic Projections
// ==========================================================================
function TrafficProjectionsTab() {
  const [period, setPeriod] = useState<3 | 6 | 12>(3);

  const scenarios = {
    3: {
      conservative: { users: 2000, revenue: 5000 },
      moderate: { users: 5000, revenue: 15000 },
      aggressive: { users: 10000, revenue: 40000 },
    },
    6: {
      conservative: { users: 8000, revenue: 25000 },
      moderate: { users: 20000, revenue: 75000 },
      aggressive: { users: 50000, revenue: 200000 },
    },
    12: {
      conservative: { users: 25000, revenue: 100000 },
      moderate: { users: 75000, revenue: 350000 },
      aggressive: { users: 200000, revenue: 1000000 },
    },
  };

  const data = scenarios[period];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {([3, 6, 12] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === p
                ? "bg-pd-purple/20 text-white"
                : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {p} Months
          </button>
        ))}
      </div>

      {/* Scenarios Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            {period}-Month Projections
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Three scenarios based on growth trajectory
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Users
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">
                  Revenue/User
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Conservative",
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                  ...data.conservative,
                },
                {
                  label: "Moderate",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  ...data.moderate,
                },
                {
                  label: "Aggressive",
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  ...data.aggressive,
                },
              ].map((s, i) => (
                <tr
                  key={s.label}
                  className={
                    i % 2 === 0
                      ? "bg-white/[0.01]"
                      : "bg-white/[0.03]"
                  }
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.color}`}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {fmt(s.users)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-pd-gold">
                    {fmtCurrency(s.revenue)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {fmtCurrency(
                      s.users > 0 ? s.revenue / s.users : 0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison across all periods */}
      <div className="grid gap-4 md:grid-cols-3">
        {([3, 6, 12] as const).map((p) => {
          const d = scenarios[p].moderate;
          return (
            <div
              key={p}
              className={`glass-card p-5 ${
                period === p ? "border-pd-purple/40" : ""
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {p}-Month (Moderate)
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {fmt(d.users)}
              </p>
              <p className="text-sm text-gray-500">users</p>
              <p className="mt-2 text-xl font-bold text-pd-gold">
                {fmtCurrency(d.revenue)}
              </p>
              <p className="text-sm text-gray-500">monthly revenue</p>
            </div>
          );
        })}
      </div>

      {/* First Movers Advantage */}
      <div className="glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Star className="h-5 w-5 text-pd-gold" /> First Movers Advantage
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white/[0.03] p-4">
            <h4 className="font-medium text-white">
              For Early Businesses
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Lock in lower platform fees as founding partners
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                First to build reviews and organic SEO ranking
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Category exclusivity before competitors join
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Founding partner badge = permanent trust signal
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-4">
            <h4 className="font-medium text-white">For the Platform</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Network effects compound &mdash; each business brings customers
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Local SEO authority builds with content volume
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                Referral loops create organic, zero-cost acquisition
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                High switching cost once businesses have reviews + offers
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 4: Tracking & UTM
// ==========================================================================
function TrackingTab() {
  const linkExamples = [
    {
      label: "Referral link",
      url: "platinumdirectory.com/business/joes-pizza?ref=USER123",
      desc: "ref param ties visitor to referring user's referral code",
    },
    {
      label: "Affiliate link",
      url: "platinumdirectory.com/offers/half-off-facial?aff=PARTNER456",
      desc: "aff param attributes sales commission to affiliate partner",
    },
    {
      label: "UTM campaign",
      url: "platinumdirectory.com/?utm_source=instagram&utm_medium=story&utm_campaign=summer_launch",
      desc: "Standard UTM params flow into GA4 and internal analytics",
    },
    {
      label: "Combined",
      url: "platinumdirectory.com/offers/spa-day?ref=USER123&utm_source=twitter&utm_medium=share",
      desc: "Referral + UTM params coexist for full attribution",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Link Format Examples */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          Link Format Examples
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          How ref, aff, and UTM parameters work together
        </p>
        <div className="mt-4 space-y-3">
          {linkExamples.map((ex, i) => (
            <div key={i} className="rounded-lg bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-pd-gold">
                {ex.label}
              </p>
              <p className="mt-1 break-all font-mono text-sm text-blue-400">
                {ex.url}
              </p>
              <p className="mt-1 text-xs text-gray-500">{ex.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* UTM Persistence Flow */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          UTM Persistence Flow
        </h3>
        <div className="mt-4 space-y-3">
          {[
            {
              step: "1. Visitor Arrives",
              desc: "Middleware captures ref, aff, and all utm_* params from URL query string",
              icon: Globe,
              color: "text-blue-400",
            },
            {
              step: "2. Cookie Storage",
              desc: "Parameters stored in pd_ref (referral), pd_aff (affiliate), and pd_utm (campaign) cookies with 30-day TTL",
              icon: MousePointer,
              color: "text-purple-400",
            },
            {
              step: "3. Session Persistence",
              desc: "Cookies persist across pages. If visitor leaves and returns within 30 days, attribution is maintained",
              icon: Repeat,
              color: "text-green-400",
            },
            {
              step: "4. Conversion Attribution",
              desc: "On signup or purchase, cookies are read and attached to the conversion event in referral_tracking table",
              icon: Target,
              color: "text-pd-gold",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-lg bg-white/[0.03] p-4"
            >
              <div className="rounded-lg bg-white/[0.05] p-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="font-medium text-white">{s.step}</p>
                <p className="mt-1 text-sm text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Pixel Stack */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          Analytics Pixel Stack
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          GTM orchestrates all tracking pixels
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-sm font-semibold text-blue-400">
              Google Tag Manager
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-400">
              <p>
                &rarr; GA4 (Google Analytics 4)
              </p>
              <p className="text-gray-500">
                Page views, events, conversions, e-commerce
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="text-sm font-semibold text-purple-400">
              Meta (Facebook)
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-400">
              <p>
                &rarr; Meta Pixel + Conversions API (CAPI)
              </p>
              <p className="text-gray-500">
                Client-side pixel + server-side deduplication
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-sm font-semibold text-cyan-400">TikTok</p>
            <div className="mt-2 space-y-1 text-xs text-gray-400">
              <p>
                &rarr; TikTok Pixel + Events API
              </p>
              <p className="text-gray-500">
                Pixel for retargeting + server events for attribution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 5: Share UX
// ==========================================================================
function ShareUXTab() {
  return (
    <div className="space-y-6">
      {/* Logged-in vs Logged-out */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-2">
              <UserPlus className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="font-heading font-bold text-white">
              Logged-In Experience
            </h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-pd-gold">
                Share Button Action
              </p>
              <p className="mt-1">
                Opens share modal with user&apos;s personal referral link
                pre-filled. Link includes <code className="text-blue-400">?ref=USER_CODE</code>.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-pd-gold">
                Share Options
              </p>
              <p className="mt-1">
                Native share sheet (mobile), copy link, direct share to
                Facebook, Twitter/X, WhatsApp, SMS, email.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-pd-gold">
                Points Earned
              </p>
              <p className="mt-1">
                +{POINTS_CONFIG.SHARE_LISTING} points per share (max{" "}
                {POINTS_CONFIG.SHARE_DAILY_MAX}/day). First share bonus: +
                {fmt(POINTS_CONFIG.FIRST_SHARE_BONUS)} points.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-pd-gold">
                Tracking
              </p>
              <p className="mt-1">
                Every click on shared link awards referrer +
                {POINTS_CONFIG.REFERRAL_CLICK} pts. Signups and purchases
                through the link are tracked in referral_tracking table.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gray-500/10 p-2">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="font-heading font-bold text-white">
              Logged-Out Experience
            </h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-gray-400">
                Share Button Action
              </p>
              <p className="mt-1">
                Opens share modal with a generic (no ref code) link. Uses
                Native Web Share API on mobile or copy-to-clipboard fallback.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-gray-400">
                CTA Nudge
              </p>
              <p className="mt-1">
                After sharing, a toast suggests &ldquo;Sign up to earn
                points when friends visit your link!&rdquo; linking to signup
                page.
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-gray-400">
                No Tracking
              </p>
              <p className="mt-1">
                No referral code is attached. UTM params can still be
                appended for campaign attribution if the link includes them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placement Map */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          Share Button Placement Map
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Where share buttons appear across the platform
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              location: "Business Pages",
              position: "Below business info card, above reviews section",
              icon: BarChart3,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              location: "Offer Pages",
              position: "Below the Buy / Claim button",
              icon: ShoppingCart,
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              location: "Mobile Bottom Bar",
              position:
                "Sticky footer bar with share icon on business/offer pages",
              icon: Smartphone,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              location: "Post-Purchase Confirmation",
              position:
                "After buying a Smart Offer, CTA to share with friends for bonus points",
              icon: Gift,
              color: "text-pd-gold",
              bg: "bg-pd-gold/10",
            },
          ].map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg bg-white/[0.03] p-4"
            >
              <div className={`rounded-lg p-2 ${p.bg}`}>
                <p.icon className={`h-5 w-5 ${p.color}`} />
              </div>
              <div>
                <p className="font-medium text-white">{p.location}</p>
                <p className="mt-1 text-sm text-gray-400">{p.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// TAB 6: Internal ROI Calculator
// ==========================================================================
function CalculatorTab({ stats }: { stats: RevenueStats | null }) {
  const [verified, setVerified] = useState(stats?.subscribers.verified ?? 25);
  const [partner, setPartner] = useState(stats?.subscribers.partner ?? 5);
  const [elite, setElite] = useState(stats?.subscribers.elite ?? 1);
  const [offersPerBiz, setOffersPerBiz] = useState(3);
  const [avgOfferPrice, setAvgOfferPrice] = useState(59);

  // Update from live data when it arrives
  useEffect(() => {
    if (stats) {
      setVerified(stats.subscribers.verified || 25);
      setPartner(stats.subscribers.partner || 5);
      setElite(stats.subscribers.elite || 1);
    }
  }, [stats]);

  const subscriptionMRR = verified * 99 + partner * 799 + elite * 3500;

  const totalPaidBiz = verified + partner + elite;
  const totalOffersPerMonth = totalPaidBiz * offersPerBiz;
  // Weighted average platform fee: verified=30%, partner=25%, elite=20%
  const weightedFee =
    totalPaidBiz > 0
      ? (verified * 0.3 + partner * 0.25 + elite * 0.2) / totalPaidBiz
      : 0.3;
  const platformFeeRevenue =
    totalOffersPerMonth * avgOfferPrice * weightedFee;
  const totalMonthly = subscriptionMRR + platformFeeRevenue;
  const arr = totalMonthly * 12;

  const milestones = [
    { label: "$10K MRR", target: 10000 },
    { label: "$25K MRR", target: 25000 },
    { label: "$50K MRR", target: 50000 },
    { label: "$100K MRR", target: 100000 },
    { label: "$500K MRR", target: 500000 },
    { label: "$1M ARR", target: 1000000, isARR: true },
  ];

  const sliders = [
    {
      label: "Verified Businesses",
      value: verified,
      set: setVerified,
      min: 0,
      max: 200,
      price: "$99/mo each",
    },
    {
      label: "Partner Businesses",
      value: partner,
      set: setPartner,
      min: 0,
      max: 50,
      price: "$799/mo each",
    },
    {
      label: "Elite Businesses",
      value: elite,
      set: setElite,
      min: 0,
      max: 10,
      price: "$3,500/mo each",
    },
    {
      label: "Avg Smart Offers per Business",
      value: offersPerBiz,
      set: setOffersPerBiz,
      min: 0,
      max: 20,
      price: "per month",
    },
    {
      label: "Avg Offer Price",
      value: avgOfferPrice,
      set: setAvgOfferPrice,
      min: 0,
      max: 200,
      price: "per offer",
      prefix: "$",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sliders */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            Adjust Inputs
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag sliders to model different scenarios
          </p>
          <div className="mt-6 space-y-6">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    {s.label}
                  </label>
                  <span className="text-sm font-bold text-white">
                    {s.prefix || ""}
                    {s.value}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="mt-2 w-full accent-pd-purple"
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                  <span>
                    {s.prefix || ""}
                    {s.min}
                  </span>
                  <span className="text-gray-500">{s.price}</span>
                  <span>
                    {s.prefix || ""}
                    {s.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Calculations */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Revenue Breakdown
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm text-gray-400">Subscription MRR</p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {verified}&times;$99 + {partner}&times;$799 +{" "}
                    {elite}&times;$3,500
                  </p>
                </div>
                <p className="text-xl font-bold text-white">
                  {fmtCurrency(subscriptionMRR)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Platform Fee Revenue (est.)
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {totalOffersPerMonth} offers &times; $
                    {avgOfferPrice} &times;{" "}
                    {(weightedFee * 100).toFixed(1)}% avg fee
                  </p>
                </div>
                <p className="text-xl font-bold text-white">
                  {fmtCurrency(platformFeeRevenue)}
                </p>
              </div>

              <div className="rounded-lg border border-pd-gold/30 bg-pd-gold/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-pd-gold">Total Monthly</p>
                  <p className="text-2xl font-bold text-pd-gold">
                    {fmtCurrency(totalMonthly)}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-pd-gold/20 pt-2">
                  <p className="text-sm text-gray-400">
                    Annualized (ARR)
                  </p>
                  <p className="text-lg font-bold text-white">
                    {fmtCurrency(arr)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Tracker */}
          <div className="glass-card p-6">
            <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <Trophy className="h-5 w-5 text-pd-gold" /> Milestone Tracker
            </h3>
            <div className="mt-4 space-y-3">
              {milestones.map((m) => {
                const compare = m.isARR ? arr : totalMonthly;
                const pct = Math.min(
                  100,
                  (compare / m.target) * 100
                );
                const reached = compare >= m.target;
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={
                          reached ? "text-green-400" : "text-gray-400"
                        }
                      >
                        {reached && (
                          <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                        )}
                        {m.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          reached
                            ? "bg-green-500"
                            : "bg-pd-purple"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
