"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";

const TIERS = [
  { value: "free", label: "Free" },
  { value: "verified_platinum", label: "Verified Platinum" },
  { value: "platinum_partner", label: "Platinum Partner" },
  { value: "platinum_elite", label: "Platinum Elite" },
];

const CLAIM_STATUSES = [
  { value: "unclaimed", label: "Unclaimed" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [businessId, setBusinessId] = useState("");
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    params.then((p) => setBusinessId(p.id));
  }, [params]);

  useEffect(() => {
    if (!businessId) return;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (
        profile?.user_type !== "admin" &&
        profile?.user_type !== "super_admin"
      ) {
        window.location.href = "/dashboard";
        return;
      }
      setAuthorized(true);

      const { data: biz, error: fetchError } = await supabase
        .from("businesses")
        .select("*, categories(name, slug)")
        .eq("id", businessId)
        .single();

      if (fetchError || !biz) {
        setError("Business not found.");
        setLoading(false);
        return;
      }
      setBusiness(biz);
      setLoading(false);
    }
    load();
  }, [businessId]);

  function updateField(field: string, value: any) {
    setBusiness((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: business.name,
          description: business.description,
          phone: business.phone,
          email: business.email,
          website: business.website,
          address: business.address,
          city: business.city,
          state: business.state,
          zip_code: business.zip_code,
          tier: business.tier,
          is_active: business.is_active,
          is_claimed: business.is_claimed,
          claim_status: business.claim_status,
          is_featured: business.is_featured,
          admin_notes: business.admin_notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This will deactivate the business.")) return;
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/businesses");
      }
    } catch {
      setError("Failed to delete.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pd-purple" />
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <p className="mt-4 text-lg text-white">{error}</p>
        <Link
          href="/admin/businesses"
          className="mt-4 inline-block text-sm text-pd-blue hover:underline"
        >
          Back to businesses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/businesses"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="font-heading text-xl font-bold text-white">
            {business?.name}
          </h2>
          {business?.slug && (
            <Link
              href={`/business/${business.slug}`}
              target="_blank"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" /> Deactivate
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Basic Information
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Business Name
                </label>
                <input
                  type="text"
                  value={business?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Description
                </label>
                <textarea
                  value={business?.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={business?.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={business?.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Website
                </label>
                <input
                  type="url"
                  value={business?.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Location
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Address
                </label>
                <input
                  type="text"
                  value={business?.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    City
                  </label>
                  <input
                    type="text"
                    value={business?.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    State
                  </label>
                  <input
                    type="text"
                    value={business?.state || ""}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={business?.zip_code || ""}
                    onChange={(e) => updateField("zip_code", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Admin */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Status & Tier
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Tier
                </label>
                <select
                  value={business?.tier || "free"}
                  onChange={(e) => updateField("tier", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-pd-dark">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Claim Status
                </label>
                <select
                  value={business?.claim_status || "unclaimed"}
                  onChange={(e) =>
                    updateField("claim_status", e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none"
                >
                  {CLAIM_STATUSES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-pd-dark">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={business?.is_active || false}
                    onChange={(e) =>
                      updateField("is_active", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue"
                  />
                  <span className="text-sm text-gray-300">Active (visible in directory)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={business?.is_claimed || false}
                    onChange={(e) =>
                      updateField("is_claimed", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue"
                  />
                  <span className="text-sm text-gray-300">Claimed</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={business?.is_featured || false}
                    onChange={(e) =>
                      updateField("is_featured", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Owner Info
            </h3>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-400">
                Owner ID:{" "}
                <span className="text-white">
                  {business?.owner_user_id || "None"}
                </span>
              </p>
              <p className="text-gray-400">
                Claimed by:{" "}
                <span className="text-white">
                  {business?.claimed_by || "N/A"}
                </span>
              </p>
              <p className="text-gray-400">
                Created:{" "}
                <span className="text-white">
                  {business?.created_at
                    ? new Date(business.created_at).toLocaleString()
                    : "N/A"}
                </span>
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold text-white">
              Admin Notes
            </h3>
            <textarea
              value={business?.admin_notes || ""}
              onChange={(e) => updateField("admin_notes", e.target.value)}
              rows={4}
              placeholder="Internal notes about this business..."
              className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-pd-purple/40 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
