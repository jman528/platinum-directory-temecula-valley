import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Handshake, Link2, Share2, DollarSign, ArrowRight,
  TrendingUp, Users, Shield, ChevronDown,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Partner | Platinum Directory",
  description: "Earn commissions by promoting Temecula Valley businesses. Join the Platinum Directory affiliate program.",
};

const COMMISSION_TIERS = [
  { tier: "Starter", rate: "10%", desc: "0-10 referrals/month", color: "text-pd-blue-light", bg: "bg-pd-blue/10" },
  { tier: "Growth", rate: "15%", desc: "11-50 referrals/month", color: "text-pd-purple-light", bg: "bg-pd-purple/10" },
  { tier: "Pro", rate: "20%", desc: "51+ referrals/month", color: "text-pd-gold", bg: "bg-pd-gold/10" },
];

const FAQS = [
  { q: "How do I earn commissions?", a: "Share your unique referral link. When someone signs up or a business subscribes through your link, you earn a commission on their subscription fees." },
  { q: "When do I get paid?", a: "Commissions are paid out monthly via Stripe, PayPal, or Venmo once you reach the $50 minimum threshold." },
  { q: "Is there a cost to join?", a: "No! The affiliate program is completely free to join. Sign up and start earning immediately." },
  { q: "Can I promote on social media?", a: "Absolutely! Share your link on social media, blogs, email newsletters, or any channel you prefer. We provide marketing materials to help." },
  { q: "Do I earn recurring commissions?", a: "Yes! You earn recurring commissions for as long as the businesses you refer remain active subscribers." },
];

export default async function PartnersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="premium-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 py-20" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.12), rgba(212,175,55,0.1))" }}>
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
            <Handshake className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">
            Become a Platinum Directory <span className="text-gold-shimmer">Partner</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Earn while you promote. Share Temecula Valley&apos;s best businesses and earn commissions on every referral.
          </p>
          <Link
            href="/sign-up?role=affiliate"
            className="btn-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-8 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="container py-16">
        {/* How It Works */}
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-gray-400">Start earning in three simple steps</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Get Your Link", desc: "Sign up and receive your unique referral link and marketing materials.", icon: Link2 },
            { step: "2", title: "Share With Your Audience", desc: "Promote the directory on social media, blogs, email, or in person.", icon: Share2 },
            { step: "3", title: "Earn Commissions", desc: "Get paid every time someone subscribes through your referral link.", icon: DollarSign },
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

        {/* Commission Structure */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">Commission Structure</h2>
          <p className="mt-2 text-gray-400">The more you refer, the more you earn</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {COMMISSION_TIERS.map((tier) => (
            <div key={tier.tier} className="glass-card flex flex-col items-center p-8 text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tier.bg}`}>
                <TrendingUp className={`h-7 w-7 ${tier.color}`} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">{tier.tier}</h3>
              <p className={`mt-2 text-4xl font-bold ${tier.color}`}>{tier.rate}</p>
              <p className="mt-1 text-sm text-gray-500">{tier.desc}</p>
              <p className="mt-3 text-xs text-gray-400">Recurring commissions on all subscription fees</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-20 glass-card p-8">
          <h2 className="text-center font-heading text-2xl font-bold text-white">Why Partner With Us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: DollarSign, title: "Recurring Revenue", desc: "Earn monthly commissions for as long as your referrals stay active" },
              { icon: Shield, title: "Trusted Brand", desc: "Promote the leading business directory in Temecula Valley" },
              { icon: Users, title: "Growing Market", desc: "11 cities, thousands of businesses, millions of visitors" },
              { icon: TrendingUp, title: "Real-Time Tracking", desc: "Monitor clicks, conversions, and earnings in your dashboard" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pd-purple/15">
                  <item.icon className="h-6 w-6 text-pd-purple-light" />
                </div>
                <h3 className="mt-3 font-medium text-white">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Placeholder */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">What Partners Say</h2>
          <p className="mt-2 text-gray-400">Hear from our growing community of partners</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { name: "Coming Soon", quote: "Partner testimonials will be featured here as our affiliate program grows." },
            { name: "Coming Soon", quote: "We're building an amazing community of local promoters and influencers." },
            { name: "Coming Soon", quote: "Join early and be among the first to share your success story." },
          ].map((t, i) => (
            <div key={i} className="glass-card p-6">
              <p className="italic text-gray-400">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-medium text-gray-500">&mdash; {t.name}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="glass-card group cursor-pointer p-4">
              <summary className="flex items-center justify-between font-medium text-white">
                {faq.q}
                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-gray-400">{faq.a}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 glass-card p-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-white">Ready to Start Earning?</h2>
          <p className="mt-2 text-gray-400">Join the Platinum Directory affiliate program today. It&apos;s free.</p>
          <Link
            href="/sign-up?role=affiliate"
            className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-8 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
