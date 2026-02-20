import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default async function EarningsPage() {
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

  // Fetch offer claims for business
  let grossRevenue = 0;
  let platformFees = 0;
  let claims: any[] = [];

  if (biz) {
    const { data: claimsData } = await supabase
      .from("offer_claims")
      .select("id, amount_paid, platform_share_amount, created_at, offers(title)")
      .eq("business_id", biz.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(50);

    claims = claimsData || [];
    grossRevenue = claims.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
    platformFees = claims.reduce((sum, c) => sum + (c.platform_share_amount || 0), 0);
  }

  const netEarnings = grossRevenue - platformFees;

  const tierFees: Record<string, string> = {
    verified_platinum: "15%",
    platinum_partner: "10%",
    platinum_elite: "5%",
    free: "20%",
  };

  const statCards = [
    { label: "Gross Revenue", value: formatCurrency(grossRevenue), color: "text-white" },
    { label: "Platform Fees", value: formatCurrency(platformFees), sub: `${tierFees[biz?.tier || "free"]} (${biz?.tier?.replace(/_/g, " ") || "free"} tier)`, color: "text-red-400" },
    { label: "Net Earnings", value: formatCurrency(netEarnings), color: "text-green-400" },
    { label: "Total Payouts", value: formatCurrency(0), sub: "Via Stripe Connect", color: "text-blue-400" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Earnings</h1>
      <p className="mt-1 text-gray-400">Smart Offer revenue and payout tracking</p>

      {/* Earnings Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Stripe Connect CTA */}
      <div className="mt-6 glass-card flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2.5">
            <CreditCard className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-white">Receive payouts via Stripe Connect</p>
            <p className="text-sm text-gray-400">Connect your bank account to receive automatic payouts</p>
          </div>
        </div>
        <Link
          href="/dashboard/stripe-connect"
          className="rounded-lg bg-pd-purple/20 px-4 py-2 text-sm font-medium text-pd-purple-light hover:bg-pd-purple/30"
        >
          Set Up Payouts
        </Link>
      </div>

      {/* Claims Breakdown */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Offer Claims</h3>
        {claims.length === 0 ? (
          <div className="mt-4 py-8 text-center text-gray-500">
            <DollarSign className="mx-auto h-10 w-10 text-gray-600" />
            <p className="mt-3">No earnings yet. Revenue from Smart Offer claims will appear here.</p>
            <Link
              href="/dashboard/offers"
              className="mt-4 inline-block rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
            >
              Create a Smart Offer
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-gray-400">Offer</th>
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Gross</th>
                  <th className="pb-3 text-gray-400">Platform Fee</th>
                  <th className="pb-3 text-gray-400">Net</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim: any) => (
                  <tr key={claim.id} className="border-b border-white/5">
                    <td className="py-3 text-white">{(claim.offers as any)?.title || "Offer"}</td>
                    <td className="py-3 text-gray-400">{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-white">{formatCurrency(claim.amount_paid || 0)}</td>
                    <td className="py-3 text-red-400">-{formatCurrency(claim.platform_share_amount || 0)}</td>
                    <td className="py-3 font-medium text-green-400">
                      {formatCurrency((claim.amount_paid || 0) - (claim.platform_share_amount || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
