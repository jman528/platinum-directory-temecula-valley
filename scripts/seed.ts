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
  // === PLATINUM ELITE (4) ===
  { name: "Ponte Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_elite", description: "Award-winning winery featuring Italian-inspired cuisine, vineyard views, and a full-service inn nestled in wine country.", address: "35053 Rancho California Rd", phone: "(951) 694-0400", website: "https://www.pontewinery.com", priceRange: "$$$", rating: 4.7, reviews: 2850, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/ponte-vineyard/800/400" },
  { name: "Pechanga Resort Casino", category: "luxury-accommodations", city: "Temecula", zip: "92592", tier: "platinum_elite", description: "World-class casino resort with luxury spa, championship golf, five-star dining, and top entertainment.", address: "45000 Pechanga Pkwy", phone: "(951) 693-1819", website: "https://www.pechanga.com", priceRange: "$$$$", rating: 4.5, reviews: 8900, neighborhood: "Pechanga", coverImageUrl: "https://picsum.photos/seed/pechanga-resort/800/400" },
  { name: "Leoness Cellars", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_elite", description: "Stunning hilltop winery with panoramic vineyard views, award-winning wines, and The Restaurant at Leoness.", address: "38311 De Portola Rd", phone: "(951) 302-7601", website: "https://www.leonesscellars.com", priceRange: "$$$", rating: 4.7, reviews: 1920, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/leoness-hilltop/800/400" },
  { name: "Europa Village", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_elite", description: "European-inspired winery village featuring Spanish, French, and Italian estates with boutique inn and bistro.", address: "33475 La Serena Way", phone: "(951) 506-0600", website: "https://www.europavillage.com", priceRange: "$$$$", rating: 4.6, reviews: 1650, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/europa-village/800/400" },

  // === PLATINUM PARTNER (7) ===
  { name: "Wilson Creek Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Family-owned winery famous for its Almond Champagne, beautiful picnic grounds, and wedding venue.", address: "35960 Rancho California Rd", phone: "(951) 699-9463", website: "https://www.wilsoncreekwinery.com", priceRange: "$$$", rating: 4.6, reviews: 3200, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/wilson-creek/800/400" },
  { name: "Thornton Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Premier sparkling wine producer with acclaimed Champagne Jazz concert series and fine dining.", address: "32575 Rancho California Rd", phone: "(951) 699-0099", website: "https://www.thorntonwine.com", priceRange: "$$$", rating: 4.5, reviews: 1780, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/thornton-jazz/800/400" },
  { name: "Callaway Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "One of Temecula's original wineries offering premium wines, gourmet dining, and breathtaking views.", address: "32720 Rancho California Rd", phone: "(951) 676-0503", website: "https://www.callawaywinery.com", priceRange: "$$$", rating: 4.4, reviews: 1560, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/callaway-views/800/400" },
  { name: "South Coast Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Resort and spa surrounded by vineyards offering premium wine experiences, luxury villas, and fine dining.", address: "34843 Rancho California Rd", phone: "(951) 587-0700", website: "https://www.southcoastwinery.com", priceRange: "$$$$", rating: 4.5, reviews: 1890, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/southcoast-spa/800/400" },
  { name: "Robert Renzoni Vineyards", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Italian-inspired winery bringing old-world Fano traditions to Temecula with handcrafted wines and Tuscan architecture.", address: "37350 De Portola Rd", phone: "(951) 302-1919", website: "https://www.robertrenzoni.com", priceRange: "$$$", rating: 4.6, reviews: 1340, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/renzoni-tuscan/800/400" },
  { name: "Carol's Restaurant", category: "old-town-dining", city: "Temecula", zip: "92590", tier: "platinum_partner", description: "Beloved Old Town breakfast and brunch spot known for generous portions and welcoming atmosphere.", address: "28636 Old Town Front St", phone: "(951) 694-0656", website: "https://www.carolsrestaurant.com", priceRange: "$$", rating: 4.5, reviews: 1120, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/carols-brunch/800/400" },
  { name: "Bushfire Kitchen", category: "restaurants-dining", city: "Temecula", zip: "92591", tier: "platinum_partner", description: "Farm-to-table restaurant featuring wood-fired cuisine, craft cocktails, and a vibrant patio atmosphere.", address: "41923 2nd St", phone: "(951) 302-8500", website: "https://www.bushfirekitchen.com", priceRange: "$$$", rating: 4.4, reviews: 890, neighborhood: "Promenade", coverImageUrl: "https://picsum.photos/seed/bushfire-grill/800/400" },

  // === VERIFIED PLATINUM (9) ===
  { name: "Briar Rose Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Charming boutique winery with a fairy-tale cottage setting and intimate tasting experiences.", address: "41720 Calle Cabrillo", phone: "(951) 308-1098", website: "https://www.briarrosewinery.com", priceRange: "$$", rating: 4.8, reviews: 520, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/briarrose-cottage/800/400" },
  { name: "Lorimar Vineyards", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Art-focused winery combining wine tasting with live music, art galleries, and a vibrant social scene.", address: "39990 Anza Rd", phone: "(951) 694-6699", website: "https://www.lorimarwinery.com", priceRange: "$$", rating: 4.5, reviews: 1340, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/lorimar-gallery/800/400" },
  { name: "Miramonte Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Mediterranean-style winery with Blind Tasting experiences, live music, and artisan food pairings.", address: "33410 Rancho California Rd", phone: "(951) 506-0400", website: "https://www.miramontewinery.com", priceRange: "$$$", rating: 4.4, reviews: 980, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/miramonte-med/800/400" },
  { name: "Avensole Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Boutique winery featuring handcrafted small-lot wines, wood-fired pizza, and stunning sunset views.", address: "34567 Rancho California Rd", phone: "(951) 325-2510", website: "https://www.avensolewinery.com", priceRange: "$$", rating: 4.3, reviews: 670, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/avensole-sunset/800/400" },
  { name: "Baily Vineyard & Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "verified_platinum", description: "Pioneer Temecula winery with Carol's Restaurant on-site, known for Cabernet and Riesling.", address: "33440 La Serena Way", phone: "(951) 676-9463", website: "https://www.bailywinery.com", priceRange: "$$", rating: 4.4, reviews: 840, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/baily-pioneer/800/400" },
  { name: "The Goat & Vine", category: "old-town-dining", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Artisan pizzeria in Old Town serving wood-fired pizzas, craft beers, and inventive salads.", address: "41923 2nd St", phone: "(951) 694-0011", website: "https://www.thegoatandvine.com", priceRange: "$$", rating: 4.5, reviews: 760, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/goatvine-pizza/800/400" },
  { name: "Public House", category: "restaurants-dining", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Gastropub with craft cocktails, elevated comfort food, and a lively Old Town atmosphere.", address: "41971 Main St", phone: "(951) 676-0470", website: "https://www.publichousebyjameslane.com", priceRange: "$$", rating: 4.3, reviews: 640, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/publichouse-pub/800/400" },
  { name: "Toast", category: "restaurants-dining", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Popular breakfast and brunch restaurant with a creative menu and locally sourced ingredients.", address: "28693 Old Town Front St", phone: "(951) 676-4222", website: "https://www.toasttemecula.com", priceRange: "$$", rating: 4.4, reviews: 580, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/toast-breakfast/800/400" },
  { name: "Temecula Olive Oil Company", category: "shopping-retail", city: "Temecula", zip: "92590", tier: "verified_platinum", description: "Artisanal olive oils, balsamic vinegars, and gourmet foods — a must-visit in Old Town.", address: "28653 Old Town Front St", phone: "(951) 693-7500", website: "https://www.temeculaoliveoil.com", priceRange: "$$", rating: 4.7, reviews: 410, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/oliveoil-artisan/800/400" },

  // === FREE TIER (10) ===
  { name: "Old Town Spice & Tea Merchants", category: "shopping-retail", city: "Temecula", zip: "92590", tier: "free", description: "Unique spice shop and tea house offering hundreds of spice blends, loose-leaf teas, and custom mixes.", address: "28693 Old Town Front St", phone: "(951) 693-2569", website: "https://www.oldtownspiceandtea.com", priceRange: "$", rating: 4.8, reviews: 350, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/spice-tea-shop/800/400" },
  { name: "Danza del Sol Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Vibrant winery known for creative wine cocktails, live music weekends, and a fun social atmosphere.", address: "39050 De Portola Rd", phone: "(951) 302-0404", website: "https://www.danzadelsolwinery.com", priceRange: "$$", rating: 4.3, reviews: 720, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/danzadelsol-music/800/400" },
  { name: "Akash Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Modern boutique winery with a rooftop lounge, innovative wines, and stunning valley panoramas.", address: "39750 De Portola Rd", phone: "(951) 699-0156", website: "https://www.akashwinery.com", priceRange: "$$$", rating: 4.5, reviews: 480, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/akash-rooftop/800/400" },
  { name: "Fazeli Cellars", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Persian-inspired winery fusing Middle Eastern art with Temecula terroir — truly one of a kind.", address: "37320 De Portola Rd", phone: "(951) 302-8466", website: "https://www.fazelicellars.com", priceRange: "$$$", rating: 4.5, reviews: 620, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/fazeli-persian/800/400" },
  { name: "Cougar Vineyard & Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Relaxed, dog-friendly winery with award-winning wines and a cozy tasting room.", address: "39870 De Portola Rd", phone: "(951) 491-0825", website: "https://www.cougarvineyards.com", priceRange: "$$", rating: 4.4, reviews: 510, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/cougar-cozy/800/400" },
  { name: "Wiens Family Cellars", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Family-operated winery with spacious grounds, live music, and consistently excellent wines.", address: "35055 Via Del Ponte", phone: "(951) 694-0670", website: "https://www.wienscellars.com", priceRange: "$$", rating: 4.4, reviews: 890, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/wiens-grounds/800/400" },
  { name: "Maurice Car'rie Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Victorian-style winery known for its Champagne brunch, lush gardens, and charming tasting room.", address: "34225 Rancho California Rd", phone: "(951) 676-5226", website: "https://www.mauricecarriewinery.com", priceRange: "$$", rating: 4.3, reviews: 1050, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/mauricecarrie-garden/800/400" },
  { name: "Mount Palomar Winery", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Historic winery established in 1975, crafting estate-grown wines from one of Temecula's oldest vineyards.", address: "33820 Rancho California Rd", phone: "(951) 676-9047", website: "https://www.mountpalomar.com", priceRange: "$$", rating: 4.3, reviews: 780, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/palomar-historic/800/400" },
  { name: "Palumbo Family Vineyards", category: "wineries-vineyards", city: "Temecula", zip: "92591", tier: "free", description: "Small-lot, handcrafted wines in an intimate tasting room — a hidden gem for serious wine lovers.", address: "40150 Barksdale Cir", phone: "(951) 676-0998", website: "https://www.palumbofamilyvineyards.com", priceRange: "$$", rating: 4.7, reviews: 290, neighborhood: "Wine Country", coverImageUrl: "https://picsum.photos/seed/palumbo-gem/800/400" },
  { name: "1909 Temecula", category: "old-town-dining", city: "Temecula", zip: "92590", tier: "free", description: "Hip craft cocktail bar and restaurant in a historic 1909 building with outdoor patio and live events.", address: "28636 Old Town Front St", phone: "(951) 694-7782", website: "https://www.1909temecula.com", priceRange: "$$", rating: 4.4, reviews: 980, neighborhood: "Old Town", coverImageUrl: "https://picsum.photos/seed/1909-cocktails/800/400" },
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
        description: `Exclusive deal for Platinum Directory visitors at ${biz.name}`,
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
      neighborhood: biz.neighborhood,
      phone: biz.phone,
      website: biz.website,
      coverImageUrl: biz.coverImageUrl,
      tier: biz.tier,
      status: "active",
      isVerified: biz.tier !== "free",
      isFeatured: biz.tier === "platinum_partner" || biz.tier === "platinum_elite",
      priceRange: biz.priceRange,
      googleRating: biz.rating,
      googleReviewCount: biz.reviews,
      averageRating: biz.rating,
      reviewCount: biz.reviews,
      seoTitle: `${biz.name} — Temecula Valley | Platinum Directory`,
      smartOffers: smartOffers.length > 0 ? smartOffers : undefined,
    });
    console.log(`  ✓ ${biz.name} (${biz.tier})`);
  }
  console.log(`Seeded ${SAMPLE_BUSINESSES.length} businesses`);
}

async function seedGiveaways() {
  console.log("\nSeeding giveaways...");

  // Consumer weekly giveaway
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

  // Verify data
  console.log("\nVerifying seeded data...");
  const bizCount = await client.fetch(`count(*[_type == "business" && status == "active"])`);
  const catCount = await client.fetch(`count(*[_type == "category" && isActive == true])`);
  const giveCount = await client.fetch(`count(*[_type == "giveaway" && isActive == true])`);
  const eliteCount = await client.fetch(`count(*[_type == "business" && tier == "platinum_elite"])`);
  const partnerCount = await client.fetch(`count(*[_type == "business" && tier == "platinum_partner"])`);
  const verifiedCount = await client.fetch(`count(*[_type == "business" && tier == "verified_platinum"])`);
  const freeCount = await client.fetch(`count(*[_type == "business" && tier == "free"])`);

  console.log(`  Businesses: ${bizCount} (Elite: ${eliteCount}, Partner: ${partnerCount}, Verified: ${verifiedCount}, Free: ${freeCount})`);
  console.log(`  Categories: ${catCount}`);
  console.log(`  Active Giveaways: ${giveCount}`);
  console.log("\n✅ Seed complete!");
}

main().catch(console.error);
