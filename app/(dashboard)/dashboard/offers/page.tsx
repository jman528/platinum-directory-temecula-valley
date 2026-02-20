import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Tag, Plus, Eye, BarChart3, DollarSign, Clock, CheckCircle, XCircle
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default async function DashboardOffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get user's business
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, tier")
    .eq("owner_user_id", user.id)
    .limit(1)
    .single();

  // Fetch offers
  let offers: any[] = [];
  if (biz) {
    const { data } = await supabase
      .from("offers")
      .select("*, offer_claims(id)")
      .eq("business_id", biz.id)
      .order("created_at", { ascending: false });
    offers = data || [];
  }

  const activeOffers = offers.filter((o: any) => o.is_active);
  const totalClaims = offers.reduce((sum, o: any) => sum + ((o.offer_claims as any[])?.length || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Smart Offers</h1>
          <p className="mt-1 text-gray-400">Create and manage offers to drive traffic and sales</p>
        </div>
        <Link
          href="/dashboard/promotions/ai-builder"
          className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
        >
          <Plus className="h-4 w-4" /> Create New Offer
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Offers</p>
          <p className="mt-1 text-3xl font-bold text-white">{activeOffers.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Claims</p>
          <p className="mt-1 text-3xl font-bold text-white">{totalClaims}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Revenue Generated</p>
          <p className="mt-1 text-3xl font-bold text-green-400">{formatCurrency(0)}</p>
        </div>
      </div>

      {/* Offers List */}
      <div className="mt-8">
        {offers.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-bold text-white">No Smart Offers Yet</h3>
            <p className="mt-2 text-gray-400">
              Create your first Smart Offer to attract customers with compelling deals.
            </p>
            <Link
              href="/dashboard/promotions/ai-builder"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-pd-gold px-6 py-2 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
            >
              <Plus className="h-4 w-4" /> Create Your First Offer
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer: any) => {
              const claimCount = (offer.offer_claims as any[])?.length || 0;
              return (
                <div key={offer.id} className="glass-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{offer.title}</h3>
                        {offer.is_active ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-400 line-clamp-1">{offer.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        {offer.price && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> {formatCurrency(offer.price)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {claimCount} claims
                        </span>
                        {offer.max_claims && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" /> {claimCount}/{offer.max_claims} max
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(offer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/offers/${offer.slug || offer.id}`}
                        target="_blank"
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
