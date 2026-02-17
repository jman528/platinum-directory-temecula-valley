"use client";

import { useState } from "react";
import { Search, Shield, Check, ArrowRight } from "lucide-react";

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-lg">
        {/* Steps Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= s ? "bg-pd-blue text-white" : "bg-pd-card text-gray-500"
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? "text-white" : "text-gray-500"}`}>
                {s === 1 ? "Business Info" : s === 2 ? "Verify" : "Complete"}
              </span>
              {s < 3 && <ArrowRight className="h-4 w-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {step === 1 && (
            <>
              <h2 className="font-heading text-2xl font-bold text-white">Claim Your Business</h2>
              <p className="mt-2 text-gray-400">Search for your business and claim it to manage your listing.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Business Name</label>
                  <div className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-3">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Search for your business..."
                      className="w-full bg-transparent py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Your Name</label>
                  <input type="text" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Business Email</label>
                  <input type="email" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Phone Number</label>
                  <input type="tel" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-white focus:border-pd-blue focus:outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" required className="rounded" />
                  I am the owner or authorized representative
                </label>
                <button onClick={() => setStep(2)} className="w-full rounded-lg bg-pd-blue py-2 font-medium text-white hover:bg-pd-blue-dark">
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-heading text-2xl font-bold text-white">Verify Your Identity</h2>
              <p className="mt-2 text-gray-400">We&apos;ll send a verification code to confirm ownership.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-pd-purple/10 p-4 text-center">
                  <Shield className="mx-auto h-8 w-8 text-pd-purple" />
                  <p className="mt-2 text-sm text-gray-300">A verification code will be sent to your email</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Verification Code</label>
                  <input type="text" placeholder="Enter 6-digit code" className="w-full rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-center text-lg tracking-widest text-white focus:border-pd-blue focus:outline-none" />
                </div>
                <button onClick={() => setStep(3)} className="w-full rounded-lg bg-pd-blue py-2 font-medium text-white hover:bg-pd-blue-dark">
                  Verify & Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">Business Claimed!</h2>
              <p className="mt-2 text-gray-400">
                Your business has been claimed. Complete your profile in the dashboard.
              </p>
              <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-pd-gold px-6 py-3 font-medium text-pd-dark hover:bg-pd-gold-light">
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
