"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ClaimSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    const { data } = await supabase
      .from("businesses")
      .select("id, name, slug, city, state, tier, is_claimed")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .order("name")
      .limit(10);

    setResults(data || []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-pd-gold" />
          <h1 className="mt-4 font-heading text-3xl font-bold text-white">Claim Your Business</h1>
          <p className="mt-2 text-gray-400">
            Search for your business below to claim and manage your listing.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-8 glass-input flex overflow-hidden">
          <div className="flex flex-1 items-center gap-3 px-4">
            <Search className="h-5 w-5 text-pd-purple-light" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by business name..."
              className="w-full bg-transparent py-3 text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-glow bg-pd-blue px-6 py-3 font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50">
            {loading ? "..." : "Search"}
          </button>
        </form>

        {searched && (
          <div className="mt-6 space-y-3">
            {results.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-gray-400">No businesses found matching &ldquo;{query}&rdquo;</p>
                <p className="mt-2 text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              results.map((biz) => (
                <div key={biz.id} className="glass-card flex items-center justify-between gap-4 p-4">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-white">{biz.name}</h3>
                    {biz.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> {biz.city}, {biz.state}
                      </p>
                    )}
                  </div>
                  {biz.is_claimed ? (
                    <span className="text-xs text-gray-500">Already claimed</span>
                  ) : (
                    <Link
                      href={`/claim/${biz.id}`}
                      className="flex items-center gap-1 rounded-lg bg-pd-gold px-4 py-2 text-xs font-medium text-pd-dark hover:bg-pd-gold-light"
                    >
                      Claim <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
