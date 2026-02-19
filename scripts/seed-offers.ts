import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const OFFER_TEMPLATES = [
  // Wine-related
  {
    titleFn: (biz: string) => `Wine Tasting Experience at ${biz}`,
    description: "Enjoy a premium wine tasting flight featuring 5 estate wines paired with artisan cheese. Perfect for date night or group outings.",
    terms: "Must be 21+. Valid any day during regular tasting hours. Not combinable with other offers. Reservations recommended.",
    redemption_instructions: "Show your QR voucher to the host upon arrival. Present valid ID for age verification.",
    offer_type: "voucher" as const,
    originalPrice: 65,
    offerPrice: 39,
    maxClaims: 200,
    category: "wineries-vineyards",
  },
  {
    titleFn: (biz: string) => `Sunset Tour & Tasting — ${biz}`,
    description: "Guided vineyard tour with sunset wine tasting, charcuterie board, and a souvenir glass to take home.",
    terms: "Available Thursday–Sunday, 4–7 PM. Subject to weather. Advance booking required.",
    redemption_instructions: "Book online using the code from your voucher, or call the winery to reserve your spot.",
    offer_type: "voucher" as const,
    originalPrice: 95,
    offerPrice: 59,
    maxClaims: 100,
    category: "wineries-vineyards",
  },
  // Dining
  {
    titleFn: (biz: string) => `Dinner for Two at ${biz}`,
    description: "Two entrees, one appetizer, and two house drinks. Experience the best of Temecula Valley cuisine.",
    terms: "Valid Sunday–Thursday. Excludes holidays. Gratuity not included. Dine-in only.",
    redemption_instructions: "Present your voucher QR code to your server before ordering.",
    offer_type: "voucher" as const,
    originalPrice: 120,
    offerPrice: 79,
    maxClaims: 150,
    category: "restaurants-dining",
  },
  {
    titleFn: (biz: string) => `Brunch Special — ${biz}`,
    description: "Weekend brunch for two including unlimited mimosas, two entrees, and a shared dessert.",
    terms: "Valid Saturdays and Sundays, 9 AM – 2 PM only. Cannot be combined with other discounts.",
    redemption_instructions: "Show voucher QR code to host when seated. Valid for dine-in only.",
    offer_type: "voucher" as const,
    originalPrice: 85,
    offerPrice: 55,
    maxClaims: 100,
    category: "old-town-dining",
  },
  // Spa / Wellness
  {
    titleFn: (biz: string) => `Relaxation Package — ${biz}`,
    description: "60-minute Swedish massage plus aromatherapy add-on. Melt away stress in wine country.",
    terms: "By appointment only. 24-hour cancellation policy. New clients only.",
    redemption_instructions: "Call to book and mention your Platinum Directory voucher code.",
    offer_type: "voucher" as const,
    originalPrice: 150,
    offerPrice: 99,
    maxClaims: 75,
    category: "health-wellness",
  },
  // Shopping
  {
    titleFn: (biz: string) => `$50 Gift Card for $35 — ${biz}`,
    description: "Get $50 of store credit for just $35. Stock up on artisanal goods and local products.",
    terms: "One per customer. No cash value. Valid for 90 days from purchase.",
    redemption_instructions: "Show QR voucher at checkout. Staff will apply $50 credit to your purchase.",
    offer_type: "voucher" as const,
    originalPrice: 50,
    offerPrice: 35,
    maxClaims: 200,
    category: "shopping-retail",
  },
  // Local deal (percentage off)
  {
    titleFn: (biz: string) => `20% Off Any Purchase — ${biz}`,
    description: "Save 20% on your entire purchase. Discover what makes this local favorite a must-visit.",
    terms: "Cannot be combined with other offers. One use per customer. In-store only.",
    redemption_instructions: "Show this voucher on your phone at checkout for 20% off.",
    offer_type: "local_deal" as const,
    originalPrice: 100,
    offerPrice: 80,
    maxClaims: 300,
    category: "any",
  },
  // Premium experience
  {
    titleFn: (biz: string) => `VIP Experience — ${biz}`,
    description: "Exclusive behind-the-scenes VIP experience including private tour, premium tastings, and a take-home gift.",
    terms: "Advance reservation required. Limited to 8 guests per session. Ages 21+ for wine experiences.",
    redemption_instructions: "Email your voucher code to reservations@business.com or call to book your VIP slot.",
    offer_type: "voucher" as const,
    originalPrice: 200,
    offerPrice: 129,
    maxClaims: 50,
    category: "any",
  },
];

async function seedOffers() {
  console.log("Fetching businesses...");
  const { data: businesses, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, slug, tier, city, category_id, categories(slug)")
    .eq("is_active", true);

  if (bizError) {
    console.error("Error fetching businesses:", bizError);
    return;
  }
  if (!businesses || businesses.length === 0) {
    console.error("No businesses found. Run the main seed first.");
    return;
  }

  console.log(`Found ${businesses.length} businesses`);

  // Delete existing seeded offers
  console.log("Clearing existing offers...");
  await supabase.from("offers").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const offers: any[] = [];
  const now = new Date();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expirations = [
    ninetyDays.toISOString(),
    sixtyDays.toISOString(),
    thirtyDays.toISOString(),
  ];

  // Only create offers for non-free tier businesses
  const paidBusinesses = businesses.filter((b: any) => b.tier !== "free");

  for (const biz of paidBusinesses) {
    const catSlug = (biz as any).categories?.slug || "";
    // Pick 1-3 offer templates for this business
    const matchingTemplates = OFFER_TEMPLATES.filter(
      (t) => t.category === "any" || t.category === catSlug
    );
    // Use at least 1, up to 2 offers per business
    const count = Math.min(2, matchingTemplates.length);
    const selected = matchingTemplates.slice(0, count);

    for (let i = 0; i < selected.length; i++) {
      const t = selected[i];
      const title = t.titleFn(biz.name);
      const slug = slugify(title) + `-${biz.slug}`;
      const isFeatured = biz.tier === "platinum_elite" || (biz.tier === "platinum_partner" && i === 0);

      offers.push({
        business_id: biz.id,
        slug,
        title,
        description: t.description,
        terms: t.terms,
        redemption_instructions: t.redemption_instructions,
        offer_type: t.offer_type,
        original_price: t.originalPrice,
        offer_price: t.offerPrice,
        discount_type: "fixed",
        discount_value: t.originalPrice - t.offerPrice,
        max_claims: t.maxClaims,
        max_per_customer: 2,
        current_claims: Math.floor(Math.random() * 30),
        starts_at: now.toISOString(),
        expires_at: expirations[i % expirations.length],
        is_active: true,
        is_featured: isFeatured,
        status: "active",
        cover_image_url: `https://picsum.photos/seed/${biz.slug}-offer-${i}/800/400`,
      });
    }
  }

  console.log(`Inserting ${offers.length} offers...`);
  const { error: insertError } = await supabase.from("offers").insert(offers);

  if (insertError) {
    console.error("Insert error:", insertError);
    return;
  }

  // Verify
  const { count } = await supabase
    .from("offers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  console.log(`\nSeeded ${count} active offers`);

  // Show breakdown
  const { data: featured } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: false })
    .eq("is_featured", true);

  console.log(`  Featured: ${featured?.length || 0}`);
  console.log(`  Regular: ${(count || 0) - (featured?.length || 0)}`);
  console.log("\nDone!");
}

seedOffers().catch(console.error);
