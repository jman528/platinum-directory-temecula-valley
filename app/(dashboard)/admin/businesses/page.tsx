"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  Upload,
  Plus,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Pencil,
  Eye,
  Flame,
  Sparkles,
  Flag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "hot_leads", label: "Hot Leads" },
  { key: "pending", label: "Pending Verification" },
  { key: "active", label: "Active" },
  { key: "free", label: "Free" },
  { key: "verified_platinum", label: "Verified ($99)" },
  { key: "platinum_partner", label: "Partner ($799)" },
  { key: "platinum_elite", label: "Elite ($3,500)" },
  { key: "suspended", label: "Suspended" },
];

const PAGE_SIZE = 50;

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState({ total: 0, active: 0, pending: 0 });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (
        profile?.user_type !== "admin" &&
        profile?.user_type !== "super_admin"
      ) {
        window.location.href = "/dashboard";
        return;
      }
      setAuthorized(true);
    }
    checkAuth();
  }, []);

  const fetchBusinesses = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_SIZE));
      if (searchQuery.trim()) params.set("search", searchQuery);
      if (filterCity) params.set("city", filterCity);
      if (activeTab !== "all") params.set("tab", activeTab);

      try {
        const res = await fetch(`/api/admin/businesses?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          console.error("Fetch error:", json.error);
          setLoading(false);
          return;
        }

        const list = json.businesses || [];
        if (append) {
          setBusinesses((prev) => [...prev, ...list]);
        } else {
          setBusinesses(list);
        }
        setTotalCount(json.total || 0);
        if (json.summary) {
          setSummary(json.summary);
        }
        setHasMore(list.length === PAGE_SIZE);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filterCity, activeTab]
  );

  useEffect(() => {
    if (!authorized) return;
    setPage(0);
    fetchBusinesses(0);
  }, [authorized, searchQuery, filterCity, activeTab, fetchBusinesses]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBusinesses(nextPage, true);
  }

  async function handleApprove(bizId: string) {
    setActionLoading(bizId);
    try {
      const res = await fetch(`/api/admin/businesses/${bizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      if (res.ok) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === bizId ? { ...b, is_active: true } : b))
        );
        setSummary((prev) => ({
          ...prev,
          active: prev.active + 1,
          pending: prev.pending - 1,
        }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(bizId: string, bizName: string) {
    if (!confirm(`Deactivate "${bizName}"? This hides it from the directory.`))
      return;
    setActionLoading(bizId);
    try {
      const res = await fetch(`/api/admin/businesses/${bizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === bizId ? { ...b, is_active: false } : b))
        );
        setSummary((prev) => ({
          ...prev,
          active: prev.active - 1,
          pending: prev.pending + 1,
        }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  function getTierBadge(tier: string) {
    const colors: Record<string, string> = {
      free: "bg-gray-500/20 text-gray-400",
      verified_platinum: "bg-pd-blue/20 text-pd-blue",
      platinum_partner: "bg-pd-purple/20 text-pd-purple-light",
      platinum_elite: "bg-pd-gold/20 text-pd-gold",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs capitalize ${colors[tier] || colors.free}`}
      >
        {tier.replace(/_/g, " ")}
      </span>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-white">
            Business Management
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/businesses/import"
            className="flex items-center gap-2 rounded-lg bg-pd-purple/20 px-4 py-2 text-sm font-medium text-pd-purple-light hover:bg-pd-purple/30"
          >
            <Upload className="h-4 w-4" /> Import
          </Link>
          <Link
            href="/claim"
            className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
          >
            <Plus className="h-4 w-4" /> Add Business
          </Link>
        </div>
      </div>

      {/* Count Summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-white">{summary.total}</span> total businesses
        </span>
        <span className="text-pd-purple/40">|</span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-green-400">{summary.active}</span> active
        </span>
        <span className="text-pd-purple/40">|</span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-yellow-400">{summary.pending}</span> pending
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex flex-wrap gap-1 rounded-lg border border-pd-purple/20 bg-pd-dark/50 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-pd-purple/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + City Filter */}
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, address, phone..."
            className="w-full min-w-[200px] bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Enrichment Controls + Flagged Names */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/businesses/flagged"
          className="flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20"
        >
          <Flag className="h-3 w-3" /> Review Flagged Names
        </Link>
        <button
          onClick={async () => {
            setActionLoading("enrich_basic");
            await fetch("/api/admin/enrich-batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batch_size: 50, enrichment_tier: "basic" }),
            });
            setActionLoading(null);
            fetchBusinesses(0);
          }}
          disabled={actionLoading === "enrich_basic"}
          className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
        >
          {actionLoading === "enrich_basic" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Quick Enrich: Basic (Free)
        </button>
        <button
          onClick={async () => {
            setActionLoading("enrich_standard");
            await fetch("/api/admin/enrich-batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batch_size: 25, enrichment_tier: "standard" }),
            });
            setActionLoading(null);
            fetchBusinesses(0);
          }}
          disabled={actionLoading === "enrich_standard"}
          className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
        >
          {actionLoading === "enrich_standard" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Enrich: Standard (Google)
        </button>
      </div>

      {/* Glass-card Table */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Business</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">
                  Category
                </th>
                <th className="pb-3 text-gray-400">City</th>
                <th className="pb-3 text-gray-400">Tier</th>
                <th className="pb-3 text-gray-400">Status</th>
                <th className="hidden pb-3 text-gray-400 lg:table-cell">
                  Created
                </th>
                <th className="pb-3 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz: any) => (
                <tr
                  key={biz.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/businesses/${biz.id}`}
                      className="flex items-center gap-2 text-white hover:text-pd-blue"
                    >
                      {biz.name}
                      {biz.tier !== "free" && (
                        <Shield className="h-3 w-3 text-pd-gold" />
                      )}
                    </Link>
                  </td>
                  <td className="hidden py-3 text-gray-400 md:table-cell">
                    {biz.category_name || "\u2014"}
                  </td>
                  <td className="py-3 text-gray-400">{biz.city || "\u2014"}</td>
                  <td className="py-3">{getTierBadge(biz.tier)}</td>
                  <td className="py-3">
                    {biz.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <XCircle className="h-3.5 w-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="hidden py-3 text-gray-500 lg:table-cell">
                    {new Date(biz.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {biz.slug && (
                        <Link
                          href={`/business/${biz.slug}`}
                          className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                          title="View"
                          target="_blank"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/businesses/${biz.id}`}
                        className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {!biz.is_active && (
                        <button
                          onClick={() => handleApprove(biz.id)}
                          disabled={actionLoading === biz.id}
                          className="rounded p-1 text-green-400/70 hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50"
                          title="Approve (set active)"
                        >
                          {actionLoading === biz.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {biz.is_active && (
                        <button
                          onClick={() => handleDelete(biz.id, biz.name)}
                          disabled={actionLoading === biz.id}
                          className="rounded p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          title="Deactivate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
            <div className="py-12 text-center text-gray-500">
              No businesses found.
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
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
