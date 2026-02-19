"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  CheckCircle,
  FileText,
  Pen,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type Step = "terms" | "signature" | "confirmation";

export default function ClaimBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const [businessId, setBusinessId] = useState("");
  const [business, setBusiness] = useState<any>(null);
  const [step, setStep] = useState<Step>("terms");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    params.then((p) => setBusinessId(p.businessId));
  }, [params]);

  useEffect(() => {
    if (!businessId) return;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/sign-in?redirect=/claim/${businessId}`;
        return;
      }
      setUser(user);

      const { data: biz } = await supabase
        .from("businesses")
        .select("id, name, slug, city, state, tier, is_claimed, claimed_by")
        .eq("id", businessId)
        .single();

      if (!biz) {
        setError("Business not found.");
        setLoading(false);
        return;
      }
      if (biz.is_claimed) {
        setError("This business has already been claimed.");
        setLoading(false);
        return;
      }
      setBusiness(biz);
      setLoading(false);
    }
    load();
  }, [businessId]);

  async function handleSubmitClaim() {
    if (!termsAccepted || !signature.trim() || !user) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          ownerName: signature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to claim business. Please try again.");
        setSubmitting(false);
        return;
      }

      setStep("confirmation");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="premium-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="premium-bg flex min-h-screen items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-xl font-bold text-white">{error}</h1>
          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-pd-blue px-6 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-bg min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Platinum Directory"
              width={56}
              height={56}
              className="logo-glow mx-auto"
            />
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[
            { key: "terms", label: "Terms", icon: FileText },
            { key: "signature", label: "Signature", icon: Pen },
            { key: "confirmation", label: "Done", icon: CheckCircle },
          ].map(({ key, label, icon: Icon }, i) => {
            const steps: Step[] = ["terms", "signature", "confirmation"];
            const current = steps.indexOf(step);
            const stepIdx = steps.indexOf(key as Step);
            const isActive = stepIdx <= current;
            return (
              <div key={key} className="flex items-center gap-4">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${isActive ? "bg-pd-gold" : "bg-white/10"}`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isActive ? "border-pd-gold bg-pd-gold/20 text-pd-gold" : "border-white/10 text-gray-500"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs ${isActive ? "text-pd-gold" : "text-gray-500"}`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Business Info */}
        <div className="glass-card mb-6 p-4">
          <p className="text-sm text-gray-400">Claiming business:</p>
          <h2 className="font-heading text-lg font-bold text-white">
            {business?.name}
          </h2>
          {business?.city && (
            <p className="text-sm text-gray-400">
              {business.city}, {business.state}
            </p>
          )}
        </div>

        {/* Step 1: Terms */}
        {step === "terms" && (
          <div className="glass-card p-6">
            <h2 className="font-heading text-xl font-bold text-white">
              Business Listing Terms
            </h2>
            <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-white/5 bg-pd-dark/60 p-4 text-sm text-gray-300">
              <p className="mb-3">
                By claiming this business on Platinum Directory, you agree to
                the following:
              </p>
              <ol className="list-decimal space-y-2 pl-4">
                <li>
                  You are an authorized representative of this business.
                </li>
                <li>
                  All information you provide is accurate and truthful.
                </li>
                <li>
                  You agree to the{" "}
                  <Link
                    href="/legal/business-terms"
                    className="text-pd-blue hover:underline"
                    target="_blank"
                  >
                    Business Listing Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/terms"
                    className="text-pd-blue hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                  .
                </li>
                <li>
                  Platinum Directory may verify your ownership and reserves the
                  right to revoke claims made fraudulently.
                </li>
                <li>
                  You consent to receiving business-related communications from
                  Platinum Directory.
                </li>
                <li>
                  Smart Offer transactions are subject to the{" "}
                  <Link
                    href="/legal/smart-offers"
                    className="text-pd-blue hover:underline"
                    target="_blank"
                  >
                    Smart Offers Terms
                  </Link>
                  .
                </li>
              </ol>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue"
              />
              <span className="text-sm text-gray-300">
                I confirm that I am an authorized representative and I accept
                the{" "}
                <Link
                  href="/legal/business-terms"
                  className="text-pd-blue hover:underline"
                  target="_blank"
                >
                  Business Listing Terms
                </Link>
                ,{" "}
                <Link
                  href="/legal/terms"
                  className="text-pd-blue hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>
                , and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-pd-blue hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              onClick={() => setStep("signature")}
              disabled={!termsAccepted}
              className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pd-blue py-3 font-semibold text-white transition-all hover:bg-pd-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Signature */}
        {step === "signature" && (
          <div className="glass-card p-6">
            <h2 className="font-heading text-xl font-bold text-white">
              Digital Signature
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Type your full legal name below to sign the Business Listing
              Agreement.
            </p>

            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name"
              className="mt-4 w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-3 text-lg text-white placeholder:text-gray-500 focus:border-pd-gold focus:outline-none"
              style={{ fontFamily: "cursive" }}
            />

            {signature && (
              <div className="mt-4 rounded-lg border border-pd-gold/20 bg-pd-gold/5 p-4 text-center">
                <p className="text-xs text-gray-400">Your signature:</p>
                <p
                  className="mt-1 text-2xl text-pd-gold"
                  style={{ fontFamily: "cursive" }}
                >
                  {signature}
                </p>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep("terms")}
                className="flex items-center gap-2 rounded-xl border border-pd-purple/20 px-4 py-3 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={!signature.trim() || submitting}
                className="btn-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-pd-gold py-3 font-semibold text-pd-dark transition-all hover:bg-pd-gold-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="h-5 w-5" /> Claim Business
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Business Claimed!
            </h2>
            <p className="mt-2 text-gray-400">
              You have successfully claimed{" "}
              <span className="font-medium text-white">{business?.name}</span>.
              You can now manage your listing from your dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="btn-glow rounded-xl bg-pd-blue px-8 py-3 font-semibold text-white hover:bg-pd-blue-dark"
              >
                Go to Dashboard
              </Link>
              <Link
                href={`/business/${business?.slug}`}
                className="rounded-xl border border-pd-purple/20 px-8 py-3 text-sm text-gray-300 hover:border-pd-gold/40 hover:text-white"
              >
                View Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
