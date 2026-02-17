import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/live";
import { BUSINESSES_BY_CITY_QUERY } from "@/lib/sanity/queries";
import { Star, Shield, MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { Business } from "@/types";
import { CITIES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  return {
    title: `Businesses in ${decoded}, CA`,
    description: `Browse verified businesses in ${decoded}, California — part of Temecula Valley.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  const cityInfo = CITIES.find((c) => c.name === city);

  const { data: businesses } = await sanityFetch({
    query: BUSINESSES_BY_CITY_QUERY,
    params: { city, start: 0, end: 24 },
  });

  const bizList = (businesses as Business[]) || [];

  return (
    <div className="container py-8">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{city}, CA</span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-white">
        Businesses in {city}, CA
      </h1>
      <p className="mt-2 text-gray-400">
        {cityInfo ? `${cityInfo.businessCount.toLocaleString()} businesses` : "Browse local businesses"} in {city}
      </p>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No businesses listed in {city} yet</p>
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
              {biz.primaryCategory && (
                <span className="mt-1 inline-block rounded-full bg-pd-blue/20 px-2 py-0.5 text-[10px] text-pd-blue-light">
                  {biz.primaryCategory.name}
                </span>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                {(biz.averageRating > 0 || biz.googleRating) && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                    {biz.averageRating || biz.googleRating}
                  </span>
                )}
                {biz.address && <span className="truncate">{biz.address}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
