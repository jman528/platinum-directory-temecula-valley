"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2, Tag, ArrowLeft, Check, Edit3, DollarSign, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface GeneratedOffer {
  title: string;
  description: string;
  offer_type: "voucher" | "local_deal";
  original_price: number;
  offer_price: number;
  terms: string;
  redemption_instructions: string;
  suggested_duration_days: number;
}

export default function AIOfferBuilderPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [offers, setOffers] = useState<GeneratedOffer[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("businesses")
        .select("id, name, tier, city, categories(name)")
        .eq("owner_user_id", user.id)
        .eq("is_active", true);

      setBusinesses(data || []);
      if (data && data.length === 1) setSelectedBiz(data[0].id);
      setLoading(false);
    }
    loadBusinesses();
  }, []);

  async function handleGenerate() {
    if (!selectedBiz) return;
    setGenerating(true);
    setError(null);
    setOffers([]);
    setSaved(new Set());

    try {
      const res = await fetch("/api/offers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selectedBiz }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate offers");
        return;
      }

      setOffers(data.offers || []);
    } catch {
      setError("Network error. Make sure your AI provider is running.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveOffer(index: number) {
    const offer = offers[index];
    if (!offer || !selectedBiz) return;

    setSaving(index);
    setError(null);

    const slug = offer.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const expiresAt = new Date(
      Date.now() + (offer.suggested_duration_days || 60) * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabase.from("offers").insert({
      business_id: selectedBiz,
      slug: `${slug}-${Date.now()}`,
      title: offer.title,
      description: offer.description,
      terms: offer.terms,
      redemption_instructions: offer.redemption_instructions,
      offer_type: offer.offer_type,
      original_price: offer.original_price,
      offer_price: offer.offer_price,
      discount_type: "fixed",
      discount_value: offer.original_price - offer.offer_price,
      max_claims: 100,
      max_per_customer: 2,
      current_claims: 0,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true,
      is_featured: false,
      status: "draft",
    });

    setSaving(null);

    if (insertError) {
      setError(`Save failed: ${insertError.message}`);
      return;
    }

    setSaved((prev) => new Set(prev).add(index));
  }

  const selectedBizName = businesses.find((b) => b.id === selectedBiz)?.name;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/promotions"
          className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pd-purple/20 to-pd-gold/20">
          <Sparkles className="h-5 w-5 text-pd-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">AI Offer Builder</h1>
          <p className="text-sm text-gray-400">Generate high-converting offers with AI</p>
        </div>
      </div>

      {/* Business Selector */}
      <div className="glass-card mt-6 p-6">
        <label className="text-sm font-medium text-gray-300">Select Business</label>
        {loading ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading businesses...
          </div>
        ) : businesses.length === 0 ? (
          <div className="mt-2 rounded-lg border border-white/10 p-4 text-center">
            <p className="text-sm text-gray-400">No businesses found.</p>
            <p className="mt-1 text-xs text-gray-500">You need to own a business to create offers.</p>
          </div>
        ) : (
          <select
            value={selectedBiz}
            onChange={(e) => { setSelectedBiz(e.target.value); setOffers([]); setSaved(new Set()); }}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-pd-purple/40 focus:outline-none"
          >
            <option value="" className="bg-pd-dark">Choose a business...</option>
            {businesses.map((b: any) => (
              <option key={b.id} value={b.id} className="bg-pd-dark">
                {b.name} — {(b as any).categories?.name || "Uncategorized"} ({b.city})
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedBiz || generating}
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue px-6 py-2.5 font-heading text-sm font-semibold text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Offer Ideas
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Generated Offers */}
      {offers.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-white">
            AI Suggestions for {selectedBizName}
          </h2>

          {offers.map((offer, i) => {
            const pctOff = Math.round((1 - offer.offer_price / offer.original_price) * 100);
            const isSaved = saved.has(i);

            return (
              <div key={i} className={`glass-card overflow-hidden ${isSaved ? "border-green-500/30" : ""}`}>
                <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
                  <Tag className="h-4 w-4 text-pd-gold" />
                  <span className="text-xs font-medium text-gray-400">
                    {offer.offer_type === "voucher" ? "QR Voucher" : "Local Deal"}
                  </span>
                  <span className="ml-auto rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    {pctOff}% OFF
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-white">{offer.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{offer.description}</p>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-pd-gold" />
                      <span className="text-gray-500 line-through">${offer.original_price}</span>
                      <span className="text-lg font-bold text-pd-gold">${offer.offer_price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {offer.suggested_duration_days} days
                    </div>
                  </div>

                  {offer.terms && (
                    <p className="mt-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-400">Terms:</span> {offer.terms}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    {isSaved ? (
                      <span className="flex items-center gap-2 rounded-xl bg-green-500/15 px-4 py-2 text-sm text-green-400">
                        <Check className="h-4 w-4" /> Saved as Draft
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSaveOffer(i)}
                        disabled={saving === i}
                        className="flex items-center gap-2 rounded-xl bg-pd-gold px-4 py-2 text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-50"
                      >
                        {saving === i ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                          <><Edit3 className="h-4 w-4" /> Save as Draft</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
