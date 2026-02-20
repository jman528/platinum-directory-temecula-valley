/**
 * SUPERADMIN SETUP INSTRUCTIONS:
 * 1. Go to your deployed site and sign up / sign in normally with your email
 * 2. Go to /admin/initial-setup
 * 3. Enter your email and the setup secret from .env.local (SUPERADMIN_SETUP_SECRET)
 * 4. Click "Make Me Superadmin"
 * 5. Sign out and sign back in
 * 6. Navigate to /admin to access the admin panel
 * 7. DELETE this page (app/admin/initial-setup/) and the API route
 *    (app/api/admin/setup-superadmin/) after setup is complete
 */
"use client";

import { useState } from "react";

export default function InitialSetupPage() {
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/admin/setup-superadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setResult("Network error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0612] p-8">
      <div className="glass-card w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold text-white">
          Initial Superadmin Setup
        </h1>
        <p className="text-sm text-white/60">
          One-time use. Delete this page after.
        </p>
        <input
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          placeholder="Email (must have signed up first)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          placeholder="Setup secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button
          onClick={handleSetup}
          disabled={loading || !email || !secret}
          className="w-full rounded-lg bg-pd-gold px-4 py-2 font-semibold text-pd-dark hover:bg-pd-gold-light disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Make Me Superadmin"}
        </button>
        {result && (
          <pre className="overflow-auto rounded-lg bg-white/5 p-4 text-xs text-green-400">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
