"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, Gift, Users, TrendingUp, Zap, Store, Smartphone, Eye, EyeOff,
} from "lucide-react";

const BANNER_TYPES = [
  {
    key: "giveaway_countdown",
    label: "Giveaway Countdown",
    icon: Gift,
    description: "Sticky banner at top of public pages with $250 giveaway countdown timer.",
    auto: false,
  },
  {
    key: "affiliate_banner",
    label: "Affiliate / Traffic Banner",
    icon: Users,
    description: "Inline banner on homepage promoting referral program and point earnings.",
    auto: false,
  },
  {
    key: "social_proof_ticker",
    label: "Social Proof Ticker",
    icon: TrendingUp,
    description: "Auto-scrolling horizontal ticker showing recent platform activity.",
    auto: false,
  },
  {
    key: "flash_deal_banner",
    label: "Flash Deal / Points Multiplier",
    icon: Zap,
    description: "Auto-shows when a points multiplier event is active. Cannot be manually toggled.",
    auto: true,
  },
  {
    key: "business_cta",
    label: "Business CTA Banner",
    icon: Store,
    description: "\"Is this your business?\" banner on free-tier listing pages.",
    auto: false,
  },
  {
    key: "mobile_bottom_bar",
    label: "Mobile Bottom Bar",
    icon: Smartphone,
    description: "Fixed bottom action bar on mobile business detail pages (Call, Directions, Deals, Save).",
    auto: false,
  },
];

export default function AdminBannersPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") return;
      setAuthorized(true);

      // Load feature flags
      const { data: allFlags } = await supabase
        .from("feature_flags")
        .select("key, is_enabled")
        .in("key", ["engagement_banners", ...BANNER_TYPES.map(b => `banner_${b.key}`)]);

      const flagMap: Record<string, boolean> = {};
      for (const f of allFlags || []) {
        if (f.key === "engagement_banners") {
          setMasterEnabled(f.is_enabled);
        } else {
          flagMap[f.key.replace("banner_", "")] = f.is_enabled;
        }
      }
      // Default all to enabled if no flag exists
      for (const b of BANNER_TYPES) {
        if (flagMap[b.key] === undefined) flagMap[b.key] = true;
      }
      setFlags(flagMap);
      setLoading(false);
    }
    init();
  }, []);

  async function toggleBanner(key: string) {
    setSaving(key);
    const newVal = !flags[key];
    setFlags(prev => ({ ...prev, [key]: newVal }));

    await supabase
      .from("feature_flags")
      .upsert({ key: `banner_${key}`, is_enabled: newVal, description: `Toggle ${key} banner` }, { onConflict: "key" });

    setSaving(null);
  }

  async function toggleMaster() {
    setSaving("master");
    const newVal = !masterEnabled;
    setMasterEnabled(newVal);

    await supabase
      .from("feature_flags")
      .upsert({ key: "engagement_banners", is_enabled: newVal, description: "Master switch for all engagement banners" }, { onConflict: "key" });

    setSaving(null);
  }

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Banner Management</h2>
          <p className="mt-1 text-gray-400">Control engagement banners across the public site</p>
        </div>
      </div>

      {/* Master Switch */}
      <div className="mt-6 glass-card border-pd-gold/20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-white">Master Switch</p>
            <p className="text-sm text-gray-400">Enable or disable all engagement banners at once</p>
          </div>
          <button
            onClick={toggleMaster}
            disabled={saving === "master"}
            className={`relative h-7 w-14 rounded-full transition-colors ${
              masterEnabled ? "bg-pd-gold" : "bg-white/10"
            }`}
          >
            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              masterEnabled ? "translate-x-7" : ""
            }`} />
          </button>
        </div>
      </div>

      {/* Banner List */}
      <div className="mt-4 space-y-3">
        {BANNER_TYPES.map(banner => (
          <div key={banner.key} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  flags[banner.key] && masterEnabled ? "bg-pd-gold/10 text-pd-gold" : "bg-white/5 text-gray-500"
                }`}>
                  <banner.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{banner.label}</p>
                  <p className="text-xs text-gray-500">{banner.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {flags[banner.key] && masterEnabled ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Eye className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <EyeOff className="h-3 w-3" /> Hidden
                  </span>
                )}
                {banner.auto ? (
                  <span className="rounded bg-white/5 px-2 py-1 text-[10px] text-gray-500">AUTO</span>
                ) : (
                  <button
                    onClick={() => toggleBanner(banner.key)}
                    disabled={saving === banner.key || !masterEnabled}
                    className={`relative h-6 w-12 rounded-full transition-colors disabled:opacity-50 ${
                      flags[banner.key] ? "bg-green-600" : "bg-white/10"
                    }`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      flags[banner.key] ? "translate-x-6" : ""
                    }`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-pd-purple" />
        </div>
      )}
    </div>
  );
}
