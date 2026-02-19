import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Shield, Crown, Zap, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Win a FREE $3,500 Platinum Elite Package",
  description: "Every paying Platinum Directory member is automatically entered to win a complete Platinum Elite advertising package.",
};

export default async function BusinessSweepstakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let tier: string | null = null;
  if (user) {
    const { data: biz } = await supabase
      .from("businesses")
      .select("tier")
      .eq("owner_user_id", user.id)
      .limit(1)
      .single();
    tier = biz?.tier || null;
  }
  const isPaidTier = tier && ["verified_platinum", "platinum_partner", "platinum_elite"].includes(tier);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pd-purple/20">
          <Trophy className="h-8 w-8 text-pd-purple" />
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-white">
          Win a FREE <span className="text-pd-gold">$3,500</span> Platinum Elite Package
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Every paying member is automatically entered. Upgrade your plan to enter.
        </p>
      </div>

      {/* Prize Details */}
      <div className="mx-auto mt-12 max-w-xl glass-card p-8">
        <h2 className="font-heading text-xl font-bold text-pd-gold text-center">Prize Includes:</h2>
        <div className="mt-6 space-y-3">
          {[
            "Featured placement across all directory pages",
            "Paid traffic campaigns managed by our team",
            "Dedicated promotion & content creation",
            "Category exclusivity in your area",
            "White Label CRM access",
            "Professional photo/video production",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-pd-gold" />
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-3xl font-bold text-pd-gold">Value: $3,500/month</p>
      </div>

      {/* Entry Status */}
      <div className="mx-auto mt-8 max-w-xl text-center">
        {!user ? (
          <div className="glass-card p-8">
            <p className="text-lg text-gray-300">Sign in to check your eligibility</p>
            <Link href="/sign-in" className="mt-4 inline-block rounded-lg bg-pd-blue px-6 py-3 font-medium text-white hover:bg-pd-blue-dark">
              Sign In
            </Link>
          </div>
        ) : isPaidTier ? (
          <div className="glass-card border-pd-gold/30 p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pd-gold/20">
              <Trophy className="h-8 w-8 text-pd-gold" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-pd-gold">You&apos;re Entered!</h2>
            <p className="mt-2 text-gray-400">
              As a <span className="capitalize text-white">{tier?.replace(/_/g, " ")}</span> member, you&apos;re automatically entered.
            </p>
            <p className="mt-4 text-sm text-gray-500">Drawing held monthly. Winner notified via email.</p>
          </div>
        ) : (
          <div className="glass-card p-8">
            <p className="text-lg text-gray-300">You need a paid plan to enter</p>
            <p className="mt-2 text-sm text-gray-400">
              Subscribe to Verified ($99/mo), Partner ($799/mo), or Elite ($3,500/mo) to be automatically entered.
            </p>
            <Link href="/pricing" className="mt-4 inline-block rounded-lg bg-pd-gold px-6 py-3 font-medium text-pd-dark hover:bg-pd-gold-light">
              Upgrade to Enter
            </Link>
          </div>
        )}
      </div>

      {/* Eligible Tiers */}
      <div className="mx-auto mt-12 max-w-2xl">
        <h3 className="text-center font-heading text-xl font-bold text-white">Eligible Plans</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-card p-4 text-center">
            <Shield className="mx-auto h-8 w-8 text-pd-blue" />
            <p className="mt-2 font-heading font-semibold text-white">Verified Platinum</p>
            <p className="text-sm text-pd-gold">$99/mo</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Zap className="mx-auto h-8 w-8 text-pd-blue" />
            <p className="mt-2 font-heading font-semibold text-white">Platinum Partner</p>
            <p className="text-sm text-pd-gold">$799/mo</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Crown className="mx-auto h-8 w-8 text-pd-purple" />
            <p className="mt-2 font-heading font-semibold text-white">Platinum Elite</p>
            <p className="text-sm text-pd-gold">$3,500/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
