export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Search, Gift, Trophy, MapPin, Star, Shield, Phone, Globe, Navigation, ChevronRight, Wine, UtensilsCrossed, Car, Heart, ShoppingBag, Briefcase, Wrench, Sparkles, Home, Music, Crown, Store, Map } from "lucide-react";
import type { Business, Category } from "@/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import AffiliateBanner from "@/components/banners/AffiliateBanner";

const ICON_MAP: Record<string, any> = {
  Wine, UtensilsCrossed, Car, Heart, ShoppingBag, Briefcase, Wrench, Sparkles,
  Home, Music, Crown, Store, MapPin, Star, Shield, Map,
};

const VALLEY_CITIES = [
  { name: "Temecula", lat: 33.4936, lng: -117.1484 },
  { name: "Murrieta", lat: 33.5539, lng: -117.2139 },
  { name: "Hemet", lat: 33.7476, lng: -116.9719 },
  { name: "Menifee", lat: 33.6781, lng: -117.1851 },
  { name: "Fallbrook", lat: 33.3764, lng: -117.2511 },
  { name: "Lake Elsinore", lat: 33.6681, lng: -117.3273 },
  { name: "Perris", lat: 33.7825, lng: -117.2286 },
  { name: "Wildomar", lat: 33.5989, lng: -117.2800 },
  { name: "Sun City", lat: 33.7092, lng: -117.1970 },
  { name: "Winchester", lat: 33.7069, lng: -117.0848 },
  { name: "Canyon Lake", lat: 33.6847, lng: -117.2726 },
];

function getTierBadge(tier: string) {
  switch (tier) {
    case "platinum_elite":
      return <span className="tier-badge-elite rounded-full px-2 py-0.5 text-[10px] font-bold">ELITE</span>;
    case "platinum_partner":
      return <span className="tier-badge-partner rounded-full px-2 py-0.5 text-[10px] font-bold">PARTNER</span>;
    case "verified_platinum":
      return <span className="tier-badge-verified rounded-full px-2 py-0.5 text-[10px] font-bold">VERIFIED</span>;
    default:
      return null;
  }
}

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: featuredBusinesses },
    { count: businessCount },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("businesses")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .or("tier.eq.platinum_elite,tier.eq.platinum_partner,is_featured.eq.true")
      .order("tier", { ascending: false })
      .limit(12),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const allCategories = (categories as Category[]) || [];
  const displayCategories = allCategories.slice(0, 20);
  const catPills = allCategories.slice(0, 10);
  const bizList = (featuredBusinesses as any[]) || [];

  return (
    <div className="premium-bg">
      {/* HERO SECTION */}
      <section className="wine-hero-gradient relative overflow-hidden py-28 lg:py-36">
        {/* Temecula Valley Rolling Hills SVG Background */}
        <div className="absolute inset-0" aria-hidden="true">
          <svg
            viewBox="0 0 1440 700"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-x-0 bottom-0 h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Golden hour radial glow at horizon */}
              <radialGradient id="hero-golden-glow" cx="50%" cy="58%" r="45%" fx="50%" fy="58%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.14" />
                <stop offset="35%" stopColor="#C4872A" stopOpacity="0.07" />
                <stop offset="70%" stopColor="#7C3AED" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#0A0F1A" stopOpacity="0" />
              </radialGradient>
              {/* Warm amber horizon band */}
              <linearGradient id="hero-horizon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="55%" stopColor="#C9A84C" stopOpacity="0.06" />
                <stop offset="70%" stopColor="#C4872A" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Far distant hills */}
              <linearGradient id="hills-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D1B69" />
                <stop offset="100%" stopColor="#1A1040" />
              </linearGradient>
              {/* Mid-distance hills */}
              <linearGradient id="hills-mid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B1F7A" />
                <stop offset="100%" stopColor="#1E1245" />
              </linearGradient>
              {/* Near hills */}
              <linearGradient id="hills-near" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#261555" />
                <stop offset="100%" stopColor="#120D2E" />
              </linearGradient>
              {/* Foreground hills blend to page bg */}
              <linearGradient id="hills-front" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#180F35" />
                <stop offset="100%" stopColor="#0A0F1A" />
              </linearGradient>
            </defs>

            {/* Golden hour sky glow */}
            <rect width="1440" height="700" fill="url(#hero-golden-glow)" />
            <rect width="1440" height="700" fill="url(#hero-horizon)" />

            {/* Layer 1: Far distant rolling hills */}
            <path d="M0,480 C100,440 200,460 340,410 C480,360 560,400 720,370 C880,340 980,390 1100,365 C1220,340 1340,380 1440,360 L1440,700 L0,700 Z" fill="url(#hills-far)" opacity="0.5" />

            {/* Layer 2: Mid-distance vineyard hills */}
            <path d="M0,520 C140,480 260,500 400,465 C540,430 660,480 820,450 C980,420 1080,470 1220,445 C1360,420 1420,450 1440,440 L1440,700 L0,700 Z" fill="url(#hills-mid)" opacity="0.6" />

            {/* Vineyard row lines on mid hills - golden at dusk */}
            <g opacity="0.07" stroke="#C9A84C" strokeWidth="0.8" fill="none">
              <path d="M260,490 Q340,475 420,482 Q500,470 580,476" />
              <path d="M275,497 Q355,482 435,489 Q515,477 595,483" />
              <path d="M290,504 Q370,489 450,496 Q530,484 610,490" />
              <path d="M305,511 Q385,496 465,503 Q545,491 625,497" />
              <path d="M840,458 Q940,442 1040,452 Q1120,444 1200,450" />
              <path d="M855,465 Q955,449 1055,459 Q1135,451 1215,457" />
              <path d="M870,472 Q970,456 1070,466 Q1150,458 1230,464" />
              <path d="M885,479 Q985,463 1085,473 Q1165,465 1245,471" />
            </g>

            {/* Layer 3: Near rolling hills */}
            <path d="M0,560 C120,535 240,550 400,520 C560,490 680,530 860,505 C1040,480 1160,520 1300,500 C1380,492 1430,508 1440,505 L1440,700 L0,700 Z" fill="url(#hills-near)" opacity="0.7" />

            {/* Vineyard rows on near hills - amber tones */}
            <g opacity="0.05" stroke="#C4872A" strokeWidth="1" fill="none">
              <path d="M80,548 Q180,532 280,540 Q380,528 480,536" />
              <path d="M95,555 Q195,539 295,547 Q395,535 495,543" />
              <path d="M110,562 Q210,546 310,554 Q410,542 510,550" />
              <path d="M700,515 Q820,498 940,510 Q1040,500 1140,508" />
              <path d="M715,522 Q835,505 955,517 Q1055,507 1155,515" />
              <path d="M730,529 Q850,512 970,524 Q1070,514 1170,522" />
            </g>

            {/* Layer 4: Foreground hills - blend into page */}
            <path d="M0,600 C200,580 360,595 540,575 C720,555 900,585 1080,568 C1260,550 1380,575 1440,565 L1440,700 L0,700 Z" fill="url(#hills-front)" opacity="0.85" />

            {/* Subtle foreground vineyard texture */}
            <g opacity="0.03" stroke="#C9A84C" strokeWidth="1.2" fill="none">
              <path d="M160,592 Q280,578 400,586 Q500,577 600,582" />
              <path d="M175,598 Q295,584 415,592 Q515,583 615,588" />
              <path d="M850,575 Q970,562 1090,572 Q1180,565 1270,570" />
              <path d="M865,581 Q985,568 1105,578 Q1195,571 1285,576" />
            </g>
          </svg>

          {/* Warm golden overlay blending hills with atmosphere */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0F1A] via-transparent to-transparent" />
        </div>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        {/* Atmospheric glow accents */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pd-purple/8 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-pd-gold/5 blur-[100px]" />

        <div className="container relative text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="Platinum Directory"
              width={80}
              height={80}
              className="logo-glow"
              priority
            />
          </div>
          <h1 className="text-gold-shimmer font-heading text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
            PLATINUM DIRECTORY
          </h1>
          <p className="mt-4 font-heading text-2xl font-semibold text-white md:text-4xl">
            Temecula Valley
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-300 md:text-lg">
            Discover Temecula Valley&apos;s Finest &mdash; Verified Local Businesses,
            Exclusive Deals, and $250 Weekly Giveaways
          </p>

          {/* Large Glassmorphism Search Bar */}
          <form action="/search" method="GET" className="glass-input-hero mx-auto mt-12 flex max-w-3xl overflow-hidden">
            <div className="flex flex-1 items-center gap-3 px-6">
              <Search className="h-6 w-6 text-pd-purple-light" />
              <input
                type="text"
                name="q"
                placeholder="Search wineries, restaurants, services..."
                className="w-full bg-transparent py-5 text-lg text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
            <div className="hidden items-center border-l border-pd-purple/20 px-5 md:flex">
              <MapPin className="mr-2 h-5 w-5 text-pd-gold" />
              <span className="text-sm text-gray-400">Temecula, CA</span>
            </div>
            <button
              type="submit"
              className="btn-glow flex items-center bg-pd-blue px-10 py-5 font-heading font-semibold text-white transition-colors hover:bg-pd-blue-dark"
            >
              Search
            </button>
          </form>

          {/* Scrollable Category Pills */}
          <div className="horizontal-scroll mx-auto mt-8 flex max-w-3xl gap-2 pb-2">
            {catPills.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className="glass-card flex-shrink-0 rounded-full px-4 py-1.5 text-xs text-gray-300 transition-all hover:border-pd-gold/40 hover:text-pd-gold"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Animated Stat Counters */}
          <div className="mt-12 flex flex-wrap justify-center gap-10">
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-white tabular-nums">
                <AnimatedCounter target={3.4} suffix="M+" />
              </p>
              <p className="mt-1 text-sm text-gray-400">Visitors Annually</p>
            </div>
            <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-pd-purple/30 to-transparent md:block" />
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-pd-gold">
                <AnimatedCounter target={1.1} suffix="B" prefix="$" />
              </p>
              <p className="mt-1 text-sm text-gray-400">Annual Visitor Spending</p>
            </div>
            <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-pd-purple/30 to-transparent md:block" />
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-white tabular-nums">
                <AnimatedCounter target={9580} duration={2000} />
              </p>
              <p className="mt-1 text-sm text-gray-400">Hospitality Jobs</p>
            </div>
            <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-pd-purple/30 to-transparent md:block" />
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-white">
                <AnimatedCounter target={11} duration={1500} />
              </p>
              <p className="mt-1 text-sm text-gray-400">Cities Covered</p>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-gray-600">Source: Visit Temecula Valley 2024</p>
        </div>
      </section>

      {/* AFFILIATE REFERRAL BANNER */}
      <div className="py-8">
        <div className="container px-4">
          <AffiliateBanner />
        </div>
      </div>

      {/* FEATURED PLATINUM BUSINESSES */}
      <ScrollReveal>
        <section className="py-20">
          <div className="container">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-pd-gold" />
              <h2 className="font-heading text-3xl font-bold text-white">
                Featured Platinum Businesses
              </h2>
            </div>
            <div className="mt-1 h-1 w-24 rounded-full bg-gradient-to-r from-pd-gold to-pd-gold/0" />

            {/* Horizontal scrolling carousel */}
            <div className="horizontal-scroll -mx-4 mt-8 flex gap-5 px-4 pb-4">
              {bizList.map((biz) => {
                const imgUrl = biz.cover_image_url || `https://picsum.photos/seed/${biz.slug || biz.id}/800/400`;
                const catName = biz.categories?.name;
                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="glass-card glow-effect group relative flex w-72 flex-shrink-0 flex-col overflow-hidden"
                  >
                    {biz.is_featured && <div className="featured-ribbon">FEATURED</div>}

                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-pd-purple-dark/40 to-pd-blue-dark/30">
                      <img
                        src={imgUrl}
                        alt={biz.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,26,0.95)] via-[rgba(10,15,26,0.3)] to-transparent" />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-sm font-bold text-white group-hover:text-pd-gold">
                          {biz.name}
                        </h3>
                        {getTierBadge(biz.tier)}
                      </div>

                      {catName && (
                        <span className="mt-2 inline-block w-fit rounded-full bg-pd-purple/20 px-2.5 py-0.5 text-[10px] text-pd-purple-light">
                          {catName}
                        </span>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                        {biz.average_rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                            <span className="text-white">{biz.average_rating}</span>
                          </span>
                        )}
                        {biz.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {biz.city}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2 pt-3">
                        {biz.phone && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                            <Phone className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                          <Navigation className="h-3.5 w-3.5" />
                        </span>
                        {biz.website && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pd-purple/20 text-gray-400 transition-colors group-hover:border-pd-gold/30 group-hover:text-pd-gold">
                            <Globe className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {bizList.length === 0 && (
                <div className="glass-card mx-auto flex w-full max-w-md flex-col items-center p-12 text-center">
                  <Shield className="h-12 w-12 text-pd-purple/50" />
                  <p className="mt-4 text-lg text-gray-400">Premium businesses coming soon</p>
                  <Link href="/pricing" className="mt-4 text-sm text-pd-blue hover:text-pd-blue-light">
                    Become a verified business &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* WEEKLY GIVEAWAY BANNER */}
      <ScrollReveal>
        <section className="relative overflow-hidden py-12">
          <div className="absolute inset-0 bg-gradient-to-r from-pd-purple-dark/40 via-pd-blue-dark/20 to-pd-purple-dark/40" />
          <div className="container relative">
            <div className="glass-card-premium flex flex-col items-center gap-6 p-8 text-center lg:flex-row lg:text-left">
              <div className="animate-float flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-pd-gold/20">
                <Gift className="h-10 w-10 text-pd-gold" />
              </div>
              <div className="flex-1">
                <h3 className="text-gold-shimmer font-heading text-2xl font-bold md:text-3xl">
                  Win $250 This Week!
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Enter our weekly giveaway &mdash; gift cards, dining, &amp; more from local businesses
                </p>
                <div className="mt-4 flex justify-center lg:justify-start">
                  <CountdownTimer />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/giveaway"
                  className="btn-glow gradient-border rounded-xl bg-pd-gold px-8 py-3.5 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
                >
                  Enter Now &rarr;
                </Link>
                <Link
                  href="/giveaway/business"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-pd-purple/30 px-5 py-3.5 text-sm text-pd-purple-light transition-colors hover:border-pd-purple hover:text-white"
                >
                  <Trophy className="h-4 w-4" />
                  Business: Win $3,500
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CATEGORIES GRID */}
      <ScrollReveal>
        <section className="py-20">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-white">
              Browse by Category
            </h2>
            <p className="mt-2 text-gray-400">
              Discover trusted businesses across Temecula Valley
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayCategories.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon || ""] || MapPin;
                return (
                  <Link
                    key={cat.id}
                    href={`/search?category=${cat.slug}`}
                    className="glass-card group flex flex-col items-center gap-3 p-6 text-center"
                  >
                    <div className="category-icon-scale flex h-12 w-12 items-center justify-center rounded-xl bg-pd-purple/15">
                      <IconComponent className="h-6 w-6 text-pd-purple-light" />
                    </div>
                    <p className="font-heading text-xs font-semibold text-white">
                      {cat.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* MAP SECTION */}
      <ScrollReveal>
        <section className="py-20">
          <div className="container">
            <div className="flex items-center gap-3">
              <Map className="h-6 w-6 text-pd-blue-light" />
              <h2 className="font-heading text-3xl font-bold text-white">
                Serving 11 Cities Across the Valley
              </h2>
            </div>
            <p className="mt-2 text-gray-400">
              From Temecula Wine Country to Lake Elsinore, Canyon Lake, and beyond
            </p>

            <div className="map-section-dark mt-8 overflow-hidden rounded-2xl border border-pd-purple/15 p-1">
              <div className="relative h-[400px] overflow-hidden rounded-xl">
                <div className="absolute inset-0" style={{
                  background: `
                    radial-gradient(circle at 45% 55%, rgba(124, 58, 237, 0.12) 0%, transparent 35%),
                    radial-gradient(circle at 55% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 30%),
                    radial-gradient(circle at 35% 70%, rgba(201, 168, 76, 0.06) 0%, transparent 25%),
                    linear-gradient(135deg, #0D1321 0%, #111827 50%, #0D1321 100%)
                  `,
                }} />

                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px',
                }} />

                {VALLEY_CITIES.map((city, i) => {
                  const x = ((city.lng + 117.35) / 0.4) * 100;
                  const y = ((33.8 - city.lat) / 0.5) * 100;
                  const isPrimary = ["Temecula", "Murrieta", "Menifee", "Lake Elsinore"].includes(city.name);
                  return (
                    <Link
                      key={city.name}
                      href={`/search?city=${city.name}`}
                      className="group absolute z-10"
                      style={{
                        left: `${Math.max(8, Math.min(88, x))}%`,
                        top: `${Math.max(8, Math.min(88, y))}%`,
                      }}
                    >
                      <div className={`absolute -inset-3 animate-ping rounded-full ${isPrimary ? 'bg-pd-gold/20' : 'bg-pd-blue/15'}`} style={{ animationDuration: `${3 + i * 0.5}s` }} />
                      <div className={`relative h-3 w-3 rounded-full border-2 transition-all group-hover:scale-150 ${isPrimary ? 'border-pd-gold bg-pd-gold shadow-glow-gold' : 'border-pd-blue-light bg-pd-blue shadow-glow-blue'}`} />
                      <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-pd-dark/90 px-2 py-0.5 text-[10px] font-medium text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
                        {city.name}
                      </span>
                    </Link>
                  );
                })}

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="font-heading text-2xl font-bold text-white/10">TEMECULA VALLEY</p>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-4 rounded-xl bg-pd-dark/80 px-4 py-2 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-pd-gold" /> Primary
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-pd-blue" /> Coverage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* $3,500 BUSINESS SWEEPSTAKES CTA */}
      <ScrollReveal>
        <section className="py-20">
          <div className="container">
            <div className="glass-card-premium mx-auto max-w-3xl p-8 text-center md:p-12">
              <Crown className="mx-auto h-12 w-12 text-pd-gold" />
              <h2 className="mt-4 font-heading text-3xl font-bold text-white md:text-4xl">
                Win a FREE $3,500 Platinum Elite Package
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-gray-400">
                Are you a local business? Sign up for any paid plan to be automatically entered into our monthly drawing
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/giveaway/business"
                  className="btn-glow rounded-xl bg-pd-gold px-8 py-3.5 font-heading font-semibold text-pd-dark hover:bg-pd-gold-light"
                >
                  Learn More
                </Link>
                <Link
                  href="/claim"
                  className="rounded-xl border border-pd-purple/30 px-8 py-3.5 font-medium text-white transition-colors hover:border-pd-gold/40 hover:text-pd-gold"
                >
                  Claim Your Business
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ADVERTISE CTA */}
      <ScrollReveal>
        <section className="wine-hero-gradient py-24">
          <div className="container text-center">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Grow Your Business with Platinum Directory
            </h2>
            <div className="mx-auto mt-8 flex max-w-lg flex-col items-start gap-3 text-left text-gray-300">
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Reach Temecula&apos;s Premium Audience
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Featured Placement &amp; AI-Powered Insights
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pd-gold/20 text-xs text-pd-gold">&#10003;</span>
                Smart Offers That Drive Real Traffic
              </p>
            </div>
            <Link
              href="/pricing"
              className="btn-glow mt-10 inline-flex items-center gap-2 rounded-xl bg-pd-gold px-10 py-4 font-heading font-semibold text-pd-dark transition-colors hover:bg-pd-gold-light"
            >
              Become a Partner Today
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
