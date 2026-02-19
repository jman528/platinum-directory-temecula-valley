export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Tag, Shield, Clock, MapPin, SlidersHorizontal, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Offers | Platinum Directory",
  description: "Exclusive deals and smart offers from verified Temecula Valley businesses. Wine tastings, dining, spa, shopping and more.",
};

const ALL_CITIES = [
  "Temecula", "Murrieta", "Hemet", "Menifee", "Fallbrook",
  "Lake Elsinore", "Perris", "Wildomar", "Sun City", "Winchester", "Canyon Lake",
];

const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25-$50", min: 25, max: 50 },
  { label: "$50-$100", min: 50, max: 100 },
  { label: "$100+", min: 100, max: 99999 },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

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

export default async function SmartOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; price?: string }>;
}) {
  const params = await searchParams;
  const filterCategory = params.category || "";
  const filterCity = params.city || "";
  const filterPrice = params.price || "";

  const supabase = await createClient();

  let offerQuery = supabase
    .from("offers")
    .select("*, businesses(id, name, slug, tier, city, cover_image_url, categories(name, slug))")
    .eq("is_active", true)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (filterCity) {
    offerQuery = offerQuery.eq("businesses.city", filterCity);
  }

  const [{ data: offers }, { data: categories }] = await Promise.all([
    offerQuery,
    supabase.from("categories").select("name, slug").eq("is_active", true).order("display_order"),
  ]);

  let offerList = (offers as any[]) || [];

  // Filter by category (nested join)
  if (filterCategory) {
    offerList = offerList.filter((o) => o.businesses?.categories?.slug === filterCategory);
  }

  // Filter by price range
  if (filterPrice) {
    const range = PRICE_RANGES.find((r) => r.label === filterPrice);
    if (range) {
      offerList = offerList.filter((o) => {
        const price = Number(o.offer_price) || 0;
        return price >= range.min && price < range.max;
      });
    }
  }

  const catList = (categories as any[]) || [];

  return (
    <div className="premium-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 py-16" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1), rgba(212,175,55,0.08))" }}>
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
            <Tag className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">
            Exclusive Deals in <span className="text-gold-shimmer">Temecula Valley</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Save big with smart offers from the valley&apos;s top-rated businesses. Wine tastings, dining, spa treatments, and more.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="glass-card mb-8 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <SlidersHorizontal className="h-4 w-4 text-pd-gold" />
            Filters
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/smart-offers"
              className={`rounded-full px-3 py-1 text-xs transition-colors ${!filterCategory && !filterCity && !filterPrice ? "bg-pd-purple/20 text-white" : "border border-white/10 text-gray-400 hover:text-white"}`}
            >
              All Offers
            </Link>
            {catList.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/smart-offers?category=${cat.slug}${filterCity ? `&city=${filterCity}` : ""}${filterPrice ? `&price=${encodeURIComponent(filterPrice)}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${filterCategory === cat.slug ? "bg-pd-purple/20 text-white" : "border border-white/10 text-gray-400 hover:text-white"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-500" />
            {ALL_CITIES.map((city) => (
              <Link
                key={city}
                href={`/smart-offers?city=${city}${filterCategory ? `&category=${filterCategory}` : ""}${filterPrice ? `&price=${encodeURIComponent(filterPrice)}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${filterCity === city ? "bg-pd-gold/20 text-pd-gold" : "border border-white/10 text-gray-400 hover:text-white"}`}
              >
                {city}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-gray-500" />
            {PRICE_RANGES.map((range) => (
              <Link
                key={range.label}
                href={`/smart-offers?price=${encodeURIComponent(range.label)}${filterCategory ? `&category=${filterCategory}` : ""}${filterCity ? `&city=${filterCity}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${filterPrice === range.label ? "bg-green-500/20 text-green-400" : "border border-white/10 text-gray-400 hover:text-white"}`}
              >
                {range.label}
              </Link>
            ))}
          </div>
        </div>

        {offerList.length === 0 ? (
          <div className="glass-card mx-auto max-w-md p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-lg text-gray-400">No active offers right now</p>
            <p className="mt-2 text-sm text-gray-500">Check back soon for exclusive deals from local businesses</p>
            <Link href="/search" className="mt-6 inline-block rounded-xl bg-pd-purple/20 px-6 py-2.5 text-sm text-pd-purple-light transition-colors hover:bg-pd-purple/30">
              Browse Businesses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {offerList.map((offer: any) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: any }) {
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
    <div className="glass-card group relative flex flex-col overflow-hidden">
      {offer.is_featured && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-pd-gold/20 px-2.5 py-0.5 text-[10px] font-bold text-pd-gold">
          FEATURED
        </div>
      )}
      {pctOff && pctOff > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
          {pctOff}% OFF
        </div>
      )}

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

      <div className="flex flex-1 flex-col px-5 py-4">
        <h3 className="font-heading text-lg font-bold text-white">{offer.title}</h3>
        {offer.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-400">{offer.description}</p>
        )}

        <div className="mt-4 flex items-end gap-3">
          {offer.original_price && (
            <span className="text-lg text-gray-500 line-through">${Number(offer.original_price).toFixed(0)}</span>
          )}
          <span className="text-3xl font-bold text-pd-gold">
            {Number(offer.offer_price) === 0 ? "FREE" : `$${Number(offer.offer_price).toFixed(0)}`}
          </span>
        </div>
        {savings && Number(savings) > 0 && (
          <p className="mt-1 text-sm text-green-400">You save ${savings}</p>
        )}

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
      </div>

      <div className="border-t border-white/5 px-5 py-3">
        <Link
          href={`/offers/${offer.slug || offer.id}`}
          className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-pd-gold py-2.5 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
        >
          <ShoppingCart className="h-4 w-4" />
          Get Offer
        </Link>
      </div>
    </div>
  );
}
