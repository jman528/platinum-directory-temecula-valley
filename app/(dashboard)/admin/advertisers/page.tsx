import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Megaphone, Search, Pencil, Trash2, Eye } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  verified_platinum: 'Verified ($99/mo)',
  platinum_partner: 'Partner ($799/mo)',
  platinum_elite: 'Elite ($3,500/mo)',
}

export default async function AdvertisersPage() {
  await requireAdmin()
  const adminClient = createAdminClient()

  const { data: advertisers } = await adminClient
    .from('businesses')
    .select('id, name, slug, tier, subscription_status, created_at, city, owner_user_id')
    .in('tier', ['verified_platinum', 'platinum_partner', 'platinum_elite'])
    .order('created_at', { ascending: false })

  const advList = advertisers || []

  // Fetch owner profiles
  const ownerIds = [...new Set(advList.map(a => a.owner_user_id).filter(Boolean))]
  let ownerMap: Record<string, any> = {}
  if (ownerIds.length > 0) {
    const { data: owners } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ownerIds)
    if (owners) {
      ownerMap = Object.fromEntries(owners.map(o => [o.id, o]))
    }
  }

  function getStatusBadge(status: string | null) {
    if (status === 'active') return <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Active</span>
    if (status === 'past_due') return <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">Past Due</span>
    return <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">{status || 'Pending'}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Advertiser Management</h2>
          <p className="mt-1 text-gray-400">{advList.length} active advertisers</p>
        </div>
      </div>

      <div className="mt-6 glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 font-medium text-gray-400">Advertiser Name</th>
                <th className="hidden px-4 py-3 font-medium text-gray-400 md:table-cell">Owner</th>
                <th className="px-4 py-3 font-medium text-gray-400">Plan Type</th>
                <th className="px-4 py-3 font-medium text-gray-400">Status</th>
                <th className="hidden px-4 py-3 font-medium text-gray-400 lg:table-cell">Join Date</th>
                <th className="px-4 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {advList.map((adv: any) => {
                const owner = ownerMap[adv.owner_user_id]
                return (
                  <tr key={adv.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{adv.name}</p>
                        <p className="text-xs text-gray-500">{adv.city}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                      {owner?.full_name || owner?.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-pd-gold/10 px-2 py-0.5 text-xs text-pd-gold">
                        {PLAN_LABELS[adv.tier] || adv.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(adv.subscription_status)}</td>
                    <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                      {new Date(adv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {adv.slug && (
                          <Link href={`/business/${adv.slug}`} target="_blank" className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white" title="View">
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link href={`/admin/businesses/${adv.id}`} className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {advList.length === 0 && (
            <div className="py-12 text-center text-gray-500">No advertisers yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
