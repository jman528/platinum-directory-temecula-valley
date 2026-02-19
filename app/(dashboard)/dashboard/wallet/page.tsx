"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Wallet, Coins, Clock, ArrowUpRight, ArrowDownRight,
  DollarSign, Loader2, Gift, Copy, CheckCircle,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  action: string;
  points: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export default function WalletPage() {
  const [profile, setProfile] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: entries }] = await Promise.all([
        supabase
          .from("profiles")
          .select("points_balance, points_pending, total_points_earned, commission_balance_available, commission_balance_pending, total_commission_earned, total_commission_paid, referral_code")
          .eq("id", user.id)
          .single(),
        supabase
          .from("points_ledger")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      setProfile(prof);
      setLedger((entries as LedgerEntry[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  function copyReferralCode() {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`${window.location.origin}/sign-up?ref=${profile.referral_code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function formatAction(action: string) {
    return action.replace(/^(earned_|redeemed_)/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  const pointsBalance = profile?.points_balance || 0;
  const pointsPending = profile?.points_pending || 0;
  const totalEarned = profile?.total_points_earned || 0;
  const commissionAvailable = Number(profile?.commission_balance_available || 0);
  const commissionPending = Number(profile?.commission_balance_pending || 0);
  const totalCommission = Number(profile?.total_commission_earned || 0);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Wallet</h1>
      <p className="mt-1 text-gray-400">Your points balance, earnings, and transaction history</p>

      {/* Balance Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-gold/20 p-2">
              <Coins className="h-5 w-5 text-pd-gold" />
            </div>
            <div>
              <p className="text-3xl font-bold text-pd-gold">{pointsBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Available Points</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">{pointsPending.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Pending Points</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">${commissionAvailable.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Commission Available</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pd-purple/20 p-2">
              <Gift className="h-5 w-5 text-pd-purple-light" />
            </div>
            <div>
              <p className="text-3xl font-bold text-pd-purple-light">{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Lifetime Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      {profile?.referral_code && (
        <div className="mt-6 glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Your Referral Link</p>
              <p className="mt-1 text-sm text-gray-400">Earn 100 points for every friend who signs up</p>
            </div>
            <button
              onClick={copyReferralCode}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-pd-gold/30 hover:text-pd-gold"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
            {typeof window !== "undefined" ? `${window.location.origin}/sign-up?ref=${profile.referral_code}` : `https://platinumdirectory.com/sign-up?ref=${profile.referral_code}`}
          </div>
        </div>
      )}

      {/* Commission Summary */}
      {totalCommission > 0 && (
        <div className="mt-6 glass-card p-5">
          <h2 className="font-heading text-lg font-bold text-white">Commission Earnings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-400">Total Earned</p>
              <p className="text-xl font-bold text-white">${totalCommission.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-400">${commissionPending.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Paid Out</p>
              <p className="text-xl font-bold text-green-400">${Number(profile?.total_commission_paid || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white">Transaction History</h2>
        {ledger.length === 0 ? (
          <div className="mt-4 glass-card p-8 text-center">
            <Wallet className="mx-auto h-10 w-10 text-gray-600" />
            <p className="mt-3 text-gray-400">No transactions yet</p>
            <p className="mt-1 text-sm text-gray-500">Earn points by exploring businesses, leaving reviews, and sharing deals.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {ledger.map((entry) => {
              const isEarned = entry.points > 0;
              return (
                <div key={entry.id} className="glass-card flex items-center gap-3 p-3">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${isEarned ? "bg-green-500/15" : "bg-red-500/15"}`}>
                    {isEarned
                      ? <ArrowUpRight className="h-4 w-4 text-green-400" />
                      : <ArrowDownRight className="h-4 w-4 text-red-400" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{formatAction(entry.action)}</p>
                    {entry.description && <p className="truncate text-xs text-gray-500">{entry.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isEarned ? "text-green-400" : "text-red-400"}`}>
                      {isEarned ? "+" : ""}{entry.points}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
