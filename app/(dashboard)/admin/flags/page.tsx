import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Flag, ToggleLeft, ToggleRight, Clock, User } from 'lucide-react'

const FEATURE_FLAGS = [
  { key: 'smart_offers_enabled', description: 'Enable Smart Offers marketplace for business owners' },
  { key: 'ai_agents_enabled', description: 'Enable AI agent features (chat, enrichment, social posts)' },
  { key: 'referral_tracking_enabled', description: 'Track referrals and award points for signups' },
  { key: 'points_system_enabled', description: 'Enable the points economy (earning, redeeming)' },
  { key: 'giveaway_active', description: 'Enable the giveaway contest system' },
  { key: 'stripe_live_mode', description: 'Use Stripe live keys (vs test mode)' },
  { key: 'phone_otp_enabled', description: 'Require phone OTP for business owner verification' },
  { key: 'daily_login_rewards', description: 'Award daily login streak bonus points' },
  { key: 'split_testing_enabled', description: 'Enable A/B split testing for Smart Offers' },
  { key: 'progressive_dialer_enabled', description: 'Enable the sales progressive dialer tool' },
]

export default async function AdminFlagsPage() {
  await requireSuperAdmin()
  const adminClient = createAdminClient()

  // Fetch existing flags from database
  const { data: dbFlags } = await adminClient
    .from('feature_flags')
    .select('*')

  const flagMap: Record<string, any> = {}
  dbFlags?.forEach((f: any) => {
    flagMap[f.flag_key] = f
  })

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Feature Flags</h2>
      <p className="mt-1 text-gray-400">Toggle platform features on and off (super admin only)</p>

      {/* Summary */}
      <div className="mt-6 flex gap-4">
        <div className="glass-card flex items-center gap-3 px-5 py-3">
          <ToggleRight className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-xl font-bold text-white">
              {FEATURE_FLAGS.filter((f) => flagMap[f.key]?.is_enabled).length}
            </p>
            <p className="text-xs text-gray-400">Enabled</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 px-5 py-3">
          <ToggleLeft className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-xl font-bold text-white">
              {FEATURE_FLAGS.filter((f) => !flagMap[f.key]?.is_enabled).length}
            </p>
            <p className="text-xs text-gray-400">Disabled</p>
          </div>
        </div>
      </div>

      {/* Flags Table */}
      <div className="mt-6 glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Feature Flag</th>
                <th className="pb-3 text-gray-400">Description</th>
                <th className="hidden pb-3 text-gray-400 md:table-cell">Last Changed</th>
                <th className="hidden pb-3 text-gray-400 lg:table-cell">Changed By</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_FLAGS.map((flag) => {
                const dbFlag = flagMap[flag.key]
                const isEnabled = dbFlag?.is_enabled ?? false
                return (
                  <tr key={flag.key} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <code className="rounded bg-white/5 px-2 py-0.5 text-xs text-pd-purple-light">
                        {flag.key}
                      </code>
                    </td>
                    <td className="py-3 text-gray-400">{flag.description}</td>
                    <td className="hidden py-3 text-gray-500 md:table-cell">
                      {dbFlag?.updated_at ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(dbFlag.updated_at).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden py-3 text-gray-500 lg:table-cell">
                      {dbFlag?.last_changed_by ? (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {dbFlag.last_changed_by.slice(0, 8)}...
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3">
                      {isEnabled ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <ToggleRight className="h-5 w-5 text-green-400" />
                          <span className="text-green-400">Enabled</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs">
                          <ToggleLeft className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-500">Disabled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <Flag className="mt-0.5 h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-400">
            Feature flags are managed via the <code className="rounded bg-white/5 px-1 text-pd-purple-light">feature_flags</code> table
            in Supabase. Toggle switches will be functional once the API routes for flag updates are connected.
            Changes take effect immediately across the platform.
          </p>
        </div>
      </div>
    </div>
  )
}
