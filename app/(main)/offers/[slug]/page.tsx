export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield, MapPin, Clock, Tag, QrCode, ShoppingCart,
  ArrowLeft, Star, CheckCircle, AlertTriangle, Share2,
} from "lucide-react";
import { BuyButton } from "./buy-button";
import ShareSection from "@/components/ShareSection";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("offers")
    .select("title, description, businesses(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const biz = (offer as any)?.businesses;
  return {
    title: offer ? `${offer.title} | ${biz?.name}` : "Offer",
    description: offer?.description || undefined,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "platinum_elite":
      return <span className="tier-badge-elite rounded-full px-2.5 py-0.5 text-[11px] font-bold">ELITE</span>;
    case "platinum_partner":
      return <span className="tier-badge-partner rounded-full px-2.5 py-0.5 text-[11px] font-bold">PARTNER</span>;
    case "verified_platinum":
      return <span className="tier-badge-verified rounded-full px-2.5 py-0.5 text-[11px] font-bold">VERIFIED</span>;
    default:
      return null;
  }
}

export default async function OfferDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: offer } = await supabase
    .from("offers")
    .select("*, businesses(id, name, slug, tier, city, phone, address, cover_image_url, logo_url, average_rating, review_count, categories(name, slug))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!offer) notFound();

  const o = offer as any;
  const biz = o.businesses;
  const heroImg = o.cover_image_url || biz?.cover_image_url || `https://picsum.photos/seed/${slug}/1200/600`;
  const savings = o.original_price && o.offer_price
    ? (o.original_price - o.offer_price).toFixed(0)
    : null;
  const pctOff = o.original_price && o.offer_price
    ? Math.round((1 - o.offer_price / o.original_price) * 100)
    : null;
  const remaining = o.max_claims ? o.max_claims - (o.current_claims || 0) : null;
  const expiresIn = o.expires_at ? daysUntil(o.expires_at) : null;
  const isUrgent = expiresIn !== null && expiresIn <= 7;
  const isLow = remaining !== null && remaining < 20;

  // Fetch related offers from the same business
  const { data: relatedOffers } = await supabase
    .from("offers")
    .select("id, slug, title, offer_price, original_price, cover_image_url")
    .eq("business_id", o.business_id)
    .eq("is_active", true)
    .neq("id", o.id)
    .limit(3);

  return (
    <div className="premium-bg min-h-screen">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden sm:h-80 md:h-96">
        <Image
          src={heroImg}
          alt={o.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pd-dark via-pd-dark/50 to-transparent" />

        {/* Back button */}
        <Link
          href="/deals"
          className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" /> All Offers
        </Link>

        {/* Featured / Urgent badges */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {o.is_featured && (
            <span className="rounded-full bg-pd-gold/20 px-3 py-1 text-xs font-bold text-pd-gold backdrop-blur-md">
              FEATURED
            </span>
          )}
          {isUrgent && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 backdrop-blur-md">
              <AlertTriangle className="h-3 w-3" /> {expiresIn} days left
            </span>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="container">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Tag className="h-4 w-4 text-pd-gold" />
              <span>{o.offer_type === "voucher" ? "QR Voucher" : "Local Deal"}</span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {o.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white">About This Offer</h2>
              {o.description && (
                <p className="mt-3 leading-relaxed text-gray-300">{o.description}</p>
              )}

              {/* Key details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {o.expires_at && (
                  <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-pd-blue" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Valid Until</p>
                      <p className={`text-sm ${isUrgent ? "text-orange-400" : "text-gray-500"}`}>
                        {formatDate(o.expires_at)}
                        {expiresIn !== null && ` (${expiresIn} days left)`}
                      </p>
                    </div>
                  </div>
                )}
                {remaining !== null && (
                  <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <ShoppingCart className="mt-0.5 h-5 w-5 flex-shrink-0 text-pd-purple-light" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Remaining</p>
                      <p className={`text-sm ${isLow ? "text-orange-400" : "text-gray-500"}`}>
                        {remaining} of {o.max_claims} available
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <QrCode className="mt-0.5 h-5 w-5 flex-shrink-0 text-pd-gold" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Redemption</p>
                    <p className="text-sm text-gray-500">
                      {o.offer_type === "voucher" ? "QR code voucher — show at checkout" : "Discount applied in-store"}
                    </p>
                  </div>
                </div>
                {o.max_per_customer && (
                  <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Limit</p>
                      <p className="text-sm text-gray-500">{o.max_per_customer} per customer</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Redemption Instructions */}
            {o.redemption_instructions && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-bold text-white">How to Redeem</h2>
                <div className="mt-3 flex gap-3 rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-4">
                  <QrCode className="mt-0.5 h-6 w-6 flex-shrink-0 text-pd-gold" />
                  <p className="text-sm leading-relaxed text-gray-300">{o.redemption_instructions}</p>
                </div>
              </div>
            )}

            {/* Terms */}
            {o.terms && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-bold text-white">Terms & Conditions</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{o.terms}</p>
              </div>
            )}

            {/* Related Offers */}
            {relatedOffers && relatedOffers.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-bold text-white">More from {biz?.name}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedOffers.map((rel: any) => (
                    <Link
                      key={rel.id}
                      href={`/offers/${rel.slug}`}
                      className="group rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-pd-purple/20"
                    >
                      <p className="text-sm font-medium text-white group-hover:text-pd-gold">{rel.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {rel.original_price && (
                          <span className="text-xs text-gray-500 line-through">${Number(rel.original_price).toFixed(0)}</span>
                        )}
                        <span className="text-sm font-bold text-pd-gold">${Number(rel.offer_price).toFixed(0)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Purchase + Business Card */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="glass-card sticky top-20 p-6">
              {/* Price */}
              <div className="text-center">
                {o.original_price && (
                  <span className="text-lg text-gray-500 line-through">${Number(o.original_price).toFixed(2)}</span>
                )}
                <div className="mt-1 text-4xl font-bold text-pd-gold">${Number(o.offer_price).toFixed(2)}</div>
                {pctOff && (
                  <span className="mt-2 inline-block rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
                    {pctOff}% OFF — Save ${savings}
                  </span>
                )}
              </div>

              {/* Buy button */}
              <BuyButton offerId={o.id} offerSlug={o.slug} />

              {/* Trust signals */}
              <div className="mt-4 space-y-2 text-center text-xs text-gray-500">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3 text-pd-purple-light" />
                  Secure checkout via Stripe
                </p>
                <p>7-day refund policy if unredeemed</p>
              </div>

              {/* Share */}
              <div className="mt-4">
                <ShareSection
                  url={`/offers/${o.slug}`}
                  title="Share This Deal & Earn!"
                  incentive={o.offer_price ? `Earn $${(o.offer_price * 0.05).toFixed(2)} per friend who buys` : undefined}
                  variant="offer"
                  offerId={o.id}
                  businessId={o.business_id}
                />
              </div>
            </div>

            {/* Business Card */}
            {biz && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pd-purple/15">
                    <Shield className="h-6 w-6 text-pd-purple-light" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/business/${biz.slug}`} className="font-semibold text-white hover:text-pd-gold">
                        {biz.name}
                      </Link>
                      {getTierBadge(biz.tier)}
                    </div>
                    {biz.city && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" /> {biz.city}, CA
                      </p>
                    )}
                  </div>
                </div>

                {biz.average_rating > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-pd-gold text-pd-gold" />
                    <span className="text-white">{biz.average_rating}</span>
                    <span className="text-gray-500">({biz.review_count} reviews)</span>
                  </div>
                )}

                {biz.address && (
                  <p className="mt-3 text-sm text-gray-400">{biz.address}, {biz.city}, CA</p>
                )}

                <Link
                  href={`/business/${biz.slug}`}
                  className="mt-4 block rounded-xl border border-pd-purple/20 py-2.5 text-center text-sm font-medium text-pd-purple-light transition-colors hover:bg-pd-purple/10"
                >
                  View Business Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
