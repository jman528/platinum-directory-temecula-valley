"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Search, Menu, X, Gift } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-pd-purple/20 bg-pd-dark/80 backdrop-blur-xl">
      {/* Gradient bottom border accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pd-purple/40 to-transparent" />

      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold">
            <span className="text-gold-shimmer">PLATINUM</span>{" "}
            <span className="text-white">DIRECTORY</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm text-gray-300 transition-colors hover:text-white"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-300 transition-colors hover:text-white"
          >
            Advertise
          </Link>
          <Link
            href="/deals"
            className="text-sm text-gray-300 transition-colors hover:text-white"
          >
            Deals
          </Link>
          <Link
            href="/giveaway"
            className="flex items-center gap-1.5 text-sm font-medium text-pd-gold transition-colors hover:text-pd-gold-light"
          >
            <Gift className="h-4 w-4" />
            Win $250
          </Link>
        </nav>

        {/* Auth + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-glow rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pd-blue-dark">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden text-sm text-gray-300 transition-colors hover:text-white md:block"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-300 transition-colors hover:border-pd-gold/40 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out panel */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-pd-purple/20 bg-pd-dark/95 backdrop-blur-xl md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            <Link href="/search" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-pd-purple/10 hover:text-white">
              <Search className="h-4 w-4" /> Search
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-pd-purple/10 hover:text-white">
              Advertise
            </Link>
            <Link href="/deals" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-pd-purple/10 hover:text-white">
              Deals
            </Link>
            <Link href="/giveaway" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-pd-gold transition-colors hover:bg-pd-gold/10">
              <Gift className="h-4 w-4" /> Win $250
            </Link>
            <SignedIn>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-pd-purple/10 hover:text-white">
                Dashboard
              </Link>
            </SignedIn>
          </nav>
        </div>
      )}
    </header>
  );
}
