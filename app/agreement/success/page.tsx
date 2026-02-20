"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const agreementId = searchParams.get("agreement_id");

  return (
    <div className="min-h-screen bg-pd-dark flex items-center justify-center px-4">
      <div className="glass-card border-green-500/20 max-w-lg w-full p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>

        <h1 className="font-heading text-2xl font-bold text-white">
          Agreement Signed Successfully!
        </h1>

        <p className="mt-4 text-gray-400">
          Thank you for joining Platinum Directory Temecula Valley. Your membership agreement has been
          recorded and your payment is being processed.
        </p>

        <div className="mt-6 rounded-lg bg-white/[0.03] p-4 text-sm text-gray-300 space-y-2">
          <p>What happens next:</p>
          <ul className="space-y-1 text-left">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
              A copy of your signed agreement will be emailed to you
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
              Your listing will be upgraded within 24 hours
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
              Our team will reach out for onboarding
            </li>
          </ul>
        </div>

        {agreementId && (
          <p className="mt-4 text-xs text-gray-600">
            Agreement ID: {agreementId}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg bg-pd-gold px-6 py-3 font-medium text-black hover:bg-pd-gold/90"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-gray-400 hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AgreementSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pd-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
