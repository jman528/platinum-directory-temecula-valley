"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Chrome } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="premium-bg flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-pd-purple border-t-transparent" /></div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "facebook" | "apple") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="premium-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Platinum Directory" width={56} height={56} className="logo-glow mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-1 text-gray-400">Sign in to Platinum Directory</p>
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
            <span className="bg-[#0f172a] px-4 text-gray-500">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm text-gray-400">Password</label>
              <Link href="/auth/reset-password" className="text-xs text-pd-purple-light hover:text-pd-gold transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue py-3 font-semibold text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-pd-purple-light hover:text-pd-gold transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
