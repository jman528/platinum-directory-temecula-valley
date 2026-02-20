"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Flame, Loader2, ChevronDown, Sparkles, Phone,
  CheckCircle, Filter,
} from "lucide-react";
import { CITIES } from "@/lib/constants";
import { formatPhoneUS } from "@/lib/utils/format-phone";

const PAGE_SIZE = 50;

const OUTREACH_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow Up" },
  { value: "appointment_set", label: "Appointment Set" },
  { value: "not_interested", label: "Not Interested" },
  { value: "voicemail", label: "Voicemail" },
  { value: "no_answer", label: "No Answer" },
];

const TIER_OPTIONS = [
  { value: "", label: "All Tiers" },
  { value: "free", label: "Free" },
  { value: "verified_platinum", label: "Verified" },
  { value: "platinum_partner", label: "Partner" },
  { value: "platinum_elite", label: "Elite" },
];

export default function QueueManagementPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterHotLead, setFilterHotLead] = useState("");
  const [filterOutreach, setFilterOutreach] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [smartSort, setSmartSort] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
      }
      setAuthorized(true);
    }
    checkAuth();
  }, []);

  const fetchBusinesses = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    let query = supabase
      .from("businesses")
      .select("id, name, phone, city, tier, average_rating, review_count, is_hot_lead, outreach_status, lead_score, categories(name)")
      .eq("is_active", true)
      .not("phone", "is", null);

    if (searchQuery.trim()) {
      query = query.ilike("name", `%${searchQuery}%`);
    }
    if (filterCity) query = query.eq("city", filterCity);
    if (filterTier) query = query.eq("tier", filterTier);
    if (filterHotLead === "true") query = query.eq("is_hot_lead", true);
    if (filterHotLead === "false") query = query.eq("is_hot_lead", false);
    if (filterOutreach) query = query.eq("outreach_status", filterOutreach);

    if (smartSort) {
      query = query
        .order("is_hot_lead", { ascending: false })
        .order("average_rating", { ascending: false })
        .order("review_count", { ascending: false });
    } else {
      query = query
        .order("is_hot_lead", { ascending: false })
        .order("lead_score", { ascending: false });
    }

    query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const { data } = await query;
    const list = data || [];
    if (append) {
      setBusinesses(prev => [...prev, ...list]);
    } else {
      setBusinesses(list);
    }
    setHasMore(list.length === PAGE_SIZE);
    setLoading(false);
  }, [searchQuery, filterCity, filterTier, filterHotLead, filterOutreach, smartSort]);

  useEffect(() => {
    if (!authorized) return;
    setPage(0);
    fetchBusinesses(0);
  }, [authorized, fetchBusinesses]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === businesses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(businesses.map(b => b.id)));
    }
  }

  if (!authorized) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pd-purple" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Call Queue Management</h2>
          <p className="mt-1 text-gray-400">Manage which businesses appear in the dialer queue</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSmartSort(!smartSort)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              smartSort
                ? "bg-pd-gold/20 text-pd-gold border border-pd-gold/30"
                : "border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Smart Queue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by business name..."
            className="w-full min-w-[200px] bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none">
          {TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterHotLead} onChange={e => setFilterHotLead(e.target.value)} className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Leads</option>
          <option value="true">Hot Leads Only</option>
          <option value="false">Non-Hot Leads</option>
        </select>
        <select value={filterOutreach} onChange={e => setFilterOutreach(e.target.value)} className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none">
          {OUTREACH_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Selected Actions */}
      {selectedIds.size > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-pd-purple/20 bg-pd-purple/5 p-3">
          <span className="text-sm text-white">{selectedIds.size} selected</span>
          <button className="rounded-lg bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30">
            Add to Queue
          </button>
          <button className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-600/30">
            Remove from Queue
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-white">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 pr-2">
                  <input
                    type="checkbox"
                    checked={businesses.length > 0 && selectedIds.size === businesses.length}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-gray-600 bg-pd-dark"
                  />
                </th>
                <th className="pb-3 text-gray-400">Business</th>
                <th className="pb-3 text-gray-400">Phone</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">City</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">Category</th>
                <th className="pb-3 text-gray-400">Rating</th>
                <th className="pb-3 text-gray-400">Hot Lead</th>
                <th className="pb-3 text-gray-400">Outreach Status</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz, i) => (
                <tr
                  key={biz.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="py-3 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(biz.id)}
                      onChange={() => toggleSelect(biz.id)}
                      className="h-3.5 w-3.5 rounded border-gray-600 bg-pd-dark"
                    />
                  </td>
                  <td className="py-3">
                    <p className="font-medium text-white">{biz.name}</p>
                    <span className="text-xs text-gray-500 capitalize">{(biz.tier || "free").replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-3 text-gray-400">{biz.phone ? formatPhoneUS(biz.phone) : "\u2014"}</td>
                  <td className="hidden py-3 text-gray-400 md:table-cell">{biz.city || "\u2014"}</td>
                  <td className="hidden py-3 text-gray-400 md:table-cell">{biz.categories?.name || "\u2014"}</td>
                  <td className="py-3">
                    {biz.average_rating > 0 ? (
                      <span className="text-pd-gold">{biz.average_rating}</span>
                    ) : (
                      <span className="text-gray-500">\u2014</span>
                    )}
                    {biz.review_count > 0 && (
                      <span className="ml-1 text-xs text-gray-500">({biz.review_count})</span>
                    )}
                  </td>
                  <td className="py-3">
                    {biz.is_hot_lead ? (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <Flame className="h-3.5 w-3.5" /> Hot
                      </span>
                    ) : (
                      <span className="text-gray-600">\u2014</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      biz.outreach_status === "not_contacted" ? "bg-gray-500/20 text-gray-400" :
                      biz.outreach_status === "follow_up" ? "bg-yellow-500/20 text-yellow-400" :
                      biz.outreach_status === "appointment_set" ? "bg-green-500/20 text-green-400" :
                      biz.outreach_status === "not_interested" ? "bg-red-500/20 text-red-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {(biz.outreach_status || "not contacted").replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-pd-purple" />
            </div>
          )}

          {!loading && businesses.length === 0 && (
            <div className="py-12 text-center text-gray-500">No businesses found.</div>
          )}

          {hasMore && !loading && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchBusinesses(next, true);
                }}
                className="mx-auto flex items-center gap-2 rounded-lg border border-white/10 px-6 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" /> Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
