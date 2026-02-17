// Placeholder script — requires GOOGLE_PLACES_API_KEY
// For each business in Sanity without a googlePlaceId:
//   1. Search Google Places API: query = `${name} ${address} ${city} CA`
//   2. If match found, update Sanity document with:
//      - googlePlaceId, googleRating, googleReviewCount
//      - geopoint (lat/lng)
//      - website (if not set)
//      - Map Google types → our category references
//      - Business hours
//   3. Rate limit: 10 requests/second (Google QPS limit)
//   4. Log progress and save checkpoint for resume
//
// Cost estimate: ~$0.017 per request × 7,831 = ~$133
// Can be run in batches over multiple days

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2025-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.log("GOOGLE_PLACES_API_KEY not set. Add it to .env.local to run enrichment.");
    console.log("\nThis script will:");
    console.log("  1. Find businesses without googlePlaceId");
    console.log("  2. Search Google Places API for each");
    console.log("  3. Update Sanity with rating, reviews, coordinates, hours");
    console.log("  4. Estimated cost: ~$133 for 7,831 businesses");
    process.exit(0);
  }

  const businesses = await client.fetch(
    `*[_type == "business" && !defined(googlePlaceId)] { _id, name, address, city }`
  );

  console.log(`Found ${businesses.length} businesses to enrich`);
  // TODO: Implement Google Places API calls
  console.log("Enrichment not yet implemented. Add Google Places API logic here.");
}

main().catch(console.error);
