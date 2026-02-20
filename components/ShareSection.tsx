"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Copy, CheckCircle, Facebook, Twitter, MessageCircle, Share2, Lock } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ShareSectionProps {
  url: string;
  title: string;
  subtitle?: string;
  incentive?: string;
  variant: "listing" | "offer" | "giveaway";
  businessId?: string;
  offerId?: string;
}

export default function ShareSection({
  url, title, subtitle, incentive, variant, businessId, offerId,
}: ShareSectionProps) {
  const [user, setUser] = useState<any>(null);
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", u.id)
          .single();
        if (profile?.referral_code) setRefCode(profile.referral_code);
      }
    }
    load();
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = refCode ? `${baseUrl}${url}?ref=${refCode}` : `${baseUrl}${url}`;
  const shareText = variant === "offer"
    ? `Check out this deal on Platinum Directory Temecula Valley!`
    : `Check out ${title.replace("Share ", "").replace(" & Earn Points", "")} on Platinum Directory!`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    awardPoints("copy");
  }

  function shareFacebook() {
    window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
    awardPoints("facebook");
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
    awardPoints("twitter");
  }

  function shareSMS() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`);
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    awardPoints("sms");
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: shareText, url: shareUrl }).catch(() => {});
    } else {
      copyLink();
    }
    awardPoints("native");
  }

  function awardPoints(method: string) {
    trackEvent("share", { method, business_id: businessId, offer_id: offerId, variant });
    if (user) {
      fetch("/api/points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share_listing", entity_id: businessId || offerId }),
      }).catch(() => {});
    }
  }

  // Not logged in — show disabled state with signup CTA
  if (!user) {
    return (
      <div className="glass-card overflow-hidden border-pd-gold/10 p-6">
        <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        {incentive && (
          <p className="mt-2 text-sm font-medium text-pd-gold">{incentive}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 opacity-40 pointer-events-none">
          <ShareButton icon={Facebook} label="Facebook" color="bg-blue-600/20 text-blue-400" />
          <ShareButton icon={Copy} label="Copy Link" color="bg-white/10 text-gray-300" />
          <ShareButton icon={Twitter} label="Twitter/X" color="bg-sky-500/20 text-sky-400" />
          <ShareButton icon={MessageCircle} label="Text" color="bg-green-600/20 text-green-400" />
        </div>

        <a
          href={`/sign-up?redirect=${encodeURIComponent(url)}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pd-gold to-pd-gold-light px-6 py-3 text-sm font-bold text-pd-dark transition-all hover:shadow-lg hover:shadow-pd-gold/20"
        >
          <Lock className="h-4 w-4" />
          Sign Up FREE — Get $5.50 in Points Instantly
        </a>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-pd-gold/10 p-6">
      <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      {incentive && (
        <p className="mt-2 text-sm font-medium text-pd-gold">{incentive}</p>
      )}

      {/* Referral link box */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0D1321] px-3 py-2.5">
        <code className="flex-1 truncate text-sm text-gray-300">{shareUrl}</code>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-lg bg-pd-gold/15 px-3 py-1.5 text-xs font-medium text-pd-gold hover:bg-pd-gold/25"
        >
          {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button onClick={shareFacebook} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-4 py-2.5 text-sm text-blue-400 transition-colors hover:bg-blue-600/30">
          <Facebook className="h-4 w-4" /> Facebook
        </button>
        <button onClick={shareTwitter} className="flex items-center justify-center gap-2 rounded-lg bg-sky-500/20 px-4 py-2.5 text-sm text-sky-400 transition-colors hover:bg-sky-500/30">
          <Twitter className="h-4 w-4" /> Twitter/X
        </button>
        <button onClick={shareSMS} className="flex items-center justify-center gap-2 rounded-lg bg-green-600/20 px-4 py-2.5 text-sm text-green-400 transition-colors hover:bg-green-600/30">
          <MessageCircle className="h-4 w-4" /> Text
        </button>
        <button onClick={shareNative} className="flex items-center justify-center gap-2 rounded-lg bg-pd-purple/20 px-4 py-2.5 text-sm text-pd-purple-light transition-colors hover:bg-pd-purple/30">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Earn 25 points every time someone visits your link
      </p>
    </div>
  );
}

function ShareButton({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm ${color}`}>
      <Icon className="h-4 w-4" /> {label}
    </div>
  );
}
