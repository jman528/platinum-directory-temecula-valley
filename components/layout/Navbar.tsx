import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-pd-purple/20 bg-pd-dark/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-white">
            PLATINUM <span className="text-pd-gold">DIRECTORY</span>
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Temecula Valley
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm text-gray-300 transition-colors hover:text-white"
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
            className="text-sm text-pd-gold transition-colors hover:text-pd-gold-light"
          >
            Win $250
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-pd-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pd-blue-dark">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm text-gray-300 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
