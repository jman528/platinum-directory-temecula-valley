import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  Bot, Shield, Zap, ToggleLeft, ToggleRight, Settings,
  TrendingUp, DollarSign, Activity, AlertTriangle
} from 'lucide-react'

export default async function AdminAIPage() {
  await requireSuperAdmin()
  const adminClient = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Fetch AI agents
  const { data: agents } = await adminClient
    .from('ai_agents')
    .select('*')
    .order('name')

  // Fetch providers
  const { data: providers } = await adminClient
    .from('llm_providers')
    .select('*')
    .order('provider_key')

  // AI credit usage MTD
  const { data: creditUsage } = await adminClient
    .from('ai_credit_transactions')
    .select('credits_delta, agent_key, created_at')
    .lt('credits_delta', 0)
    .gte('created_at', startOfMonth.toISOString())

  const agentList = agents || []
  const providerList = providers || []

  const totalCreditsUsed = creditUsage?.reduce((sum, t) => sum + Math.abs(t.credits_delta || 0), 0) || 0

  // Usage by agent
  const usageByAgent: Record<string, number> = {}
  creditUsage?.forEach((t) => {
    const key = t.agent_key || 'unknown'
    usageByAgent[key] = (usageByAgent[key] || 0) + Math.abs(t.credits_delta || 0)
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">AI Agents & Credits</h2>
          <p className="mt-1 text-gray-400">Manage AI agents, providers, and credit usage</p>
        </div>
        <Link
          href="/admin/ai/guardrails"
          className="flex items-center gap-2 rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-400 hover:bg-pd-purple/10 hover:text-white"
        >
          <Shield className="h-4 w-4" /> Guardrails
        </Link>
      </div>

      {/* Credit Usage Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Credits Used (MTD)</p>
              <p className="mt-1 text-3xl font-bold text-white">{totalCreditsUsed.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">This month&apos;s consumption</p>
            </div>
            <div className="rounded-lg bg-cyan-500/10 p-2.5">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Agents</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {agentList.filter((a: any) => a.is_active).length}
              </p>
              <p className="mt-1 text-xs text-gray-500">of {agentList.length} total</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Providers</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {providerList.filter((p: any) => p.is_active).length}
              </p>
              <p className="mt-1 text-xs text-gray-500">of {providerList.length} configured</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Management Table */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Agent Management</h3>
        <p className="mt-1 text-sm text-gray-500">Configure AI agents and their settings</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Agent</th>
                <th className="pb-3 text-gray-400">Key</th>
                <th className="pb-3 text-gray-400">Provider</th>
                <th className="pb-3 text-gray-400">Credits/Use</th>
                <th className="pb-3 text-gray-400">Usage (MTD)</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {agentList.map((agent: any) => (
                <tr key={agent.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3">
                    <p className="font-medium text-white">{agent.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{agent.description}</p>
                  </td>
                  <td className="py-3">
                    <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-400">
                      {agent.agent_key}
                    </code>
                  </td>
                  <td className="py-3 text-gray-400">{agent.provider || '—'}</td>
                  <td className="py-3 text-gray-400">{agent.credits_per_use || 0}</td>
                  <td className="py-3">
                    <span className="text-cyan-400">{(usageByAgent[agent.agent_key] || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-3">
                    {agent.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <ToggleRight className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <ToggleLeft className="h-4 w-4" /> Disabled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {agentList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No AI agents configured. Add agents via the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Provider Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">LLM providers and their status</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-gray-400">Provider</th>
                <th className="pb-3 text-gray-400">Key</th>
                <th className="pb-3 text-gray-400">Default Model</th>
                <th className="pb-3 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {providerList.map((provider: any) => (
                <tr key={provider.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 font-medium text-white">{provider.name || provider.provider_key}</td>
                  <td className="py-3">
                    <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-400">
                      {provider.provider_key}
                    </code>
                  </td>
                  <td className="py-3 text-gray-400">{provider.default_model || '—'}</td>
                  <td className="py-3">
                    {provider.is_active ? (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Active</span>
                    ) : (
                      <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">Disabled</span>
                    )}
                  </td>
                </tr>
              ))}
              {providerList.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No LLM providers configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Usage by Agent */}
      {Object.keys(usageByAgent).length > 0 && (
        <div className="mt-8 glass-card p-6">
          <h3 className="font-heading text-lg font-bold text-white">Credit Usage by Agent</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(usageByAgent)
              .sort(([, a], [, b]) => b - a)
              .map(([agentKey, credits]) => {
                const pct = totalCreditsUsed > 0 ? Math.round((credits / totalCreditsUsed) * 100) : 0
                return (
                  <div key={agentKey} className="flex items-center gap-4">
                    <span className="w-40 truncate text-sm text-gray-400">{agentKey}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-sm text-white">{credits.toLocaleString()}</span>
                    <span className="w-12 text-right text-xs text-gray-500">{pct}%</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
