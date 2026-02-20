"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag, Plus, Loader2, Copy, X, Trash2, CheckCircle, Zap,
  BarChart3, DollarSign, Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PD-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeView, setActiveView] = useState<"codes" | "redemptions">("codes");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: generateCode(),
    description: "",
    discount_type: "percentage",
    discount_value: 20,
    applies_to: "subscription",
    min_tier: "",
    max_uses: "",
    max_uses_per_user: 1,
    starts_at: new Date().toISOString().split("T")[0],
    expires_at: "",
    is_flash_deal: false,
    flash_deal_name: "",
    flash_deal_banner_text: "",
  });

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
      loadData();
    }
    init();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: codesData }, { data: redemptionsData }] = await Promise.all([
      supabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("discount_code_redemptions").select("*, discount_codes(code)").order("redeemed_at", { ascending: false }).limit(100),
    ]);
    setCodes(codesData || []);
    setRedemptions(redemptionsData || []);
    setLoading(false);
  }, []);

  async function handleCreate() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("discount_codes").insert({
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      applies_to: form.applies_to,
      min_tier: form.min_tier || null,
      max_uses: form.max_uses ? parseInt(form.max_uses as string) : null,
      max_uses_per_user: form.max_uses_per_user,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_flash_deal: form.is_flash_deal,
      flash_deal_name: form.is_flash_deal ? form.flash_deal_name : null,
      flash_deal_banner_text: form.is_flash_deal ? form.flash_deal_banner_text : null,
      created_by: user?.id,
    });
    if (!error) {
      setShowCreate(false);
      setForm({ ...form, code: generateCode(), description: "" });
      loadData();
    }
    setSaving(false);
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await supabase.from("discount_codes").update({ is_active: !currentActive }).eq("id", id);
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
  }

  const activeCodes = codes.filter(c => c.is_active);
  const totalRedemptions = redemptions.length;
  const totalDiscount = redemptions.reduce((sum, r) => sum + (r.discount_amount || 0), 0);
  const flashDeals = codes.filter(c => c.is_flash_deal && c.is_active);

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Discount Codes</h1>
          <p className="mt-1 text-gray-400">Manage discount codes, flash deals, and promotions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
        >
          <Plus className="h-4 w-4" /> Create Code
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Codes</p>
          <p className="mt-1 text-3xl font-bold text-white">{activeCodes.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Redemptions</p>
          <p className="mt-1 text-3xl font-bold text-white">{totalRedemptions}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Revenue Impact</p>
          <p className="mt-1 text-3xl font-bold text-red-400">-${totalDiscount.toFixed(2)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Flash Deals</p>
          <p className="mt-1 text-3xl font-bold text-pd-gold">{flashDeals.length}</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mt-6 flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 w-fit">
        <button onClick={() => setActiveView("codes")} className={`rounded-md px-4 py-1.5 text-sm ${activeView === "codes" ? "bg-pd-purple/20 text-white" : "text-gray-400"}`}>Codes</button>
        <button onClick={() => setActiveView("redemptions")} className={`rounded-md px-4 py-1.5 text-sm ${activeView === "redemptions" ? "bg-pd-purple/20 text-white" : "text-gray-400"}`}>Redemptions</button>
      </div>

      {/* Codes Table */}
      {activeView === "codes" && (
        <div className="mt-4 glass-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
          ) : codes.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-gray-500" />
              <p className="mt-3 text-white">No discount codes yet</p>
              <p className="mt-1 text-sm text-gray-400">Create your first code to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Applies To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Uses</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map(code => (
                    <tr key={code.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-white">{code.code}</span>
                          {code.is_flash_deal && <Zap className="h-3 w-3 text-pd-gold" />}
                          <button
                            onClick={() => navigator.clipboard.writeText(code.code)}
                            className="text-gray-500 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{code.discount_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-white">
                        {code.discount_type === "percentage" ? `${code.discount_value}%` : `$${code.discount_value}`}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{code.applies_to.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {code.current_uses}{code.max_uses ? `/${code.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          code.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {code.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleActive(code.id, code.is_active)}
                          className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
                        >
                          {code.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Redemptions Table */}
      {activeView === "redemptions" && (
        <div className="mt-4 glass-card overflow-hidden">
          {redemptions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No redemptions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Applied To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Original</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Final</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map(r => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="px-4 py-3 font-mono text-white">{(r as any).discount_codes?.code || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{r.applied_to}</td>
                      <td className="px-4 py-3 text-gray-400">${r.original_amount}</td>
                      <td className="px-4 py-3 text-red-400">-${r.discount_amount}</td>
                      <td className="px-4 py-3 text-green-400">${r.final_amount}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(r.redeemed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-bold text-white">Create Discount Code</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Code</label>
                <div className="flex gap-2">
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white font-mono focus:outline-none" />
                  <button onClick={() => setForm({ ...form, code: generateCode() })}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/5">Random</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Type</label>
                  <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none">
                    <option value="percentage" className="bg-pd-dark">Percentage</option>
                    <option value="fixed_amount" className="bg-pd-dark">Fixed Amount</option>
                    <option value="free_month" className="bg-pd-dark">Free Month</option>
                    <option value="waive_setup" className="bg-pd-dark">Waive Setup Fee</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Value {form.discount_type === "percentage" ? "(%)" : "($)"}</label>
                  <input type="number" step="0.01" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Applies To</label>
                <select value={form.applies_to} onChange={e => setForm({ ...form, applies_to: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none">
                  <option value="subscription" className="bg-pd-dark">Subscription</option>
                  <option value="smart_offer" className="bg-pd-dark">Smart Offer</option>
                  <option value="ai_credits" className="bg-pd-dark">AI Credits</option>
                  <option value="setup_fee" className="bg-pd-dark">Setup Fee</option>
                  <option value="any" className="bg-pd-dark">Any</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Max Uses (blank = unlimited)</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Max Per User</label>
                  <input type="number" value={form.max_uses_per_user} onChange={e => setForm({ ...form, max_uses_per_user: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Start Date</label>
                  <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Expiry (optional)</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>

              {/* Flash Deal toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-pd-gold/5 border border-pd-gold/20 p-3">
                <input type="checkbox" checked={form.is_flash_deal} onChange={e => setForm({ ...form, is_flash_deal: e.target.checked })}
                  className="h-4 w-4 rounded border-pd-gold/30 bg-pd-dark text-pd-gold" />
                <div>
                  <span className="text-sm font-medium text-pd-gold flex items-center gap-1"><Zap className="h-3 w-3" /> Flash Deal</span>
                  <p className="text-xs text-gray-500">Shows a banner on pricing/advertise pages</p>
                </div>
              </label>
              {form.is_flash_deal && (
                <div className="space-y-3 pl-4 border-l-2 border-pd-gold/30">
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Flash Deal Name</label>
                    <input type="text" value={form.flash_deal_name} onChange={e => setForm({ ...form, flash_deal_name: e.target.value })}
                      placeholder="Spring Savings Event"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Banner Text</label>
                    <input type="text" value={form.flash_deal_banner_text} onChange={e => setForm({ ...form, flash_deal_banner_text: e.target.value })}
                      placeholder="50% off first month — 48 hours only!"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-sm focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.code}
                className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
