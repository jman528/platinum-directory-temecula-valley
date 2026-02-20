"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PlatformConfig {
  name: string;
  key: string;
  connected: boolean;
  description: string;
  envVars: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    name: "Facebook",
    key: "facebook",
    connected: false,
    description: "Auto-post business welcomes and offers to your Facebook Page",
    envVars: ["FB_PAGE_ID", "FB_PAGE_ACCESS_TOKEN"],
  },
  {
    name: "Instagram",
    key: "instagram",
    connected: false,
    description: "Share branded images to your Instagram Business account",
    envVars: ["IG_BUSINESS_ACCOUNT_ID", "FB_PAGE_ACCESS_TOKEN"],
  },
  {
    name: "X (Twitter)",
    key: "x",
    connected: false,
    description: "Tweet new business listings and deal alerts",
    envVars: ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"],
  },
  {
    name: "LinkedIn",
    key: "linkedin",
    connected: false,
    description: "Post to your LinkedIn organization page",
    envVars: ["LINKEDIN_ORG_ID", "LINKEDIN_ACCESS_TOKEN"],
  },
  {
    name: "Reddit",
    key: "reddit",
    connected: false,
    description: "Post deal roundups to r/TemeculaValleyDeals",
    envVars: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"],
  },
  {
    name: "Discord",
    key: "discord",
    connected: false,
    description: "Send embeds to Discord channels via webhooks",
    envVars: ["DISCORD_WEBHOOK_NEW_BUSINESSES"],
  },
];

export default function SyndicationSettingsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syndicationEnabled, setSyndicationEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchSettings();
  }, [authorized]);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data: flag } = await supabase
        .from("feature_flags")
        .select("enabled")
        .eq("flag_key", "social_syndication")
        .single();
      setSyndicationEnabled(flag?.enabled || false);
    } catch {
      // flag may not exist
    }
    setLoading(false);
  }

  async function toggleSyndication() {
    setSaving(true);
    const newValue = !syndicationEnabled;
    await supabase
      .from("feature_flags")
      .update({ enabled: newValue })
      .eq("flag_key", "social_syndication");
    setSyndicationEnabled(newValue);
    setSaving(false);
  }

  if (!authorized || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/syndication"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Syndication
        </Link>
      </div>

      <div className="mt-4">
        <h2 className="font-heading text-2xl font-bold text-white">Syndication Settings</h2>
        <p className="mt-1 text-sm text-gray-400">Configure platform connections and auto-post rules</p>
      </div>

      {/* Master Toggle */}
      <div className="mt-6 glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Auto-Syndication</h3>
            <p className="mt-1 text-sm text-gray-400">
              When enabled, posts are automatically sent when businesses are verified or offers are published
            </p>
          </div>
          <button
            onClick={toggleSyndication}
            disabled={saving}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              syndicationEnabled ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                syndicationEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Platform Connections */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Platform Connections</h3>
        <p className="mt-1 text-sm text-gray-400">
          Configure API keys in your environment variables to connect platforms
        </p>
        <div className="mt-4 space-y-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.key}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${platform.connected ? "bg-green-500/10" : "bg-gray-500/10"}`}>
                  {platform.connected ? (
                    <Wifi className="h-5 w-5 text-green-400" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{platform.name}</p>
                  <p className="text-xs text-gray-500">{platform.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {platform.connected ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <XCircle className="h-3 w-3" /> Not configured
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discord Webhooks */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Discord Webhooks</h3>
        <p className="mt-1 text-sm text-gray-400">
          Configure webhook URLs for each Discord channel
        </p>
        <div className="mt-4 space-y-3">
          {[
            { key: "newBusinesses", label: "#new-businesses", desc: "Gold embeds for new business listings" },
            { key: "weeklyDeals", label: "#weekly-deals", desc: "Purple embeds for Smart Offer roundups" },
            { key: "giveawayAlerts", label: "#giveaway-alerts", desc: "Green embeds for giveaway announcements" },
            { key: "stripeAlerts", label: "#stripe-alerts", desc: "Blue embeds for payment notifications" },
            { key: "systemStatus", label: "#system-status", desc: "Gray embeds for deploy and error info" },
          ].map((webhook) => (
            <div key={webhook.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{webhook.label}</p>
                  <p className="text-xs text-gray-500">{webhook.desc}</p>
                </div>
                <span className="text-xs text-gray-500">
                  Set via DISCORD_WEBHOOK_* env vars
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Post Rules */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Auto-Post Rules</h3>
        <p className="mt-1 text-sm text-gray-400">Events that trigger automatic social posts</p>
        <div className="mt-4 space-y-2">
          {[
            { event: "Business Verified", platforms: "All platforms", active: true },
            { event: "Business Upgraded", platforms: "All platforms", active: true },
            { event: "Smart Offer Published", platforms: "Facebook, Reddit, Discord", active: true },
            { event: "Weekly Giveaway Started", platforms: "All platforms", active: true },
            { event: "Weekly Deal Roundup", platforms: "Reddit, Discord (via cron)", active: true },
          ].map((rule) => (
            <div
              key={rule.event}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{rule.event}</p>
                <p className="text-xs text-gray-500">{rule.platforms}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${rule.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                {rule.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
