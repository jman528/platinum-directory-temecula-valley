import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Eye, Users, TrendingUp, Download, Lock
} from "lucide-react";
import DashboardAnalyticsCharts from "@/components/dashboard/DashboardAnalyticsCharts";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, tier")
    .eq("owner_user_id", user.id)
    .limit(1)
    .single();

  const isPaidTier = biz?.tier && biz.tier !== "free";

  // Fetch basic stats
  let leadsCount = 0;
  if (biz) {
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("business_id", biz.id);
    leadsCount = count || 0;
  }

  if (!isPaidTier) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-gray-400">Track your listing performance</p>

        {/* Basic Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Leads</p>
            <p className="mt-1 text-3xl font-bold text-white">{leadsCount}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Listing Status</p>
            <p className="mt-1 text-3xl font-bold text-white">{biz ? "Active" : "—"}</p>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="mt-8 glass-card p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-4 text-xl font-bold text-white">Unlock Full Analytics</h3>
          <p className="mt-2 text-gray-400">
            Upgrade to Partner or Elite plan to access detailed analytics including
            views over time, traffic sources, lead conversion funnels, and downloadable reports.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-lg bg-pd-gold px-6 py-3 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-gray-400">Performance metrics for {biz?.name}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Profile Views</p>
              <p className="mt-1 text-3xl font-bold text-white">0</p>
              <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Leads</p>
              <p className="mt-1 text-3xl font-bold text-white">{leadsCount}</p>
              <p className="mt-1 text-xs text-gray-500">All time</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <Users className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Conversion Rate</p>
              <p className="mt-1 text-3xl font-bold text-white">—</p>
              <p className="mt-1 text-xs text-gray-500">Views to leads</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Search Appearances</p>
              <p className="mt-1 text-3xl font-bold text-white">—</p>
              <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
            </div>
            <div className="rounded-lg bg-pd-gold/10 p-2.5">
              <BarChart3 className="h-5 w-5 text-pd-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Views & Clicks</h3>
          <p className="text-sm text-gray-400">Last 30 days</p>
          <DashboardAnalyticsCharts type="views" />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Lead Sources</h3>
          <p className="text-sm text-gray-400">Where your leads come from</p>
          <DashboardAnalyticsCharts type="sources" />
        </div>
      </div>
    </div>
  );
}
