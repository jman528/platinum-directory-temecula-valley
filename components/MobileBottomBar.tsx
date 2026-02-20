"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, Tag, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRefCode } from "@/lib/utm-persistence";

interface MobileBottomBarProps {
  phone?: string;
  address?: string;
  hasDeals?: boolean;
  dealsHref?: string;
  shareUrl: string;
  shareText: string;
}

export default function MobileBottomBar({
  phone, address, hasDeals, dealsHref, shareUrl, shareText,
}: MobileBottomBarProps) {
  const [user, setUser] = useState<any>(null);
  const [refCode, setRefCode] = useState("");
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

  function handleShare() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = refCode ? `${baseUrl}${shareUrl}?ref=${refCode}` : `${baseUrl}${shareUrl}`;

    if (!user) {
      window.location.href = `/sign-up?redirect=${encodeURIComponent(shareUrl)}`;
      return;
    }

    if (navigator.share) {
      navigator.share({ title: shareText, url: fullUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(fullUrl);
    }
  }

  const mapsUrl = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
    : "#";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#0A0F1A]/95 px-2 py-2 backdrop-blur-xl md:hidden">
      {phone && (
        <a href={`tel:${phone}`} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-pd-gold">
          <Phone className="h-5 w-5" />
          <span className="text-[10px]">Call</span>
        </a>
      )}
      {address && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-pd-gold">
          <MapPin className="h-5 w-5" />
          <span className="text-[10px]">Directions</span>
        </a>
      )}
      {hasDeals && dealsHref && (
        <a href={dealsHref} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-pd-gold">
          <Tag className="h-5 w-5" />
          <span className="text-[10px]">Deals</span>
        </a>
      )}
      <button onClick={handleShare} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-300 hover:text-pd-gold">
        <Share2 className="h-5 w-5" />
        <span className="text-[10px]">Share</span>
      </button>
    </div>
  );
}
