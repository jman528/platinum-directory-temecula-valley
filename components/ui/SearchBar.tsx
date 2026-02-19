"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search businesses, categories, or neighborhoods…",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      router.push(`/businesses?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`search-glow relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-300 ${className}`}
      role="search"
    >
      <Search
        className="h-5 w-5 flex-shrink-0 text-[#D4AF37]"
        aria-hidden="true"
      />
      <label htmlFor="pd-search" className="sr-only">
        Search Temecula Valley businesses
      </label>
      <input
        ref={inputRef}
        id="pd-search"
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
      />
      <button
        type="submit"
        className="btn-gold hidden flex-shrink-0 px-6 py-2 text-sm sm:flex"
        aria-label="Search"
      >
        Search
      </button>
      {/* Mobile: icon-only submit */}
      <button
        type="submit"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] sm:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-[#060c18]" />
      </button>
    </form>
  );
}
