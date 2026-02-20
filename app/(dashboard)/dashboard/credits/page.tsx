'use client'

import { useState, useEffect } from 'react'
import { Coins, Loader2, Zap, TrendingUp, Sparkles } from 'lucide-react'
import { CREDIT_PACKS, CREDIT_COSTS } from '@/lib/credits/pricing'

interface CreditBalance {
  balance: number
  transactions: {
    id: string
    credits_delta: number
    reason: string
    created_at: string
  }[]
}

export default function CreditsPage() {
  const [data, setData] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchBalance()
  }, [])

  async function fetchBalance() {
    try {
      const res = await fetch('/api/credits/balance')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // Balance endpoint may not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function purchasePack(packId: string) {
    setPurchasing(packId)
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      }
    } catch {
      setPurchasing(null)
    }
  }

  const balance = data?.balance ?? 0
  const packIcons = [Zap, TrendingUp, Sparkles]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">AI Credits</h1>
      <p className="mt-1 text-gray-400">Power enrichments, AI chat, social posts, and more.</p>

      {/* Current Balance */}
      <div className="glass-card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pd-gold/10">
            <Coins className="h-7 w-7 text-pd-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-4xl font-bold text-white">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Packs */}
      <h2 className="mt-8 font-heading text-lg font-semibold text-white">Purchase Credits</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {CREDIT_PACKS.map((pack, i) => {
          const Icon = packIcons[i] || Zap
          const totalCredits = pack.credits + ('bonus' in pack ? (pack.bonus ?? 0) : 0)
          return (
            <div key={pack.id} className="glass-card relative p-6">
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-500 to-pd-gold px-4 py-1 text-sm font-bold text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pd-purple/10">
                <Icon className="h-5 w-5 text-pd-purple-light" />
              </div>
              <h3 className="text-xl font-bold text-white">{pack.name}</h3>
              <div className="my-3 text-4xl font-bold text-pd-gold">{pack.price_display}</div>
              <div className="mb-4 text-sm text-white/60">{pack.description}</div>
              <div className="mb-4 font-semibold text-white">
                {totalCredits.toLocaleString()} Credits
                {'bonus' in pack && pack.bonus && (
                  <span className="ml-1 text-sm text-green-400">+{pack.bonus} bonus!</span>
                )}
              </div>
              <button
                onClick={() => purchasePack(pack.id)}
                disabled={purchasing === pack.id}
                className="w-full rounded-xl bg-pd-blue py-3 font-semibold text-white hover:bg-pd-blue/80 disabled:opacity-50"
              >
                {purchasing === pack.id ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  'Purchase Credits →'
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Credit Costs Reference */}
      <h2 className="mt-8 font-heading text-lg font-semibold text-white">What Credits Buy</h2>
      <div className="mt-4 glass-card p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
            <div key={action} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="text-sm capitalize text-gray-300">{action.replace(/_/g, ' ')}</span>
              <span className="text-sm font-semibold text-pd-gold">{cost} credits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {data?.transactions && data.transactions.length > 0 && (
        <>
          <h2 className="mt-8 font-heading text-lg font-semibold text-white">Recent Transactions</h2>
          <div className="mt-4 glass-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Credits</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white">{tx.reason}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${tx.credits_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.credits_delta > 0 ? '+' : ''}{tx.credits_delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
