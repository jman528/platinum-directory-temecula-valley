import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, SlidersHorizontal, Star, Shield, MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { Business, Category } from "@/types";
import { formatPhone } from "@/lib/utils/format-phone";
import MobileFilterToggle from "@/components/ui/mobile-filter-toggle";

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

function FilterContent({
  catList,
  query,
  category,
  city,
}: {
  catList: Category[];
  query: string;
  category: string;
  city: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-300">Category</h4>
        <div className="space-y-0.5">
          <Link href="/search" className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!category ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}>
            All Categories
          </Link>
          {catList.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}${query ? `&q=${query}` : ""}`}
              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${category === cat.slug ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}
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
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string; tier?: string; has_offers?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";
  const city = params.city || "";
  const tier = params.tier || "";
  const hasOffers = params.has_offers === "true";
  const page = Number(params.page) || 1;
  const perPage = 12;

  const supabase = await createClient();

  // Fetch categories for the filter sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Build business query
  let bizQuery = supabase
    .from("businesses")
    .select("*, categories(name, slug)")
    .eq("is_active", true)
    .order("tier", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("average_rating", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (query) {
    bizQuery = bizQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }
  if (city) {
    bizQuery = bizQuery.eq("city", city);
  }
  if (tier) {
    bizQuery = bizQuery.eq("tier", tier);
  }
  if (category) {
    // Look up category id by slug
    const { data: catRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (catRow) {
      bizQuery = bizQuery.eq("category_id", catRow.id);
    }
  }

  const { data: businesses } = await bizQuery;

  const bizList = (businesses as any[]) || [];
  const catList = (categories as Category[]) || [];

  return (
    <div className="premium-bg container py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <form action="/search" method="GET" className="glass-input flex overflow-hidden">
          <div className="flex flex-1 items-center gap-3 px-4 sm:px-5">
            <Search className="h-5 w-5 flex-shrink-0 text-pd-purple-light" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search businesses, categories..."
              className="w-full bg-transparent py-3 text-white placeholder:text-gray-500 focus:outline-none sm:py-3.5"
            />
          </div>
          <button type="submit" className="btn-glow bg-pd-blue px-6 py-3 font-medium text-white hover:bg-pd-blue-dark sm:px-8 sm:py-3.5">
            Search
          </button>
        </form>
      </div>

      {/* Mobile filter button + results count */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          {bizList.length} result{bizList.length !== 1 ? "s" : ""}
          {query && <span> for &ldquo;{query}&rdquo;</span>}
          {city && <span> in {city}</span>}
        </p>
        <MobileFilterToggle>
          <FilterContent catList={catList} query={query} category={category} city={city} />
        </MobileFilterToggle>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar — Desktop only */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-pd-purple-light" />
              <h3 className="font-heading font-semibold text-white">Filters</h3>
            </div>
            <FilterContent catList={catList} query={query} category={category} city={city} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {bizList.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-lg text-gray-400">No businesses found</p>
              <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bizList.map((biz) => {
                const imgUrl = biz.cover_image_url || `https://picsum.photos/seed/${biz.slug || biz.id}/800/400`;
                const catName = biz.categories?.name;
                const isVerified = biz.tier !== "free";
                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="glass-card glow-effect group relative flex gap-4 overflow-hidden p-4"
                  >
                    {biz.is_featured && <div className="featured-ribbon">FEATURED</div>}

                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pd-purple-dark/40 to-pd-blue-dark/30 sm:h-24 sm:w-24">
                      <img
                        src={imgUrl}
                        alt={biz.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-heading text-sm font-semibold text-white group-hover:text-pd-gold">
                          {biz.name}
                        </h3>
                        {getTierBadge(biz.tier)}
                      </div>
                      {isVerified && (
                        <span className="verified-pulse mt-0.5 inline-flex items-center gap-1 text-xs text-pd-gold">
                          <Shield className="h-3 w-3" /> Platinum Verified
                        </span>
                      )}
                      {catName && (
                        <span className="mt-1 inline-block rounded-full bg-pd-purple/20 px-2.5 py-0.5 text-[10px] text-pd-purple-light">
                          {catName}
                        </span>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400 sm:gap-3">
                        {biz.average_rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                            <span className="text-white">{biz.average_rating}</span>
                          </span>
                        )}
                        {biz.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {biz.city}
                          </span>
                        )}
                        {biz.phone && (
                          <span className="hidden text-gray-500 sm:inline">{formatPhone(biz.phone)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {bizList.length === perPage && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/search?page=${page - 1}${query ? `&q=${query}` : ""}${category ? `&category=${category}` : ""}${city ? `&city=${city}` : ""}`}
                  className="rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white"
                >
                  Previous
                </Link>
              )}
              <Link
                href={`/search?page=${page + 1}${query ? `&q=${query}` : ""}${category ? `&category=${category}` : ""}${city ? `&city=${city}` : ""}`}
                className="rounded-lg border border-pd-purple/20 px-4 py-2 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white"
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
