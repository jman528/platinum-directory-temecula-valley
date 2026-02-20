import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, SlidersHorizontal, Star, Shield, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import type { Category } from "@/types";
import { formatPhone } from "@/lib/utils/format-phone";
import MobileFilterToggle from "@/components/ui/mobile-filter-toggle";
import AISearchBar from "@/components/search/AISearchBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Businesses",
  description: "Search verified businesses in Temecula Valley — wineries, restaurants, spas, and more.",
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
  const activeCount = [category, city].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-pd-blue/20 px-2.5 py-0.5 text-xs font-medium text-pd-blue">
            {activeCount} active filter{activeCount !== 1 ? "s" : ""}
          </span>
          <Link href="/search" className="text-xs text-gray-400 hover:text-white">
            Reset All
          </Link>
        </div>
      )}

      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-300">Category</h4>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          <Link href={`/search${query ? `?q=${query}` : ""}${city ? `${query ? "&" : "?"}city=${city}` : ""}`} className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!category ? "bg-pd-purple/20 text-white" : "text-gray-400 hover:bg-pd-purple/10 hover:text-white"}`}>
            All Categories
          </Link>
          {catList.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}${query ? `&q=${query}` : ""}${city ? `&city=${city}` : ""}`}
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

      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-300">Rating</h4>
        <div className="space-y-0.5">
          {["Any", "4+ Stars", "3+ Stars"].map((opt) => {
            const val = opt === "Any" ? "" : opt[0];
            return (
              <Link
                key={opt}
                href={`/search?${new URLSearchParams({
                  ...(query ? { q: query } : {}),
                  ...(category ? { category } : {}),
                  ...(city ? { city } : {}),
                  ...(val ? { minRating: val } : {}),
                }).toString()}`}
                className="block rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-pd-purple/10 hover:text-white"
              >
                {opt}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string; tier?: string; minRating?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "";
  const city = params.city || "";
  const tier = params.tier || "";
  const minRating = Number(params.minRating) || 0;
  const page = Number(params.page) || 1;
  const perPage = 12;

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  let bizQuery = supabase
    .from("businesses")
    .select("*, categories(name, slug)")
    .eq("is_active", true)
    .order("tier", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("average_rating", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (query) {
    bizQuery = bizQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
  }
  if (city) {
    bizQuery = bizQuery.eq("city", city);
  }
  if (tier) {
    bizQuery = bizQuery.eq("tier", tier);
  }
  if (minRating > 0) {
    bizQuery = bizQuery.gte("average_rating", minRating);
  }
  if (category) {
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
      {/* AI Search Bar */}
      <AISearchBar defaultQuery={query} />

      {/* AI Suggestion Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { icon: "🔍", label: "Similar:", value: "Wine tasting experiences" },
          { icon: "⚡", label: "Trending:", value: "Weekend brunch spots" },
          { icon: "💡", label: "Suggested:", value: "Pet-friendly restaurants" },
        ].map((s, i) => (
          <Link
            key={i}
            href={`/search?q=${encodeURIComponent(s.value)}`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-pd-gold/30 hover:text-pd-gold"
          >
            <span>{s.icon}</span>
            <span className="text-white/40">{s.label}</span>
            <span>{s.value}</span>
          </Link>
        ))}
      </div>

      {/* Results Summary */}
      {(query || category || city) && (
        <div className="glass-card mb-4 p-4">
          <p className="text-white/80">
            Found <span className="font-bold text-pd-gold">{bizList.length}</span> result{bizList.length !== 1 ? "s" : ""}
            {query && <> for &ldquo;<span className="text-white">{query}</span>&rdquo;</>}
            {city && <> in <span className="text-white">{city}</span></>}
            {category && <> in <span className="capitalize text-white">{category.replace(/-/g, " ")}</span></>}
          </p>
        </div>
      )}

      {/* Mobile filter button */}
      <div className="mb-4 flex items-center justify-end lg:hidden">
        <MobileFilterToggle>
          <FilterContent catList={catList} query={query} category={category} city={city} />
        </MobileFilterToggle>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-pd-purple-light" />
              <h3 className="font-heading font-semibold text-white">Filters</h3>
            </div>
            <FilterContent catList={catList} query={query} category={category} city={city} />
          </div>
        </aside>

        {/* Results Grid */}
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
                const hasAIResponse = biz.tier === "platinum_partner" || biz.tier === "platinum_elite";
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

                    <div className="min-w-0 flex-1">
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
                            {biz.review_count > 0 && <span>({biz.review_count})</span>}
                          </span>
                        )}
                        {biz.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {biz.city}
                          </span>
                        )}
                        {biz.phone && (
                          <span className="hidden items-center gap-1 sm:flex">
                            <Phone className="h-3 w-3" /> {formatPhone(biz.phone)}
                          </span>
                        )}
                        {biz.price_range && (
                          <span className="text-pd-gold">{biz.price_range}</span>
                        )}
                      </div>
                      {biz.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">{biz.description}</p>
                      )}
                      {hasAIResponse && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400">
                          🤖 AI Quick Response
                        </span>
                      )}
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
