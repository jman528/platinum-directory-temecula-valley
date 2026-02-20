'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Mic, Zap } from 'lucide-react'

export default function AISearchBar({ defaultQuery = '' }: { defaultQuery?: string }) {
  const [query, setQuery] = useState(defaultQuery)
  const [isAI, setIsAI] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    // Use regular search with query params - the AI search is available via the API
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="relative mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pd-gold text-xs font-bold text-white">
            AI
          </span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: "5-star rated winery with outdoor seating" or "pet-friendly restaurants in Murrieta"'
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-5 pl-16 pr-36 text-lg text-white placeholder:text-gray-500 backdrop-blur-md focus:border-pd-purple/50 focus:outline-none focus:ring-1 focus:ring-pd-purple/30"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-pd-blue px-6 py-2.5 font-semibold text-white transition-colors hover:bg-pd-blue/80"
          >
            <Zap className="h-4 w-4" />
            Smart Search
          </button>
        </div>
      </form>
    </div>
  )
}
