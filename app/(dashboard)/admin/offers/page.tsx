"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Tag, Plus, Loader2, Search, Pencil, XCircle, CheckCircle,
} from "lucide-react";

export default function AdminOffersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [bizSearch, setBizSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_id: "",
    title: "",
    description: "",
    original_price: "",
    offer_price: "",
    starts_at: "",
    expires_at: "",
    max_claims: "",
    cover_image_url: "",
    status: "draft",
  });
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
      loadOffers();
      loadBusinesses("");
    }
    init();
  }, []);

  async function loadOffers() {
    setLoading(true);
    const { data } = await supabase
      .from("offers")
      .select("*, businesses(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setOffers(data || []);
    setLoading(false);
  }

  async function loadBusinesses(search: string) {
    let query = supabase
      .from("businesses")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .limit(20);
    if (search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }
    const { data } = await query;
    setBusinesses(data || []);
  }

  function resetForm() {
    setForm({
      business_id: "", title: "", description: "",
      original_price: "", offer_price: "",
      starts_at: "", expires_at: "", max_claims: "",
      cover_image_url: "", status: "draft",
    });
    setEditingId(null);
  }

  function editOffer(offer: any) {
    setForm({
      business_id: offer.business_id || "",
      title: offer.title || "",
      description: offer.description || "",
      original_price: offer.original_price?.toString() || "",
      offer_price: offer.offer_price?.toString() || "",
      starts_at: offer.starts_at ? new Date(offer.starts_at).toISOString().split("T")[0] : "",
      expires_at: offer.expires_at ? new Date(offer.expires_at).toISOString().split("T")[0] : "",
      max_claims: offer.max_claims?.toString() || "",
      cover_image_url: offer.cover_image_url || "",
      status: offer.status || "draft",
    });
    setEditingId(offer.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.business_id) return;
    setSaving(true);

    const payload: Record<string, any> = {
      business_id: form.business_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      offer_price: form.offer_price ? parseFloat(form.offer_price) : 0,
      starts_at: form.starts_at || new Date().toISOString(),
      expires_at: form.expires_at || null,
      max_claims: form.max_claims ? parseInt(form.max_claims) : null,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
      offer_type: "local_deal",
      is_active: form.status === "active",
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("offers").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("offers").insert(payload));
    }

    if (error) {
      setToast(`Error: ${error.message}`);
    } else {
      setToast(editingId ? "Offer updated" : "Offer created");
      resetForm();
      setShowForm(false);
      loadOffers();
    }
    setTimeout(() => setToast(null), 3000);
    setSaving(false);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("offers")
      .update({ status: newStatus, is_active: newStatus === "active" })
      .eq("id", id);
    if (!error) {
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, is_active: newStatus === "active" } : o));
    }
  }

  function discountPercent(original: number, offer: number) {
    if (!original || original <= 0) return 0;
    return Math.round(((original - offer) / original) * 100);
  }

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none";
  const labelClass = "mb-1 block text-xs text-gray-400";

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-pd-purple/90 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Smart Offers</h2>
          <p className="mt-1 text-gray-400">{offers.length} offers total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 rounded-lg bg-pd-gold px-4 py-2 text-sm font-medium text-pd-dark hover:bg-pd-gold-light"
        >
          <Plus className="h-4 w-4" /> Create Offer
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mt-6 glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">
            {editingId ? "Edit Offer" : "Create New Offer"}
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Business *</label>
              <input
                type="text"
                value={bizSearch}
                onChange={e => { setBizSearch(e.target.value); loadBusinesses(e.target.value); }}
                placeholder="Search businesses..."
                className={inputClass}
              />
              {businesses.length > 0 && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-pd-dark">
                  {businesses.map(biz => (
                    <button
                      key={biz.id}
                      onClick={() => { setForm(prev => ({ ...prev, business_id: biz.id })); setBizSearch(biz.name); }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-white/5 ${
                        form.business_id === biz.id ? "text-pd-gold" : "text-gray-300"
                      }`}
                    >
                      {biz.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Offer Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. 50% Off Wine Tasting" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className={inputClass}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className={labelClass}>Original Price ($)</label>
                <input type="number" step="0.01" value={form.original_price} onChange={e => setForm(prev => ({ ...prev, original_price: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Offer Price ($)</label>
                <input type="number" step="0.01" value={form.offer_price} onChange={e => setForm(prev => ({ ...prev, offer_price: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={form.starts_at} onChange={e => setForm(prev => ({ ...prev, starts_at: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={form.expires_at} onChange={e => setForm(prev => ({ ...prev, expires_at: e.target.value }))} className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Quantity Available</label>
                <input type="number" value={form.max_claims} onChange={e => setForm(prev => ({ ...prev, max_claims: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input type="url" value={form.cover_image_url} onChange={e => setForm(prev => ({ ...prev, cover_image_url: e.target.value }))} className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.business_id}
                className="flex items-center gap-2 rounded-lg bg-pd-gold px-6 py-2 text-sm font-medium text-pd-dark hover:bg-pd-gold-light disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <div className="mt-6 glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Offer</th>
                <th className="pb-3 text-gray-400">Business</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">Price</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">Discount</th>
                <th className="pb-3 text-gray-400">Status</th>
                <th className="hidden pb-3 text-gray-400 lg:table-cell">Created</th>
                <th className="pb-3 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-pd-purple" /></td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No offers yet. Create your first one.</td></tr>
              ) : (
                offers.map(offer => (
                  <tr key={offer.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <p className="font-medium text-white">{offer.title}</p>
                      {offer.description && <p className="text-xs text-gray-500 line-clamp-1">{offer.description}</p>}
                    </td>
                    <td className="py-3 text-gray-400">{(offer.businesses as any)?.name || "\u2014"}</td>
                    <td className="hidden py-3 md:table-cell">
                      {offer.original_price && (
                        <span className="text-gray-500 line-through">${Number(offer.original_price).toFixed(2)}</span>
                      )}
                      {" "}
                      <span className="text-pd-gold font-medium">${Number(offer.offer_price).toFixed(2)}</span>
                    </td>
                    <td className="hidden py-3 md:table-cell">
                      {offer.original_price ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                          {discountPercent(offer.original_price, offer.offer_price)}% off
                        </span>
                      ) : "\u2014"}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        offer.status === "active" ? "bg-green-500/20 text-green-400" :
                        offer.status === "expired" ? "bg-red-500/20 text-red-400" :
                        offer.status === "paused" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="hidden py-3 text-gray-500 lg:table-cell">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => editOffer(offer)} className="text-gray-400 hover:text-white" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(offer.id, offer.status)}
                          className={offer.status === "active" ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}
                          title={offer.status === "active" ? "Pause" : "Activate"}
                        >
                          {offer.status === "active" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
