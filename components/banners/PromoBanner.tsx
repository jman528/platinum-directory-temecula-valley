"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface PromoBannerProps {
  type: "giveaway" | "affiliate" | "flash-deal" | "social-proof" | "points";
  position: "top-sticky" | "inline" | "bottom-float" | "sidebar";
  dismissable?: boolean;
  children: React.ReactNode;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, hours: number) {
  const expires = new Date(Date.now() + hours * 3600000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export default function PromoBanner({ type, position, dismissable = true, children }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedAt = getCookie(`pd_banner_${type}_dismissed`);
    if (dismissedAt) setDismissed(true);
  }, [type]);

  function dismiss() {
    setCookie(`pd_banner_${type}_dismissed`, "1", position === "top-sticky" ? 4 : 24);
    setDismissed(true);
    // Track dismiss
    fetch("/api/analytics/banner-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        banner_type: type,
        action: "dismiss",
        page_url: window.location.pathname,
        visitor_id: getCookie("pd_visitor_id") || "anon",
      }),
    }).catch(() => {});
  }

  if (dismissed) return null;

  const positionClasses = {
    "top-sticky": "sticky top-16 z-40",
    inline: "",
    "bottom-float": "fixed bottom-0 left-0 right-0 z-40",
    sidebar: "",
  };

  return (
    <div className={positionClasses[position]}>
      <div className="relative">
        {children}
        {dismissable && (
          <button
            onClick={dismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
