"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, FileText, CheckCircle } from "lucide-react";
import DigitalSignature, { type SignatureData } from "@/components/agreements/DigitalSignature";

const TIER_CONFIG: Record<string, { name: string; monthly: number; setup: number; offerFee: string }> = {
  "platinum-partner": { name: "Platinum Partner", monthly: 799, setup: 1000, offerFee: "25%" },
  "platinum-elite": { name: "Platinum Elite", monthly: 3500, setup: 1500, offerFee: "25%" },
};

const SERVICES: Record<string, string[]> = {
  "platinum-partner": [
    "Verified and enhanced business listing with photos, video, and description",
    "Smart Offer creation and management with 25% platform fee",
    "Lead generation, tracking, and real-time notifications",
    "AI-powered business assistant for listing optimization",
    "Analytics dashboard with visitor and engagement data",
    "Google Maps integration and SEO backlinks",
    "Priority placement in search results",
    "Weekly performance reports",
  ],
  "platinum-elite": [
    "Everything in Platinum Partner, plus:",
    "Category near-exclusivity (max 3 businesses per category)",
    "Smart Offer creation and management with 25% platform fee",
    "Dedicated account manager",
    "Custom landing page design",
    "Featured placement on homepage and category pages",
    "Advanced AI analytics and competitor insights",
    "Priority support with 2-hour response time",
    "Quarterly strategy review sessions",
    "Premium badge and enhanced listing visibility",
  ],
};

export default function AgreementPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = use(params);
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business_id");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const config = TIER_CONFIG[tier];

  if (!config) {
    return (
      <div className="min-h-screen bg-pd-dark flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-lg text-white">Invalid membership tier.</p>
          <a href="/pricing" className="mt-4 inline-block text-pd-gold hover:underline">
            View available plans
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(data: SignatureData) {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/agreements/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          business_id: businessId,
          ...data,
          user_agent: navigator.userAgent,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to process agreement");
        setSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-pd-dark">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pd-gold/10">
            <Shield className="h-8 w-8 text-pd-gold" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Membership Agreement
          </h1>
          <p className="mt-2 text-gray-400">
            {config.name} &mdash; ${config.monthly.toLocaleString()}/month
          </p>
        </div>

        {/* Agreement Document */}
        <div className="glass-card border-pd-gold/20 p-6 sm:p-10">
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1: Parties */}
            <section>
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-pd-gold">
                <FileText className="h-5 w-5" /> 1. Parties
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                This Membership Agreement (&ldquo;Agreement&rdquo;) is between Platinum Directory
                (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by PDTV LLC,
                and the undersigned business (&ldquo;Member&rdquo;, &ldquo;you&rdquo;).
                This Agreement is effective as of the date of electronic signature below.
              </p>
            </section>

            {/* Section 2: Membership Tier & Pricing */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">2. Membership Tier & Pricing</h2>
              <div className="rounded-lg bg-white/[0.03] p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Membership Tier</span>
                    <span className="font-medium text-white">{config.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Price</span>
                    <span className="font-medium text-white">${config.monthly.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">One-Time Setup Fee</span>
                    <span className="font-medium text-white">${config.setup.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Smart Offer Platform Fee</span>
                    <span className="font-medium text-white">{config.offerFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Billing Cycle</span>
                    <span className="font-medium text-white">Monthly, auto-renewing</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Services Provided */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">3. Services Provided</h2>
              <ul className="space-y-2">
                {(SERVICES[tier] || []).map((service, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                    {service}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4: Smart Offer Terms */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">4. Smart Offer Terms</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>
                  The platform fee for Smart Offers at your tier is <strong className="text-white">{config.offerFee}</strong> of
                  each transaction. An additional 5% affiliate referral fee may apply when sales are generated through
                  affiliate referrals.
                </p>
                <p>
                  Payouts are processed via Stripe. Funds are held for 7 days after purchase, then released to your
                  connected Stripe account.
                </p>
                <p>
                  Member is responsible for honoring all purchased vouchers and Smart Offers. Refund requests from
                  consumers are handled on a case-by-case basis.
                </p>
              </div>
            </section>

            {/* Section 5: Disclaimers */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">5. Disclaimers & Limitations</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>We do not guarantee any specific number of leads, customers, or revenue.</p>
                <p>Results vary based on business type, market conditions, and member engagement.</p>
                <p>Member is responsible for the quality of their products and services.</p>
                <p>We are not liable for any losses arising from use of the platform.</p>
              </div>
            </section>

            {/* Section 6: Hold Harmless */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">6. Hold Harmless & Indemnification</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>
                  Member agrees to hold Company harmless from any claims arising from Member&apos;s products,
                  services, or business operations.
                </p>
                <p>
                  Member agrees to indemnify Company against any third-party claims related to
                  Member&apos;s use of the platform, Smart Offers, or representations made therein.
                </p>
              </div>
            </section>

            {/* Section 7: Dispute Resolution */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">7. Dispute Resolution</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>
                  Any disputes arising from this Agreement shall be resolved through binding arbitration
                  in Riverside County, California.
                </p>
                <p>This Agreement shall be governed by the laws of the State of California.</p>
                <p>
                  Prior to initiating arbitration, the parties agree to provide 30 days written notice
                  and attempt to resolve the dispute informally.
                </p>
              </div>
            </section>

            {/* Section 8: Cancellation */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">8. Cancellation</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>Member may cancel at any time with 30 days written notice.</p>
                <p>No refunds are provided for partial months of service.</p>
                <p>Setup fees are non-refundable.</p>
                <p>
                  Active Smart Offer obligations continue until all purchased vouchers are fulfilled
                  or refunded.
                </p>
              </div>
            </section>

            {/* Section 9: Data & Privacy */}
            <section>
              <h2 className="font-heading text-lg font-bold text-pd-gold">9. Data & Privacy</h2>
              <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>We collect business data for listing and marketing purposes.</p>
                <p>
                  Customer data from Smart Offer purchases is shared with the Member for fulfillment
                  purposes.
                </p>
                <p>We may use anonymized, aggregate data for platform improvements and reporting.</p>
              </div>
            </section>

            {/* Section 10: Signature */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="font-heading text-lg font-bold text-pd-gold">10. Electronic Signature</h2>
              <p className="mb-6 text-sm text-gray-400">
                Date: {today}
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <DigitalSignature
                tier={tier}
                monthlyPrice={config.monthly}
                setupFee={config.setup}
                businessName=""
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>Platinum Directory Temecula Valley &mdash; PDTV LLC</p>
          <p className="mt-1">platinumdirectorytemeculavalley.com</p>
        </div>
      </div>
    </div>
  );
}
