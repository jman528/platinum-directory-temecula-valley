"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

export function BuyButton({ offerId, offerSlug }: { offerId: string; offerSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-pd-gold py-3.5 font-heading text-base font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" /> Buy Now
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
