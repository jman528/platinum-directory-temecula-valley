"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SyndicationLog {
  id: string;
  business_id: string;
  platform: string;
  post_type: string;
  post_content: string;
  post_url: string | null;
  status: string;
  error_message: string | null;
  posted_at: string | null;
  created_at: string;
  businesses?: { name: string; slug: string } | null;
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  facebook: { bg: "bg-blue-600/20", text: "text-blue-400" },
  instagram: { bg: "bg-pink-500/20", text: "text-pink-400" },
  x: { bg: "bg-gray-500/20", text: "text-gray-300" },
  linkedin: { bg: "bg-blue-500/20", text: "text-blue-300" },
  reddit: { bg: "bg-orange-500/20", text: "text-orange-400" },
  discord: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  cron: { bg: "bg-pd-purple/20", text: "text-pd-purple-light" },
};

export default function AdminSyndicationPage() {
  const [logs, setLogs] = useState<SyndicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({
    totalMonth: 0,
    posted: 0,
    failed: 0,
    pending: 0,
  });
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
    fetchLogs();
  }, [authorized]);

  async function fetchLogs() {
    setLoading(true);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("syndication_log")
      .select("*, businesses(name, slug)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data as any);
      const thisMonth = data.filter(
        (l: any) => new Date(l.created_at) >= monthAgo
      );
      setStats({
        totalMonth: thisMonth.length,
        posted: thisMonth.filter((l: any) => l.status === "posted").length,
        failed: thisMonth.filter((l: any) => l.status === "failed").length,
        pending: thisMonth.filter((l: any) => l.status === "pending" || l.status === "scheduled").length,
      });
    }
    setLoading(false);
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  const statCards = [
    { title: "Posts This Month", value: stats.totalMonth, icon: BarChart3, color: "text-pd-purple-light", bg: "bg-pd-purple/10" },
    { title: "Successfully Posted", value: stats.posted, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { title: "Failed", value: stats.failed, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Social Syndication</h2>
          <p className="mt-1 text-sm text-gray-400">Monitor and manage social media posting across platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link
            href="/admin/syndication/settings"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
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

      {/* Platform Status */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Platform Status</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["facebook", "instagram", "x", "linkedin", "reddit", "discord"].map((platform) => {
            const colors = PLATFORM_COLORS[platform] || { bg: "bg-gray-500/20", text: "text-gray-400" };
            const platformLogs = logs.filter((l) => l.platform === platform);
            const lastSuccess = platformLogs.find((l) => l.status === "posted");
            const hasRecent = lastSuccess && new Date(lastSuccess.created_at) > new Date(Date.now() - 7 * 86400000);
            return (
              <div key={platform} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium capitalize ${colors.text}`}>{platform}</span>
                  <span className={`h-2 w-2 rounded-full ${hasRecent ? "bg-green-400" : lastSuccess ? "bg-yellow-400" : "bg-gray-500"}`} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {lastSuccess
                    ? `Last: ${new Date(lastSuccess.created_at).toLocaleDateString()}`
                    : "No posts yet"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Recent Posts</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Share2 className="h-10 w-10 mb-3 opacity-50" />
            <p>No syndication posts yet</p>
            <p className="mt-1 text-xs text-gray-500">Posts will appear here when syndication is enabled</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pd-purple/20 text-left">
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Business</th>
                  <th className="pb-3 text-gray-400">Platform</th>
                  <th className="pb-3 text-gray-400">Type</th>
                  <th className="pb-3 text-gray-400">Status</th>
                  <th className="pb-3 text-gray-400">Link</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log) => {
                  const colors = PLATFORM_COLORS[log.platform] || { bg: "bg-gray-500/20", text: "text-gray-400" };
                  return (
                    <tr key={log.id} className="border-b border-pd-purple/10 hover:bg-pd-purple/5">
                      <td className="py-3 text-gray-300">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-white">
                          {(log.businesses as any)?.name || "System"}
                        </p>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
                          {log.platform}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{log.post_type.replace(/_/g, " ")}</td>
                      <td className="py-3">
                        {log.status === "posted" ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="h-3 w-3" /> Posted
                          </span>
                        ) : log.status === "failed" ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs" title={log.error_message || ""}>
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Clock className="h-3 w-3" /> {log.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {log.post_url ? (
                          <a
                            href={log.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pd-purple-light hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
