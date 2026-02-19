"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Menu, X, User, LogOut, LayoutDashboard, Coins } from "lucide-react";
import type { Profile } from "@/types";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, points_balance, user_type, avatar_url")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data as Profile);
      }
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5" style={{ background: "rgba(10, 15, 26, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="Platinum Directory" width={36} height={36} className="logo-glow" />
          <span className="hidden font-heading text-lg font-bold text-white lg:inline">
            <span className="text-gold-shimmer">PLATINUM</span> DIRECTORY
          </span>
        </Link>

        {/* Desktop Search Bar - centered */}
        <form action="/search" method="GET" className="hidden flex-1 md:flex md:max-w-xl md:mx-auto">
          <div className="flex w-full items-center rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-pd-purple/40 focus-within:bg-white/[0.07]">
            <Search className="ml-3 h-4 w-4 flex-shrink-0 text-gray-500" />
            <input
              type="text"
              name="q"
              placeholder="Search businesses, wineries, restaurants..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
            <button type="submit" className="mr-1 rounded-lg bg-pd-purple/20 px-3 py-1 text-xs font-medium text-pd-purple-light transition-colors hover:bg-pd-purple/30">
              Search
            </button>
          </div>
        </form>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/search" className="whitespace-nowrap text-sm text-gray-300 transition-colors hover:text-white">Directory</Link>
          <Link href="/deals" className="whitespace-nowrap text-sm text-gray-300 transition-colors hover:text-white">Deals</Link>
          <Link href="/giveaway" className="whitespace-nowrap text-sm text-gray-300 transition-colors hover:text-white">Giveaway</Link>
          <Link href="/pricing" className="whitespace-nowrap text-sm text-gray-300 transition-colors hover:text-white">Pricing</Link>
          <Link href="/legal/business-terms" className="whitespace-nowrap text-sm text-gray-300 transition-colors hover:text-white">For Businesses</Link>
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Mobile search link */}
          <Link href="/search" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden">
            <Search className="h-5 w-5" />
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white transition-all hover:border-pd-purple/30"
              >
                {profile && (
                  <span className="hidden items-center gap-1 text-pd-gold sm:flex">
                    <Coins className="h-3.5 w-3.5" />
                    {profile.points_balance.toLocaleString()}
                  </span>
                )}
                <User className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#111827] p-1 shadow-2xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="whitespace-nowrap rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue px-4 py-2 text-sm font-medium text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/5 px-4 py-4 lg:hidden" style={{ background: "rgba(10, 15, 26, 0.95)" }}>
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Home</Link>
            <Link href="/search" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Directory</Link>
            <Link href="/deals" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Deals</Link>
            <Link href="/giveaway" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Giveaway</Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Pricing</Link>
            <Link href="/legal/business-terms" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">For Businesses</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
