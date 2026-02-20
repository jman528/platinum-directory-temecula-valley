import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DollarSign, Users, TrendingUp, Clock, Link2, Copy, Share2
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default async function AffiliatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Check if user is an affiliate
  const { data: referralCode } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!referralCode) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Affiliate Program</h1>
        <div className="mt-8 glass-card p-8 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-500" />
          <h3 className="mt-4 text-xl font-bold text-white">Join Our Affiliate Program</h3>
          <p className="mt-2 text-gray-400">
            Earn commissions by referring businesses to the Platinum Directory.
            Get 5% of subscription revenue for every business you refer.
          </p>
          <Link
            href="/partners"
            className="mt-6 inline-block rounded-lg bg-pd-gold px-6 py-3 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light"
          >
            Apply to Become an Affiliate
          </Link>
        </div>
      </div>
    );
  }

  const code = referralCode.code || "";
  const referralUrl = `https://platinumdirectorytemeculavalley.com?ref=${code}`;

  // Fetch referral stats
  const { data: referrals } = await supabase
    .from("referral_tracking")
    .select("*, businesses(name, tier, subscription_status)")
    .eq("referrer_user_id", user.id)
    .order("created_at", { ascending: false });

  const referralList = referrals || [];
  const activeSubscribers = referralList.filter(
    (r: any) => (r.businesses as any)?.subscription_status === "active"
  );

  // Commission calculations (placeholder values)
  const totalCommission = 0;
  const pendingCommission = 0;
  const availableCommission = 0;
  const totalPaidOut = 0;

  const statCards = [
    {
      label: "Total Commissions",
      value: formatCurrency(totalCommission),
      sub: "Lifetime earnings",
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Active Referrals",
      value: String(activeSubscribers.length),
      sub: "Subscribers from your link",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending (30-day hold)",
      value: formatCurrency(pendingCommission),
      sub: "Awaiting clearance",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Available to Withdraw",
      value: formatCurrency(availableCommission),
      sub: "Ready for payout",
      icon: TrendingUp,
      color: "text-pd-gold",
      bg: "bg-pd-gold/10",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Affiliate Dashboard</h1>
      <p className="mt-1 text-gray-400">Track referrals, commissions, and payouts</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="mt-6 glass-card p-6">
        <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <Link2 className="h-5 w-5 text-pd-gold" /> Your Affiliate Link
        </h3>
        <div className="mt-3 flex gap-2">
          <input
            readOnly
            value={referralUrl}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
          />
          <button
            onClick={() => navigator.clipboard?.writeText(referralUrl)}
            className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Share this link to earn 5% commission on all subscription revenue from referred businesses.
        </p>
      </div>

      {/* Commission Lifecycle */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Commission Lifecycle</h3>
        <div className="mt-4 flex items-center justify-between text-xs">
          {["Purchase", "Held (30 days)", "Available", "Request Payout", "Paid"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pd-purple/20 text-xs font-bold text-pd-purple-light">
                {i + 1}
              </div>
              <span className="hidden text-gray-400 sm:inline">{step}</span>
              {i < 4 && <span className="hidden text-gray-600 sm:inline">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-heading text-lg font-bold text-white">Referral History</h3>
        {referralList.length === 0 ? (
          <div className="mt-4 py-8 text-center text-gray-500">
            No referrals yet. Share your link to get started!
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-gray-400">Business</th>
                  <th className="pb-3 text-gray-400">Plan</th>
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {referralList.map((ref: any) => (
                  <tr key={ref.id} className="border-b border-white/5">
                    <td className="py-3 text-white">{(ref.businesses as any)?.name || "—"}</td>
                    <td className="py-3 text-gray-400 capitalize">
                      {((ref.businesses as any)?.tier || "free").replace(/_/g, " ")}
                    </td>
                    <td className="py-3 text-gray-500">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        (ref.businesses as any)?.subscription_status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {(ref.businesses as any)?.subscription_status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request */}
      <div className="mt-6 glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Request Payout</h3>
            <p className="text-sm text-gray-400">Minimum payout: $25.00</p>
          </div>
          <button
            disabled={availableCommission < 25}
            className="rounded-lg bg-pd-gold px-4 py-2 text-sm font-semibold text-pd-dark hover:bg-pd-gold-light disabled:opacity-50"
          >
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );
}
