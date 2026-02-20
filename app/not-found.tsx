import Link from "next/link";
import { Search, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pd-dark px-4">
      <div className="glass-card mx-auto max-w-lg p-12 text-center">
        <h1 className="text-gold-shimmer text-8xl font-heading font-black">404</h1>
        <h2 className="mt-4 text-2xl font-heading font-bold text-white">Page Not Found</h2>
        <p className="mt-3 text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/search"
            className="btn-gold btn-premium flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          >
            <Search className="h-4 w-4" />
            Browse Directory
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <MapPin className="h-4 w-4" />
            Search
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
