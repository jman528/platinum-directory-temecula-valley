"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AffiliateApplicationForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    website: "",
    promotion_method: "",
    expected_referrals: "",
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.agreed) {
      setError("Please fill in all required fields and agree to terms.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Check if user exists
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Update existing profile to affiliate
        await supabase
          .from("profiles")
          .update({
            user_type: "affiliate",
            affiliate_status: "pending",
            full_name: form.full_name,
            phone: form.phone || null,
          })
          .eq("id", user.id);
      } else {
        // Create a sign-up with affiliate role
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: crypto.randomUUID().slice(0, 16),
          options: {
            data: {
              full_name: form.full_name,
              user_type: "affiliate",
            },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setSubmitting(false);
          return;
        }
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h3 className="mt-4 font-heading text-xl font-bold text-white">Application Received!</h3>
        <p className="mt-2 text-gray-400">We&apos;ll review your application within 24 hours and send you an email.</p>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-400">Full Name *</label>
        <input
          type="text"
          value={form.full_name}
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          placeholder="Your full name"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-400">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-400">Phone (optional)</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="(951) 555-1234"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-400">Website / Social Media (optional)</label>
        <input
          type="text"
          value={form.website}
          onChange={e => setForm({ ...form, website: e.target.value })}
          placeholder="https://yourwebsite.com or @handle"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-400">How do you plan to promote?</label>
        <select
          value={form.promotion_method}
          onChange={e => setForm({ ...form, promotion_method: e.target.value })}
          className={inputClass}
        >
          <option value="" className="bg-pd-dark">Select...</option>
          <option value="social_media" className="bg-pd-dark">Social Media</option>
          <option value="blog" className="bg-pd-dark">Blog / Website</option>
          <option value="in_person" className="bg-pd-dark">In Person</option>
          <option value="email" className="bg-pd-dark">Email Marketing</option>
          <option value="other" className="bg-pd-dark">Other</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-400">Expected monthly referrals</label>
        <select
          value={form.expected_referrals}
          onChange={e => setForm({ ...form, expected_referrals: e.target.value })}
          className={inputClass}
        >
          <option value="" className="bg-pd-dark">Select...</option>
          <option value="1-5" className="bg-pd-dark">1-5</option>
          <option value="5-10" className="bg-pd-dark">5-10</option>
          <option value="10-25" className="bg-pd-dark">10-25</option>
          <option value="25+" className="bg-pd-dark">25+</option>
        </select>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={e => setForm({ ...form, agreed: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-pd-dark text-pd-blue"
        />
        <span className="text-sm text-gray-400">
          I agree to the{" "}
          <Link href="/legal/affiliate" className="text-pd-purple-light hover:underline">
            Affiliate Program Terms
          </Link>
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-glow w-full rounded-xl bg-pd-gold px-6 py-3 font-heading text-sm font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light disabled:opacity-50"
      >
        {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Submit Application"}
      </button>
    </form>
  );
}
