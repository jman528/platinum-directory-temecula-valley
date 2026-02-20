import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Shield, ArrowLeft, AlertTriangle, Settings, Lock } from 'lucide-react'

export default async function AIGuardrailsPage() {
  await requireSuperAdmin()
  const adminClient = createAdminClient()

  // Fetch guardrails if table exists
  const { data: guardrails } = await adminClient
    .from('ai_agent_guardrails')
    .select('*')
    .order('created_at', { ascending: false })

  const guardrailList = guardrails || []

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin/ai" className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">AI Guardrails</h2>
          <p className="mt-1 text-gray-400">Configure safety policies and usage limits for AI agents</p>
        </div>
      </div>

      {/* Global Settings */}
      <div className="mt-6 glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Settings className="h-5 w-5 text-gray-400" /> Global Settings
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 p-4">
            <label className="text-sm font-medium text-gray-400">Max Tokens Per Response</label>
            <input
              type="number"
              defaultValue={500}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
              readOnly
            />
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <label className="text-sm font-medium text-gray-400">Daily Cost Ceiling</label>
            <input
              type="number"
              defaultValue={50}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">Max daily spend across all providers ($)</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <label className="text-sm font-medium text-gray-400">Rate Limit (per user)</label>
            <input
              type="number"
              defaultValue={20}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">Max requests per hour per user</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <label className="text-sm font-medium text-gray-400">Rate Limit (global)</label>
            <input
              type="number"
              defaultValue={500}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-pd-purple"
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">Max requests per hour platform-wide</p>
          </div>
        </div>
      </div>

      {/* Blocked Topics */}
      <div className="mt-6 glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Lock className="h-5 w-5 text-red-400" /> Blocked Topics
        </h3>
        <p className="mt-1 text-sm text-gray-500">Topics that AI agents should refuse to discuss</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Competitors pricing', 'Legal advice', 'Medical advice', 'Political content', 'Adult content'].map((topic) => (
            <span key={topic} className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
              <AlertTriangle className="h-3 w-3" /> {topic}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Edit blocked topics via the ai_agent_guardrails table in Supabase.
        </p>
      </div>

      {/* Per-Agent Guardrails */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Per-Agent Policies</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Agent</th>
                <th className="pb-3 text-gray-400">Max Tokens</th>
                <th className="pb-3 text-gray-400">Rate Limit</th>
                <th className="pb-3 text-gray-400">Cost Ceiling</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {guardrailList.length > 0 ? guardrailList.map((g: any) => (
                <tr key={g.id} className="border-b border-white/5">
                  <td className="py-3 text-white">{g.agent_key || 'Global'}</td>
                  <td className="py-3 text-gray-400">{g.max_tokens_per_response || '—'}</td>
                  <td className="py-3 text-gray-400">{g.rate_limit_per_hour || '—'}/hr</td>
                  <td className="py-3 text-gray-400">${g.cost_ceiling_daily || '—'}/day</td>
                  <td className="py-3">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No guardrail policies configured. Add them via the ai_agent_guardrails table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
