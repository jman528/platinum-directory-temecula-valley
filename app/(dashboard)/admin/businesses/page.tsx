"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  Upload,
  Plus,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";

const TIERS = [
  { value: "", label: "All Tiers" },
  { value: "free", label: "Free" },
  { value: "verified_platinum", label: "Verified Platinum" },
  { value: "platinum_partner", label: "Platinum Partner" },
  { value: "platinum_elite", label: "Platinum Elite" },
];

const CLAIM_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "pending", label: "Pending" },
  { value: "claimed", label: "Claimed" },
];

const PAGE_SIZE = 50;

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterClaimStatus, setFilterClaimStatus] = useState("");

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
      let query = supabase
        .from("businesses")
        .select(
          "id, name, slug, city, state, phone, email, tier, is_active, is_claimed, claim_status, owner_user_id, created_at, categories(name)",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }
      if (filterCity) {
        query = query.ilike("city", filterCity);
      }
      if (filterTier) {
        query = query.eq("tier", filterTier);
      }
      if (filterClaimStatus === "unclaimed") {
        query = query.or("is_claimed.is.null,is_claimed.eq.false");
      } else if (filterClaimStatus === "pending") {
        query = query.eq("claim_status", "pending");
      } else if (filterClaimStatus === "claimed") {
        query = query.eq("is_claimed", true);
      }

      const { data, count, error } = await query;

      if (error) {
        console.error("Fetch error:", error);
        setLoading(false);
        return;
      }

      const list = data || [];
      if (append) {
        setBusinesses((prev) => [...prev, ...list]);
      } else {
        setBusinesses(list);
      }
      setTotalCount(count || 0);
      setHasMore(list.length === PAGE_SIZE);
      setLoading(false);
    },
    [searchQuery, filterCity, filterCategory, filterTier, filterClaimStatus]
  );

  useEffect(() => {
    if (!authorized) return;
    setPage(0);
    fetchBusinesses(0);
  }, [
    authorized,
    searchQuery,
    filterCity,
    filterCategory,
    filterTier,
    filterClaimStatus,
    fetchBusinesses,
  ]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBusinesses(nextPage, true);
  }

  function getClaimBadge(biz: any) {
    if (biz.is_claimed && biz.claim_status === "pending") {
      return (
        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
          Pending
        </span>
      );
    }
    if (biz.is_claimed) {
      return (
        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
          Claimed
        </span>
      );
    }
    return (
      <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">
        Unclaimed
      </span>
    );
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
          <span className="rounded-full bg-pd-purple/20 px-3 py-1 text-xs text-pd-purple-light">
            {totalCount}
          </span>
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

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
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

        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none"
        >
          {TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={filterClaimStatus}
          onChange={(e) => setFilterClaimStatus(e.target.value)}
          className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none"
        >
          {CLAIM_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pd-purple/20 text-left">
              <th className="pb-3 text-gray-400">Business</th>
              <th className="hidden pb-3 text-gray-400 md:table-cell">
                Category
              </th>
              <th className="pb-3 text-gray-400">City</th>
              <th className="hidden pb-3 text-gray-400 lg:table-cell">
                Phone
              </th>
              <th className="pb-3 text-gray-400">Claim</th>
              <th className="pb-3 text-gray-400">Tier</th>
              <th className="hidden pb-3 text-gray-400 lg:table-cell">
                Active
              </th>
              <th className="pb-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz: any) => (
              <tr
                key={biz.id}
                className="border-b border-pd-purple/10 hover:bg-pd-purple/5"
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
                  {(biz.categories as any)?.name || "\u2014"}
                </td>
                <td className="py-3 text-gray-400">{biz.city || "\u2014"}</td>
                <td className="hidden py-3 text-gray-400 lg:table-cell">
                  {biz.phone || "\u2014"}
                </td>
                <td className="py-3">{getClaimBadge(biz)}</td>
                <td className="py-3">{getTierBadge(biz.tier)}</td>
                <td className="hidden py-3 lg:table-cell">
                  {biz.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-500" />
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/businesses/${biz.id}`}
                      className="rounded p-1 text-gray-400 hover:bg-pd-purple/10 hover:text-white"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {biz.slug && (
                      <Link
                        href={`/business/${biz.slug}`}
                        className="rounded p-1 text-gray-400 hover:bg-pd-purple/10 hover:text-white"
                        title="View"
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
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
              className="flex mx-auto items-center gap-2 rounded-lg border border-pd-purple/20 px-6 py-2 text-sm text-gray-400 hover:bg-pd-purple/10 hover:text-white"
            >
              <ChevronDown className="h-4 w-4" /> Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
