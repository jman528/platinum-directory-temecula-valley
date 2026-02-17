import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESSES_BY_CATEGORY_QUERY, CATEGORIES_QUERY } from "@/lib/sanity/queries";
import { Star, Shield, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Business, Category } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: categories } = await sanityFetch({ query: CATEGORIES_QUERY });
  const cat = (categories as Category[])?.find((c) => c.slug?.current === slug);
  return {
    title: cat ? `${cat.name} in Temecula Valley` : "Category",
    description: cat ? `Find verified ${cat.name.toLowerCase()} businesses in Temecula Valley.` : undefined,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ data: businesses }, { data: categories }] = await Promise.all([
    sanityFetch({
      query: BUSINESSES_BY_CATEGORY_QUERY,
      params: { categorySlug: slug, start: 0, end: 24 },
    }),
    sanityFetch({ query: CATEGORIES_QUERY }),
  ]);

  const cat = (categories as Category[])?.find((c) => c.slug?.current === slug);
  if (!cat) notFound();

  const bizList = (businesses as Business[]) || [];

  return (
    <div className="container py-8">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{cat.name}</span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-white">{cat.name}</h1>
      <p className="mt-2 text-gray-400">{bizList.length} verified businesses in Temecula Valley</p>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <p className="text-lg text-gray-400">No businesses in this category yet</p>
          <Link href="/claim" className="mt-4 inline-block text-pd-blue hover:text-pd-blue-light">
            Add your business →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bizList.map((biz) => (
            <Link key={biz._id} href={`/business/${biz.slug?.current}`} className="glass-card group p-4">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-heading font-semibold text-white group-hover:text-pd-gold">{biz.name}</h3>
                {biz.isVerified && <Shield className="h-4 w-4 shrink-0 text-pd-gold" />}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                {(biz.averageRating > 0 || biz.googleRating) && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                    {biz.averageRating || biz.googleRating}
                  </span>
                )}
                {biz.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.city}</span>}
              </div>
              {biz.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{biz.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
