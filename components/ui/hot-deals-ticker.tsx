"use client";

import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  offer_price: number;
  original_price: number | null;
  business_name: string;
  slug: string;
}

export function HotDealsTicker({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) return null;

  // Duplicate items for infinite scroll effect
  const items = [...deals, ...deals];

  return (
    <section className="relative overflow-hidden border-y border-pd-gold/20 bg-gradient-to-r from-pd-dark via-pd-gold/[0.03] to-pd-dark py-3">
      <div className="flex animate-scroll-left items-center gap-8" style={{ width: "max-content" }}>
        {items.map((deal, i) => (
          <Link
            key={`${deal.id}-${i}`}
            href="/deals"
            className="flex shrink-0 items-center gap-3 rounded-lg border border-pd-gold/20 bg-pd-gold/5 px-4 py-2 transition-colors hover:border-pd-gold/40 hover:bg-pd-gold/10"
          >
            <Tag className="h-4 w-4 text-pd-gold" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{deal.business_name}</span>
              <span className="text-xs text-gray-400">&middot;</span>
              <span className="text-sm text-pd-gold">{deal.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {deal.original_price && (
                <span className="text-xs text-gray-500 line-through">${deal.original_price}</span>
              )}
              <span className="text-sm font-bold text-pd-gold">${deal.offer_price}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-pd-gold/60" />
          </Link>
        ))}
      </div>
    </section>
  );
}
