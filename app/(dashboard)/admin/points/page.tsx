import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  Coins, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Zap, DollarSign, Ban, Eye, RotateCcw, Search
} from 'lucide-react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}

export default async function AdminPointsPage() {
  await requireAdmin()
  const adminClient = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { data: topUsers },
    { data: recentTransactions },
    { count: totalUsersWithPoints },
    { data: allPointsData },
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, email, full_name, points_balance, total_points_earned, created_at')
      .gt('total_points_earned', 0)
      .order('total_points_earned', { ascending: false })
      .limit(20),
    adminClient
      .from('points_ledger')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(50),
    adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('total_points_earned', 0),
    adminClient
      .from('profiles')
      .select('points_balance, total_points_earned'),
  ])

  const userList = topUsers || []
  const txList = (recentTransactions as any[]) || []

  const totalOutstanding = allPointsData?.reduce((sum, p) => sum + (p.points_balance || 0), 0) || 0
  const totalEverIssued = allPointsData?.reduce((sum, p) => sum + (p.total_points_earned || 0), 0) || 0
  const totalRedeemed = totalEverIssued - totalOutstanding
  const redemptionRate = totalEverIssued > 0 ? Math.round((totalRedeemed / totalEverIssued) * 100) : 0

  // Detect suspicious users (high balance relative to account age or rapid accumulation)
  const suspiciousUsers = userList.filter((u: any) => {
    const daysSinceCreation = Math.max(1, (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const pointsPerDay = (u.total_points_earned || 0) / daysSinceCreation
    return pointsPerDay > 100 || u.points_balance > 10000
  })

  const statCards = [
    {
      title: 'Total Points Outstanding',
      value: totalOutstanding.toLocaleString(),
      sub: `~ ${formatCurrency(totalOutstanding * 0.001)} liability`,
      icon: Coins,
      color: 'text-pd-gold',
      bg: 'bg-pd-gold/10',
    },
    {
      title: 'Points Issued (All Time)',
      value: totalEverIssued.toLocaleString(),
      sub: `${totalUsersWithPoints || 0} users with points`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Points Redeemed',
      value: totalRedeemed.toLocaleString(),
      sub: `${redemptionRate}% redemption rate`,
      icon: ArrowDownRight,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Dollar Liability',
      value: formatCurrency(totalOutstanding * 0.001),
      sub: 'At $0.001 per point',
      icon: DollarSign,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Points & Multipliers</h2>
      <p className="mt-1 text-gray-400">Manage the platform points economy, multiplier events, and fraud detection</p>

      {/* Points Reserve Dashboard */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Multiplier Manager */}
      <div className="mt-8 glass-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
            <Zap className="h-5 w-5 text-pd-gold" /> Multiplier Events
          </h3>
          <button className="flex items-center gap-2 rounded-lg bg-pd-purple/20 px-4 py-2 text-sm font-medium text-pd-purple-light hover:bg-pd-purple/30">
            <Zap className="h-4 w-4" /> Create Multiplier
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">Create flash multiplier events to boost engagement</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Event Name</th>
                <th className="pb-3 text-gray-400">Multiplier</th>
                <th className="pb-3 text-gray-400">Applies To</th>
                <th className="pb-3 text-gray-400">Start</th>
                <th className="pb-3 text-gray-400">End</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 text-white">Weekend Bonus</td>
                <td className="py-3">
                  <span className="rounded-full bg-pd-gold/10 px-2 py-0.5 text-xs font-bold text-pd-gold">2x</span>
                </td>
                <td className="py-3 text-gray-400">All activities</td>
                <td className="py-3 text-gray-400">Sat 12am</td>
                <td className="py-3 text-gray-400">Sun 11:59pm</td>
                <td className="py-3">
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Active</span>
                </td>
              </tr>
              <tr className="border-b border-white/5 text-gray-500">
                <td colSpan={6} className="py-8 text-center">
                  Configure multiplier events from the database. Coming soon: in-app event creation.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Fraud Detection */}
      {suspiciousUsers.length > 0 && (
        <div className="mt-8 glass-card p-6">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-red-400" /> Fraud Detection
          </h3>
          <p className="mt-1 text-sm text-gray-500">Users with unusual points accumulation patterns</p>

          <div className="mt-4 space-y-3">
            {suspiciousUsers.map((u: any) => {
              const daysSinceCreation = Math.max(1, (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
              const pointsPerDay = Math.round((u.total_points_earned || 0) / daysSinceCreation)
              return (
                <div key={u.id} className="flex flex-col gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{u.full_name || u.email}</p>
                    <p className="text-sm text-gray-400">
                      Balance: <span className="text-pd-gold">{u.points_balance?.toLocaleString()}</span>
                      {' '}&middot; {pointsPerDay} pts/day avg
                      {' '}&middot; Joined {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30">
                      <Ban className="h-3.5 w-3.5" /> Freeze Points
                    </button>
                    <button className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white">
                      <Eye className="h-3.5 w-3.5" /> Audit
                    </button>
                    <button className="flex items-center gap-1 rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30">
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Top Points Holders */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Top Points Holders</h3>
          {userList.length === 0 ? (
            <div className="mt-4 py-8 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-gray-400">No users have earned points yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {userList.slice(0, 10).map((u: any, i: number) => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{u.full_name || u.email}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pd-gold">{(u.points_balance || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">of {(u.total_points_earned || 0).toLocaleString()} earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Points Ledger */}
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Points Ledger</h3>
          {txList.length === 0 ? (
            <div className="mt-4 py-8 text-center">
              <Coins className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {txList.slice(0, 15).map((tx: any) => {
                const isEarned = tx.points > 0
                return (
                  <div key={tx.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isEarned ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {isEarned
                        ? <ArrowUpRight className="h-4 w-4 text-green-400" />
                        : <ArrowDownRight className="h-4 w-4 text-red-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {(tx.profiles as any)?.full_name || (tx.profiles as any)?.email || 'Unknown'}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {tx.action?.replace(/^(earned_|redeemed_)/, '').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isEarned ? 'text-green-400' : 'text-red-400'}`}>
                        {isEarned ? '+' : ''}{tx.points}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
