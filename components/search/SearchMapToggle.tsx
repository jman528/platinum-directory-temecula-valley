"use client";

import { useState } from "react";
import { Map, List } from "lucide-react";
import dynamic from "next/dynamic";

const MapboxClusterMap = dynamic(() => import("@/components/MapboxClusterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white/5 rounded-xl">
      <p className="text-sm text-gray-500">Loading map...</p>
    </div>
  ),
});

interface Business {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  average_rating: number;
  tier: string;
  cover_image_url?: string;
  city?: string;
}

interface SearchMapToggleProps {
  businesses: Business[];
}

export default function SearchMapToggle({ businesses }: SearchMapToggleProps) {
  const [showMap, setShowMap] = useState(true);

  const hasGeoData = businesses.some((b) => b.latitude && b.longitude);
  if (!hasGeoData) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-pd-purple/30 hover:text-white"
      >
        {showMap ? <List className="h-4 w-4" /> : <Map className="h-4 w-4" />}
        {showMap ? "Hide Map" : "Show Map"}
      </button>

      {/* Map */}
      {showMap && (
        <div className="mb-6 h-[350px] overflow-hidden rounded-xl border border-white/10 lg:h-[450px]">
          <MapboxClusterMap businesses={businesses} />
        </div>
      )}
    </>
  );
}
