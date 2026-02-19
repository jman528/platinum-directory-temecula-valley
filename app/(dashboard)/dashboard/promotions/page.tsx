import { createClient } from "@/lib/supabase/server";
import { Tag, Sparkles, Plus, Eye } from "lucide-react";
import Link from "next/link";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let offers: any[] = [];
  if (user) {
    // Get businesses owned by user, then their offers
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_user_id", user.id);

    if (businesses && businesses.length > 0) {
      const bizIds = businesses.map((b) => b.id);
      const { data } = await supabase
        .from("offers")
        .select("id, slug, title, offer_type, offer_price, original_price, status, is_active, current_claims, max_claims, expires_at")
        .in("business_id", bizIds)
        .order("created_at", { ascending: false });
      offers = data || [];
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Smart Offers</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/promotions/ai-builder"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue px-4 py-2 text-sm font-medium text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark"
          >
            <Sparkles className="h-4 w-4" /> AI Builder
          </Link>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No offers yet</p>
          <p className="mt-2 text-sm text-gray-500">Use the AI Builder to generate your first high-converting offer.</p>
          <Link
            href="/dashboard/promotions/ai-builder"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-6 py-2.5 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            <Sparkles className="h-4 w-4" /> Generate with AI
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {offers.map((offer: any) => {
            const remaining = offer.max_claims ? offer.max_claims - (offer.current_claims || 0) : null;
            const isExpired = offer.expires_at && new Date(offer.expires_at) < new Date();
            const statusColors: Record<string, string> = {
              active: "text-green-400 bg-green-500/15",
              draft: "text-yellow-400 bg-yellow-500/15",
              paused: "text-gray-400 bg-gray-500/15",
              expired: "text-red-400 bg-red-500/15",
              sold_out: "text-orange-400 bg-orange-500/15",
            };
            const statusColor = statusColors[offer.status] || "text-gray-400 bg-gray-500/15";

            return (
              <div key={offer.id} className="glass-card flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pd-gold/10">
                  <Tag className="h-5 w-5 text-pd-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{offer.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor}`}>
                      {isExpired ? "expired" : offer.status}
                    </span>
                    {offer.original_price && (
                      <span>
                        <span className="line-through">${offer.original_price}</span>{" "}
                        <span className="text-pd-gold">${offer.offer_price}</span>
                      </span>
                    )}
                    {remaining !== null && <span>{remaining} remaining</span>}
                    <span>{offer.current_claims || 0} sold</span>
                  </div>
                </div>
                {offer.slug && (
                  <Link
                    href={`/offers/${offer.slug}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                    title="View offer"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
