"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, ToggleLeft, ToggleRight, Clock, User, Loader2 } from "lucide-react";

const FEATURE_FLAGS = [
  { key: "smart_offers_enabled", description: "Enable Smart Offers marketplace for business owners" },
  { key: "ai_agents_enabled", description: "Enable AI agent features (chat, enrichment, social posts)" },
  { key: "referral_tracking_enabled", description: "Track referrals and award points for signups" },
  { key: "points_system_enabled", description: "Enable the points economy (earning, redeeming)" },
  { key: "giveaway_active", description: "Enable the giveaway contest system" },
  { key: "stripe_live_mode", description: "Use Stripe live keys (vs test mode)" },
  { key: "phone_otp_enabled", description: "Require phone OTP for business owner verification" },
  { key: "daily_login_rewards", description: "Award daily login streak bonus points" },
  { key: "split_testing_enabled", description: "Enable A/B split testing for Smart Offers" },
  { key: "progressive_dialer_enabled", description: "Enable the sales progressive dialer tool" },
];

export default function AdminFlagsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flagMap, setFlagMap] = useState<Record<string, any>>({});
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);

      const { data: dbFlags } = await supabase.from("feature_flags").select("*");
      const map: Record<string, any> = {};
      dbFlags?.forEach((f: any) => { map[f.flag_key] = f; });
      setFlagMap(map);
      setLoading(false);
    }
    init();
  }, []);

  async function toggleFlag(flagKey: string, currentEnabled: boolean) {
    setToggling(flagKey);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag_key: flagKey, is_enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(`Error: ${data.error}`);
        setTimeout(() => setToast(null), 3000);
        return;
      }
      // Update local state
      setFlagMap(prev => ({
        ...prev,
        [flagKey]: {
          ...prev[flagKey],
          flag_key: flagKey,
          is_enabled: !currentEnabled,
          updated_at: new Date().toISOString(),
        },
      }));
      setToast(`${flagKey} ${!currentEnabled ? "enabled" : "disabled"}`);
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast("Network error");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setToggling(null);
    }
  }

  if (!authorized || loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  const enabledCount = FEATURE_FLAGS.filter(f => flagMap[f.key]?.is_enabled).length;
  const disabledCount = FEATURE_FLAGS.length - enabledCount;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-pd-purple/90 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <h2 className="font-heading text-2xl font-bold text-white">Feature Flags</h2>
      <p className="mt-1 text-gray-400">Toggle platform features on and off (super admin only)</p>

      {/* Summary */}
      <div className="mt-6 flex gap-4">
        <div className="glass-card flex items-center gap-3 px-5 py-3">
          <ToggleRight className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-xl font-bold text-white">{enabledCount}</p>
            <p className="text-xs text-gray-400">Enabled</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 px-5 py-3">
          <ToggleLeft className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-xl font-bold text-white">{disabledCount}</p>
            <p className="text-xs text-gray-400">Disabled</p>
          </div>
        </div>
      </div>

      {/* Flags Table */}
      <div className="mt-6 glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Feature Flag</th>
                <th className="pb-3 text-gray-400">Description</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">Last Changed</th>
                <th className="hidden pb-3 text-gray-400 lg:table-cell">Changed By</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_FLAGS.map((flag) => {
                const dbFlag = flagMap[flag.key];
                const isEnabled = dbFlag?.is_enabled ?? false;
                const isToggling = toggling === flag.key;
                return (
                  <tr key={flag.key} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <code className="rounded bg-white/5 px-2 py-0.5 text-xs text-pd-purple-light">
                        {flag.key}
                      </code>
                    </td>
                    <td className="py-3 text-gray-400">{flag.description}</td>
                    <td className="hidden py-3 text-gray-500 md:table-cell">
                      {dbFlag?.updated_at ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(dbFlag.updated_at).toLocaleDateString()}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="hidden py-3 text-gray-500 lg:table-cell">
                      {dbFlag?.last_changed_by ? (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {dbFlag.last_changed_by.slice(0, 8)}...
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleFlag(flag.key, isEnabled)}
                        disabled={isToggling}
                        className="flex items-center gap-1.5 text-xs disabled:opacity-50"
                      >
                        {isToggling ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : isEnabled ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-400" />
                            <span className="text-green-400">Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-500">Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <Flag className="mt-0.5 h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-400">
            Feature flags control platform features. Changes take effect immediately across the platform.
            All changes are logged with the admin who made them.
          </p>
        </div>
      </div>
    </div>
  );
}
