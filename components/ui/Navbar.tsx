"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Businesses", href: "/businesses" },
  { label: "Smart Offers", href: "/offers" },
  { label: "Giveaway", href: "/giveaway" },
  { label: "For Business Owners", href: "/for-business" },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass-nav sticky top-0 z-50">
      {/* Gradient border bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-col leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:rounded"
          aria-label="Platinum Directory — Home"
        >
          <span className="font-serif text-lg font-bold tracking-widest text-[#D4AF37]">
            PLATINUM
          </span>
          <span className="text-[10px] font-semibold tracking-[0.3em] text-white/70">
            DIRECTORY
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="btn-glass px-5 py-2 text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/for-business"
            className="btn-gold px-5 py-2 text-sm"
          >
            List Your Business
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/8 px-4 pb-6 pt-4 md:hidden">
          <nav
            className="flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/5 hover:text-[#D4AF37]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="btn-glass block text-center text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/for-business"
              onClick={() => setMobileOpen(false)}
              className="btn-gold block text-center text-sm"
            >
              List Your Business
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
