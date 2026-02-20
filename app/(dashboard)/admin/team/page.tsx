import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { UsersRound, Shield, ShieldAlert, Crown, UserMinus, UserPlus } from 'lucide-react'

export default async function AdminTeamPage() {
  const { user: currentUser } = await requireSuperAdmin()
  const adminClient = createAdminClient()

  // Fetch all admin users
  const { data: admins } = await adminClient
    .from('profiles')
    .select('id, email, full_name, user_type, created_at')
    .in('user_type', ['admin', 'super_admin'])
    .order('user_type', { ascending: false })

  const adminList = admins || []

  // Fetch recent admin activity (approximate from events or profiles)
  const { count: totalUsers } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white">Team Management</h2>
      <p className="mt-1 text-gray-400">Manage admin access and team members (super admin only)</p>

      {/* Team Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Super Admins</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {adminList.filter((a: any) => a.user_type === 'super_admin').length}
              </p>
            </div>
            <div className="rounded-lg bg-pd-gold/10 p-2.5">
              <Crown className="h-5 w-5 text-pd-gold" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Admins</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {adminList.filter((a: any) => a.user_type === 'admin').length}
              </p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-white">{(totalUsers || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <UsersRound className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="mt-8 glass-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-white">Team Members</h3>
          <button className="flex items-center gap-2 rounded-lg bg-pd-purple/20 px-4 py-2 text-sm font-medium text-pd-purple-light hover:bg-pd-purple/30">
            <UserPlus className="h-4 w-4" /> Promote User to Admin
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Name</th>
                <th className="pb-3 text-gray-400">Email</th>
                <th className="pb-3 text-gray-400">Role</th>
                <th className="pb-3 text-gray-400">Joined</th>
                <th className="pb-3 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminList.map((admin: any) => {
                const isSelf = admin.id === currentUser.id
                const isSuperAdmin = admin.user_type === 'super_admin'
                return (
                  <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                          {(admin.full_name || admin.email)?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{admin.full_name || 'No name'}</p>
                          {isSelf && <span className="text-xs text-pd-gold">(you)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{admin.email}</td>
                    <td className="py-3">
                      {isSuperAdmin ? (
                        <span className="flex items-center gap-1 rounded-full bg-pd-gold/10 px-2 py-0.5 text-xs text-pd-gold">
                          <Crown className="h-3 w-3" /> Super Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {isSelf || isSuperAdmin ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <button className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30">
                          <UserMinus className="h-3.5 w-3.5" /> Demote
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {adminList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-yellow-300">Security Note</p>
          <p className="mt-1 text-sm text-gray-400">
            Super admins cannot be demoted through the UI. Contact the database administrator
            to modify super admin privileges. Admin promotions are logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
