import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Eye, Users, BarChart3, DollarSign, Plus, Tag,
  MessageSquare, Link2, Bot, Download, ArrowRight
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: businesses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("businesses").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const bizList = (businesses as any[]) || [];
  const displayName = profile?.full_name?.split(" ")[0] || "there";
  const primaryBiz = bizList[0];

  // Fetch stats for primary business
  let viewCount = 0;
  let leadsCount = 0;
  let revenueTotal = 0;
  let recentLeads: any[] = [];

  if (primaryBiz) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [leadsResult, recentLeadsResult] = await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", primaryBiz.id),
      supabase
        .from("leads")
        .select("id, name, email, message, status, created_at")
        .eq("business_id", primaryBiz.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    leadsCount = leadsResult.count || 0;
    recentLeads = recentLeadsResult.data || [];
  }

  const statCards = [
    {
      icon: Eye,
      value: viewCount.toLocaleString(),
      label: "Total Profile Views",
      trend: "Last 30 days",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Users,
      value: leadsCount.toLocaleString(),
      label: "Total Leads",
      trend: "All time",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: BarChart3,
      value: "—",
      label: "Response Rate",
      trend: "Within 24 hours",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: DollarSign,
      value: formatCurrency(revenueTotal),
      label: "Total Revenue",
      trend: "From Smart Offers",
      color: "text-pd-gold",
      bg: "bg-pd-gold/10",
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Add New Listing", href: "/claim", color: "text-blue-400" },
    { icon: Tag, label: "Create Smart Offer", href: "/dashboard/offers", color: "text-purple-400" },
    { icon: MessageSquare, label: "View Messages", href: "/dashboard/messages", color: "text-green-400" },
    { icon: Link2, label: "Share Referral Link", href: "/dashboard/rewards", color: "text-pd-gold" },
    { icon: Bot, label: "Ask AI Assistant", href: "/dashboard/ai", color: "text-cyan-400" },
    { icon: Download, label: "Download Report", href: "/dashboard/analytics", color: "text-gray-400" },
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Dashboard Overview</h1>
      <p className="mt-1 text-gray-400">Welcome back, {displayName}!</p>

      {/* 4 Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.trend}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">Recent Leads</h3>
            <Link href="/dashboard/leads" className="text-xs text-pd-gold hover:underline">
              View All <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentLeads.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">No leads yet. Leads will appear here when customers contact you.</p>
            ) : (
              recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                    {lead.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{lead.name || "Unknown"}</p>
                    <p className="truncate text-xs text-gray-500">{lead.message || lead.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-500">{timeAgo(lead.created_at)}</span>
                    <Link
                      href="/dashboard/leads"
                      className="rounded-md bg-pd-blue/20 px-2 py-0.5 text-[10px] font-medium text-pd-blue hover:bg-pd-blue/30"
                    >
                      Respond
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* My Listings */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-white">My Listings</h3>
          <Link href="/dashboard/listings" className="text-xs text-pd-gold hover:underline">
            Manage <ArrowRight className="ml-1 inline h-3 w-3" />
          </Link>
        </div>
        {bizList.length === 0 ? (
          <div className="mt-4 glass-card p-8 text-center">
            <p className="text-gray-400">You haven&apos;t claimed any businesses yet.</p>
            <Link
              href="/claim"
              className="mt-4 inline-block rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
            >
              Claim Your Business
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bizList.map((biz: any) => (
              <Link
                key={biz.id}
                href={`/dashboard/listings`}
                className="glass-card flex items-center justify-between p-4 transition-colors hover:bg-white/[0.03]"
              >
                <div>
                  <p className="font-medium text-white">{biz.name}</p>
                  <p className="text-sm text-gray-400">
                    {biz.city}, {biz.state} &middot;{" "}
                    <span className="capitalize">{biz.tier?.replace(/_/g, " ")}</span>
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    biz.is_active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {biz.is_active ? "Active" : "Pending"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
