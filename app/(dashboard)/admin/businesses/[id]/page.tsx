"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, ExternalLink,
  Trash2, Bot, Building2, Phone, Clock, ImageIcon, ToggleLeft,
  Share2, Target, CreditCard, MapPin, Sparkles, FileBarChart, Upload
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { formatPhoneUS, stripPhoneForStorage } from "@/lib/utils/format-phone";

const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), { ssr: false });
const AIAssistantPanel = dynamic(() => import("@/components/admin/AIAssistantPanel"), { ssr: false });

const TIERS = [
  { value: "free", label: "Free" },
  { value: "verified_platinum", label: "Verified Platinum ($99/mo)" },
  { value: "platinum_partner", label: "Platinum Partner ($799/mo)" },
  { value: "platinum_elite", label: "Platinum Elite ($3,500/mo)" },
];

const OUTREACH_STATUSES = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow Up" },
  { value: "appointment_set", label: "Appointment Set" },
  { value: "appointment_completed", label: "Appointment Completed" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
  { value: "not_interested", label: "Not Interested" },
];

const OUTREACH_METHODS = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "in_person", label: "In Person" },
  { value: "social_media", label: "Social Media" },
  { value: "ghl", label: "GoHighLevel" },
  { value: "other", label: "Other" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const AMENITIES_LIST = [
  "WiFi", "Outdoor Seating", "Pet Friendly", "Wheelchair Accessible",
  "Parking Available", "Live Music", "Private Events", "Catering",
  "Takeout", "Delivery", "Reservations Required", "Walk-ins Welcome",
  "Family Friendly", "Happy Hour", "Full Bar", "Wine Tasting",
  "Beer & Wine Only", "Gift Shop", "Wedding Venue", "Corporate Events",
  "Group Tours", "24/7 Service", "Appointment Only", "Online Booking",
  "Credit Cards Accepted", "Cash Only", "Vegan Options",
  "Gluten Free Options", "Farm to Table", "Organic",
];

const TABS = [
  { key: "basic", label: "Basic Info", icon: Building2 },
  { key: "contact", label: "Contact & Location", icon: MapPin },
  { key: "hours", label: "Hours", icon: Clock },
  { key: "media", label: "Images & Media", icon: ImageIcon },
  { key: "amenities", label: "Amenities", icon: ToggleLeft },
  { key: "social", label: "Social Media", icon: Share2 },
  { key: "outreach", label: "Outreach & CRM", icon: Target },
  { key: "subscription", label: "Subscription", icon: CreditCard },
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
  const [activeTab, setActiveTab] = useState("basic");
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showSetupFeeModal, setShowSetupFeeModal] = useState(false);
  const [pendingTier, setPendingTier] = useState("");
  const [setupFeeDiscountCode, setSetupFeeDiscountCode] = useState("");
  const [setupFeeValidating, setSetupFeeValidating] = useState(false);
  const [setupFeeDiscount, setSetupFeeDiscount] = useState<any>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditHtml, setAuditHtml] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Ctrl+K to toggle AI panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setAiPanelOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    params.then((p) => setBusinessId(p.id));
  }, [params]);

  useEffect(() => {
    if (!businessId) return;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/sign-in"; return; }
      const { data: profile } = await supabase
        .from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "admin" && profile?.user_type !== "super_admin") {
        window.location.href = "/dashboard"; return;
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

  function updateSocialMedia(field: string, value: string) {
    setBusiness((prev: any) => ({
      ...prev,
      social_media: { ...(prev?.social_media || {}), [field]: value },
    }));
    setSaved(false);
  }

  function updateHours(day: string, field: string, value: any) {
    setBusiness((prev: any) => ({
      ...prev,
      hours: {
        ...(prev?.hours || {}),
        [day]: { ...(prev?.hours?.[day] || {}), [field]: value },
      },
    }));
    setSaved(false);
  }

  function toggleAmenity(amenity: string) {
    setBusiness((prev: any) => {
      const current = prev?.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter((a: string) => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
    setSaved(false);
  }

  async function handleImageUpload(file: File, field: "cover_image_url" | "logo_url") {
    const setUploading = field === "cover_image_url" ? setUploadingCover : setUploadingLogo;
    setUploading(true);
    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      setUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${businessId}/${field.replace("_url", "")}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("business-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("business-images")
      .getPublicUrl(fileName);

    updateField(field, urlData.publicUrl);
    setUploading(false);
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
          slug: business.slug,
          description: business.description,
          phone: business.phone,
          email: business.email,
          website: business.website,
          address: business.address,
          city: business.city,
          state: business.state,
          zip_code: business.zip_code,
          latitude: business.latitude,
          longitude: business.longitude,
          tier: business.tier,
          is_active: business.is_active,
          is_claimed: business.is_claimed,
          claim_status: business.claim_status,
          is_featured: business.is_featured,
          hours: business.hours,
          amenities: business.amenities,
          social_media: business.social_media,
          outreach_status: business.outreach_status,
          outreach_method: business.outreach_method,
          outreach_notes: business.outreach_notes,
          outreach_last_contacted_at: business.outreach_last_contacted_at,
          outreach_next_follow_up: business.outreach_next_follow_up,
          ghl_contact_id: business.ghl_contact_id,
          google_place_id: business.google_place_id,
          google_maps_url: business.google_maps_url,
          google_business_claimed: business.google_business_claimed,
          setup_fee_status: business.setup_fee_status,
          setup_fee_amount: business.setup_fee_amount,
          discount_code_used: business.discount_code_used,
          video_embeds: business.video_embeds,
          virtual_tour_url: business.virtual_tour_url,
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
      const res = await fetch(`/api/admin/businesses/${businessId}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/businesses");
    } catch {
      setError("Failed to delete.");
    }
  }

  async function handleAiCheck() {
    setAiChecking(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/admin/ai-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business }),
      });
      const data = await res.json();
      setAiResult(data.result || data.error || "No result");
    } catch {
      setAiResult("AI check failed. Try again.");
    } finally {
      setAiChecking(false);
    }
  }

  async function handleGenerateAudit() {
    setAuditLoading(true);
    setAuditHtml(null);
    try {
      const res = await fetch("/api/admin/audit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId }),
      });
      const data = await res.json();
      if (data.audit_html) {
        setAuditHtml(data.audit_html);
        // Open in new window for printing
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(data.audit_html);
          w.document.close();
        }
      } else {
        setAiResult(data.error || "Failed to generate audit");
      }
    } catch {
      setAiResult("Audit generation failed. Try again.");
    } finally {
      setAuditLoading(false);
    }
  }

  const SETUP_FEES: Record<string, number> = {
    verified_platinum: 199,
    platinum_partner: 499,
    platinum_elite: 999,
  };

  function handleTierChange(newTier: string) {
    const fee = SETUP_FEES[newTier] || 0;
    if (fee > 0 && newTier !== business?.tier) {
      setPendingTier(newTier);
      setSetupFeeDiscountCode("");
      setSetupFeeDiscount(null);
      setShowSetupFeeModal(true);
    } else {
      updateField("tier", newTier);
    }
  }

  async function validateSetupFeeDiscount() {
    if (!setupFeeDiscountCode.trim()) return;
    setSetupFeeValidating(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupFeeDiscountCode, applies_to: "setup_fee", tier: pendingTier }),
      });
      const data = await res.json();
      if (data.valid) {
        setSetupFeeDiscount(data.discount);
      } else {
        setSetupFeeDiscount({ error: data.reason });
      }
    } catch {
      setSetupFeeDiscount({ error: "Failed to validate code" });
    } finally {
      setSetupFeeValidating(false);
    }
  }

  function applySetupFee(action: "send_invoice" | "mark_paid" | "waive") {
    const baseFee = SETUP_FEES[pendingTier] || 0;
    let finalAmount = baseFee;
    if (setupFeeDiscount && !setupFeeDiscount.error) {
      if (setupFeeDiscount.discount_type === "percentage") {
        finalAmount = baseFee * (1 - setupFeeDiscount.discount_value / 100);
      } else if (setupFeeDiscount.discount_type === "fixed") {
        finalAmount = Math.max(0, baseFee - setupFeeDiscount.discount_value);
      }
    }

    updateField("tier", pendingTier);
    updateField("setup_fee_amount", finalAmount);
    updateField("discount_code_used", setupFeeDiscount?.code || setupFeeDiscountCode || null);

    if (action === "mark_paid") {
      updateField("setup_fee_status", "paid");
      updateField("setup_fee_paid_at", new Date().toISOString());
    } else if (action === "waive") {
      updateField("setup_fee_status", "waived");
      updateField("setup_fee_amount", 0);
    } else {
      updateField("setup_fee_status", "unpaid");
    }
    setShowSetupFeeModal(false);
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-pd-purple/40 focus:outline-none text-sm";
  const labelClass = "mb-1 block text-sm text-gray-400";

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
        <Link href="/admin/businesses" className="mt-4 inline-block text-sm text-pd-blue hover:underline">
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
          <Link href="/admin/businesses" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="font-heading text-xl font-bold text-white">{business?.name}</h2>
          {business?.slug && (
            <Link href={`/business/${business.slug}`} target="_blank" className="text-gray-400 hover:text-white">
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAudit}
            disabled={auditLoading}
            className="flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 disabled:opacity-50"
          >
            {auditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBarChart className="h-4 w-4" />}
            {auditLoading ? "Generating..." : "Audit PDF"}
          </button>
          <button
            onClick={() => setAiPanelOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-pd-gold/30 px-3 py-2 text-sm text-pd-gold hover:bg-pd-gold/10"
            title="Ctrl+K"
          >
            <Sparkles className="h-4 w-4" /> AI Assistant
          </button>
          <button
            onClick={handleAiCheck}
            disabled={aiChecking}
            className="flex items-center gap-2 rounded-lg border border-pd-purple/30 px-3 py-2 text-sm text-pd-purple-light hover:bg-pd-purple/10 disabled:opacity-50"
          >
            {aiChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            AI Check
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" /> Deactivate
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white hover:bg-pd-blue-dark disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
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

      {/* AI Check Result */}
      {aiResult && (
        <div className="mt-4 glass-card border-pd-purple/20 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-pd-purple-light flex items-center gap-2">
              <Bot className="h-4 w-4" /> AI Analysis
            </h4>
            <button onClick={() => setAiResult(null)} className="text-xs text-gray-500 hover:text-white">Dismiss</button>
          </div>
          <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{aiResult}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mt-6 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-pd-purple/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Tab 1: Basic Info */}
        {activeTab === "basic" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Business Name</label>
                <input type="text" value={business?.name || ""} onChange={e => updateField("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input type="text" value={business?.slug || ""} onChange={e => updateField("slug", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <TipTapEditor
                content={business?.description || ""}
                onChange={(html) => updateField("description", html)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <input type="text" value={(business as any)?.categories?.name || ""} disabled className={`${inputClass} opacity-60`} />
              </div>
              <div>
                <label className={labelClass}>Tier</label>
                <select value={business?.tier || "free"} onChange={e => handleTierChange(e.target.value)} className={inputClass}>
                  {TIERS.map(t => <option key={t.value} value={t.value} className="bg-pd-dark">{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={business?.is_active || false} onChange={e => updateField("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue" />
                <span className="text-sm text-gray-300">Active</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={business?.is_featured || false} onChange={e => updateField("is_featured", e.target.checked)}
                  className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue" />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={business?.is_claimed || false} onChange={e => updateField("is_claimed", e.target.checked)}
                  className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue" />
                <span className="text-sm text-gray-300">Claimed</span>
              </label>
            </div>
            <div>
              <label className={labelClass}>Owner User ID</label>
              <input type="text" value={business?.owner_user_id || ""} onChange={e => updateField("owner_user_id", e.target.value)} placeholder="UUID or leave empty" className={inputClass} />
            </div>
          </div>
        )}

        {/* Tab 2: Contact & Location */}
        {activeTab === "contact" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Contact &amp; Location</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={business?.phone ? formatPhoneUS(business.phone) : ""} onChange={e => {
                  const raw = e.target.value.replace(/\D/g, "");
                  updateField("phone", raw);
                }} placeholder="(951) 555-1234" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={business?.email || ""} onChange={e => updateField("email", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={business?.website || ""} onChange={e => updateField("website", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={business?.address || ""} onChange={e => updateField("address", e.target.value)} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={business?.city || ""} onChange={e => updateField("city", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" value={business?.state || ""} onChange={e => updateField("state", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ZIP</label>
                <input type="text" value={business?.zip_code || ""} onChange={e => updateField("zip_code", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Latitude</label>
                <input type="number" step="0.0000001" value={business?.latitude || ""} onChange={e => updateField("latitude", e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input type="number" step="0.0000001" value={business?.longitude || ""} onChange={e => updateField("longitude", e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 mt-4">
              <h4 className="text-sm font-medium text-white mb-3">Google Maps Integration</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Google Place ID</label>
                  <input type="text" value={business?.google_place_id || ""} onChange={e => updateField("google_place_id", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Google Maps URL</label>
                  <input type="url" value={business?.google_maps_url || ""} onChange={e => updateField("google_maps_url", e.target.value)} className={inputClass} />
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={business?.google_business_claimed || false} onChange={e => updateField("google_business_claimed", e.target.checked)}
                  className="h-4 w-4 rounded border-pd-purple/30 bg-pd-dark text-pd-blue focus:ring-pd-blue" />
                <span className="text-sm text-gray-300">Google Business Profile Claimed</span>
              </label>
              {business?.google_presence_score !== undefined && (
                <p className="mt-2 text-xs text-gray-500">Google Presence Score: {business.google_presence_score}/100</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Hours */}
        {activeTab === "hours" && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-white">Hours of Operation</h3>
              <button
                onClick={() => {
                  const template = business?.hours?.monday;
                  if (!template) return;
                  const newHours: any = {};
                  DAYS.forEach(d => { newHours[d] = { ...template }; });
                  updateField("hours", newHours);
                }}
                className="text-xs text-pd-blue hover:text-pd-blue-light"
              >
                Copy Monday to all
              </button>
            </div>
            <div className="space-y-3">
              {DAYS.map(day => {
                const h = business?.hours?.[day] || {};
                return (
                  <div key={day} className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
                    <span className="w-24 text-sm font-medium capitalize text-gray-300">{day}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.closed || false}
                        onChange={e => updateHours(day, "closed", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-600 bg-pd-dark text-red-500"
                      />
                      <span className="text-xs text-gray-400">Closed</span>
                    </label>
                    {!h.closed && (
                      <>
                        <input
                          type="time"
                          value={h.open || "09:00"}
                          onChange={e => updateHours(day, "open", e.target.value)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={h.close || "17:00"}
                          onChange={e => updateHours(day, "close", e.target.value)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Images & Media */}
        {activeTab === "media" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Images &amp; Media</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Cover Image URL</label>
                <div className="flex gap-2">
                  <input type="url" value={business?.cover_image_url || ""} onChange={e => updateField("cover_image_url", e.target.value)} className={inputClass + " flex-1"} />
                  <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-pd-purple/20 px-3 py-2 text-xs text-pd-purple-light hover:bg-pd-purple/30">
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>{uploadingCover ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover_image_url"); }}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
                {business?.cover_image_url && (
                  <div className="mt-2 aspect-video overflow-hidden rounded-lg bg-white/5">
                    <img src={business.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Logo URL</label>
                <div className="flex gap-2">
                  <input type="url" value={business?.logo_url || ""} onChange={e => updateField("logo_url", e.target.value)} className={inputClass + " flex-1"} />
                  <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-pd-purple/20 px-3 py-2 text-xs text-pd-purple-light hover:bg-pd-purple/30">
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>{uploadingLogo ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "logo_url"); }}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
                {business?.logo_url && (
                  <div className="mt-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    <img src={business.logo_url} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-white mb-3">Video Embeds</h4>
              {(business?.video_embeds || []).map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={v.url || ""}
                    onChange={e => {
                      const vids = [...(business?.video_embeds || [])];
                      vids[i] = { ...vids[i], url: e.target.value };
                      updateField("video_embeds", vids);
                    }}
                    placeholder="YouTube or Vimeo URL"
                    className={inputClass}
                  />
                  <button
                    onClick={() => {
                      const vids = (business?.video_embeds || []).filter((_: any, idx: number) => idx !== i);
                      updateField("video_embeds", vids);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const vids = [...(business?.video_embeds || []), { url: "", title: "", type: "youtube", sort_order: (business?.video_embeds || []).length }];
                  updateField("video_embeds", vids);
                }}
                className="text-xs text-pd-blue hover:text-pd-blue-light"
              >
                + Add Video
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className={labelClass}>Virtual Tour URL (Elite only)</label>
              <input type="url" value={business?.virtual_tour_url || ""} onChange={e => updateField("virtual_tour_url", e.target.value)} placeholder="Google Street View or Matterport URL" className={inputClass} />
            </div>
          </div>
        )}

        {/* Tab 5: Amenities */}
        {activeTab === "amenities" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Amenities &amp; Features</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITIES_LIST.map(a => (
                <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                  <input
                    type="checkbox"
                    checked={(business?.amenities || []).includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="h-3.5 w-3.5 rounded border-gray-600 bg-pd-dark text-pd-blue focus:ring-pd-blue"
                  />
                  <span className="text-sm text-gray-300">{a}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Social Media */}
        {activeTab === "social" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Social Media Links</h3>
            {[
              { key: "facebook", label: "Facebook" },
              { key: "instagram", label: "Instagram" },
              { key: "twitter", label: "Twitter/X" },
              { key: "tiktok", label: "TikTok" },
              { key: "youtube", label: "YouTube" },
              { key: "linkedin", label: "LinkedIn" },
              { key: "yelp", label: "Yelp" },
              { key: "google_business", label: "Google Business Profile" },
              { key: "tripadvisor", label: "TripAdvisor" },
            ].map(s => (
              <div key={s.key}>
                <label className={labelClass}>{s.label}</label>
                <input
                  type="url"
                  value={business?.social_media?.[s.key] || ""}
                  onChange={e => updateSocialMedia(s.key, e.target.value)}
                  placeholder={`https://${s.key}.com/...`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Outreach & CRM */}
        {activeTab === "outreach" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Outreach &amp; CRM</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Outreach Status</label>
                <select value={business?.outreach_status || "not_contacted"} onChange={e => updateField("outreach_status", e.target.value)} className={inputClass}>
                  {OUTREACH_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-pd-dark">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Outreach Method</label>
                <select value={business?.outreach_method || ""} onChange={e => updateField("outreach_method", e.target.value)} className={inputClass}>
                  <option value="" className="bg-pd-dark">Not set</option>
                  {OUTREACH_METHODS.map(m => <option key={m.value} value={m.value} className="bg-pd-dark">{m.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Last Contacted</label>
                <input type="date" value={business?.outreach_last_contacted_at?.split("T")[0] || ""} onChange={e => updateField("outreach_last_contacted_at", e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Next Follow-up</label>
                <input type="date" value={business?.outreach_next_follow_up?.split("T")[0] || ""} onChange={e => updateField("outreach_next_follow_up", e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>GHL Contact ID</label>
              <input type="text" value={business?.ghl_contact_id || ""} onChange={e => updateField("ghl_contact_id", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Outreach Notes</label>
              <textarea value={business?.outreach_notes || ""} onChange={e => updateField("outreach_notes", e.target.value)} rows={4} className={inputClass} />
            </div>
            {/* Data Quality / Lead Info */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Import &amp; Lead Data</h4>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-400">Data Quality</p>
                  <p className="text-lg font-bold text-white">{business?.data_quality_score || 0}/100</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-400">Lead Score</p>
                  <p className="text-lg font-bold text-white">{business?.lead_score || 0}/100</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-gray-400">Hot Lead</p>
                  <p className={`text-lg font-bold ${business?.is_hot_lead ? 'text-orange-400' : 'text-gray-500'}`}>
                    {business?.is_hot_lead ? "Yes" : "No"}
                  </p>
                  {business?.hot_lead_reason && <p className="text-xs text-gray-500">{business.hot_lead_reason}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Subscription & Payments */}
        {activeTab === "subscription" && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Subscription &amp; Payments</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-xs text-gray-400">Current Tier</p>
                <p className="mt-1 text-sm font-bold text-white capitalize">{(business?.tier || "free").replace(/_/g, " ")}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-xs text-gray-400">Subscription Status</p>
                <p className={`mt-1 text-sm font-bold ${
                  business?.subscription_status === "active" ? "text-green-400" :
                  business?.subscription_status === "past_due" ? "text-yellow-400" :
                  business?.subscription_status === "cancelled" ? "text-red-400" : "text-gray-400"
                }`}>
                  {business?.subscription_status || "none"}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-xs text-gray-400">Stripe Connect</p>
                <p className={`mt-1 text-sm font-bold ${
                  business?.stripe_connect_status === "active" ? "text-green-400" : "text-gray-400"
                }`}>
                  {business?.stripe_connect_status || "not connected"}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-xs text-gray-400">Setup Fee</p>
                <p className={`mt-1 text-sm font-bold ${
                  business?.setup_fee_status === "paid" ? "text-green-400" :
                  business?.setup_fee_status === "waived" ? "text-blue-400" : "text-gray-400"
                }`}>
                  {business?.setup_fee_status || "not applicable"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Stripe Connect ID</label>
                <input type="text" value={business?.stripe_connect_id || ""} disabled className={`${inputClass} opacity-60`} />
              </div>
              <div>
                <label className={labelClass}>Subscription Stripe ID</label>
                <input type="text" value={business?.subscription_stripe_id || ""} disabled className={`${inputClass} opacity-60`} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Setup Fee Status</label>
                <select value={business?.setup_fee_status || "not_applicable"} onChange={e => updateField("setup_fee_status", e.target.value)} className={inputClass}>
                  {["not_applicable", "unpaid", "paid", "waived"].map(s => (
                    <option key={s} value={s} className="bg-pd-dark">{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Setup Fee Amount</label>
                <input type="number" step="0.01" value={business?.setup_fee_amount || ""} onChange={e => updateField("setup_fee_amount", e.target.value ? parseFloat(e.target.value) : null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Discount Code Used</label>
                <input type="text" value={business?.discount_code_used || ""} onChange={e => updateField("discount_code_used", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Setup Fee Modal */}
      {showSetupFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-pd-dark p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-white">
              Upgrading to {pendingTier.replace(/_/g, ' ')}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Setup Fee: <span className="font-bold text-pd-gold">${SETUP_FEES[pendingTier] || 0}</span>
            </p>

            <div className="mt-4">
              <label className={labelClass}>Have a discount code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={setupFeeDiscountCode}
                  onChange={e => { setSetupFeeDiscountCode(e.target.value); setSetupFeeDiscount(null); }}
                  placeholder="Enter code"
                  className={inputClass}
                />
                <button
                  onClick={validateSetupFeeDiscount}
                  disabled={setupFeeValidating || !setupFeeDiscountCode.trim()}
                  className="whitespace-nowrap rounded-lg bg-pd-purple/20 px-3 py-2 text-sm text-pd-purple-light hover:bg-pd-purple/30 disabled:opacity-50"
                >
                  {setupFeeValidating ? "..." : "Apply"}
                </button>
              </div>
              {setupFeeDiscount && !setupFeeDiscount.error && (
                <p className="mt-1 text-xs text-green-400">
                  Code applied: {setupFeeDiscount.discount_type === 'percentage' ? `${setupFeeDiscount.discount_value}% off` : `$${setupFeeDiscount.discount_value} off`}
                </p>
              )}
              {setupFeeDiscount?.error && (
                <p className="mt-1 text-xs text-red-400">{setupFeeDiscount.error}</p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => applySetupFee("send_invoice")}
                className="w-full rounded-lg bg-pd-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-pd-blue-dark"
              >
                Send Invoice
              </button>
              <button
                onClick={() => applySetupFee("mark_paid")}
                className="w-full rounded-lg bg-green-600/20 px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-green-600/30"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => applySetupFee("waive")}
                className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10"
              >
                Waive Fee
              </button>
              <button
                onClick={() => setShowSetupFeeModal(false)}
                className="mt-1 w-full text-sm text-gray-500 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        business={business}
        mode="general"
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />
    </div>
  );
}
