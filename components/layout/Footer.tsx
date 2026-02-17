import Link from "next/link";

const FOOTER_CITIES = [
  "Temecula", "Murrieta", "Hemet", "Menifee", "Fallbrook",
  "Lake Elsinore", "Perris", "Wildomar", "Winchester", "Sun City", "Canyon Lake",
];

export default function Footer() {
  return (
    <footer className="relative border-t border-pd-purple/20 bg-pd-dark/90 backdrop-blur-md">
      {/* Gold accent line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pd-gold/40 to-transparent" />

      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div>
            <h3 className="font-heading text-lg font-bold">
              <span className="text-gold-shimmer">PLATINUM</span>{" "}
              <span className="text-white">DIRECTORY</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Temecula Valley&apos;s premier verified business directory.
              Connecting residents and visitors with trusted local businesses across 11 cities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/about" className="transition-colors hover:text-pd-gold">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-pd-gold">Contact</Link></li>
              <li><Link href="/pricing" className="transition-colors hover:text-pd-gold">Advertise</Link></li>
              <li><Link href="/claim" className="transition-colors hover:text-pd-gold">Claim Your Business</Link></li>
              <li><Link href="/giveaway" className="transition-colors hover:text-pd-gold">Weekly Giveaway</Link></li>
              <li><Link href="/deals" className="transition-colors hover:text-pd-gold">Smart Offers</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-white">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/search" className="transition-colors hover:text-pd-gold">Search Businesses</Link></li>
              <li><Link href="/giveaway/business" className="transition-colors hover:text-pd-gold">Business Sweepstakes</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-pd-gold">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-pd-gold">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Cities We Cover */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-white">
              Cities We Cover
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-400">
              {FOOTER_CITIES.map((city) => (
                <li key={city}>
                  <Link href={`/city/${city}`} className="transition-colors hover:text-pd-gold">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-pd-purple/20 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Platinum Directory Temecula Valley. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
