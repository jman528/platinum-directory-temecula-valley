"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Handshake,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const USER_TYPES = [
  { value: "", label: "All Types" },
  { value: "customer", label: "Customer" },
  { value: "business_owner", label: "Business Owner" },
  { value: "affiliate", label: "Affiliate" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const TABS = [
  { key: "all", label: "All Users" },
  { key: "affiliates", label: "Affiliates" },
  { key: "pending_affiliates", label: "Pending Applications" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const supabase = createClient();
  const PAGE_SIZE = 50;

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

  useEffect(() => {
    if (!authorized) return;
    fetchUsers(0);
  }, [authorized, filterType, searchQuery, activeTab]);

  async function fetchUsers(pageNum: number, append = false) {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (activeTab === "affiliates") {
      query = query.eq("user_type", "affiliate");
    } else if (activeTab === "pending_affiliates") {
      query = query.eq("user_type", "affiliate").eq("affiliate_status", "pending");
    } else if (filterType) {
      query = query.eq("user_type", filterType);
    }
    if (searchQuery.trim()) {
      query = query.or(
        `email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Users fetch error:", error);
      setLoading(false);
      return;
    }

    const list = data || [];
    if (append) {
      setUsers((prev) => [...prev, ...list]);
    } else {
      setUsers(list);
    }
    setHasMore(list.length === PAGE_SIZE);
    setLoading(false);
  }

  function getTypeBadge(type: string) {
    const colors: Record<string, string> = {
      customer: "bg-gray-500/20 text-gray-400",
      business_owner: "bg-pd-blue/20 text-pd-blue",
      affiliate: "bg-pd-purple/20 text-pd-purple-light",
      admin: "bg-pd-gold/20 text-pd-gold",
      super_admin: "bg-red-500/20 text-red-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs capitalize ${colors[type] || colors.customer}`}
      >
        {type.replace(/_/g, " ")}
      </span>
    );
  }

  async function approveAffiliate(userId: string) {
    await supabase
      .from("profiles")
      .update({ affiliate_status: "approved" })
      .eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, affiliate_status: "approved" } : u));
  }

  async function rejectAffiliate(userId: string) {
    await supabase
      .from("profiles")
      .update({ affiliate_status: "rejected" })
      .eq("id", userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
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
      <h2 className="font-heading text-2xl font-bold text-white">
        User Management
      </h2>
      <p className="mt-1 text-gray-400">
        Manage customers, business owners, and admin users.
      </p>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
              activeTab === tab.key ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.key === "pending_affiliates" && <Handshake className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full min-w-[200px] bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2 text-sm text-white focus:outline-none"
        >
          {USER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pd-purple/20 text-left">
              <th className="pb-3 text-gray-400">Email</th>
              <th className="hidden pb-3 text-gray-400 md:table-cell">
                Name
              </th>
              <th className="pb-3 text-gray-400">Type</th>
              <th className="hidden pb-3 text-gray-400 lg:table-cell">
                Points
              </th>
              <th className="pb-3 text-gray-400">Joined</th>
              {(activeTab === "affiliates" || activeTab === "pending_affiliates") && (
                <th className="pb-3 text-gray-400">Status</th>
              )}
              {activeTab === "pending_affiliates" && (
                <th className="pb-3 text-gray-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr
                key={u.id}
                className="border-b border-pd-purple/10 hover:bg-pd-purple/5"
              >
                <td className="py-3 text-white">{u.email}</td>
                <td className="hidden py-3 text-gray-400 md:table-cell">
                  {u.full_name || "\u2014"}
                </td>
                <td className="py-3">{getTypeBadge(u.user_type)}</td>
                <td className="hidden py-3 text-gray-400 lg:table-cell">
                  {u.points_balance || 0}
                </td>
                <td className="py-3 text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                {(activeTab === "affiliates" || activeTab === "pending_affiliates") && (
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      u.affiliate_status === "approved" ? "bg-green-500/20 text-green-400" :
                      u.affiliate_status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      u.affiliate_status === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {u.affiliate_status || "—"}
                    </span>
                  </td>
                )}
                {activeTab === "pending_affiliates" && (
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveAffiliate(u.id)}
                        className="flex items-center gap-1 rounded-lg bg-green-500/10 px-2.5 py-1 text-xs text-green-400 hover:bg-green-500/20"
                      >
                        <CheckCircle className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => rejectAffiliate(u.id)}
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-pd-purple" />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No users found.
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchUsers(next, true);
              }}
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
