export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Tag, Shield, Clock, Share2, Copy, QrCode, ShoppingCart, MapPin, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Offers & Deals | Platinum Directory",
  description: "Exclusive deals and smart offers from verified Temecula Valley businesses. Wine tastings, dining, spa, and more.",
};

const ALL_CITIES = [
  "Temecula", "Murrieta", "Hemet", "Menifee", "Fallbrook",
  "Lake Elsinore", "Perris", "Wildomar", "Sun City", "Winchester", "Canyon Lake",
];

function getTierBadge(tier: string) {
  switch (tier) {
    case "platinum_elite":
      return <span className="tier-badge-elite rounded-full px-2 py-0.5 text-[10px] font-bold">ELITE</span>;
    case "platinum_partner":
      return <span className="tier-badge-partner rounded-full px-2 py-0.5 text-[10px] font-bold">PARTNER</span>;
    case "verified_platinum":
      return <span className="tier-badge-verified rounded-full px-2 py-0.5 text-[10px] font-bold">VERIFIED</span>;
    default:
      return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  const params = await searchParams;
  const filterCategory = params.category || "";
  const filterCity = params.city || "";

  const supabase = await createClient();

  // Fetch offers with business + category info
  let offerQuery = supabase
    .from("offers")
    .select("*, businesses(id, name, slug, tier, city, cover_image_url, categories(name, slug))")
    .eq("is_active", true)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (filterCity) {
    offerQuery = offerQuery.eq("businesses.city", filterCity);
  }

  const [{ data: offers, error: offersError }, { data: categories }] = await Promise.all([
    offerQuery,
    supabase.from("categories").select("name, slug").eq("is_active", true).order("display_order"),
  ]);

  if (offersError) console.error("Offers query error:", offersError);

  // Filter by category client-side (nested join filter)
  let offerList = (offers as any[]) || [];
  if (filterCategory) {
    offerList = offerList.filter((o) => o.businesses?.categories?.slug === filterCategory);
  }

  const catList = (categories as any[]) || [];
  const featuredOffers = offerList.filter((o) => o.is_featured);
  const regularOffers = offerList.filter((o) => !o.is_featured);

  return (
    <div className="premium-bg min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/5 py-12" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1), rgba(212,175,55,0.08))" }}>
        <div className="container">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pd-gold/20">
              <Tag className="h-7 w-7 text-pd-gold" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
                Smart <span className="text-gold-shimmer">Offers</span>
              </h1>
              <p className="mt-1 text-gray-400">
                Exclusive deals from Temecula Valley&apos;s finest businesses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <Link
            href="/deals"
            className={`rounded-full px-3 py-1 text-xs transition-colors ${!filterCategory && !filterCity ? "bg-pd-purple/20 text-white" : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-white"}`}
          >
            All Offers
          </Link>
          {catList.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/deals?category=${cat.slug}${filterCity ? `&city=${filterCity}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${filterCategory === cat.slug ? "bg-pd-purple/20 text-white" : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-white"}`}
            >
              {cat.name}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          {ALL_CITIES.slice(0, 5).map((city) => (
            <Link
              key={city}
              href={`/deals?city=${city}${filterCategory ? `&category=${filterCategory}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${filterCity === city ? "bg-pd-gold/20 text-pd-gold" : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-white"}`}
            >
              {city}
            </Link>
          ))}
        </div>

        {offerList.length === 0 ? (
          <div className="glass-card mx-auto max-w-md p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-lg text-gray-400">No active deals right now</p>
            <p className="mt-2 text-sm text-gray-500">Check back soon for exclusive offers from local businesses</p>
            <Link href="/search" className="mt-6 inline-block rounded-xl bg-pd-purple/20 px-6 py-2.5 text-sm text-pd-purple-light transition-colors hover:bg-pd-purple/30">
              Browse Businesses
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Offers */}
            {featuredOffers.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-white">
                  <span className="text-pd-gold">&#9733;</span> Featured Offers
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {featuredOffers.map((offer: any) => (
                    <OfferCard key={offer.id} offer={offer} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Offers */}
            {regularOffers.length > 0 && (
              <div>
                {featuredOffers.length > 0 && (
                  <h2 className="mb-4 font-heading text-xl font-bold text-white">All Offers</h2>
                )}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {regularOffers.map((offer: any) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer, featured = false }: { offer: any; featured?: boolean }) {
  const biz = offer.businesses;
  const savings = offer.original_price && offer.offer_price
    ? (offer.original_price - offer.offer_price).toFixed(0)
    : null;
  const pctOff = offer.original_price && offer.offer_price
    ? Math.round((1 - offer.offer_price / offer.original_price) * 100)
    : null;
  const remaining = offer.max_claims ? offer.max_claims - (offer.current_claims || 0) : null;
  const expiresIn = offer.expires_at ? daysUntil(offer.expires_at) : null;

  return (
    <div className={`glass-card group relative flex flex-col overflow-hidden ${featured ? "border-pd-gold/30 ring-1 ring-pd-gold/10" : ""}`}>
      {featured && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-pd-gold/20 px-2.5 py-0.5 text-[10px] font-bold text-pd-gold">
          FEATURED
        </div>
      )}

      {/* Business Info Header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pd-purple/15">
          <Shield className="h-5 w-5 text-pd-purple-light" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/business/${biz?.slug}`} className="truncate text-sm font-semibold text-white hover:text-pd-gold">
              {biz?.name}
            </Link>
            {biz?.tier && getTierBadge(biz.tier)}
          </div>
          {biz?.city && (
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" /> {biz.city}
            </p>
          )}
        </div>
      </div>

      {/* Offer Content */}
      <div className="flex flex-1 flex-col px-5 py-4">
        <h3 className="font-heading text-lg font-bold text-white">{offer.title}</h3>
        {offer.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-400">{offer.description}</p>
        )}

        {/* Price Block */}
        <div className="mt-4 flex items-end gap-3">
          {offer.original_price && (
            <span className="text-lg text-gray-500 line-through">${Number(offer.original_price).toFixed(0)}</span>
          )}
          <span className="text-3xl font-bold text-pd-gold">${Number(offer.offer_price).toFixed(0)}</span>
          {pctOff && (
            <span className="mb-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
              {pctOff}% OFF
            </span>
          )}
        </div>
        {savings && (
          <p className="mt-1 text-sm text-green-400">You save ${savings}</p>
        )}

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {offer.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {expiresIn !== null && expiresIn <= 7
                ? <span className="text-orange-400">{expiresIn} days left</span>
                : <>Expires {formatDate(offer.expires_at)}</>
              }
            </span>
          )}
          {remaining !== null && (
            <span className={remaining < 20 ? "text-orange-400" : ""}>
              {remaining} remaining
            </span>
          )}
        </div>

        {/* QR Code Preview */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <QrCode className="h-8 w-8 text-gray-600" />
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-400">QR Voucher</p>
            <p>Show at checkout to redeem</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-white/5 px-5 py-3">
        <Link
          href={`/offers/${offer.slug || offer.id}`}
          className="btn-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-pd-gold py-2.5 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
        >
          <ShoppingCart className="h-4 w-4" />
          Buy Now
        </Link>
        <ShareButton offerId={offer.id} title={offer.title} offerSlug={offer.slug} businessSlug={biz?.slug} />
      </div>
    </div>
  );
}

function ShareButton({ offerId, title, offerSlug, businessSlug }: { offerId: string; title: string; offerSlug?: string; businessSlug?: string }) {
  const url = offerSlug ? `/offers/${offerSlug}` : `/business/${businessSlug}?offer=${offerId}`;
  return (
    <div className="flex gap-1">
      <button
        data-copy-url={url}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        title="Copy link"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        data-share-title={title}
        data-share-url={url}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        title="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
