import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  TrendingUp, Store, AlertTriangle, ShieldAlert, Target, Bot,
  CheckCircle, XCircle, Eye, Database, Flame, BarChart3, Flag,
  LayoutGrid, Palette, Settings, DollarSign, Sparkles, List,
} from 'lucide-react'
import AdminRevenueChart from '@/components/admin/AdminRevenueChart'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents)
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const adminClient = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Parallel data fetching
  const [
    { count: activeCount },
    { count: pendingCount },
    { count: totalCount },
    { data: tierCounts },
    { data: recentBusinesses },
    { data: recentUsers },
    { data: pointsData },
    { data: aiCreditsData },
    { count: validNameCount },
    { count: flaggedNameCount },
    { count: hotLeadCount },
    { count: enrichedCount },
    { data: qualityScores },
  ] = await Promise.all([
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', false),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }),
    adminClient.from('businesses').select('tier').neq('tier', 'free'),
    adminClient.from('businesses').select('id, name, tier, is_active, created_at, city').order('created_at', { ascending: false }).limit(10),
    adminClient.from('profiles').select('id, email, full_name, user_type, created_at').order('created_at', { ascending: false }).limit(10),
    adminClient.from('profiles').select('points_balance'),
    adminClient.from('ai_credit_transactions').select('credits_delta').lt('credits_delta', 0).gte('created_at', startOfMonth.toISOString()),
    // Data quality stats
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('has_valid_name', true),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('has_valid_name', false),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('is_hot_lead', true),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }).eq('enrichment_status', 'completed'),
    adminClient.from('businesses').select('data_quality_score').not('data_quality_score', 'is', null),
  ])

  // Revenue estimate from paid tier counts
  const tierPrices: Record<string, number> = {
    verified_platinum: 99,
    platinum_partner: 799,
    platinum_elite: 3500,
  }
  const revenueEstimate = tierCounts?.reduce((acc, b) => acc + (tierPrices[b.tier] || 0), 0) || 0

  // Calculate new this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const newThisWeek = recentBusinesses?.filter(b => new Date(b.created_at) > weekAgo).length || 0

  // Points liability
  const totalPoints = pointsData?.reduce((sum, p) => sum + (p.points_balance || 0), 0) || 0

  // AI credits used MTD
  const aiCreditsUsed = aiCreditsData?.reduce((sum, t) => sum + Math.abs(t.credits_delta || 0), 0) || 0

  // Pending moderation items
  const pendingMod = recentBusinesses?.filter(b => !b.is_active).slice(0, 5) || []

  const statCards = [
    {
      title: 'Total Revenue (MTD)',
      value: formatCurrency(revenueEstimate),
      trend: `${tierCounts?.length || 0} active subscriptions`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-l-green-500',
    },
    {
      title: 'Active Businesses',
      value: (activeCount || 0).toLocaleString(),
      trend: `+${newThisWeek} new this week`,
      icon: Store,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-l-blue-500',
    },
    {
      title: 'Pending Verification',
      value: String(pendingCount || 0),
      action: { label: 'Review Now', href: '/admin/businesses?status=pending' },
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-l-yellow-500',
    },
    {
      title: 'Open Moderation Items',
      value: String(pendingMod.length),
      action: { label: 'View Queue', href: '/admin/moderation' },
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-l-red-500',
    },
    {
      title: 'Points Liability',
      value: totalPoints.toLocaleString(),
      trend: `~ ${formatCurrency(totalPoints * 0.001)}`,
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-l-purple-500',
    },
    {
      title: 'AI Credits Used (MTD)',
      value: aiCreditsUsed.toLocaleString(),
      trend: 'credits consumed',
      icon: Bot,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-l-cyan-500',
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Platform Overview</h2>
      <p className="mt-1 text-gray-400">
        {totalCount || 0} total businesses &middot; Real-time platform metrics
      </p>

      {/* 6 Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.title} className={`glass-card p-5 border-l-4 ${stat.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                {stat.trend && <p className="mt-1 text-xs text-gray-500">{stat.trend}</p>}
                {stat.action && (
                  <Link href={stat.action.href} className="mt-2 inline-block text-xs font-medium text-pd-blue hover:underline">
                    {stat.action.label} &rarr;
                  </Link>
                )}
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Moderation */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {(recentUsers || []).length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              (recentUsers || []).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                    {(u.full_name || u.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{u.full_name || u.email}</p>
                    <p className="text-xs text-gray-500">
                      New {u.user_type === 'business_owner' ? 'business owner' : u.user_type} signup
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Moderation Queue Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">Moderation Queue</h3>
            <Link href="/admin/moderation" className="text-xs text-pd-blue hover:underline">View All &rarr;</Link>
          </div>
          <div className="mt-4 space-y-3">
            {pendingMod.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" /> All clear — no pending items
              </div>
            ) : (
              pendingMod.map((biz: any) => (
                <div key={biz.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{biz.name}</p>
                    <p className="text-xs text-gray-500">{biz.city} &middot; Pending verification</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/businesses/${biz.id}`} className="rounded-md bg-white/5 p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="font-heading text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Manage Businesses', icon: Store, href: '/admin/businesses', color: 'text-blue-400' },
            { label: 'Manage Users', icon: Target, href: '/admin/users', color: 'text-purple-400' },
            { label: 'Banner Controls', icon: Palette, href: '/admin/banners', color: 'text-yellow-400' },
            { label: 'Smart Offers', icon: Sparkles, href: '/admin/offers', color: 'text-cyan-400' },
            { label: 'Syndication Dashboard', icon: BarChart3, href: '/admin/syndication', color: 'text-green-400' },
            { label: 'Revenue Dashboard', icon: DollarSign, href: '/admin/revenue-architecture', color: 'text-pd-gold' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              target={undefined}
              className="glass-card flex items-center gap-3 p-4 transition-all hover:border-pd-purple/30"
            >
              <div className="rounded-lg bg-white/5 p-2.5">
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Revenue Overview</h3>
        <p className="text-sm text-gray-400">Subscription MRR by month</p>
        <AdminRevenueChart />
      </div>

      {/* Data Quality Overview */}
      <div className="mt-8 glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-pd-blue" /> Import &amp; Data Quality
            </h3>
            <p className="mt-1 text-sm text-gray-400">Business data quality overview</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/businesses/flagged"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Flag className="mr-1 inline h-3 w-3" /> Review Flagged Names
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Businesses</p>
            <p className="mt-1 text-2xl font-bold text-white">{(totalCount || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Valid Names</p>
            <p className="mt-1 text-2xl font-bold text-green-400">
              {(validNameCount || 0).toLocaleString()}
              <span className="ml-1 text-sm text-gray-500">
                ({totalCount ? Math.round(((validNameCount || 0) / totalCount) * 100) : 0}%)
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Flagged Names</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">{(flaggedNameCount || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" /> Hot Leads
            </p>
            <p className="mt-1 text-2xl font-bold text-orange-400">{(hotLeadCount || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Data Quality Distribution */}
        {(() => {
          const scores = qualityScores || []
          const high = scores.filter((s: any) => s.data_quality_score >= 80).length
          const med = scores.filter((s: any) => s.data_quality_score >= 50 && s.data_quality_score < 80).length
          const low = scores.filter((s: any) => s.data_quality_score >= 20 && s.data_quality_score < 50).length
          const vlow = scores.filter((s: any) => s.data_quality_score < 20).length
          const total = scores.length || 1
          return (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Data Quality Distribution</p>
              <div className="space-y-2">
                {[
                  { label: '80-100 (High)', count: high, color: 'bg-green-500' },
                  { label: '50-79 (Medium)', count: med, color: 'bg-blue-500' },
                  { label: '20-49 (Low)', count: low, color: 'bg-yellow-500' },
                  { label: '0-19 (Very Low)', count: vlow, color: 'bg-red-500' },
                ].map(tier => (
                  <div key={tier.label} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-gray-400">{tier.label}</span>
                    <div className="flex-1 rounded-full bg-white/5 h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tier.color}`}
                        style={{ width: `${Math.max(1, (tier.count / total) * 100)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs text-gray-400">
                      {tier.count.toLocaleString()} ({Math.round((tier.count / total) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span><BarChart3 className="mr-1 inline h-3 w-3" /> Enrichment: {(enrichedCount || 0).toLocaleString()} completed / {((totalCount || 0) - (enrichedCount || 0)).toLocaleString()} pending</span>
          </div>
        </div>
      </div>

      {/* System Health Footer */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-white">System Status: Operational</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> Database</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> API</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> Payments</span>
        </div>
      </div>
    </div>
  )
}
