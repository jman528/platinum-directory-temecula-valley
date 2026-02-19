import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Gift, Star, Users, Share2, MessageSquare, Award,
  ArrowRight, Trophy, Zap, Crown,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards | Platinum Directory",
  description: "Earn points, unlock rewards, and explore Temecula Valley with the Platinum Directory rewards program.",
};

const EARN_ACTIONS = [
  { icon: Star, label: "Leave a Review", points: "50 pts", desc: "Share your experience at local businesses" },
  { icon: Share2, label: "Share a Deal", points: "25 pts", desc: "Share smart offers with friends and family" },
  { icon: Users, label: "Refer a Friend", points: "100 pts", desc: "Invite friends to join the directory" },
  { icon: MessageSquare, label: "Complete Your Profile", points: "75 pts", desc: "Fill out your profile information" },
  { icon: Zap, label: "Daily Check-In", points: "10 pts", desc: "Visit the directory every day" },
  { icon: Gift, label: "Redeem an Offer", points: "25 pts", desc: "Purchase a smart offer from a local business" },
];

const TIERS = [
  { name: "Bronze", icon: Award, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", points: "0", perks: ["Earn points on activity", "Basic rewards catalog", "Birthday bonus"] },
  { name: "Silver", icon: Trophy, color: "text-gray-300", bg: "bg-gray-300/10", border: "border-gray-300/20", points: "500", perks: ["Everything in Bronze", "1.5x point multiplier", "Early access to deals", "Exclusive offers"] },
  { name: "Gold", icon: Star, color: "text-pd-gold", bg: "bg-pd-gold/10", border: "border-pd-gold/20", points: "2,000", perks: ["Everything in Silver", "2x point multiplier", "VIP event invitations", "Priority support"] },
  { name: "Platinum", icon: Crown, color: "text-pd-purple-light", bg: "bg-pd-purple/10", border: "border-pd-purple/20", points: "5,000", perks: ["Everything in Gold", "3x point multiplier", "Exclusive Platinum perks", "Concierge service", "Annual gift"] },
];

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard/rewards");
  }

  return (
    <div className="premium-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 py-20" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(212,175,55,0.12), rgba(59,130,246,0.08))" }}>
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
            <Gift className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">
            Earn Points. Redeem Rewards. <br className="hidden md:block" />
            <span className="text-gold-shimmer">Explore Temecula.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join the Platinum Directory rewards program and earn points every time you explore, review, and share Temecula Valley businesses.
          </p>
          <Link
            href="/sign-up"
            className="btn-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-8 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Start Earning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="container py-16">
        {/* How It Works */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-gray-400">Three simple steps to start earning rewards</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Sign Up", desc: "Create your free account and join the rewards program instantly.", icon: Users },
            { step: "2", title: "Earn Points", desc: "Leave reviews, share deals, refer friends, and explore businesses.", icon: Zap },
            { step: "3", title: "Redeem Rewards", desc: "Cash in your points for exclusive deals, gift cards, and more.", icon: Gift },
          ].map((item) => (
            <div key={item.step} className="glass-card relative p-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pd-gold px-3 py-0.5 text-xs font-bold text-pd-dark">
                STEP {item.step}
              </div>
              <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pd-purple/15">
                <item.icon className="h-7 w-7 text-pd-purple-light" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Earning Actions */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">Ways to Earn Points</h2>
          <p className="mt-2 text-gray-400">Every action earns you closer to the next reward</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EARN_ACTIONS.map((action) => (
            <div key={action.label} className="glass-card flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-pd-purple/15">
                <action.icon className="h-5 w-5 text-pd-purple-light" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{action.label}</p>
                  <span className="rounded-full bg-pd-gold/15 px-2 py-0.5 text-xs font-bold text-pd-gold">{action.points}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{action.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">Rewards Tiers</h2>
          <p className="mt-2 text-gray-400">Unlock bigger rewards as you level up</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`glass-card flex flex-col border ${tier.border} p-5`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tier.bg}`}>
                <tier.icon className={`h-6 w-6 ${tier.color}`} />
              </div>
              <h3 className={`mt-3 font-heading text-xl font-bold ${tier.color}`}>{tier.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{tier.points}+ points</p>
              <ul className="mt-4 flex-1 space-y-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className={`mt-0.5 ${tier.color}`}>&#10003;</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 glass-card p-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-white">Ready to Start Earning?</h2>
          <p className="mt-2 text-gray-400">Sign up for free and start earning points today.</p>
          <Link
            href="/sign-up"
            className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-8 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
