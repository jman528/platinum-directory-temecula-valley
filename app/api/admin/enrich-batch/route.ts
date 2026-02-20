import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Category-based estimated hours templates
const HOURS_TEMPLATES: Record<string, Record<string, any>> = {
  restaurant: {
    monday: { open: "11:00", close: "21:00", closed: false },
    tuesday: { open: "11:00", close: "21:00", closed: false },
    wednesday: { open: "11:00", close: "21:00", closed: false },
    thursday: { open: "11:00", close: "21:00", closed: false },
    friday: { open: "11:00", close: "22:00", closed: false },
    saturday: { open: "11:00", close: "22:00", closed: false },
    sunday: { open: "11:00", close: "21:00", closed: false },
  },
  winery: {
    monday: { open: "10:00", close: "17:00", closed: false },
    tuesday: { open: "10:00", close: "17:00", closed: false },
    wednesday: { open: "10:00", close: "17:00", closed: false },
    thursday: { open: "10:00", close: "17:00", closed: false },
    friday: { open: "10:00", close: "18:00", closed: false },
    saturday: { open: "10:00", close: "18:00", closed: false },
    sunday: { open: "10:00", close: "17:00", closed: false },
  },
  services: {
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { closed: true },
    sunday: { closed: true },
  },
};

// Category-based amenity suggestions
const CATEGORY_AMENITIES: Record<string, string[]> = {
  "Restaurants & Dining": ["WiFi", "Outdoor Seating", "Takeout", "Delivery", "Reservations Required", "Full Bar", "Credit Cards Accepted"],
  "Wineries & Breweries": ["Wine Tasting", "Outdoor Seating", "Private Events", "Group Tours", "Gift Shop", "Credit Cards Accepted", "Pet Friendly"],
  "Health & Wellness": ["Appointment Only", "Parking Available", "WiFi", "Credit Cards Accepted", "Wheelchair Accessible"],
  "Hotels & Resorts": ["WiFi", "Parking Available", "Pet Friendly", "Wheelchair Accessible", "Swimming Pool", "Credit Cards Accepted"],
  "Shopping & Retail": ["Credit Cards Accepted", "Parking Available", "Wheelchair Accessible", "Walk-ins Welcome"],
};

function getHoursTemplate(categoryName: string): Record<string, any> | null {
  const lower = (categoryName || "").toLowerCase();
  if (lower.includes("restaurant") || lower.includes("dining") || lower.includes("bar") || lower.includes("cafe")) {
    return HOURS_TEMPLATES.restaurant;
  }
  if (lower.includes("winer") || lower.includes("brewer") || lower.includes("vineyard")) {
    return HOURS_TEMPLATES.winery;
  }
  return HOURS_TEMPLATES.services;
}

function generateDescription(name: string, category: string, city: string): string {
  const cat = category || "business";
  const loc = city || "Temecula Valley";
  const descriptions = [
    `${name} is a trusted ${cat.toLowerCase()} serving the ${loc} community. Visit us to learn more about our services and offerings.`,
    `Welcome to ${name}, your local ${cat.toLowerCase()} in ${loc}, CA. We're dedicated to providing quality service to our customers.`,
    `Discover ${name} in ${loc} — a premier ${cat.toLowerCase()} committed to excellence. Contact us today for more information.`,
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function calcDataQuality(biz: any): number {
  let score = 0;
  if (biz.name && biz.name.trim().length > 1) score += 20;
  if (biz.phone) score += 15;
  if (biz.address) score += 15;
  if (biz.email) score += 10;
  if (biz.website) score += 10;
  if (biz.description && biz.description.length > 10) score += 10;
  if (biz.hours && Object.keys(biz.hours).length > 0) score += 10;
  if (biz.social_media && Object.keys(biz.social_media).length > 0) score += 5;
  if (biz.amenities && biz.amenities.length > 0) score += 5;
  return score;
}

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.user_type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const batchSize = Math.min(body.batch_size || 25, 50);
  const tier = body.enrichment_tier || "basic";

  // Fetch next batch needing enrichment
  const { data: businesses } = await adminClient
    .from("businesses")
    .select("*, categories(name)")
    .eq("needs_enrichment", true)
    .eq("enrichment_status", "pending")
    .order("lead_score", { ascending: false })
    .limit(batchSize);

  if (!businesses || businesses.length === 0) {
    return NextResponse.json({ message: "No businesses to enrich", processed: 0 });
  }

  const enrichBatchId = `enrich_${tier}_${Date.now()}`;
  let processed = 0;
  let errors = 0;

  for (const biz of businesses) {
    try {
      const catName = (biz as any).categories?.name || "";
      const updates: Record<string, any> = {
        enrichment_status: "completed",
        enrichment_batch_id: enrichBatchId,
        last_enriched_at: new Date().toISOString(),
        needs_enrichment: false,
      };

      if (tier === "basic" || tier === "standard" || tier === "full") {
        // BASIC enrichment (free, instant)
        if (!biz.description) {
          updates.description = generateDescription(biz.name, catName, biz.city);
        }
        if (!biz.hours || Object.keys(biz.hours).length === 0) {
          updates.hours = getHoursTemplate(catName);
        }
        if (!biz.amenities || biz.amenities.length === 0) {
          const suggested = CATEGORY_AMENITIES[catName] || CATEGORY_AMENITIES["Shopping & Retail"] || [];
          if (suggested.length > 0) updates.amenities = suggested;
        }
      }

      if (tier === "standard" || tier === "full") {
        // STANDARD enrichment: Google Places API lookup
        if (!biz.google_place_id && process.env.GOOGLE_PLACES_API_KEY) {
          try {
            const query = encodeURIComponent(`${biz.name} ${biz.address || ""} ${biz.city || "Temecula"} CA`);
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,business_status,opening_hours,photos&key=${process.env.GOOGLE_PLACES_API_KEY}`
            );
            const data = await res.json();

            if (data.candidates && data.candidates.length > 0) {
              const place = data.candidates[0];
              updates.google_place_id = place.place_id;
              updates.google_maps_url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

              if (place.rating && (!biz.average_rating || biz.average_rating === 0)) {
                updates.average_rating = place.rating;
              }
              if (place.user_ratings_total && (!biz.review_count || biz.review_count === 0)) {
                updates.review_count = place.user_ratings_total;
              }

              // Calculate google presence score
              let presenceScore = 20; // has listing
              if (place.business_status === "OPERATIONAL") presenceScore += 15;
              if (place.photos && place.photos.length > 0) presenceScore += 15;
              if (place.opening_hours) presenceScore += 15;
              if (place.rating >= 4) presenceScore += 15;
              if (place.user_ratings_total > 10) presenceScore += 10;
              updates.google_presence_score = presenceScore;
            }
          } catch (e) {
            // Google API error, continue with basic enrichment
          }
        }
      }

      // Recalculate data quality after enrichment
      const enriched = { ...biz, ...updates };
      updates.data_quality_score = calcDataQuality(enriched);

      await adminClient.from("businesses").update(updates).eq("id", biz.id);
      processed++;
    } catch (e) {
      errors++;
      await adminClient
        .from("businesses")
        .update({ enrichment_status: "failed" })
        .eq("id", biz.id);
    }
  }

  return NextResponse.json({
    message: `Enrichment complete`,
    tier,
    batch_id: enrichBatchId,
    processed,
    errors,
    total_in_batch: businesses.length,
  });
}
