import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container py-16">
      <h1 className="font-heading text-4xl font-bold text-white">Terms of Service</h1>
      <div className="mt-8 max-w-3xl space-y-6 text-gray-300">
        <p>Last updated: February 2026</p>
        <h2 className="font-heading text-xl font-bold text-white">Acceptance of Terms</h2>
        <p>By accessing Platinum Directory, you agree to these terms. If you do not agree, please do not use our services.</p>
        <h2 className="font-heading text-xl font-bold text-white">Business Listings</h2>
        <p>Business owners are responsible for the accuracy of their listing information. Platinum Directory reserves the right to remove or modify listings that violate our policies.</p>
        <h2 className="font-heading text-xl font-bold text-white">Giveaway Rules</h2>
        <p>Consumer giveaways are open to Temecula Valley residents. Business sweepstakes require an active paid subscription. See individual giveaway pages for complete rules.</p>
        <h2 className="font-heading text-xl font-bold text-white">Subscriptions</h2>
        <p>Paid plans are billed through GoHighLevel. Cancellation policies are governed by the payment terms agreed to at signup.</p>
      </div>
    </div>
  );
}
