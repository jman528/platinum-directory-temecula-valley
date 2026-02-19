"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Gift, Award, Trophy, Star, Crown, Loader2,
  ArrowRight, Copy, CheckCircle, Zap,
} from "lucide-react";

interface Redemption {
  id: string;
  type: string;
  points_spent: number;
  status: string;
  created_at: string;
}

const TIERS = [
  { name: "Bronze", min: 0, max: 499, icon: Award, color: "text-orange-400", bg: "bg-orange-400/15" },
  { name: "Silver", min: 500, max: 1999, icon: Trophy, color: "text-gray-300", bg: "bg-gray-300/15" },
  { name: "Gold", min: 2000, max: 4999, icon: Star, color: "text-pd-gold", bg: "bg-pd-gold/15" },
  { name: "Platinum", min: 5000, max: Infinity, icon: Crown, color: "text-pd-purple-light", bg: "bg-pd-purple/15" },
];

const EARN_TIPS = [
  { label: "Leave reviews on businesses", points: "50 pts" },
  { label: "Share deals with friends", points: "25 pts" },
  { label: "Refer a friend to sign up", points: "100 pts" },
  { label: "Daily check-in", points: "10 pts" },
  { label: "Complete your profile", points: "75 pts" },
  { label: "Purchase a smart offer", points: "25 pts" },
];

export default function RewardsDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: redeemed }] = await Promise.all([
        supabase
          .from("profiles")
          .select("points_balance, points_pending, total_points_earned, referral_code")
          .eq("id", user.id)
          .single(),
        supabase
          .from("points_redemptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setProfile(prof);
      setRedemptions((redeemed as Redemption[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  function copyReferralLink() {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`${window.location.origin}/sign-up?ref=${profile.referral_code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  const totalEarned = profile?.total_points_earned || 0;
  const currentTier = TIERS.slice().reverse().find((t) => totalEarned >= t.min) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? Math.min(100, ((totalEarned - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Rewards</h1>
      <p className="mt-1 text-gray-400">Track your tier, earn points, and redeem rewards</p>

      {/* Current Tier */}
      <div className="mt-6 glass-card p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${currentTier.bg}`}>
            <currentTier.icon className={`h-8 w-8 ${currentTier.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`font-heading text-2xl font-bold ${currentTier.color}`}>{currentTier.name}</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                {totalEarned.toLocaleString()} pts earned
              </span>
            </div>
            {nextTier ? (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{currentTier.name}</span>
                  <span>{nextTier.name} ({nextTier.min.toLocaleString()} pts)</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pd-purple to-pd-gold transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {(nextTier.min - totalEarned).toLocaleString()} more points to {nextTier.name}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-400">You&apos;ve reached the highest tier!</p>
            )}
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-pd-gold">{(profile?.points_balance || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Available</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{(profile?.points_pending || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-pd-purple-light">{totalEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Lifetime Earned</p>
        </div>
      </div>

      {/* Referral Link */}
      {profile?.referral_code && (
        <div className="mt-6 glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Referral Link</p>
              <p className="mt-0.5 text-sm text-gray-400">Earn 100 points per referral</p>
            </div>
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-pd-gold/30 hover:text-pd-gold"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* How to Earn */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white">How to Earn More Points</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EARN_TIPS.map((tip) => (
            <div key={tip.label} className="glass-card flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-pd-gold" />
                <span className="text-sm text-gray-300">{tip.label}</span>
              </div>
              <span className="rounded-full bg-pd-gold/15 px-2 py-0.5 text-xs font-bold text-pd-gold">{tip.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Redemption History */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white">Redemption History</h2>
        {redemptions.length === 0 ? (
          <div className="mt-4 glass-card p-8 text-center">
            <Gift className="mx-auto h-10 w-10 text-gray-600" />
            <p className="mt-3 text-gray-400">No redemptions yet</p>
            <p className="mt-1 text-sm text-gray-500">Earn more points to unlock rewards.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {redemptions.map((r) => (
              <div key={r.id} className="glass-card flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-white">{r.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">-{r.points_spent}</p>
                  <span className={`text-[10px] ${r.status === "completed" ? "text-green-400" : "text-yellow-400"}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
