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

const CATEGORIES = [
  { name: "Restaurants & Dining", icon: "UtensilsCrossed", order: 1, slug: "restaurants-dining" },
  { name: "Wineries & Vineyards", icon: "Wine", order: 2, slug: "wineries-vineyards" },
  { name: "Tours & Attractions", icon: "Map", order: 3, slug: "tours-attractions" },
  { name: "Hotels & Lodging", icon: "Hotel", order: 4, slug: "hotels-lodging" },
  { name: "Health & Wellness", icon: "Heart", order: 5, slug: "health-wellness" },
  { name: "Shopping & Retail", icon: "ShoppingBag", order: 6, slug: "shopping-retail" },
  { name: "Professional Services", icon: "Briefcase", order: 7, slug: "professional-services" },
  { name: "Home Services", icon: "Wrench", order: 8, slug: "home-services" },
  { name: "Automotive", icon: "Car", order: 9, slug: "automotive" },
  { name: "Beauty & Personal Care", icon: "Sparkles", order: 10, slug: "beauty-personal-care" },
  { name: "Real Estate & Property", icon: "Home", order: 11, slug: "real-estate-property" },
  { name: "Arts & Entertainment", icon: "Music", order: 12, slug: "arts-entertainment" },
  { name: "Education & Childcare", icon: "GraduationCap", order: 13, slug: "education-childcare" },
  { name: "Pets & Animals", icon: "PawPrint", order: 14, slug: "pets-animals" },
  { name: "Technology & IT", icon: "Monitor", order: 15, slug: "technology-it" },
  { name: "Local Artisans & Crafts", icon: "Palette", order: 16, slug: "local-artisans-crafts" },
  { name: "Business to Business", icon: "Building2", order: 17, slug: "business-to-business" },
  { name: "Nonprofit & Community", icon: "Users", order: 18, slug: "nonprofit-community" },
  { name: "Luxury Accommodations", icon: "Crown", order: 19, slug: "luxury-accommodations" },
  { name: "Old Town Dining", icon: "Store", order: 20, slug: "old-town-dining" },
];

const SAMPLE_BUSINESSES = [
  { name: "Ponte Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_elite", description: "Award-winning winery featuring Italian-inspired cuisine and stunning vineyard views.", address: "35053 Rancho California Rd", phone: "9516940400", priceRange: "$$$", rating: 4.7, reviews: 2850 },
  { name: "Wilson Creek Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Family-owned winery known for its Almond Champagne and beautiful grounds.", address: "35960 Rancho California Rd", phone: "9516999463", priceRange: "$$$", rating: 4.6, reviews: 3200 },
  { name: "South Coast Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Resort and spa surrounded by vineyards, offering premium wine experiences.", address: "34843 Rancho California Rd", phone: "9515870700", priceRange: "$$$$", rating: 4.5, reviews: 1890 },
  { name: "The Gambling Cowboy", category: "old-town-dining", city: "Temecula", zip: "92590", tier: "platinum_partner", description: "Classic American chophouse in the heart of Old Town Temecula.", address: "28721 Old Town Front St", phone: "9516940990", priceRange: "$$$", rating: 4.5, reviews: 1240 },
  { name: "1909 Temecula", category: "restaurants-dining", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Hip craft cocktail bar and restaurant in a historic 1909 building.", address: "28636 Old Town Front St", phone: "9516947782", priceRange: "$$", rating: 4.4, reviews: 980 },
  { name: "Prestige Auto Spa", category: "automotive", city: "Temecula", zip: "92590", tier: "platinum_partner", description: "Premium auto detailing and car care services.", address: "27407 Ynez Rd", phone: "9515061234", priceRange: "$$", rating: 4.8, reviews: 340 },
  { name: "Keller Williams Realty Temecula", category: "real-estate-property", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Full-service real estate brokerage serving Temecula Valley.", address: "40990 California Oaks Rd", phone: "9516944700", priceRange: "$$$$", rating: 4.3, reviews: 120 },
  { name: "Temecula Creek Inn", category: "hotels-lodging", city: "Temecula", zip: "92591", tier: "platinum_elite", description: "Resort-style hotel with golf course and spa in wine country.", address: "44501 Rainbow Canyon Rd", phone: "9516941000", priceRange: "$$$$", rating: 4.4, reviews: 1560 },
  { name: "Pechanga Resort Casino", category: "luxury-accommodations", city: "Temecula", zip: "92592", tier: "platinum_elite", description: "World-class casino resort with spa, dining, and entertainment.", address: "45000 Pechanga Pkwy", phone: "9516931819", priceRange: "$$$$", rating: 4.5, reviews: 8900 },
  { name: "Temecula Olive Oil Company", category: "shopping-retail", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Artisanal olive oils and gourmet foods in Old Town.", address: "28653 Old Town Front St", phone: "9516937500", priceRange: "$$", rating: 4.7, reviews: 410 },
  { name: "Pennypickle's Workshop", category: "tours-attractions", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Interactive children's museum in Old Town Temecula.", address: "42081 Main St", phone: "9513082580", priceRange: "$", rating: 4.6, reviews: 520 },
  { name: "Murrieta Day Spa", category: "health-wellness", city: "Murrieta", zip: "92562", tier: "platinum_partner", description: "Full-service day spa offering massage, facials, and body treatments.", address: "25220 Hancock Ave", phone: "9516982780", priceRange: "$$", rating: 4.7, reviews: 230 },
  { name: "Spanos Barber Shop", category: "beauty-personal-care", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Traditional barbershop with modern styling in Old Town.", address: "28636 Old Town Front St Ste 100", phone: "9516940501", priceRange: "$", rating: 4.9, reviews: 180 },
  { name: "Temecula Valley Plumbing", category: "home-services", city: "Temecula", zip: "92590", tier: "free", description: "Licensed plumbing services for residential and commercial.", phone: "9517682345", priceRange: "$$", rating: 4.2, reviews: 85 },
  { name: "Valley Tax & Accounting", category: "professional-services", city: "Murrieta", zip: "92562", tier: "free", description: "Tax preparation and bookkeeping for small businesses.", address: "24910 Las Brisas Rd", phone: "9516980123", priceRange: "$$", rating: 4.1, reviews: 42 },
  { name: "Temecula Music Academy", category: "education-childcare", city: "Temecula", zip: "92590", tier: "free", description: "Music lessons for all ages — piano, guitar, drums, and voice.", phone: "9516940567", priceRange: "$$", rating: 4.8, reviews: 95 },
  { name: "Promenade in Temecula", category: "shopping-retail", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Premier outdoor shopping center with dining and entertainment.", address: "40820 Winchester Rd", phone: "9512961222", priceRange: "$$", rating: 4.2, reviews: 1340 },
  { name: "Old Town Sweets", category: "old-town-dining", city: "Temecula", zip: "92590", tier: "free", description: "Candy shop and ice cream parlor in Old Town Temecula.", address: "28636 Old Town Front St", phone: "9516939888", priceRange: "$", rating: 4.6, reviews: 320 },
  { name: "Temecula Valley Animal Hospital", category: "pets-animals", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Full-service veterinary hospital for dogs, cats, and exotic pets.", address: "31555 Rancho California Rd", phone: "9516762601", priceRange: "$$", rating: 4.5, reviews: 275 },
  { name: "Craft Coffee Collective", category: "restaurants-dining", city: "Murrieta", zip: "92562", tier: "free", description: "Specialty coffee roaster and cafe.", address: "24660 Washington Ave", phone: "9516010234", priceRange: "$", rating: 4.7, reviews: 190 },
  { name: "TechVault IT Solutions", category: "technology-it", city: "Temecula", zip: "92590", tier: "free", description: "Managed IT services and cybersecurity for local businesses.", phone: "9519225678", priceRange: "$$$", rating: 4.3, reviews: 28 },
  { name: "Heart & Soul Pottery", category: "local-artisans-crafts", city: "Temecula", zip: "92590", tier: "free", description: "Handmade pottery and ceramic art studio.", phone: "9516949012", priceRange: "$$", rating: 4.8, reviews: 67 },
  { name: "Valley Business Alliance", category: "business-to-business", city: "Temecula", zip: "92590", tier: "free", description: "B2B networking and consulting for Temecula Valley businesses.", phone: "9516943456", priceRange: "$$", rating: 4.0, reviews: 15 },
  { name: "Hope Community Center", category: "nonprofit-community", city: "Murrieta", zip: "92562", tier: "free", description: "Community center providing youth programs and social services.", phone: "9516987890", priceRange: "$", rating: 4.9, reviews: 110 },
  { name: "Rosa's Authentic Mexican", category: "restaurants-dining", city: "Hemet", zip: "92543", tier: "free", description: "Traditional Mexican cuisine made with family recipes.", address: "125 E Florida Ave", phone: "9517652345", priceRange: "$", rating: 4.5, reviews: 450 },
  { name: "Lake Elsinore Outlet Center", category: "shopping-retail", city: "Lake Elsinore", zip: "92530", tier: "free", description: "Outlet shopping center with brand name stores.", address: "17600 Collier Ave", phone: "9512456789", priceRange: "$", rating: 3.9, reviews: 680 },
  { name: "Menifee Auto Group", category: "automotive", city: "Menifee", zip: "92584", tier: "free", description: "New and pre-owned vehicles with full service center.", address: "28000 Bradley Rd", phone: "9516720123", priceRange: "$$$", rating: 4.1, reviews: 210 },
  { name: "Wildomar Wellness Center", category: "health-wellness", city: "Wildomar", zip: "92595", tier: "free", description: "Chiropractic care and wellness services.", phone: "9516780456", priceRange: "$$", rating: 4.4, reviews: 45 },
  { name: "Canyon Lake Country Club", category: "arts-entertainment", city: "Canyon Lake", zip: "92587", tier: "verified_platinum", description: "Private country club with golf, tennis, and dining.", phone: "9512440941", priceRange: "$$$$", rating: 4.3, reviews: 95 },
  { name: "Fallbrook Winery", category: "wineries-vineyards", city: "Fallbrook", zip: "92028", tier: "verified_platinum", description: "Boutique winery in the rolling hills of Fallbrook.", address: "2554 Via Rancheros", phone: "7607234500", priceRange: "$$", rating: 4.6, reviews: 340 },
];

async function seedCategories() {
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await client.createOrReplace({
      _id: `category-${cat.slug}`,
      _type: "category",
      name: cat.name,
      slug: { _type: "slug", current: cat.slug },
      icon: cat.icon,
      order: cat.order,
      isActive: true,
      businessCount: 0,
    });
    console.log(`  ✓ ${cat.name}`);
  }
  console.log(`Seeded ${CATEGORIES.length} categories`);
}

async function seedBusinesses() {
  console.log("\nSeeding businesses...");
  for (const biz of SAMPLE_BUSINESSES) {
    const slugified = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const catId = `category-${biz.category}`;
    
    const smartOffers = [];
    if (biz.tier !== "free") {
      smartOffers.push({
        _key: `offer-${slugified}`,
        title: `Welcome Special at ${biz.name}`,
        description: `Exclusive deal for Platinum Directory visitors`,
        originalPrice: biz.priceRange === "$" ? 25 : biz.priceRange === "$$" ? 50 : biz.priceRange === "$$$" ? 100 : 200,
        offerPrice: biz.priceRange === "$" ? 15 : biz.priceRange === "$$" ? 35 : biz.priceRange === "$$$" ? 75 : 150,
        isActive: true,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        maxRedemptions: 100,
        currentRedemptions: 0,
      });
    }

    await client.createOrReplace({
      _id: `business-${slugified}`,
      _type: "business",
      name: biz.name,
      slug: { _type: "slug", current: slugified },
      description: biz.description,
      primaryCategory: { _type: "reference", _ref: catId },
      address: biz.address || "",
      city: biz.city,
      state: "CA",
      zip: biz.zip,
      phone: biz.phone,
      tier: biz.tier,
      status: "active",
      isVerified: biz.tier !== "free",
      isFeatured: biz.tier === "platinum_partner" || biz.tier === "platinum_elite",
      priceRange: biz.priceRange,
      googleRating: biz.rating,
      googleReviewCount: biz.reviews,
      averageRating: biz.rating,
      reviewCount: biz.reviews,
      seoTitle: `${biz.name} - Temecula Valley Business Directory`,
      smartOffers: smartOffers.length > 0 ? smartOffers : undefined,
    });
    console.log(`  ✓ ${biz.name} (${biz.tier})`);
  }
  console.log(`Seeded ${SAMPLE_BUSINESSES.length} businesses`);
}

async function seedGiveaways() {
  console.log("\nSeeding giveaways...");
  
  // Consumer giveaway
  await client.createOrReplace({
    _id: "giveaway-consumer-weekly",
    _type: "giveaway",
    title: "Weekly $250 Giveaway — Gift Cards & Dining",
    description: "Enter to win $250 in gift cards from local Temecula Valley businesses! New winner every week.",
    giveawayType: "consumer",
    prizeValue: 250,
    prizeDescription: "$250 in local business gift cards",
    eligibility: "Open to all Temecula Valley residents (ZIP code verified)",
    drawingFrequency: "weekly",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    entryCount: 0,
  });
  console.log("  ✓ Consumer weekly $250 giveaway");

  // Business sweepstakes
  await client.createOrReplace({
    _id: "giveaway-business-elite",
    _type: "giveaway",
    title: "Win a FREE $3,500 Platinum Elite Package",
    description: "Every business on a paid plan is automatically entered to win a complete Platinum Elite advertising package.",
    giveawayType: "business",
    prizeValue: 3500,
    prizeDescription: "Platinum Elite Package — featured placement, paid traffic, dedicated manager, category exclusivity",
    eligibility: "Must be on a paid plan (Verified, Partner, or Elite) to enter",
    requiredTiers: ["verified_platinum", "platinum_partner", "platinum_elite"],
    drawingFrequency: "monthly",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    entryCount: 0,
  });
  console.log("  ✓ Business $3,500 sweepstakes");
}

async function main() {
  const isClean = process.argv.includes("--clean");
  
  if (isClean) {
    console.log("Cleaning existing data...");
    const types = ["business", "category", "subcategory", "review", "lead", "giveaway", "giveawayEntry"];
    for (const type of types) {
      const docs = await client.fetch(`*[_type == "${type}"]{ _id }`);
      if (docs.length > 0) {
        const tx = client.transaction();
        for (const doc of docs) tx.delete(doc._id);
        await tx.commit();
        console.log(`  Deleted ${docs.length} ${type} documents`);
      }
    }
  }

  await seedCategories();
  await seedBusinesses();
  await seedGiveaways();

  console.log("\n✅ Seed complete!");
}

main().catch(console.error);
