import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { BarChart3, TrendingUp, DollarSign, Users, Target, Bot } from 'lucide-react'
import AdminAnalyticsCharts from '@/components/admin/AdminAnalyticsCharts'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const adminClient = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { data: tierCounts },
    { count: totalBusinesses },
    { count: totalUsers },
    { data: pointsData },
    { data: aiCreditsData },
    { data: recentSignups },
  ] = await Promise.all([
    adminClient.from('businesses').select('tier').neq('tier', 'free'),
    adminClient.from('businesses').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('points_balance'),
    adminClient.from('ai_credit_transactions').select('credits_delta').lt('credits_delta', 0).gte('created_at', startOfMonth.toISOString()),
    adminClient.from('businesses').select('tier, created_at').order('created_at', { ascending: false }).limit(100),
  ])

  // Revenue by tier
  const tierPrices: Record<string, number> = {
    verified_platinum: 99,
    platinum_partner: 799,
    platinum_elite: 3500,
  }
  const tierBreakdown = (tierCounts || []).reduce((acc: Record<string, { count: number; revenue: number }>, b) => {
    const tier = b.tier as string
    if (!acc[tier]) acc[tier] = { count: 0, revenue: 0 }
    acc[tier].count++
    acc[tier].revenue += tierPrices[tier] || 0
    return acc
  }, {})

  const totalMRR = Object.values(tierBreakdown).reduce((sum, t) => sum + t.revenue, 0)
  const totalSubscribers = tierCounts?.length || 0

  // Points liability
  const totalPoints = pointsData?.reduce((sum, p) => sum + (p.points_balance || 0), 0) || 0

  // AI credits
  const aiCreditsUsed = aiCreditsData?.reduce((sum, t) => sum + Math.abs(t.credits_delta || 0), 0) || 0

  // New signups this month
  const newThisMonth = recentSignups?.filter(b => new Date(b.created_at) >= startOfMonth).length || 0

  const statCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(totalMRR),
      sub: `${totalSubscribers} active subscriptions`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Total Businesses',
      value: (totalBusinesses || 0).toLocaleString(),
      sub: `+${newThisMonth} this month`,
      icon: BarChart3,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Users',
      value: (totalUsers || 0).toLocaleString(),
      sub: 'Registered accounts',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Points Liability',
      value: totalPoints.toLocaleString(),
      sub: `~ ${formatCurrency(totalPoints * 0.001)}`,
      icon: Target,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'AI Credits Used (MTD)',
      value: aiCreditsUsed.toLocaleString(),
      sub: 'Credits consumed',
      icon: Bot,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Avg Revenue Per Sub',
      value: totalSubscribers > 0 ? formatCurrency(totalMRR / totalSubscribers) : '$0',
      sub: 'Per paying business',
      icon: TrendingUp,
      color: 'text-pd-gold',
      bg: 'bg-pd-gold/10',
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Revenue & Analytics</h2>
      <p className="mt-1 text-gray-400">Platform-wide revenue metrics and growth analytics</p>

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Tier Breakdown */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Revenue by Tier</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Tier</th>
                <th className="pb-3 text-gray-400">Subscribers</th>
                <th className="pb-3 text-gray-400">Price/mo</th>
                <th className="pb-3 text-gray-400">MRR</th>
                <th className="pb-3 text-gray-400">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tierBreakdown).map(([tier, data]) => (
                <tr key={tier} className="border-b border-white/5">
                  <td className="py-3">
                    <span className="rounded-full bg-pd-gold/10 px-2 py-0.5 text-xs text-pd-gold">
                      {tier.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-white">{data.count}</td>
                  <td className="py-3 text-gray-400">{formatCurrency(tierPrices[tier] || 0)}</td>
                  <td className="py-3 font-semibold text-white">{formatCurrency(data.revenue)}</td>
                  <td className="py-3 text-gray-400">
                    {totalMRR > 0 ? Math.round((data.revenue / totalMRR) * 100) : 0}%
                  </td>
                </tr>
              ))}
              {Object.keys(tierBreakdown).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No paid subscriptions yet.</td>
                </tr>
              )}
            </tbody>
            {Object.keys(tierBreakdown).length > 0 && (
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="py-3 font-semibold text-white">Total</td>
                  <td className="py-3 font-semibold text-white">{totalSubscribers}</td>
                  <td className="py-3"></td>
                  <td className="py-3 font-bold text-green-400">{formatCurrency(totalMRR)}</td>
                  <td className="py-3 text-gray-400">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Revenue Trend</h3>
          <p className="text-sm text-gray-400">Subscription MRR by month</p>
          <AdminAnalyticsCharts type="revenue" />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Business Signups</h3>
          <p className="text-sm text-gray-400">New businesses by month</p>
          <AdminAnalyticsCharts type="signups" />
        </div>
      </div>
    </div>
  )
}
