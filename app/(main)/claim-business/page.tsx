"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "search" | "select" | "confirm" | "success";

interface BusinessResult {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  category_name: string | null;
  address: string | null;
  is_claimed: boolean;
}

export default function ClaimBusinessPage() {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<BusinessResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setSelected(null);
    setStep("search");

    const { data, error: searchError } = await supabase
      .from("businesses")
      .select("id, name, slug, city, state, address, is_claimed, categories(name)")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .order("name")
      .limit(20);

    if (searchError) {
      setError("Search failed. Please try again.");
      setSearching(false);
      return;
    }

    const mapped = (data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city,
      state: b.state,
      address: b.address,
      category_name: b.categories?.name || null,
      is_claimed: b.is_claimed || false,
    }));

    setResults(mapped);
    setSearched(true);
    setSearching(false);
  }

  function handleSelect(biz: BusinessResult) {
    setSelected(biz);
    setStep("confirm");
    setError("");
  }

  async function handleSubmitClaim() {
    if (!selected || !user) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to claim business.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        data.message || `Your claim for "${selected.name}" has been submitted.`
      );
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (step === "success") {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-lg glass-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">
            Claim Submitted!
          </h2>
          <p className="mt-2 text-gray-400">{successMessage}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="btn-glow rounded-xl bg-pd-blue px-8 py-3 font-semibold text-white hover:bg-pd-blue-dark"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-pd-purple/20 px-8 py-3 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-pd-gold" />
          <h1 className="mt-4 font-heading text-3xl font-bold text-white">
            Claim Your Business
          </h1>
          <p className="mt-2 text-gray-400">
            Search for your business below to claim and manage your listing.
          </p>
        </div>

        {!user && (
          <div className="mt-6 rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-3 text-center text-sm">
            <p className="text-gray-300">
              You need to{" "}
              <Link
                href="/sign-in?redirect=/claim-business"
                className="text-pd-gold hover:underline"
              >
                sign in
              </Link>{" "}
              or{" "}
              <Link href="/sign-up" className="text-pd-gold hover:underline">
                create an account
              </Link>{" "}
              first.
            </p>
          </div>
        )}

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-8 glass-input flex overflow-hidden"
        >
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
          <button
            type="submit"
            disabled={searching}
            className="btn-glow bg-pd-blue px-6 py-3 font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && selected && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => {
                setStep("search");
                setSelected(null);
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              &larr; Back to results
            </button>

            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white">
                Confirm Your Business
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-pd-purple-light" />
                  <span className="text-white">{selected.name}</span>
                </div>
                {selected.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-pd-purple-light" />
                    <span className="text-gray-300">{selected.address}</span>
                  </div>
                )}
                {(selected.city || selected.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-pd-purple-light" />
                    <span className="text-gray-300">
                      {[selected.city, selected.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {selected.category_name && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-pd-purple-light" />
                    <span className="text-gray-300">
                      {selected.category_name}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitClaim}
                disabled={submitting || !user}
                className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pd-gold py-3 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Claiming...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Confirm This Is My Business
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {step === "search" && searched && (
          <div className="mt-6 space-y-3">
            {results.length > 0 ? (
              results.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => !biz.is_claimed && handleSelect(biz)}
                  disabled={biz.is_claimed}
                  className={`glass-card flex w-full items-center justify-between gap-4 p-4 text-left transition-colors ${
                    biz.is_claimed
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-pd-gold/40 cursor-pointer"
                  } ${selected?.id === biz.id ? "border-pd-gold/60" : ""}`}
                >
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-white">
                      {biz.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {biz.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {biz.city}
                          {biz.state && `, ${biz.state}`}
                        </span>
                      )}
                      {biz.category_name && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {biz.category_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {biz.is_claimed ? (
                    <span className="flex-shrink-0 text-xs text-gray-500">
                      Already claimed
                    </span>
                  ) : (
                    <span className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-pd-gold px-4 py-2 text-xs font-medium text-pd-dark">
                      Claim <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-gray-400">
                  No businesses found matching &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {/* Not finding your business */}
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-gray-400">
                Not finding your business?{" "}
                <Link
                  href="/claim"
                  className="text-pd-gold hover:underline"
                >
                  Add it manually
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
