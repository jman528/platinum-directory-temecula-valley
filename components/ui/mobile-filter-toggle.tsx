"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function MobileFilterToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-pd-purple/20 bg-pd-dark/80 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-colors hover:border-pd-gold/40 hover:text-white lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Mobile filter overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-pd-purple/20 bg-pd-dark/95 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-white">Filters</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-pd-purple/20 p-1.5 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
