import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESS_BY_SLUG_QUERY, REVIEWS_BY_BUSINESS_QUERY } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import {
  Star, Shield, MapPin, Phone, Globe, Mail, Clock,
  Facebook, Instagram, Linkedin, Youtube, ExternalLink, Lock
} from "lucide-react";
import type { Metadata } from "next";
import type { Business, Review } from "@/types";
import { getTierFeatures } from "@/lib/features";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: BUSINESS_BY_SLUG_QUERY, params: { slug } });
  const biz = data as Business | null;
  return {
    title: biz?.seoTitle || biz?.name || "Business",
    description: biz?.seoDescription || biz?.description || undefined,
  };
}

function LockedField({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
      <Lock className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-500">{label}</span>
      <Link href="/pricing" className="ml-auto text-xs text-pd-blue hover:text-pd-blue-light">
        Upgrade to See
      </Link>
    </div>
  );
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ data: business }, { data: reviews }] = await Promise.all([
    sanityFetch({ query: BUSINESS_BY_SLUG_QUERY, params: { slug } }),
    sanityFetch({ query: REVIEWS_BY_BUSINESS_QUERY, params: { businessId: "" } }),
  ]);

  const biz = business as Business | null;
  if (!biz) notFound();

  const features = getTierFeatures(biz.tier);
  const reviewList = (reviews as Review[]) || [];

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        {biz.city && (
          <>
            <Link href={`/city/${biz.city}`} className="hover:text-white">{biz.city}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-white">{biz.name}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-pd-purple/10">
            <div className="flex h-full items-center justify-center text-4xl font-bold text-pd-purple-light">
              {biz.name?.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-white">{biz.name}</h1>
              {biz.isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-pd-gold/20 px-3 py-1 text-sm text-pd-gold">
                  <Shield className="h-4 w-4" /> Platinum Verified
                </span>
              )}
              {biz.isFeatured && (
                <span className="rounded-full bg-pd-gold/20 px-3 py-1 text-sm text-pd-gold">FEATURED</span>
              )}
            </div>
            {biz.primaryCategory && (
              <Link href={`/category/${biz.primaryCategory.slug?.current}`} className="mt-2 inline-block rounded-full bg-pd-blue/20 px-3 py-1 text-sm text-pd-blue-light hover:bg-pd-blue/30">
                {biz.primaryCategory.name}
              </Link>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {(biz.averageRating > 0 || biz.googleRating) && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-pd-gold text-pd-gold" />
                  <span className="text-white">{biz.averageRating || biz.googleRating}</span>
                  <span>({biz.reviewCount || biz.googleReviewCount || 0} reviews)</span>
                </span>
              )}
              {biz.priceRange && <span>{biz.priceRange}</span>}
              {biz.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{biz.city}, {biz.state}</span>}
            </div>
            {features.showDescription ? (
              biz.description && <p className="mt-3 text-gray-300">{biz.description}</p>
            ) : (
              <LockedField label="Business description" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold text-white">Contact Information</h2>
            <div className="mt-4 space-y-3">
              {features.showPhone ? (
                biz.phone && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-4 w-4 text-pd-blue" />
                    <a href={`tel:${biz.phone}`} className="hover:text-white">{biz.phone}</a>
                  </div>
                )
              ) : <LockedField label="Phone number" />}
              {features.showWebsite ? (
                biz.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="h-4 w-4 text-pd-blue" />
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="hover:text-white">{biz.website}</a>
                  </div>
                )
              ) : <LockedField label="Website" />}
              {features.showEmail ? (
                biz.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-4 w-4 text-pd-blue" />
                    <a href={`mailto:${biz.email}`} className="hover:text-white">{biz.email}</a>
                  </div>
                )
              ) : <LockedField label="Email address" />}
              {features.showAddress ? (
                biz.address && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-pd-blue" />
                    <span>{biz.address}, {biz.city}, {biz.state} {biz.zip}</span>
                  </div>
                )
              ) : <LockedField label="Address" />}
            </div>
          </div>

          {/* Hours */}
          {features.showHours ? (
            biz.hours && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pd-blue" /> Business Hours
                </h2>
                <div className="mt-4 space-y-2">
                  {Object.entries(biz.hours).map(([day, info]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-400">{day}</span>
                      <span className="text-gray-300">
                        {info?.closed ? "Closed" : `${info?.open || "—"} – ${info?.close || "—"}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="glass-card p-6">
              <LockedField label="Business hours" />
            </div>
          )}

          {/* Amenities */}
          {features.showDescription && biz.amenities && biz.amenities.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {biz.amenities.map((a) => (
                  <span key={a} className="rounded-full border border-pd-purple/20 px-3 py-1 text-sm text-gray-300">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Get Quote CTA */}
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">Get a Quote</h3>
            <p className="mt-2 text-sm text-gray-400">Contact this business directly</p>
            <form className="mt-4 space-y-3">
              <input type="hidden" name="businessId" value={biz._id} />
              <input type="text" name="name" placeholder="Your Name" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
              <input type="email" name="email" placeholder="Email" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
              <input type="tel" name="phone" placeholder="Phone" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
              <textarea name="message" rows={3} placeholder="How can they help you?" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
              <button type="submit" className="w-full rounded-lg bg-pd-blue py-2 font-medium text-white hover:bg-pd-blue-dark">
                Get Quote
              </button>
            </form>
          </div>

          {/* Smart Offers */}
          {biz.smartOffers && biz.smartOffers.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-pd-gold">Smart Offers</h3>
              <div className="mt-4 space-y-3">
                {biz.smartOffers.map((offer, i) => (
                  <div key={i} className="rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-3">
                    <p className="font-medium text-white">{offer.title}</p>
                    {offer.originalPrice && offer.offerPrice && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-500 line-through">${offer.originalPrice}</span>
                        <span className="text-lg font-bold text-pd-gold">${offer.offerPrice}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {features.showSocialLinks && biz.socialLinks && (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-white">Follow Us</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {biz.socialLinks.facebook && (
                  <a href={biz.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {biz.socialLinks.instagram && (
                  <a href={biz.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {biz.socialLinks.linkedin && (
                  <a href={biz.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {biz.socialLinks.youtube && (
                  <a href={biz.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tier upgrade CTA for free listings */}
          {biz.tier === "free" && (
            <div className="glass-card border-pd-gold/30 p-6 text-center">
              <p className="text-sm font-medium text-pd-gold">Is this your business?</p>
              <p className="mt-1 text-xs text-gray-400">Claim it and unlock your full profile</p>
              <Link href="/claim" className="mt-3 inline-block rounded-lg bg-pd-gold px-4 py-2 text-sm font-medium text-pd-dark hover:bg-pd-gold-light">
                Claim Business
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
