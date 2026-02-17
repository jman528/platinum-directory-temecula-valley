import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { CATEGORIES_QUERY, FEATURED_BUSINESSES_QUERY, BUSINESS_COUNT_QUERY } from "@/lib/sanity/queries";
import { Search, Gift, Trophy, MapPin, Star, Shield, Phone, Globe, Navigation, ChevronRight, Wine, UtensilsCrossed, Car, Heart, ShoppingBag, Briefcase, Wrench, Sparkles, Home, Music, Crown, Store } from "lucide-react";
import type { Business, Category } from "@/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const ICON_MAP: Record<string, any> = {
  Wine, UtensilsCrossed, Car, Heart, ShoppingBag, Briefcase, Wrench, Sparkles,
  Home, Music, Crown, Store, MapPin, Star, Shield,
};

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

export default async function HomePage() {
  const [{ data: categories }, { data: featuredBusinesses }, { data: businessCount }] = await Promise.all([
    sanityFetch({ query: CATEGORIES_QUERY }),
    sanityFetch({ query: FEATURED_BUSINESSES_QUERY }),
    sanityFetch({ query: BUSINESS_COUNT_QUERY }),
  ]);

  const allCategories = (categories as Category[]) || [];
  const displayCategories = allCategories.slice(0, 20);
  const catPills = allCategories.slice(0, 10);

  return (
    <div className="premium-bg">
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="wine-hero-gradient relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container relative text-center">
          <h1 className="text-gold-shimmer font-heading text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            PLATINUM DIRECTORY
          </h1>
          <p className="mt-3 font-heading text-2xl font-semibold text-white md:text-3xl">
            Temecula Valley
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Discover Temecula Valley&apos;s Finest &mdash; Verified Local Businesses,
            Exclusive Deals, and $250 Weekly Giveaways
          </p>

          {/* Search Bar */}
          <div className="glass-input mx-auto mt-10 flex max-w-2xl overflow-hidden">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 text-pd-purple-light" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-transparent py-4 text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            <div className="hidden items-center border-l border-pd-purple/20 px-4 md:flex">
              <MapPin className="mr-2 h-4 w-4 text-pd-gold" />
              <span className="text-sm text-gray-400">Temecula, CA</span>
            </div>
            <Link
              href="/search"
              className="btn-glow flex items-center bg-pd-blue px-8 py-4 font-medium text-white transition-colors hover:bg-pd-blue-dark"
            >
              Search
            </Link>
          </div>

          {/* Category Pills */}
          <div className="horizontal-scroll mx-auto mt-6 flex max-w-3xl gap-2 pb-2">
            {catPills.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug?.current}`}
                className="glass-card flex-shrink-0 rounded-full px-4 py-1.5 text-xs text-gray-300 transition-all hover:border-pd-gold/40 hover:text-pd-gold"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Stat Counters */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-white tabular-nums">{(businessCount as number) || "7,831"}</p>
              <p className="mt-1 text-xs text-gray-400">Businesses</p>
            </div>
            <div className="hidden h-12 w-px bg-pd-purple/20 md:block" />
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-pd-gold">$1.1B</p>
              <p className="mt-1 text-xs text-gray-400">Annual Visitor Spending</p>
            </div>
            <div className="hidden h-12 w-px bg-pd-purple/20 md:block" />
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-white">11</p>
              <p className="mt-1 text-xs text-gray-400">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PLATINUM BUSINESSES
          ═══════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="py-16">
          <div className="container">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-pd-gold" />
              <h2 className="font-heading text-3xl font-bold text-white">
                Featured Platinum Businesses
              </h2>
            </div>
            <div className="mt-1 h-1 w-24 rounded-full bg-gradient-to-r from-pd-gold to-pd-gold/0" />

            {/* Horizontal scrolling carousel */}
            <div className="horizontal-scroll -mx-4 mt-8 flex gap-5 px-4 pb-4">
              {(featuredBusinesses as Business[] || []).map((biz) => (
                <Link
                  key={biz._id}
                  href={`/business/${biz.slug?.current}`}
                  className="glass-card glow-effect group relative flex w-72 flex-shrink-0 flex-col overflow-hidden"
                >
                  {/* Featured ribbon */}
                  {biz.isFeatured && <div className="featured-ribbon">FEATURED</div>}

                  {/* Image placeholder with gradient */}
                  <div className="relative h-40 bg-gradient-to-br from-pd-purple-dark/40 to-pd-blue-dark/30">
                    <div className="flex h-full items-center justify-center text-5xl font-bold text-pd-purple-light/40">
                      {biz.name?.charAt(0)}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(15,23,42,0.9)] to-transparent" />
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-sm font-bold text-white group-hover:text-pd-gold">
                        {biz.name}
                      </h3>
                      {getTierBadge(biz.tier)}
                    </div>

                    {biz.primaryCategory && (
                      <span className="mt-2 inline-block w-fit rounded-full bg-pd-purple/20 px-2.5 py-0.5 text-[10px] text-pd-purple-light">
                        {biz.primaryCategory.name}
                      </span>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      {(biz.averageRating > 0 || biz.googleRating) && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                          <span className="text-white">{biz.averageRating || biz.googleRating}</span>
                        </span>
                      )}
                      {biz.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {biz.city}
                        </span>
                      )}
                    </div>

                    {/* Quick action buttons */}
                    <div className="mt-auto flex gap-2 pt-3">
                      {biz.phone && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                        <Navigation className="h-3.5 w-3.5" />
                      </span>
                      {biz.website && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                          <Globe className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {(!featuredBusinesses || (featuredBusinesses as Business[]).length === 0) && (
                <div className="glass-card mx-auto flex w-full max-w-md flex-col items-center p-12 text-center">
                  <Shield className="h-12 w-12 text-pd-purple/50" />
                  <p className="mt-4 text-lg text-gray-400">Premium businesses coming soon</p>
                  <Link href="/pricing" className="mt-4 text-sm text-pd-blue hover:text-pd-blue-light">
                    Become a verified business &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          WEEKLY GIVEAWAY BANNER
          ═══════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="relative overflow-hidden py-10">
          <div className="absolute inset-0 bg-gradient-to-r from-pd-purple-dark/40 via-pd-blue-dark/20 to-pd-purple-dark/40" />
          <div className="container relative">
            <div className="glass-card-premium flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
              <div className="animate-float flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-pd-gold/20">
                <Gift className="h-8 w-8 text-pd-gold" />
              </div>
              <div className="flex-1">
                <h3 className="text-gold-shimmer font-heading text-2xl font-bold">
                  Win $250 This Week!
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Enter our weekly giveaway &mdash; gift cards, dining, &amp; more from local businesses
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/giveaway"
                  className="btn-glow gradient-border rounded-xl bg-pd-gold px-6 py-3 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
                >
                  Enter Now &rarr;
                </Link>
                <Link
                  href="/giveaway/business"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-pd-purple/30 px-4 py-3 text-sm text-pd-purple-light transition-colors hover:border-pd-purple hover:text-white"
                >
                  <Trophy className="h-4 w-4" />
                  Business: Win $3,500
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          CATEGORIES GRID
          ═══════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-white">
              Browse by Category
            </h2>
            <p className="mt-2 text-gray-400">
              Discover trusted businesses across Temecula Valley
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayCategories.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon || ""] || MapPin;
                return (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug?.current}`}
                    className="glass-card group flex flex-col items-center gap-3 p-6 text-center"
                  >
                    <div className="category-icon-scale flex h-12 w-12 items-center justify-center rounded-xl bg-pd-purple/15">
                      <IconComponent className="h-6 w-6 text-pd-purple-light" />
                    </div>
                    <p className="font-heading text-xs font-semibold text-white">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {cat.businessCount || 0} businesses
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          $3,500 BUSINESS SWEEPSTAKES CTA
          ═══════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="py-16">
          <div className="container">
            <div className="glass-card-premium mx-auto max-w-3xl p-8 text-center md:p-12">
              <Crown className="mx-auto h-10 w-10 text-pd-gold" />
              <h2 className="mt-4 font-heading text-3xl font-bold text-white">
                Win a FREE $3,500 Platinum Elite Package
              </h2>
              <p className="mt-3 text-gray-400">
                Are you a local business? Sign up for any paid plan to be automatically entered
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/giveaway/business"
                  className="btn-glow rounded-xl bg-pd-gold px-8 py-3 font-heading font-semibold text-pd-dark hover:bg-pd-gold-light"
                >
                  Learn More
                </Link>
                <Link
                  href="/claim"
                  className="rounded-xl border border-pd-purple/30 px-8 py-3 font-medium text-white transition-colors hover:border-pd-gold/40 hover:text-pd-gold"
                >
                  Claim Your Business
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          ADVERTISE CTA
          ═══════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="wine-hero-gradient py-20">
          <div className="container text-center">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Grow Your Business with Platinum Directory
            </h2>
            <div className="mx-auto mt-8 flex max-w-lg flex-col items-start gap-3 text-left text-gray-300">
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Reach Temecula&apos;s Premium Audience
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Featured Placement &amp; AI-Powered Insights
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Smart Offers That Drive Real Traffic
              </p>
            </div>
            <Link
              href="/pricing"
              className="btn-glow mt-10 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-10 py-4 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
            >
              Become a Partner Today
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
