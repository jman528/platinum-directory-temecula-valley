"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Gift, Award, Trophy, Star, Crown, Loader2,
  ArrowRight, Copy, CheckCircle, Zap,
  Share2, Facebook, Twitter, Linkedin, ExternalLink,
  Wallet, ShoppingBag,
} from "lucide-react";
import { POINTS_CONFIG, pointsToDollars } from "@/lib/points-config";
import OnboardingChecklist from "@/components/OnboardingChecklist";

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
  { label: "Leave a Google review", points: "1,000 pts" },
  { label: "Share a listing", points: "25 pts" },
  { label: "Refer a friend to sign up", points: "500 pts" },
  { label: "Daily login", points: "10 pts" },
  { label: "7-day login streak", points: "250 pts" },
  { label: "Referred business subscribes", points: "50,000 pts" },
];

const SOCIAL_ACTIONS = [
  { key: "share_facebook", label: "Share on Facebook", points: 100, group: "Share Us", url: "https://facebook.com/sharer/sharer.php?u=https://platinumdirectorytemeculavalley.com" },
  { key: "share_twitter", label: "Share on Twitter/X", points: 100, group: "Share Us", url: "https://twitter.com/intent/tweet?text=Check%20out%20Platinum%20Directory&url=https://platinumdirectorytemeculavalley.com" },
  { key: "share_linkedin", label: "Share on LinkedIn", points: 100, group: "Share Us", url: "https://linkedin.com/shareArticle?mini=true&url=https://platinumdirectorytemeculavalley.com" },
  { key: "review_google", label: "Review on Google", points: 250, group: "Review Us", url: "https://g.page/r/review" },
  { key: "review_yelp", label: "Review on Yelp", points: 250, group: "Review Us", url: "https://yelp.com" },
  { key: "review_tripadvisor", label: "Review on TripAdvisor", points: 250, group: "Review Us", url: "https://tripadvisor.com" },
  { key: "follow_facebook", label: "Follow on Facebook", points: 50, group: "Follow Us", url: "https://facebook.com/platinumdirectory" },
  { key: "follow_instagram", label: "Follow on Instagram", points: 50, group: "Follow Us", url: "https://instagram.com/platinumdirectory" },
  { key: "follow_tiktok", label: "Follow on TikTok", points: 50, group: "Follow Us", url: "https://tiktok.com/@platinumdirectory" },
  { key: "follow_youtube", label: "Follow on YouTube", points: 50, group: "Follow Us", url: "https://youtube.com/@platinumdirectory" },
];

export default function RewardsDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimedActions, setClaimedActions] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [topupLoading, setTopupLoading] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: redeemed }, { data: claimed }] = await Promise.all([
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
        supabase
          .from("social_actions")
          .select("action_type")
          .eq("user_id", user.id),
      ]);

      setProfile(prof);
      setRedemptions((redeemed as Redemption[]) || []);
      setClaimedActions(new Set((claimed || []).map((c: any) => c.action_type)));
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

  async function claimSocialAction(action: typeof SOCIAL_ACTIONS[0]) {
    if (claimedActions.has(action.key) || claiming) return;
    // Open the social link
    window.open(action.url, "_blank");
    setClaiming(action.key);
    try {
      const res = await fetch("/api/social-actions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: action.key }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimedActions(prev => new Set([...prev, action.key]));
        setProfile((prev: any) => ({
          ...prev,
          points_balance: data.new_balance ?? (prev?.points_balance || 0) + action.points,
          total_points_earned: (prev?.total_points_earned || 0) + action.points,
        }));
      }
    } catch { /* ignore */ }
    setClaiming(null);
  }

  async function handleTopUp(tierIndex: number) {
    setTopupLoading(tierIndex);
    try {
      const res = await fetch("/api/points/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier_index: tierIndex }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch { /* ignore */ }
    setTopupLoading(null);
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

      {/* Onboarding Checklist */}
      <div className="mt-6">
        <OnboardingChecklist />
      </div>

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

      {/* Invite Friends */}
      <div className="mt-6 glass-card p-5">
        <h3 className="font-heading text-lg font-bold text-white">Invite Friends</h3>
        <p className="mt-1 text-sm text-gray-400">Earn 500 points for every friend who signs up!</p>
        {profile?.referral_code && (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${profile.referral_code}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-3 py-2 text-xs text-blue-400 hover:bg-blue-600/30"
            >
              <Facebook className="h-3.5 w-3.5" /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out Platinum Directory — the best local business guide for Temecula Valley!')}&url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${profile.referral_code}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-2 text-xs text-sky-400 hover:bg-sky-500/30"
            >
              <Twitter className="h-3.5 w-3.5" /> Twitter/X
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out Platinum Directory! ${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${profile.referral_code}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3 py-2 text-xs text-green-400 hover:bg-green-600/30"
            >
              <Share2 className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Check out Platinum Directory')}&body=${encodeURIComponent(`I found this great local business directory for Temecula Valley: ${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${profile.referral_code}`)}`}
              className="flex items-center gap-1.5 rounded-lg bg-pd-purple/20 px-3 py-2 text-xs text-pd-purple-light hover:bg-pd-purple/30"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Email
            </a>
          </div>
        )}
      </div>

      {/* Social Actions */}
      <div className="mt-6">
        <h2 className="font-heading text-lg font-bold text-white">Earn Points with Social Actions</h2>
        <p className="mt-1 text-sm text-gray-400">One-time claims — complete each action to earn points</p>
        <div className="mt-4 space-y-4">
          {["Share Us", "Review Us", "Follow Us"].map(group => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-medium text-gray-400">{group} (earn {group === "Review Us" ? "250" : group === "Share Us" ? "100" : "50"} pts each)</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {SOCIAL_ACTIONS.filter(a => a.group === group).map(action => {
                  const isClaimed = claimedActions.has(action.key);
                  return (
                    <button
                      key={action.key}
                      onClick={() => claimSocialAction(action)}
                      disabled={isClaimed || claiming === action.key}
                      className={`flex items-center justify-between rounded-lg p-3 text-left text-sm transition-colors ${
                        isClaimed
                          ? "bg-green-500/10 border border-green-500/20"
                          : "glass-card hover:border-pd-gold/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isClaimed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : claiming === action.key ? (
                          <Loader2 className="h-4 w-4 animate-spin text-pd-gold" />
                        ) : (
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={isClaimed ? "text-green-400" : "text-white"}>{action.label}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isClaimed ? "bg-green-500/20 text-green-400" : "bg-pd-gold/15 text-pd-gold"
                      }`}>
                        {isClaimed ? "Claimed" : `+${action.points}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Top-Up */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-pd-gold" /> Top Up Your Points Wallet
        </h2>
        <p className="mt-1 text-sm text-gray-400">Buy points to use on any Smart Offer. Like a Temecula Valley gift card!</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS_CONFIG.TOPUP_TIERS.map((tier, i) => {
            const total = tier.points + tier.bonus;
            return (
              <button
                key={i}
                onClick={() => handleTopUp(i)}
                disabled={topupLoading !== null}
                className="glass-card group relative overflow-hidden p-4 text-left transition-all hover:border-pd-gold/40"
              >
                {tier.bonus > 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                    +{tier.bonus.toLocaleString()} BONUS
                  </span>
                )}
                <p className="text-2xl font-bold text-pd-gold">${tier.price}</p>
                <p className="mt-1 text-sm text-white">{total.toLocaleString()} points</p>
                <p className="text-xs text-gray-500">${pointsToDollars(total)} value</p>
                {topupLoading === i ? (
                  <div className="mt-3 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-pd-gold" />
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-medium text-pd-gold group-hover:text-white">
                    Buy Now →
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
