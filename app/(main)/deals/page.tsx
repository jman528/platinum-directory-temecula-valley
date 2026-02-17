import { sanityFetch } from "@/lib/sanity/live";
import { Tag, Star, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Offers & Deals",
  description: "Browse exclusive deals and smart offers from verified Temecula Valley businesses.",
};

const DEALS_QUERY = `*[_type == "business" && status == "active" && count(smartOffers[isActive == true]) > 0] {
  _id, name, slug, logo, city,
  primaryCategory->{name},
  tier, isVerified,
  smartOffers[isActive == true]{title, offerPrice, originalPrice, validUntil}
}[0...20]`;

export default async function DealsPage() {
  const { data: businesses } = await sanityFetch({ query: DEALS_QUERY });
  const bizList = (businesses as any[]) || [];

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3">
        <Tag className="h-8 w-8 text-pd-gold" />
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Smart Offers &amp; Deals</h1>
          <p className="text-gray-400">Exclusive deals from Temecula Valley businesses</p>
        </div>
      </div>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No active deals right now</p>
          <p className="mt-2 text-sm text-gray-500">Check back soon for exclusive offers</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bizList.map((biz: any) =>
            biz.smartOffers?.map((offer: any, i: number) => (
              <Link key={`${biz._id}-${i}`} href={`/business/${biz.slug?.current}`} className="glass-card group p-4 border-pd-gold/20 hover:border-pd-gold">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-semibold text-white group-hover:text-pd-gold">{biz.name}</span>
                  {biz.isVerified && <Shield className="h-3 w-3 text-pd-gold" />}
                </div>
                <h3 className="mt-2 text-lg font-medium text-pd-gold">{offer.title}</h3>
                {offer.originalPrice && offer.offerPrice && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gray-500 line-through">${offer.originalPrice}</span>
                    <span className="text-2xl font-bold text-pd-gold">${offer.offerPrice}</span>
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      {Math.round((1 - offer.offerPrice / offer.originalPrice) * 100)}% off
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
