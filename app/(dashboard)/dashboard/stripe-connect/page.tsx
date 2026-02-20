"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard, CheckCircle, Clock, ExternalLink, Loader2, Shield
} from "lucide-react";

export default function StripeConnectPage() {
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<"not_connected" | "pending" | "active">("not_connected");
  const [connectLoading, setConnectLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("stripe_connect_id, stripe_connect_status")
        .eq("owner_user_id", user.id)
        .limit(1)
        .single();

      if (biz?.stripe_connect_status === "active") {
        setConnectStatus("active");
      } else if (biz?.stripe_connect_id) {
        setConnectStatus("pending");
      }
      setLoading(false);
    }
    checkStatus();
  }, []);

  async function handleConnect() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch {
      // ignore
    } finally {
      setConnectLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Stripe Connect</h1>
      <p className="mt-1 text-gray-400">Manage your payment account and receive Smart Offer earnings</p>

      {/* Status Card */}
      <div className="mt-6">
        {connectStatus === "not_connected" && (
          <div className="glass-card p-8 text-center">
            <CreditCard className="mx-auto h-16 w-16 text-gray-500" />
            <h3 className="mt-4 text-xl font-bold text-white">Connect Your Payment Account</h3>
            <p className="mt-2 text-gray-400">
              Link your Stripe account to receive Smart Offer earnings directly to your bank account.
            </p>
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pd-purple px-6 py-3 text-sm font-semibold text-white hover:bg-pd-purple/80 disabled:opacity-50"
            >
              {connectLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Connect with Stripe
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Powered by Stripe. Your financial data is securely handled.
            </p>
          </div>
        )}

        {connectStatus === "pending" && (
          <div className="glass-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">Verification in Progress</h3>
            <p className="mt-2 text-gray-400">
              Your Stripe account is being verified. This usually takes 1-2 business days.
            </p>
            <button
              onClick={handleConnect}
              disabled={connectLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-6 py-3 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20"
            >
              {connectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Complete Setup
            </button>
          </div>
        )}

        {connectStatus === "active" && (
          <div className="glass-card p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Stripe Connected</h3>
                <p className="text-gray-400">Your account is active and receiving payouts</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">Payout Schedule</p>
                <p className="mt-1 text-lg font-bold text-white">Weekly</p>
                <p className="text-xs text-gray-500">Automatic transfers</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">Status</p>
                <p className="mt-1 text-lg font-bold text-green-400">Active</p>
                <p className="text-xs text-gray-500">Fully verified</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">Account</p>
                <p className="mt-1 text-lg font-bold text-white">••••4242</p>
                <p className="text-xs text-gray-500">Bank account</p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" /> View Stripe Dashboard
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <Shield className="mt-0.5 h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-300">Secure Payments</p>
          <p className="mt-1 text-sm text-gray-500">
            All payment processing is handled by Stripe, a PCI-compliant payment processor.
            We never store your banking details on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
