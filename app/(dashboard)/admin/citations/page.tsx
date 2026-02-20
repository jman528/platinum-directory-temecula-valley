"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CitationStatus = "none" | "submitted" | "processing" | "complete";

interface BusinessCitation {
  id: string;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  phone: string;
  website: string;
  slug: string;
  categories: { name: string } | null;
  citation_submissions: {
    id: string;
    status: string;
    submission_date: string;
    directories_count: number;
  }[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All Businesses" },
  { value: "none", label: "Needs Citation" },
  { value: "submitted", label: "Submitted" },
  { value: "processing", label: "Processing" },
  { value: "complete", label: "Complete" },
];

function statusBadge(status: CitationStatus) {
  switch (status) {
    case "complete":
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
          <CheckCircle className="h-3 w-3" /> Complete
        </span>
      );
    case "submitted":
      return (
        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
          <Clock className="h-3 w-3" /> Submitted
        </span>
      );
    case "processing":
      return (
        <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-400">
          <AlertCircle className="h-3 w-3" /> Needs Citation
        </span>
      );
  }
}

export default function AdminCitationsPage() {
  const [businesses, setBusinesses] = useState<BusinessCitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ total: 0, needsCitation: 0, submitted: 0, complete: 0 });
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
    fetchBusinesses();
  }, [authorized]);

  async function fetchBusinesses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, address, city, zip_code, phone, website, slug, categories(name), citation_submissions(id, status, submission_date, directories_count)")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(2000);

    if (!error && data) {
      setBusinesses(data as any);
      const needsCitation = data.filter((b: any) => !b.citation_submissions?.length).length;
      const submitted = data.filter((b: any) => b.citation_submissions?.some((c: any) => c.status === "submitted" || c.status === "processing")).length;
      const complete = data.filter((b: any) => b.citation_submissions?.some((c: any) => c.status === "complete")).length;
      setStats({ total: data.length, needsCitation, submitted, complete });
    }
    setLoading(false);
  }

  function getCitationStatus(biz: BusinessCitation): CitationStatus {
    if (!biz.citation_submissions?.length) return "none";
    const statuses = biz.citation_submissions.map((c) => c.status);
    if (statuses.includes("complete")) return "complete";
    if (statuses.includes("processing")) return "processing";
    if (statuses.includes("submitted")) return "submitted";
    return "none";
  }

  const filtered = businesses.filter((biz) => {
    const status = getCitationStatus(biz);
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return biz.name.toLowerCase().includes(q) || biz.city?.toLowerCase().includes(q);
    }
    return true;
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  }

  async function exportCSV() {
    setExporting(true);
    const ids = selectedIds.size > 0 ? Array.from(selectedIds).join(",") : "";
    const url = `/api/admin/citations/export${ids ? `?businessIds=${ids}` : ""}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `pd-citations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Export error:", err);
    }
    setExporting(false);
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Businesses", value: stats.total.toLocaleString(), icon: Building2, color: "text-pd-purple-light", bg: "bg-pd-purple/10" },
    { title: "Needs Citation", value: stats.needsCitation.toLocaleString(), icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { title: "Submitted", value: stats.submitted.toLocaleString(), icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Complete", value: stats.complete.toLocaleString(), icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Citation Management</h2>
          <p className="mt-1 text-sm text-gray-400">Generate NAP data and export for citation services</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={exporting}
          className="btn-gold btn-premium flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-pd-dark"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV {selectedIds.size > 0 ? `(${selectedIds.size})` : "(All)"}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                statusFilter === f.value ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 glass-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p>No businesses match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pd-purple/20 text-left">
                  <th className="pb-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-600"
                    />
                  </th>
                  <th className="pb-3 text-gray-400">Business</th>
                  <th className="pb-3 text-gray-400">City</th>
                  <th className="pb-3 text-gray-400">Phone</th>
                  <th className="pb-3 text-gray-400">Category</th>
                  <th className="pb-3 text-gray-400">Citation Status</th>
                  <th className="pb-3 text-gray-400">Directories</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((biz) => {
                  const status = getCitationStatus(biz);
                  const latestCitation = biz.citation_submissions?.[0];
                  return (
                    <tr key={biz.id} className="border-b border-pd-purple/10 hover:bg-pd-purple/5">
                      <td className="py-3 pr-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(biz.id)}
                          onChange={() => toggleSelect(biz.id)}
                          className="rounded border-gray-600"
                        />
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-white">{biz.name}</p>
                        <p className="text-xs text-gray-500">{biz.address || "No address"}</p>
                      </td>
                      <td className="py-3 text-gray-300">{biz.city || "—"}</td>
                      <td className="py-3 text-gray-300">{biz.phone || "—"}</td>
                      <td className="py-3 text-gray-300">{(biz.categories as any)?.name || "—"}</td>
                      <td className="py-3">{statusBadge(status)}</td>
                      <td className="py-3 text-gray-300">
                        {latestCitation ? latestCitation.directories_count : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <p className="mt-4 text-center text-xs text-gray-500">
                Showing 100 of {filtered.length} businesses. Use search to narrow results.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
