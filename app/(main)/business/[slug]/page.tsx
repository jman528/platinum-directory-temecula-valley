import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Star, Shield, MapPin, Phone, Globe, Mail, Clock,
  Facebook, Instagram, Linkedin, Youtube, Lock, ImageIcon,
  Camera, Video, ArrowRight
} from "lucide-react";
import type { Metadata } from "next";
import { getTierFeatures } from "@/lib/features";
import { formatPhone } from "@/lib/utils/format-phone";
import { BusinessStructuredData } from "@/components/seo/StructuredData";
import VideoPlayTracker from "@/components/VideoPlayTracker";
import ShareSection from "@/components/ShareSection";
import MobileBottomBar from "@/components/MobileBottomBar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: biz } = await supabase
    .from("businesses")
    .select("name, description, city, seo_title, seo_description, seo_keywords, categories(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!biz) return { title: 'Business Not Found' };

  const b = biz as any;
  const title = b.seo_title || `${b.name} - ${b.categories?.name || 'Local Business'} | Temecula Valley`;
  const description = b.seo_description || `${b.name} in ${b.city || 'Temecula'}, CA. ${(b.description || '').slice(0, 120)}... View hours, location, reviews and exclusive deals.`;

  return {
    title,
    description,
    keywords: [b.name, b.city || 'Temecula', 'Temecula Valley', ...(b.seo_keywords || [])],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://platinumdirectorytemeculavalley.com/business/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://platinumdirectorytemeculavalley.com/business/${slug}`,
    },
  };
}

function LockedSection({ icon, label, claimId }: { icon: React.ReactNode; label: string; claimId?: string }) {
  return (
    <div className="glass-card p-6">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="rounded-full bg-white/5 p-3">{icon}</div>
        <p className="text-sm text-gray-400">{label}</p>
        {claimId && (
          <Link href={`/claim/${claimId}`} className="text-xs font-medium text-pd-blue hover:text-pd-blue-light">
            Claim this listing
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const biz = business as any;
  if (!biz) notFound();

  const [{ data: images }, { data: offers }] = await Promise.all([
    supabase
      .from("business_images")
      .select("*")
      .eq("business_id", biz.id)
      .order("display_order"),
    supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .eq("status", "approved")
      .eq("business_id", biz.id),
  ]);

  const features = getTierFeatures(biz.tier);
  const heroImg = biz.cover_image_url || `https://picsum.photos/seed/${biz.slug || biz.id}/1200/400`;
  const catName = biz.categories?.name;
  const catSlug = biz.categories?.slug;
  const isVerified = biz.tier !== "free";
  const isFree = biz.tier === "free";
  const bizImages = (images || []) as any[];
  const bizOffers = (offers || []) as any[];
  const showGallery = features.showImages && bizImages.length > 0;

  // Google Maps embed URL
  const googleMapsEmbedKey = process.env.GOOGLE_MAPS_EMBED_KEY;
  let googleMapsEmbedUrl = "";
  if (googleMapsEmbedKey) {
    if (biz.google_place_id) {
      googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsEmbedKey}&q=place_id:${biz.google_place_id}`;
    } else if (biz.address && biz.city) {
      const q = encodeURIComponent(`${biz.address}, ${biz.city}, ${biz.state || 'CA'}`);
      googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsEmbedKey}&q=${q}`;
    }
  }

  // Video embeds (Partner+ only)
  const videoEmbeds = (biz.video_embeds || []) as any[];
  const showVideos = features.showVideo && videoEmbeds.length > 0 && !isFree;

  return (
    <div className="container py-8">
      <BusinessStructuredData business={biz} />
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        {biz.city && (
          <>
            <Link href={`/search?city=${biz.city}`} className="hover:text-white">{biz.city}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-white">{biz.name}</span>
      </div>

      {/* Hero Cover Image */}
      <div className="relative mb-6 h-48 overflow-hidden rounded-2xl sm:h-64 md:h-72 lg:h-80">
        <Image
          src={heroImg}
          alt={`${biz.name} cover`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pd-dark/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2 sm:bottom-6 sm:left-6 sm:right-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl">{biz.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-pd-gold/20 px-3 py-1 text-xs text-pd-gold backdrop-blur-sm sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" /> Platinum Verified
                </span>
              )}
              {biz.is_featured && (
                <span className="rounded-full bg-pd-gold/20 px-3 py-1 text-xs text-pd-gold backdrop-blur-sm sm:text-sm">FEATURED</span>
              )}
              {catName && (
                <Link
                  href={`/search?category=${catSlug}`}
                  className="rounded-full bg-pd-blue/20 px-3 py-1 text-xs text-pd-blue-light backdrop-blur-sm hover:bg-pd-blue/30 sm:text-sm"
                >
                  {catName}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/90">
            {biz.average_rating > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm">
                <Star className="h-4 w-4 fill-pd-gold text-pd-gold" />
                {biz.average_rating}
                <span className="text-white/60">({biz.review_count || 0})</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {features.showDescription ? (
        biz.description && (
          <div className="glass-card mb-6 p-6">
            <p className="text-gray-300 leading-relaxed">{biz.description}</p>
          </div>
        )
      ) : (
        biz.description ? (
          <div className="glass-card mb-6 p-6">
            <p className="text-gray-300 leading-relaxed">
              {biz.description.slice(0, 50)}
              {biz.description.length > 50 && (
                <span className="text-gray-500">... </span>
              )}
            </p>
            {biz.description.length > 50 && (
              <Link href={`/claim/${biz.id}`} className="mt-2 inline-block text-sm font-medium text-pd-blue hover:text-pd-blue-light">
                Claim to see full listing
              </Link>
            )}
          </div>
        ) : null
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold text-white">Contact Information</h2>
            <div className="mt-4 space-y-3">
              {features.showPhone ? (
                biz.phone && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-4 w-4 flex-shrink-0 text-pd-blue" />
                    <a href={`tel:${biz.phone.replace(/\D/g, "")}`} className="hover:text-white">{formatPhone(biz.phone)}</a>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Phone number</span>
                  <Link href="/pricing" className="ml-auto text-xs text-pd-blue hover:text-pd-blue-light">Upgrade to See</Link>
                </div>
              )}
              {features.showWebsite ? (
                biz.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="h-4 w-4 flex-shrink-0 text-pd-blue" />
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-white">{biz.website}</a>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Website</span>
                  <Link href="/pricing" className="ml-auto text-xs text-pd-blue hover:text-pd-blue-light">Upgrade to See</Link>
                </div>
              )}
              {features.showEmail ? (
                biz.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-4 w-4 flex-shrink-0 text-pd-blue" />
                    <a href={`mailto:${biz.email}`} className="hover:text-white">{biz.email}</a>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Email address</span>
                  <Link href="/pricing" className="ml-auto text-xs text-pd-blue hover:text-pd-blue-light">Upgrade to See</Link>
                </div>
              )}
              {features.showAddress ? (
                biz.address && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-pd-blue" />
                    <span>{biz.address}, {biz.city}, {biz.state} {biz.zip_code}</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/50 px-3 py-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Address</span>
                  <Link href="/pricing" className="ml-auto text-xs text-pd-blue hover:text-pd-blue-light">Upgrade to See</Link>
                </div>
              )}
            </div>
          </div>

          {/* Google Maps Embed — shown for ALL tiers including free (SEO backlink value) */}
          {googleMapsEmbedUrl && (
            <div className="glass-card overflow-hidden">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title={`${biz.name} on Google Maps`}
              />
              {biz.google_maps_url && (
                <div className="border-t border-white/5 px-4 py-2">
                  <a
                    href={biz.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-pd-blue hover:text-pd-blue-light"
                  >
                    <MapPin className="h-3 w-3" /> View on Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Photo Gallery */}
          {showGallery ? (
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-pd-blue" /> Photo Gallery
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {bizImages.map((img: any, i: number) => (
                  <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-pd-dark/50">
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || `${biz.name} photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : isFree ? (
            <LockedSection
              icon={<Camera className="h-6 w-6 text-gray-500" />}
              label="This business hasn't upgraded to share photos yet"
              claimId={biz.id}
            />
          ) : null}

          {/* Hours */}
          {features.showHours ? (
            biz.hours && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pd-blue" /> Business Hours
                </h2>
                <div className="mt-4 space-y-2">
                  {Object.entries(biz.hours as Record<string, any>).map(([day, info]) => (
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
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-400">Hours not yet verified</span>
                <Link href={`/claim/${biz.id}`} className="ml-auto text-xs font-medium text-pd-blue hover:text-pd-blue-light">
                  Claim this listing
                </Link>
              </div>
            </div>
          )}

          {/* Video Embeds (Partner+ only) */}
          {showVideos && (
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-pd-blue" /> Videos
              </h2>
              <div className="mt-4 space-y-4">
                {videoEmbeds.map((v: any, i: number) => {
                  let embedUrl = "";
                  if (v.type === "youtube") {
                    const vid = v.url?.match(/(?:youtu\.be\/|v=)([\w-]+)/)?.[1];
                    if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
                  } else if (v.type === "vimeo") {
                    const vid = v.url?.match(/vimeo\.com\/(\d+)/)?.[1];
                    if (vid) embedUrl = `https://player.vimeo.com/video/${vid}`;
                  }
                  if (!embedUrl) return null;
                  return (
                    <div key={i} className="aspect-video overflow-hidden rounded-xl">
                      <iframe
                        src={`${embedUrl}?enablejsapi=1&origin=${process.env.NEXT_PUBLIC_BASE_URL || ''}`}
                        className="h-full w-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        title={v.title || `${biz.name} video ${i + 1}`}
                      />
                      <VideoPlayTracker businessId={biz.id} videoUrl={v.url} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isFree && (
            <LockedSection
              icon={<Video className="h-6 w-6 text-gray-500" />}
              label="Upgrade to Partner to add video to your listing"
            />
          )}

          {/* Virtual Tour (Elite only) */}
          {biz.virtual_tour_url && biz.tier === "platinum_elite" && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 pt-6">
                <h2 className="font-heading text-lg font-bold text-white">Virtual Tour</h2>
              </div>
              <div className="mt-4">
                <iframe
                  src={biz.virtual_tour_url}
                  className="h-[400px] w-full"
                  loading="lazy"
                  allowFullScreen
                  title={`${biz.name} virtual tour`}
                />
              </div>
            </div>
          )}

          {/* Share Section */}
          <ShareSection
            url={`/business/${biz.slug}`}
            title={`Share ${biz.name} & Earn Points`}
            subtitle="Earn 25 points every time someone visits your link"
            variant="listing"
            businessId={biz.id}
          />

          {/* Amenities */}
          {features.showDescription && biz.amenities && biz.amenities.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-bold text-white">Amenities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {biz.amenities.map((a: string) => (
                  <span key={a} className="rounded-full border border-pd-purple/20 px-3 py-1 text-sm text-gray-300">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Form — only for verified+ businesses */}
          {isVerified ? (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-white">Get a Quote</h3>
              <p className="mt-2 text-sm text-gray-400">Contact this business directly</p>
              <form action="/api/leads" method="POST" className="mt-4 space-y-3">
                <input type="hidden" name="businessId" value={biz.id} />
                <input type="text" name="name" placeholder="Your Name" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
                <input type="email" name="email" placeholder="Email" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
                <input type="tel" name="phone" placeholder="Phone" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
                <textarea name="message" rows={3} placeholder="How can they help you?" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pd-blue focus:outline-none" />
                <button type="submit" className="w-full rounded-lg bg-pd-blue py-2 font-medium text-white hover:bg-pd-blue-dark">
                  Get Quote
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-gray-500">Leads powered by Platinum Directory</p>
            </div>
          ) : null}

          {/* Smart Offers — only for verified+ businesses */}
          {isVerified && bizOffers.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-pd-gold">Smart Offers</h3>
              <div className="mt-4 space-y-3">
                {bizOffers.map((offer: any) => (
                  <div key={offer.id} className="rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-3">
                    <p className="font-medium text-white">{offer.title}</p>
                    {offer.original_price && offer.offer_price && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-500 line-through">${offer.original_price}</span>
                        <span className="text-lg font-bold text-pd-gold">${offer.offer_price}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {features.showSocialLinks && biz.social_media && (
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold text-white">Follow Us</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {biz.social_media.facebook && (
                  <a href={biz.social_media.facebook} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {biz.social_media.instagram && (
                  <a href={biz.social_media.instagram} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {biz.social_media.linkedin && (
                  <a href={biz.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {biz.social_media.youtube && (
                  <a href={biz.social_media.youtube} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-pd-purple/20 p-2 text-gray-400 hover:text-white">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tier upgrade CTA for free listings */}
          {isFree && (
            <div className="glass-card border-pd-gold/30 p-6 text-center">
              <p className="font-heading text-base font-bold text-pd-gold">Is this your business?</p>
              <p className="mt-2 text-sm text-gray-400">
                Claim and verify your listing for FREE, or upgrade to start generating leads and revenue.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/claim/${biz.id}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-pd-gold px-4 py-2.5 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
                >
                  Claim This Listing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  View Upgrade Options
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        phone={biz.phone}
        address={biz.address ? `${biz.address}, ${biz.city || ''} ${biz.state || ''}` : undefined}
        hasDeals={bizOffers.length > 0}
        dealsHref={`/business/${biz.slug}#offers`}
        shareUrl={`/business/${biz.slug}`}
        shareText={biz.name}
      />
    </div>
  );
}
