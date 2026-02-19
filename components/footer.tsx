import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080c16]">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Platinum Directory" width={32} height={32} />
              <span className="font-heading text-sm font-bold text-white">PLATINUM DIRECTORY</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Temecula Valley&apos;s premier verified business directory. Exclusive deals, rewards, and local discovery.
            </p>
          </div>

          {/* Directory */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Directory</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <Link href="/search" className="hover:text-gray-300 transition-colors">Browse All</Link>
              <Link href="/search?tier=platinum_elite" className="hover:text-gray-300 transition-colors">Elite Businesses</Link>
              <Link href="/search?has_offers=true" className="hover:text-gray-300 transition-colors">Smart Offers</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <Link href="/legal/business-terms" className="hover:text-gray-300 transition-colors">For Businesses</Link>
              <Link href="/legal/affiliate" className="hover:text-gray-300 transition-colors">Affiliate Program</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <Link href="/legal/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="/legal/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/legal/smart-offers" className="hover:text-gray-300 transition-colors">Smart Offers Terms</Link>
              <Link href="/legal/business-terms" className="hover:text-gray-300 transition-colors">Business Terms</Link>
              <Link href="/legal/affiliate" className="hover:text-gray-300 transition-colors">Affiliate Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Platinum Directory Temecula Valley. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
