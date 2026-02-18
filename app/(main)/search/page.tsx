import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESS_SEARCH_QUERY, CATEGORIES_QUERY } from "@/lib/sanity/queries";
import { Search, SlidersHorizontal, Star, Shield, MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { Business, Category } from "@/types";

export const metadata: Metadata = {
  title: "Search Businesses",
  description: "Search verified businesses in Temecula Valley.",
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";
  const city = params.city || "";
  const page = Number(params.page) || 1;
  const perPage = 12;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  const [{ data: businesses }, { data: categories }] = await Promise.all([
    sanityFetch({
      query: BUSINESS_SEARCH_QUERY,
      params: { query, category, city, start, end },
    }),
    sanityFetch({ query: CATEGORIES_QUERY }),
  ]);

  const bizList = (businesses as Business[]) || [];
  const catList = (categories as Category[]) || [];

  return (
    <div className="premium-bg container py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form action="/search" method="GET" className="glass-input flex overflow-hidden">
          <div className="flex flex-1 items-center gap-3 px-5">
            <Search className="h-5 w-5 text-pd-purple-light" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search businesses..."
              className="w-full bg-transparent py-3.5 text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-glow bg-pd-blue px-8 py-3.5 font-medium text-white hover:bg-pd-blue-dark">
            Search
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar — Glass styled */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="glass-card space-y-6 p-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-pd-purple-light" />
              <h3 className="font-heading font-semibold text-white">Filters</h3>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-300">Category</h4>
              <div className="space-y-0.5">
                <Link href="/search" className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!category ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}>
                  All Categories
                </Link>
                {catList.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/search?category=${cat.slug?.current}${query ? `&q=${query}` : ""}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${category === cat.slug?.current ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-300">City</h4>
              <div className="space-y-0.5">
                <Link
                  href={`/search${query ? `?q=${query}` : ""}${category ? `${query ? "&" : "?"}category=${category}` : ""}`}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!city ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}
                >
                  All Cities
                </Link>
                {ALL_CITIES.map((c) => (
                  <Link
                    key={c}
                    href={`/search?city=${c}${query ? `&q=${query}` : ""}${category ? `&category=${category}` : ""}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${city === c ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {bizList.length} result{bizList.length !== 1 ? "s" : ""}
              {query && <span> for &ldquo;{query}&rdquo;</span>}
              {city && <span> in {city}</span>}
            </p>
          </div>

          {bizList.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-lg text-gray-400">No businesses found</p>
              <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bizList.map((biz) => {
                const imgUrl = biz.coverImageUrl || `https://picsum.photos/seed/${biz.slug?.current || biz._id}/800/400`;
                return (
                  <Link
                    key={biz._id}
                    href={`/business/${biz.slug?.current}`}
                    className="glass-card glow-effect group relative flex gap-4 overflow-hidden p-4"
                  >
                    {/* Featured ribbon */}
                    {biz.isFeatured && <div className="featured-ribbon">FEATURED</div>}

                    {/* Thumbnail image */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pd-purple-dark/40 to-pd-blue-dark/30">
                      <img
                        src={imgUrl}
                        alt={biz.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-heading text-sm font-semibold text-white group-hover:text-pd-gold">
                          {biz.name}
                        </h3>
                        {getTierBadge(biz.tier)}
                      </div>
                      {biz.isVerified && (
                        <span className="verified-pulse mt-0.5 inline-flex items-center gap-1 text-xs text-pd-gold">
                          <Shield className="h-3 w-3" /> Platinum Verified
                        </span>
                      )}
                      {biz.primaryCategory && (
                        <span className="mt-1 inline-block rounded-full bg-pd-purple/20 px-2.5 py-0.5 text-[10px] text-pd-purple-light">
                          {biz.primaryCategory.name}
                        </span>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
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
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
