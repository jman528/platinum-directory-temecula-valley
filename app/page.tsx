import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import RollingHills from "@/components/ui/RollingHills";
import SearchBar from "@/components/ui/SearchBar";

/* ── Static data ── */

const STATS = [
  { value: "7,831", label: "Businesses Listed" },
  { value: "$1.1B", label: "Annual Visitor Spending" },
  { value: "11", label: "Cities Covered" },
] as const;

const CATEGORIES = [
  { emoji: "🍷", label: "Wineries & Tasting Rooms", slug: "wineries" },
  { emoji: "🍽️", label: "Restaurants & Dining", slug: "restaurants" },
  { emoji: "🏨", label: "Hotels & Resorts", slug: "hotels" },
  { emoji: "🧖", label: "Spa & Wellness", slug: "spa-wellness" },
  { emoji: "🎭", label: "Entertainment & Events", slug: "entertainment" },
  { emoji: "🛍️", label: "Shopping & Boutiques", slug: "shopping" },
  { emoji: "🏠", label: "Real Estate", slug: "real-estate" },
  { emoji: "⚖️", label: "Legal Services", slug: "legal" },
  { emoji: "🏥", label: "Health & Medical", slug: "health-medical" },
  { emoji: "💰", label: "Financial Services", slug: "financial" },
  { emoji: "🎨", label: "Arts & Culture", slug: "arts-culture" },
  { emoji: "🚗", label: "Automotive", slug: "automotive" },
  { emoji: "🏗️", label: "Home Services", slug: "home-services" },
  { emoji: "🌿", label: "Outdoors & Recreation", slug: "outdoors" },
  { emoji: "🎓", label: "Education", slug: "education" },
  { emoji: "🐾", label: "Pet Services", slug: "pet-services" },
  { emoji: "📸", label: "Photography & Video", slug: "photography" },
  { emoji: "💒", label: "Wedding Services", slug: "weddings" },
  { emoji: "🌾", label: "Farm & Agriculture", slug: "farm-agriculture" },
  { emoji: "🍺", label: "Breweries & Bars", slug: "breweries-bars" },
] as const;

/* ── Page ── */

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main">
        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="relative isolate min-h-[92vh] overflow-hidden">
          {/* Wine-country gradient overlay */}
          <div className="wine-hero-gradient absolute inset-0" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 pb-48 pt-28 text-center md:pb-56 md:pt-36">
            {/* Eyebrow label */}
            <div className="section-label mb-8 animate-fade-up">
              ✦ Temecula Valley&apos;s Premier Business Guide ✦
            </div>

            {/* Headline */}
            <h1 className="mb-4 animate-fade-up font-serif text-5xl font-bold leading-none tracking-wide sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="text-gold-shimmer">PLATINUM</span>
              <br />
              <span className="text-gold-shimmer">DIRECTORY</span>
            </h1>

            <p
              className="mb-3 animate-fade-up text-2xl font-light tracking-[0.25em] text-white/80 sm:text-3xl"
              style={{ animationDelay: "80ms" }}
            >
              Temecula Valley
            </p>

            <p
              className="mb-12 animate-fade-up text-lg text-slate-400 sm:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              Discover Temecula Valley&apos;s Finest
            </p>

            {/* Search bar */}
            <div
              className="w-full max-w-2xl animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <SearchBar />
            </div>

            {/* Stat counters */}
            <div
              className="mt-16 grid animate-fade-up grid-cols-3 gap-6 sm:gap-12"
              style={{ animationDelay: "360ms" }}
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-2xl font-bold text-[#D4AF37] sm:text-3xl md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rolling hills — pinned to section bottom */}
          <RollingHills className="absolute inset-x-0 bottom-0 w-full" />
        </section>

        {/* ══════════════════════════════════════════
            CATEGORIES GRID
        ══════════════════════════════════════════ */}
        <section className="py-24">
          <div className="container">
            {/* Section header */}
            <div className="mb-12 text-center">
              <div className="section-label mx-auto mb-5">Browse by Category</div>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Find What You&apos;re Looking For
              </h2>
              <p className="mt-3 text-slate-400">
                Explore thousands of businesses across every category in wine
                country
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/businesses?category=${cat.slug}`}
                  className="glass-card group flex flex-col items-center gap-3 px-3 py-6 text-center"
                >
                  <span
                    className="text-3xl transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    {cat.emoji}
                  </span>
                  <span className="text-xs font-medium leading-snug text-slate-300 group-hover:text-[#D4AF37] sm:text-sm">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/businesses" className="btn-glass inline-block text-sm">
                View All Categories →
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            WEEKLY GIVEAWAY BANNER
        ══════════════════════════════════════════ */}
        <section className="py-6">
          <div className="container">
            <div className="glass-card-premium relative overflow-hidden px-8 py-10 md:px-14 md:py-12">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-700/10 blur-3xl" />

              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="section-label mb-4">Weekly Giveaway</div>
                  <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    Win{" "}
                    <span className="text-gold-shimmer">$250 This Week!</span>
                  </h2>
                  <p className="mt-3 max-w-lg text-slate-400">
                    Every business review, listing save, or referral earns you
                    entries. One lucky winner is drawn every Friday. No purchase
                    necessary.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                      Write a review — 3 entries
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                      Refer a friend — 5 entries
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                      Save a listing — 1 entry
                    </li>
                  </ul>
                </div>

                <div className="flex-shrink-0">
                  <Link href="/giveaway" className="btn-gold inline-block text-base">
                    Enter Now →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            BUSINESS OWNER CTA
        ══════════════════════════════════════════ */}
        <section className="py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl border border-purple-700/20 bg-gradient-to-br from-[#1a0533]/80 via-[#2d1b4e]/60 to-[#0d1321]/80 px-8 py-16 text-center backdrop-blur-xl md:px-16 md:py-20">
              {/* Background glow accents */}
              <div className="pointer-events-none absolute left-1/4 top-0 h-56 w-56 rounded-full bg-purple-600/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-[#D4AF37]/5 blur-3xl" />

              <div className="relative">
                <div className="section-label mx-auto mb-6">
                  For Business Owners
                </div>

                <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  Reach Temecula Valley&apos;s{" "}
                  <span className="text-gold-shimmer">Most Affluent Buyers</span>
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
                  Platinum Directory connects your business to wine country&apos;s
                  highest-intent visitors and residents. Get a premium listing,
                  smart offers, and analytics — all in one place.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/for-business"
                    className="btn-gold inline-block text-base"
                  >
                    List Your Business
                  </Link>
                  <Link
                    href="/for-business#pricing"
                    className="btn-glass inline-block text-base"
                  >
                    View Pricing Plans
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span> No setup fees
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span> Cancel anytime
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span> Live in 24 hours
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span> 30-day free trial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 py-10">
          <div className="container">
            <div className="divider-gold mb-8" />
            <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
              <div>
                <span className="font-serif text-base font-bold tracking-widest text-[#D4AF37]">
                  PLATINUM
                </span>
                <span className="ml-2 text-[10px] font-semibold tracking-[0.3em] text-white/40">
                  DIRECTORY
                </span>
                <p className="mt-1 text-xs text-slate-600">
                  © {new Date().getFullYear()} Platinum Directory. All rights
                  reserved.
                </p>
              </div>
              <nav className="flex flex-wrap gap-6 text-sm text-slate-500">
                <Link href="/about" className="hover:text-[#D4AF37]">
                  About
                </Link>
                <Link href="/for-business" className="hover:text-[#D4AF37]">
                  Advertise
                </Link>
                <Link href="/giveaway" className="hover:text-[#D4AF37]">
                  Giveaway
                </Link>
                <Link href="/privacy" className="hover:text-[#D4AF37]">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-[#D4AF37]">
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
