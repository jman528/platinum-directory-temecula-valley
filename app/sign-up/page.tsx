"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    setError("");

    // Get referral code from cookie
    const refCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pd_ref="));
    const referredBy = refCookie?.split("=")[1] || undefined;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          referred_by: referredBy,
          terms_accepted: termsAccepted,
          marketing_consent: marketingConsent,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "facebook" | "apple") {
    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return (
      <div className="premium-bg flex min-h-screen items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Mail className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Check your email</h2>
          <p className="text-gray-400">
            We sent a verification link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/sign-in" className="mt-6 inline-block text-pd-purple-light hover:text-pd-gold transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Platinum Directory" width={56} height={56} className="logo-glow mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          <p className="mt-1 text-gray-400">Join Platinum Directory Temecula Valley</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={() => handleOAuth("google")}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all hover:border-white/20 hover:bg-white/10"
        >
          <Chrome className="h-5 w-5" />
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0f172a] px-4 text-gray-500">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-pd-purple/50 focus:outline-none focus:ring-1 focus:ring-pd-purple/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-pd-purple/50 focus:outline-none focus:ring-1 focus:ring-pd-purple/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-white placeholder:text-gray-600 focus:border-pd-purple/50 focus:outline-none focus:ring-1 focus:ring-pd-purple/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Required Terms Consent */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-transparent accent-pd-purple"
            />
            <span className="text-sm text-gray-300">
              I agree to the{" "}
              <Link href="/legal/terms" className="text-pd-purple-light hover:underline" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-pd-purple-light hover:underline" target="_blank">
                Privacy Policy
              </Link>
              <span className="text-red-400"> *</span>
            </span>
          </label>

          {/* Optional Marketing Consent */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-transparent accent-pd-purple"
            />
            <span className="text-sm text-gray-400">
              I agree to receive account updates and marketing communications via email and SMS from Platinum Directory. You can opt out anytime.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue py-3 font-semibold text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-pd-purple-light hover:text-pd-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
