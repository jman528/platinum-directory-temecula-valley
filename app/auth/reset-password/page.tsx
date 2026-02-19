"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="premium-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Platinum Directory" width={56} height={56} className="logo-glow mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="mt-1 text-gray-400">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Mail className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-gray-300">Check your email for a password reset link.</p>
            <Link href="/sign-in" className="mt-6 inline-flex items-center gap-2 text-pd-purple-light hover:text-pd-gold transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue py-3 font-semibold text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link href="/sign-in" className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
