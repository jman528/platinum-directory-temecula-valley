import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { CATEGORIES_QUERY, FEATURED_BUSINESSES_QUERY } from "@/lib/sanity/queries";
import { Search, Gift, Trophy, MapPin, Star, Shield } from "lucide-react";
import type { Business, Category } from "@/types";

export default async function HomePage() {
  const { data: categories } = await sanityFetch({ query: CATEGORIES_QUERY });
  const { data: featuredBusinesses } = await sanityFetch({
    query: FEATURED_BUSINESSES_QUERY,
  });

  const homepageCategories = [
    "wineries-vineyards", "old-town-dining", "luxury-accommodations",
    "automotive", "real-estate-property", "health-wellness",
    "home-services", "professional-services", "arts-entertainment",
    "shopping-retail", "local-artisans-crafts", "business-to-business",
  ];

  const displayCategories = categories
    ? (categories as Category[]).filter((c) =>
        homepageCategories.includes(c.slug?.current || "")
      )
    : [];

  const CATEGORY_LABELS: Record<string, string> = {
    "home-services": "Home Improvement",
    "automotive": "Auto Services & Detailing",
    "arts-entertainment": "Events & Entertainment",
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="wine-gradient relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative text-center">
          <h1 className="font-heading text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            Temecula Valley&apos;s{" "}
            <span className="text-pd-gold">Verified</span> Business Directory
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Wine Country &bull; Old Town &bull; Premium Local Services
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-xl border border-pd-purple/30 bg-pd-dark/80 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-transparent py-3 text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            <div className="hidden items-center border-l border-pd-purple/20 px-4 md:flex">
              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Temecula, CA 92590</span>
            </div>
            <Link
              href="/search"
              className="flex items-center bg-pd-blue px-6 py-3 font-medium text-white transition-colors hover:bg-pd-blue-dark"
            >
              Search
            </Link>
          </div>

          {/* Trending Tags */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Wine Tasting", "Auto Detailing", "Real Estate", "Restaurants"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-pd-purple/30 bg-pd-dark/50 px-3 py-1 text-xs text-gray-300 transition-colors hover:border-pd-gold hover:text-pd-gold"
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Weekly Giveaway Banner */}
      <section className="border-y border-pd-gold/30 bg-gradient-to-r from-pd-purple-dark/30 via-pd-dark to-pd-gold/10 py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pd-gold/20">
              <Gift className="h-6 w-6 text-pd-gold" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-white">
                Win $250 This Week!
              </p>
              <p className="text-sm text-gray-400">
                Enter our weekly giveaway — gift cards, dining, &amp; more
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/giveaway"
              className="rounded-lg bg-pd-gold px-5 py-2.5 font-medium text-pd-dark transition-colors hover:bg-pd-gold-light"
            >
              Enter to Win →
            </Link>
            <Link
              href="/giveaway/business"
              className="flex items-center gap-1 text-sm text-pd-purple-light hover:text-pd-purple"
            >
              <Trophy className="h-4 w-4" />
              Business: Win $3,500
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-heading text-3xl font-bold text-white">
            Browse by Category
          </h2>
          <p className="mt-2 text-gray-400">
            Discover trusted businesses across Temecula Valley
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {displayCategories.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug?.current}`}
                className="glass-card group relative flex h-36 items-end overflow-hidden p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-pd-dark via-pd-dark/60 to-transparent" />
                <div className="relative">
                  <p className="font-heading text-sm font-semibold text-white">
                    {CATEGORY_LABELS[cat.slug?.current || ""] || cat.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cat.businessCount || 0} businesses
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Listings */}
      <section className="border-t border-pd-purple/20 py-16">
        <div className="container">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-pd-gold" />
            <h2 className="font-heading text-3xl font-bold text-white">
              Verified Premium Businesses
            </h2>
          </div>
          <p className="mt-2 text-gray-400">
            Platinum-verified businesses you can trust
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {(featuredBusinesses as Business[] || []).map((biz) => (
              <Link
                key={biz._id}
                href={`/business/${biz.slug?.current}`}
                className="glass-card group flex gap-4 p-4 transition-all hover:border-pd-gold"
              >
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-pd-purple/10">
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-pd-purple-light">
                    {biz.name?.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-white group-hover:text-pd-gold">
                      {biz.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-pd-gold/20 px-2 py-0.5 text-xs text-pd-gold">
                      <Shield className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  {biz.primaryCategory && (
                    <span className="mt-1 inline-block rounded-full bg-pd-blue/20 px-2 py-0.5 text-xs text-pd-blue-light">
                      {biz.primaryCategory.name}
                    </span>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                    {(biz.averageRating > 0 || biz.googleRating) && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                        {biz.averageRating || biz.googleRating}
                      </span>
                    )}
                    {biz.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {biz.city}, {biz.state}
                      </span>
                    )}
                  </div>
                  {biz.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {biz.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {(!featuredBusinesses || (featuredBusinesses as Business[]).length === 0) && (
            <div className="mt-8 rounded-xl border border-pd-purple/20 bg-pd-dark/50 p-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-pd-purple/50" />
              <p className="mt-4 text-lg text-gray-400">
                Premium businesses coming soon
              </p>
              <Link href="/pricing" className="mt-4 inline-block text-sm text-pd-blue hover:text-pd-blue-light">
                Become a verified business →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Advertise CTA */}
      <section className="wine-gradient py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-white">
            Grow Your Business with Platinum Directory
          </h2>
          <div className="mx-auto mt-6 flex max-w-lg flex-col items-start gap-3 text-left text-gray-300">
            <p className="flex items-center gap-2">
              <span className="text-pd-gold">✓</span> Reach Temecula&apos;s Premium Audience
            </p>
            <p className="flex items-center gap-2">
              <span className="text-pd-gold">✓</span> Featured Placement &amp; Insights
            </p>
            <p className="flex items-center gap-2">
              <span className="text-pd-gold">✓</span> Smart Offers That Drive Real Traffic
            </p>
          </div>
          <Link
            href="/pricing"
            className="mt-8 inline-block rounded-lg bg-pd-gold px-8 py-3 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Become a Partner Today
          </Link>
        </div>
      </section>
    </div>
  );
}
