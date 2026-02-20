"use client";

import { useState, useEffect } from "react";
import { X, Copy, Zap, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FlashDeal {
  id: string;
  code: string;
  flash_deal_name: string;
  flash_deal_banner_text: string;
  expires_at: string | null;
}

export default function FlashDealBanner() {
  const [deal, setDeal] = useState<FlashDeal | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function load() {
      // Check if user dismissed this session
      if (typeof window !== "undefined" && sessionStorage.getItem("flash_deal_dismissed")) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("discount_codes")
        .select("id, code, flash_deal_name, flash_deal_banner_text, expires_at")
        .eq("is_flash_deal", true)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setDeal(data as FlashDeal);
    }
    load();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!deal?.expires_at) return;
    const interval = setInterval(() => {
      const diff = new Date(deal.expires_at!).getTime() - Date.now();
      if (diff <= 0) {
        setDeal(null);
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [deal?.expires_at]);

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") sessionStorage.setItem("flash_deal_dismissed", "1");
  }

  function handleCopy() {
    if (deal) {
      navigator.clipboard.writeText(deal.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!deal || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-pd-gold/20 via-orange-500/20 to-pd-gold/20 border-b border-pd-gold/30">
      <div className="container flex items-center justify-center gap-3 px-4 py-2.5 text-center">
        <Zap className="h-4 w-4 flex-shrink-0 text-pd-gold" />
        <p className="text-sm text-white">
          <span className="font-bold text-pd-gold">{deal.flash_deal_name || "Flash Deal"}: </span>
          {deal.flash_deal_banner_text}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-pd-gold/20 px-2.5 py-1 text-xs font-bold text-pd-gold hover:bg-pd-gold/30"
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : deal.code}
        </button>
        {timeLeft && (
          <span className="hidden items-center gap-1 text-xs text-orange-300 sm:flex">
            <Clock className="h-3 w-3" /> {timeLeft}
          </span>
        )}
        <button onClick={handleDismiss} className="ml-2 text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
