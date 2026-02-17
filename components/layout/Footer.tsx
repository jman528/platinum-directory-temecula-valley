import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pd-purple/20 bg-pd-dark py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              PLATINUM <span className="text-pd-gold">DIRECTORY</span>
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Temecula Valley&apos;s premier verified business directory.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Advertise</Link></li>
              <li><Link href="/claim" className="hover:text-white">Claim Your Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/giveaway" className="hover:text-white">Weekly Giveaway</Link></li>
              <li><Link href="/deals" className="hover:text-white">Smart Offers</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-heading text-sm font-semibold text-white">
              Cities We Cover
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/city/Temecula" className="hover:text-white">Temecula</Link></li>
              <li><Link href="/city/Murrieta" className="hover:text-white">Murrieta</Link></li>
              <li><Link href="/city/Menifee" className="hover:text-white">Menifee</Link></li>
              <li><Link href="/city/Lake Elsinore" className="hover:text-white">Lake Elsinore</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-pd-purple/20 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Platinum Directory Temecula Valley. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
