"use client";

import Link from "next/link";

interface BusinessCtaBannerProps {
  businessId: string;
  businessName: string;
}

export default function BusinessCtaBanner({ businessId, businessName }: BusinessCtaBannerProps) {
  return (
    <div className="glass-card border-pd-gold/20 p-6 sm:p-8">
      <div className="text-center">
        <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
          ⭐ Is this your business?
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          Claim your FREE listing and start getting leads today.
          Upgrade to unlock photos, Smart Offers, and AI assistant.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <span className="text-gray-300">✅ Verified: <strong className="text-white">$99/mo</strong></span>
          <span className="text-gray-300">🚀 Partner: <strong className="text-white">$799/mo</strong></span>
          <span className="text-gray-300">👑 Elite: <strong className="text-white">$3,500/mo</strong></span>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/claim/${businessId}`}
            className="rounded-lg bg-pd-gold px-6 py-3 text-sm font-bold text-black hover:bg-pd-gold/90 transition-colors"
          >
            Claim This Listing — It&apos;s Free
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-white/10 px-6 py-3 text-sm text-gray-400 hover:bg-white/5 transition-colors"
          >
            See All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
