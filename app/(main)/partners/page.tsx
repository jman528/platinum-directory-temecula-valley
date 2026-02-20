import Link from "next/link";
import {
  Handshake, Link2, Share2, DollarSign, ArrowRight,
  TrendingUp, Users, Shield, ChevronDown, Clock, CreditCard, QrCode,
} from "lucide-react";
import type { Metadata } from "next";
import AffiliateApplicationForm from "@/components/AffiliateApplicationForm";

export const metadata: Metadata = {
  title: "Become a Partner | Platinum Directory",
  description: "Earn commissions by promoting Temecula Valley businesses. Join the Platinum Directory affiliate program.",
};

const COMMISSION_TABLE = [
  { tier: "Verified Platinum", price: "$99/mo", commission: "$4.95/mo", annual: "$59.40/yr" },
  { tier: "Platinum Partner", price: "$799/mo", commission: "$39.95/mo", annual: "$479.40/yr" },
  { tier: "Platinum Elite", price: "$3,500/mo", commission: "$175/mo", annual: "$2,100/yr" },
];

const FAQS = [
  { q: "How do I earn commissions?", a: "Share your unique referral link. When someone signs up or a business subscribes through your link, you earn a commission on their subscription fees." },
  { q: "When do I get paid?", a: "Commissions are paid out monthly via Stripe, PayPal, or Venmo once you reach the $50 minimum threshold." },
  { q: "Is there a cost to join?", a: "No! The affiliate program is completely free to join. Sign up and start earning immediately." },
  { q: "Can I promote on social media?", a: "Absolutely! Share your link on social media, blogs, email newsletters, or any channel you prefer. We provide marketing materials to help." },
  { q: "Do I earn recurring commissions?", a: "Yes! You earn recurring commissions for as long as the businesses you refer remain active subscribers." },
];

export default function PartnersPage() {
  return (
    <div className="premium-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5 py-20" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.12), rgba(212,175,55,0.1))" }}>
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-gold/20">
            <Handshake className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">
            Earn Money Promoting Temecula Valley <span className="text-gold-shimmer">Businesses</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join our affiliate program and earn 5% recurring commissions on every paid subscription you refer.
          </p>
          <a
            href="#apply"
            className="btn-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-8 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
          >
            Apply Now — It&apos;s Free <ArrowRight className="h-4 w-4" />
          </a>
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
            { step: "1", title: "Apply & Get Approved", desc: "Submit your application — review takes 24 hours.", icon: Link2 },
            { step: "2", title: "Share Your Unique Links", desc: "We give you referral links for every page on the directory.", icon: Share2 },
            { step: "3", title: "Earn 5% on Every Subscription", desc: "Recurring monthly, for the life of the customer.", icon: DollarSign },
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

        {/* Commission Details */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">Commission Details</h2>
          <p className="mt-2 text-gray-400">5% recurring on every subscription you refer</p>
        </div>
        <div className="mt-10 glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4 text-gray-400">Tier</th>
                <th className="px-6 py-4 text-gray-400">Monthly Price</th>
                <th className="px-6 py-4 text-gray-400">Your 5% Commission</th>
                <th className="px-6 py-4 text-gray-400">Annual Earnings</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TABLE.map((row) => (
                <tr key={row.tier} className="border-b border-white/5">
                  <td className="px-6 py-4 font-medium text-white">{row.tier}</td>
                  <td className="px-6 py-4 text-gray-400">{row.price}</td>
                  <td className="px-6 py-4 font-semibold text-pd-gold">{row.commission}</td>
                  <td className="px-6 py-4 font-bold text-green-400">{row.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Program Details */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Clock, title: "90-Day Cookie", desc: "Attribution window" },
            { icon: Shield, title: "30-Day Hold", desc: "Refund protection" },
            { icon: CreditCard, title: "$25 Minimum", desc: "Monthly payouts via Stripe" },
            { icon: TrendingUp, title: "Real-Time Dashboard", desc: "Track clicks & conversions" },
            { icon: Link2, title: "Pre-Built Links", desc: "For every page on the site" },
            { icon: QrCode, title: "QR Codes", desc: "For in-person referrals" },
          ].map((item) => (
            <div key={item.title} className="glass-card p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pd-purple/15">
                <item.icon className="h-5 w-5 text-pd-purple-light" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
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

        {/* Application Form */}
        <div id="apply" className="mt-20 glass-card p-10">
          <h2 className="text-center font-heading text-2xl font-bold text-white">Apply to Become a Partner</h2>
          <p className="mt-2 text-center text-gray-400">Free to join — we&apos;ll review within 24 hours</p>
          <div className="mx-auto mt-8 max-w-lg">
            <AffiliateApplicationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
