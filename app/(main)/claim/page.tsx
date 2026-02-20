"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Shield, MapPin, ArrowRight, Globe, Plus, Loader2,
  Building2, Phone, FileText, CheckCircle, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";

type Mode = "search" | "add-url" | "add-manual";

export default function ClaimSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("search");
  const [user, setUser] = useState<any>(null);

  // URL scrape state
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  // Manual / pre-filled form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    city: "Temecula",
    state: "CA",
    zip_code: "",
    phone: "",
    website: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMode("search");

    const { data } = await supabase
      .from("businesses")
      .select("id, name, slug, city, state, tier, is_claimed")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .order("name")
      .limit(30);

    // Deduplicate by name + city (keep first occurrence)
    const seen = new Set<string>();
    const deduped = (data || []).filter((biz: any) => {
      const key = `${(biz.name || "").toLowerCase().trim()}|${(biz.city || "").toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);

    setResults(deduped);
    setSearched(true);
    setLoading(false);
  }

  async function handleScrapeUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setScraping(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/businesses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scrape", url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Could not scrape that URL");
        setScraping(false);
        return;
      }
      // Pre-fill the form with scraped data and switch to manual mode
      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        address: data.address || prev.address,
        phone: data.phone || prev.phone,
        website: url,
        description: data.description || prev.description,
      }));
      setMode("add-manual");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmitBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/sign-in?redirect=/claim");
      return;
    }
    if (!formData.name.trim()) {
      setSubmitError("Business name is required.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/businesses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...formData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit. Please try again or contact support.");
        setSubmitting(false);
        return;
      }
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Network error. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateForm(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            Business submitted successfully! We&apos;ll verify and publish your listing within 24-48 hours. Check your email for confirmation.
          </div>
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">Business Submitted!</h2>
            <p className="mt-2 text-gray-400">
              Your business <span className="font-medium text-white">{formData.name}</span> is under review.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className="btn-glow rounded-xl bg-pd-blue px-8 py-3 font-semibold text-white hover:bg-pd-blue-dark">
                Go to Dashboard
              </Link>
              <Link href="/" className="rounded-xl border border-pd-purple/20 px-8 py-3 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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

        {/* Search */}
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

        {/* Search Results */}
        {searched && mode === "search" && (
          <div className="mt-6 space-y-3">
            {results.length > 0 ? (
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
            ) : null}

            {/* Not found section — always show after search */}
            <div className="glass-card p-6">
              {results.length === 0 && (
                <p className="mb-4 text-center text-gray-400">No businesses found matching &ldquo;{query}&rdquo;</p>
              )}
              <p className={`font-heading text-sm font-semibold text-white ${results.length > 0 ? "" : "text-center"}`}>
                {results.length > 0 ? "Don't see your business?" : "Business not found?"}
              </p>
              <p className="mt-1 text-xs text-gray-500">Add it to Platinum Directory:</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => { setMode("add-url"); setSubmitError(""); }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-pd-purple/20 px-4 py-3 text-sm text-pd-purple-light transition-colors hover:border-pd-purple/40 hover:bg-pd-purple/5"
                >
                  <Globe className="h-4 w-4" /> Add by URL
                </button>
                <button
                  onClick={() => {
                    setMode("add-manual");
                    setSubmitError("");
                    setFormData((prev) => ({ ...prev, name: query }));
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-pd-gold/20 px-4 py-3 text-sm text-pd-gold transition-colors hover:border-pd-gold/40 hover:bg-pd-gold/5"
                >
                  <Plus className="h-4 w-4" /> Add Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add by URL */}
        {mode === "add-url" && (
          <div className="mt-6 glass-card p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <Globe className="h-5 w-5 text-pd-purple-light" /> Add by Website URL
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Paste your business website and we&apos;ll auto-fill the details.
            </p>
            <form onSubmit={handleScrapeUrl} className="mt-4 space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.yourbusiness.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                required
              />
              {submitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                  {submitError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setMode("search"); setSubmitError(""); }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={scraping}
                  className="btn-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-pd-purple px-4 py-2.5 font-medium text-white hover:bg-pd-purple/80 disabled:opacity-50"
                >
                  {scraping ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</> : <><Search className="h-4 w-4" /> Scan Website</>}
                </button>
              </div>
            </form>
            <button
              onClick={() => { setMode("add-manual"); setSubmitError(""); setFormData((prev) => ({ ...prev, website: url })); }}
              className="mt-3 w-full text-center text-xs text-gray-500 hover:text-gray-300"
            >
              Skip and add manually instead
            </button>
          </div>
        )}

        {/* Add Manually Form */}
        {mode === "add-manual" && (
          <div className="mt-6 glass-card p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <Building2 className="h-5 w-5 text-pd-gold" /> Add Your Business
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Fill in your business details. We&apos;ll verify and publish your listing.
            </p>

            {!user && (
              <div className="mt-4 rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-3 text-center text-sm">
                <p className="text-gray-300">
                  You need to{" "}
                  <Link href="/sign-in?redirect=/claim" className="text-pd-gold hover:underline">sign in</Link>
                  {" "}or{" "}
                  <Link href="/sign-up" className="text-pd-gold hover:underline">create an account</Link>
                  {" "}first.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitBusiness} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Business Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-pd-purple/40 focus:outline-none"
                >
                  <option value="" className="bg-pd-dark">Select a category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug} className="bg-pd-dark">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    placeholder="123 Main St"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="Temecula"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="(951) 555-1234"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateForm("website", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  placeholder="Tell us about your business..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
                />
              </div>

              {submitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setMode("search"); setSubmitError(""); }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="btn-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-pd-gold px-4 py-2.5 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-50"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><FileText className="h-4 w-4" /> Submit for Verification</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
