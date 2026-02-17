import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Platinum Directory — Temecula Valley's premier verified business directory.",
};

export default function AboutPage() {
  return (
    <div className="container py-16">
      <h1 className="font-heading text-4xl font-bold text-white">About Platinum Directory</h1>
      <div className="mt-8 max-w-3xl space-y-6 text-gray-300">
        <p>
          Platinum Directory is Temecula Valley&apos;s premier verified business directory, connecting
          local consumers with trusted businesses across 11 cities in the region.
        </p>
        <p>
          From wine country dining and luxury accommodations to professional services and local artisans,
          we curate and verify businesses to ensure quality for our community.
        </p>
        <h2 className="font-heading text-2xl font-bold text-white">Our Mission</h2>
        <p>
          To empower local businesses with the tools, visibility, and connections they need to thrive —
          while giving residents a trusted resource for discovering the best Temecula Valley has to offer.
        </p>
        <h2 className="font-heading text-2xl font-bold text-white">Cities We Cover</h2>
        <p>
          Temecula, Murrieta, Hemet, Menifee, Fallbrook, Lake Elsinore, Perris, Wildomar, Winchester, Sun City, and Canyon Lake — over 8,000 businesses strong.
        </p>
      </div>
    </div>
  );
}
