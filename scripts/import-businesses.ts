#!/usr/bin/env npx tsx
/**
 * Bulk CSV Import for Platinum Directory Temecula Valley
 *
 * Usage: npx tsx scripts/import-businesses.ts
 *
 * Reads:
 *   FRANK_05_MASTER_LIST_20260204_1137.csv  (7,831 businesses)
 *   FRANK_04_WARM_TARGETS_20260204_1137.csv (3,000 businesses)
 *
 * All businesses get tier='free', is_active=true, outreach_status='not_contacted'
 * Warm targets get is_hot_lead=true
 */

import { config } from "dotenv";
import * as path from "path";
config({ path: path.resolve(__dirname, "..", ".env.local") });

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// --- Supabase admin client ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Category mapping: Google Places categories → our categories ---
const CATEGORY_MAP: Record<string, string> = {
  // Hotels & Travel
  Hotel: "Travel & Tourism",
  Motel: "Travel & Tourism",
  Resort: "Travel & Tourism",
  "Resort hotel": "Travel & Tourism",
  "Bed & breakfast": "Travel & Tourism",
  "RV park": "Travel & Tourism",
  "Travel agency": "Travel & Tourism",
  "Tour agency": "Travel & Tourism",
  "Tour operator": "Travel & Tourism",
  "Tourist attraction": "Travel & Tourism",
  "Tourist information center": "Travel & Tourism",
  Campground: "Travel & Tourism",
  "Extended stay hotel": "Travel & Tourism",
  "Vacation home rental agency": "Travel & Tourism",
  // Restaurants & Dining
  Restaurant: "Restaurants & Dining",
  "Fast food restaurant": "Restaurants & Dining",
  "Mexican restaurant": "Restaurants & Dining",
  "Chinese restaurant": "Restaurants & Dining",
  "Italian restaurant": "Restaurants & Dining",
  "Japanese restaurant": "Restaurants & Dining",
  "Thai restaurant": "Restaurants & Dining",
  "Indian restaurant": "Restaurants & Dining",
  "Pizza delivery": "Restaurants & Dining",
  "Pizza restaurant": "Restaurants & Dining",
  "Sushi restaurant": "Restaurants & Dining",
  "Seafood restaurant": "Restaurants & Dining",
  "Steak house": "Restaurants & Dining",
  "American restaurant": "Restaurants & Dining",
  "Vietnamese restaurant": "Restaurants & Dining",
  "Korean restaurant": "Restaurants & Dining",
  "Breakfast restaurant": "Restaurants & Dining",
  "Sandwich shop": "Restaurants & Dining",
  "Hamburger restaurant": "Restaurants & Dining",
  "Barbecue restaurant": "Restaurants & Dining",
  "Mediterranean restaurant": "Restaurants & Dining",
  "Vegan restaurant": "Restaurants & Dining",
  "Vegetarian restaurant": "Restaurants & Dining",
  "Deli": "Restaurants & Dining",
  "Bakery": "Restaurants & Dining",
  "Cafe": "Restaurants & Dining",
  "Coffee shop": "Restaurants & Dining",
  "Donut shop": "Restaurants & Dining",
  "Ice cream shop": "Restaurants & Dining",
  "Juice bar": "Restaurants & Dining",
  "Bubble tea store": "Restaurants & Dining",
  "Bar": "Restaurants & Dining",
  "Bar & grill": "Restaurants & Dining",
  "Pub": "Restaurants & Dining",
  "Buffet restaurant": "Restaurants & Dining",
  "Food truck": "Restaurants & Dining",
  "Catering food and drink supplier": "Restaurants & Dining",
  "Caterer": "Restaurants & Dining",
  // Wineries
  Winery: "Wineries & Breweries",
  "Wine bar": "Wineries & Breweries",
  "Wine store": "Wineries & Breweries",
  Brewery: "Wineries & Breweries",
  "Brew pub": "Wineries & Breweries",
  Vineyard: "Wineries & Breweries",
  // Health & Wellness
  Spa: "Health & Wellness",
  "Day spa": "Health & Wellness",
  "Massage therapist": "Health & Wellness",
  "Massage spa": "Health & Wellness",
  "Yoga studio": "Health & Wellness",
  "Pilates studio": "Health & Wellness",
  "Acupuncture clinic": "Health & Wellness",
  "Alternative medicine practitioner": "Health & Wellness",
  "Health consultant": "Health & Wellness",
  "Weight loss service": "Health & Wellness",
  "Wellness center": "Health & Wellness",
  "Mental health service": "Health & Wellness",
  "Counselor": "Health & Wellness",
  "Psychologist": "Health & Wellness",
  "Therapist": "Health & Wellness",
  "Nutritionist": "Health & Wellness",
  // Beauty & Personal Care
  "Hair salon": "Beauty & Personal Care",
  "Beauty salon": "Beauty & Personal Care",
  "Barber shop": "Beauty & Personal Care",
  "Nail salon": "Beauty & Personal Care",
  "Skin care clinic": "Beauty & Personal Care",
  "Tanning salon": "Beauty & Personal Care",
  "Beauty supply store": "Beauty & Personal Care",
  "Tattoo shop": "Beauty & Personal Care",
  "Tattoo and piercing shop": "Beauty & Personal Care",
  // Home Services
  Plumber: "Home Services",
  Electrician: "Home Services",
  "HVAC contractor": "Home Services",
  "Roofing contractor": "Home Services",
  "Painting contractor": "Home Services",
  "General contractor": "Home Services",
  Contractor: "Home Services",
  "Fence contractor": "Home Services",
  "Flooring contractor": "Home Services",
  "Concrete contractor": "Home Services",
  "Landscape designer": "Home Services",
  Landscaper: "Home Services",
  "Lawn care service": "Home Services",
  "Tree service": "Home Services",
  "Pest control service": "Home Services",
  "House cleaning service": "Home Services",
  "Cleaning service": "Home Services",
  "Pool cleaning service": "Home Services",
  "Swimming pool contractor": "Home Services",
  "Garage door supplier": "Home Services",
  "Locksmith": "Home Services",
  "Handyman": "Home Services",
  "Window cleaning service": "Home Services",
  "Interior designer": "Home Services",
  "Construction company": "Home Services",
  "Home builder": "Home Services",
  "Remodeler": "Home Services",
  "Cabinet maker": "Home Services",
  "Carpet installer": "Home Services",
  "Deck builder": "Home Services",
  "Glass repair service": "Home Services",
  "Granite supplier": "Home Services",
  "Irrigation system supplier": "Home Services",
  "Solar energy company": "Home Services",
  // Automotive
  "Auto repair shop": "Automotive",
  "Auto body shop": "Automotive",
  "Auto parts store": "Automotive",
  "Tire shop": "Automotive",
  "Car dealer": "Automotive",
  "Used car dealer": "Automotive",
  "Car wash": "Automotive",
  "Car rental agency": "Automotive",
  "Oil change service": "Automotive",
  "Transmission shop": "Automotive",
  "Towing service": "Automotive",
  "Smog inspection station": "Automotive",
  "Motorcycle dealer": "Automotive",
  "Motorcycle repair shop": "Automotive",
  "RV dealer": "Automotive",
  "RV repair shop": "Automotive",
  "Truck dealer": "Automotive",
  // Shopping & Retail
  "Clothing store": "Shopping & Retail",
  "Furniture store": "Shopping & Retail",
  "Department store": "Shopping & Retail",
  "Shopping mall": "Shopping & Retail",
  "Grocery store": "Shopping & Retail",
  "Convenience store": "Shopping & Retail",
  "Thrift store": "Shopping & Retail",
  "Gift shop": "Shopping & Retail",
  "Book store": "Shopping & Retail",
  "Toy store": "Shopping & Retail",
  "Sporting goods store": "Shopping & Retail",
  "Drug store": "Shopping & Retail",
  "Pharmacy": "Shopping & Retail",
  "Liquor store": "Shopping & Retail",
  "Florist": "Shopping & Retail",
  "Bicycle shop": "Shopping & Retail",
  "Jeweler": "Shopping & Retail",
  "Jewelry store": "Shopping & Retail",
  "Pawn shop": "Shopping & Retail",
  "Pet store": "Shopping & Retail",
  "Cell phone store": "Shopping & Retail",
  "Mobile phone store": "Shopping & Retail",
  "Electronics store": "Shopping & Retail",
  "Home improvement store": "Shopping & Retail",
  "Hardware store": "Shopping & Retail",
  "Lumber store": "Shopping & Retail",
  "Plant nursery": "Shopping & Retail",
  "Garden center": "Shopping & Retail",
  "Mattress store": "Shopping & Retail",
  "Appliance store": "Shopping & Retail",
  "Antique store": "Shopping & Retail",
  "Boutique": "Shopping & Retail",
  // Professional Services
  "Insurance agency": "Professional Services",
  "Insurance company": "Professional Services",
  "Accounting firm": "Professional Services",
  "Accountant": "Professional Services",
  "Tax preparation service": "Professional Services",
  "Law firm": "Professional Services",
  "Lawyer": "Professional Services",
  "Attorney": "Professional Services",
  "Notary public": "Professional Services",
  "Paralegal services provider": "Professional Services",
  "Consultant": "Professional Services",
  "Marketing agency": "Professional Services",
  "Advertising agency": "Professional Services",
  "Employment agency": "Professional Services",
  "Staffing agency": "Professional Services",
  "Printing service": "Professional Services",
  "Sign shop": "Professional Services",
  "Courier service": "Professional Services",
  "Moving company": "Professional Services",
  "Storage facility": "Professional Services",
  "Self-storage facility": "Professional Services",
  "Leasing service": "Professional Services",
  "Property management company": "Professional Services",
  "Manufacturer": "Professional Services",
  "Building": "Professional Services",
  "Machine shop": "Professional Services",
  // Real Estate
  "Real estate agency": "Real Estate",
  "Real estate agent": "Real Estate",
  "Real estate developer": "Real Estate",
  "Real estate appraiser": "Real Estate",
  "Apartment complex": "Real Estate",
  "Apartment building": "Real Estate",
  "Condominium complex": "Real Estate",
  "Mobile home park": "Real Estate",
  "Home inspector": "Real Estate",
  // Entertainment & Events
  "Movie theater": "Entertainment & Events",
  "Amusement park": "Entertainment & Events",
  "Bowling alley": "Entertainment & Events",
  "Escape room center": "Entertainment & Events",
  "Night club": "Entertainment & Events",
  "Karaoke bar": "Entertainment & Events",
  "Event planner": "Entertainment & Events",
  "Banquet hall": "Entertainment & Events",
  "Concert hall": "Entertainment & Events",
  "Performing arts theater": "Entertainment & Events",
  "Casino": "Entertainment & Events",
  "Golf course": "Entertainment & Events",
  "Country club": "Entertainment & Events",
  // Fitness & Sports
  Gym: "Fitness & Sports",
  "Sports club": "Fitness & Sports",
  "Martial arts school": "Fitness & Sports",
  "Dance school": "Fitness & Sports",
  "Swimming pool": "Fitness & Sports",
  "Boxing gym": "Fitness & Sports",
  "CrossFit gym": "Fitness & Sports",
  "Fitness center": "Fitness & Sports",
  "Athletic field": "Fitness & Sports",
  "Tennis court": "Fitness & Sports",
  "Gymnastics center": "Fitness & Sports",
  // Education
  "Elementary school": "Education & Tutoring",
  "Middle school": "Education & Tutoring",
  "High school": "Education & Tutoring",
  School: "Education & Tutoring",
  "Private school": "Education & Tutoring",
  "Charter school": "Education & Tutoring",
  Preschool: "Education & Tutoring",
  "Child care agency": "Education & Tutoring",
  "Day care center": "Education & Tutoring",
  "Tutoring service": "Education & Tutoring",
  "Music school": "Education & Tutoring",
  "Driving school": "Education & Tutoring",
  "Language school": "Education & Tutoring",
  "After school program": "Education & Tutoring",
  University: "Education & Tutoring",
  College: "Education & Tutoring",
  "Community college": "Education & Tutoring",
  // Pet Services
  Veterinarian: "Pet Services",
  "Veterinary care": "Pet Services",
  "Pet groomer": "Pet Services",
  "Dog trainer": "Pet Services",
  "Animal hospital": "Pet Services",
  "Animal shelter": "Pet Services",
  "Kennel": "Pet Services",
  "Pet boarding service": "Pet Services",
  // Medical & Dental
  Dentist: "Medical & Dental",
  Doctor: "Medical & Dental",
  "Medical clinic": "Medical & Dental",
  Hospital: "Medical & Dental",
  "Urgent care center": "Medical & Dental",
  Chiropractor: "Medical & Dental",
  "Physical therapist": "Medical & Dental",
  "Physical therapy clinic": "Medical & Dental",
  Optometrist: "Medical & Dental",
  "Eye care center": "Medical & Dental",
  Orthodontist: "Medical & Dental",
  Dermatologist: "Medical & Dental",
  Pediatrician: "Medical & Dental",
  "Medical laboratory": "Medical & Dental",
  "Home health care service": "Medical & Dental",
  "Hearing aid store": "Medical & Dental",
  "Assisted living facility": "Medical & Dental",
  "Nursing home": "Medical & Dental",
  // Photography & Videography
  Photographer: "Photography & Videography",
  "Portrait studio": "Photography & Videography",
  // Wedding & Bridal
  "Wedding venue": "Wedding & Bridal",
  "Wedding planner": "Wedding & Bridal",
  "Bridal shop": "Wedding & Bridal",
  // Technology & IT
  "Computer repair service": "Technology & IT",
  "Computer store": "Technology & IT",
  "Internet service provider": "Technology & IT",
  "Software company": "Technology & IT",
  // Financial Services
  Bank: "Financial Services",
  "Credit union": "Financial Services",
  "Financial planner": "Financial Services",
  "Financial institution": "Financial Services",
  "Investment company": "Financial Services",
  "Mortgage lender": "Financial Services",
  "Check cashing service": "Financial Services",
  "ATM": "Financial Services",
  // Nonprofit & Community
  Church: "Nonprofit & Community",
  "Presbyterian church": "Nonprofit & Community",
  "Baptist church": "Nonprofit & Community",
  "Catholic church": "Nonprofit & Community",
  "Methodist church": "Nonprofit & Community",
  "Lutheran church": "Nonprofit & Community",
  "Christian church": "Nonprofit & Community",
  "Non-denominational church": "Nonprofit & Community",
  "Seventh-day Adventist church": "Nonprofit & Community",
  "Assemblies of God church": "Nonprofit & Community",
  "Pentecostal church": "Nonprofit & Community",
  "Synagogue": "Nonprofit & Community",
  Mosque: "Nonprofit & Community",
  "Place of worship": "Nonprofit & Community",
  "Non-profit organization": "Nonprofit & Community",
  "Community center": "Nonprofit & Community",
  "Social services organization": "Nonprofit & Community",
  Library: "Nonprofit & Community",
  "Fire station": "Nonprofit & Community",
  "Police department": "Nonprofit & Community",
  "City government office": "Nonprofit & Community",
  "Chamber of Commerce": "Nonprofit & Community",
  "Veterans organization": "Nonprofit & Community",
  "Professional and hobby associations": "Nonprofit & Community",
  "Post office": "Nonprofit & Community",
  Park: "Nonprofit & Community",
  Cemetery: "Nonprofit & Community",
  // Gas station / misc → Other Services
  "Gas station": "Shopping & Retail",
  Farm: "Shopping & Retail",
  "Laundromat": "Home Services",
  "Dry cleaner": "Home Services",
};

// High-demand categories that get extra lead score points
const HIGH_DEMAND_CATEGORIES = new Set([
  "Hotel", "Winery", "Wine bar", "Resort", "Spa", "Day spa",
  "Restaurant", "Brewery", "Wedding venue", "Golf course",
  "Country club", "Vineyard", "Bed & breakfast", "Resort hotel",
]);

// --- Slug helper ---
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// --- Phone formatting ---
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone; // Return as-is if format doesn't match
}

// --- Website formatting ---
function formatWebsite(url: string): string {
  if (!url || url.trim() === "") return "";
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }
  return u;
}

// --- Hours parsing ---
// CSV format: "Monday: 9 AM to 6 PM; Tuesday: 9 AM to 6 PM; Wednesday: Closed; ..."
// Unicode narrow no-break spaces (\u202F) appear before AM/PM
function parseHours(hoursStr: string): Record<string, any> | null {
  if (!hoursStr || hoursStr.trim() === "") return null;

  const result: Record<string, any> = {};
  // Normalize unicode: replace narrow no-break space and other whitespace variants with regular space
  const normalized = hoursStr.replace(/[\u202F\u00A0\u2009\u2002\u2003]/g, " ").trim();
  const parts = normalized.split(";").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;

    const dayName = part.slice(0, colonIdx).trim().toLowerCase();
    const timeStr = part.slice(colonIdx + 1).trim();

    if (/closed/i.test(timeStr)) {
      result[dayName] = { closed: true };
      continue;
    }

    // Parse "9 AM to 6 PM" or "8:30 AM to 5:30 PM" or "Open 24 hours"
    if (/open\s*24\s*hours/i.test(timeStr)) {
      result[dayName] = { open: "00:00", close: "23:59", closed: false };
      continue;
    }

    const match = timeStr.match(
      /(\d{1,2}(?::\d{2})?)\s*(AM|PM)\s*to\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)/i
    );
    if (match) {
      result[dayName] = {
        open: convertTo24(match[1], match[2]),
        close: convertTo24(match[3], match[4]),
        closed: false,
      };
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function convertTo24(time: string, meridiem: string): string {
  let [h, m] = time.includes(":") ? time.split(":").map(Number) : [Number(time), 0];
  const isPM = meridiem.toUpperCase() === "PM";
  if (isPM && h < 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// --- Name validation ---
function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  const lower = name.toLowerCase().trim();
  const invalid = ["closed", "permanently closed", "n/a", "na", "test", "unknown", "tbd"];
  if (invalid.includes(lower)) return false;
  // Flag if it looks like just an address
  if (/^\d+\s+\w+\s+(st|ave|rd|blvd|dr|ln|ct|way|pl)\b/i.test(lower) && lower.length < 30) return false;
  return true;
}

// --- Data quality score ---
function calcDataQuality(row: Record<string, any>): number {
  let score = 0;
  if (row.name && row.name.trim().length > 1) score += 20;
  if (row.phone && row.phone.replace(/\D/g, "").length >= 10) score += 15;
  if (row.address && row.address.trim().length > 5) score += 15;
  if (row.email && row.email.includes("@")) score += 10;
  if (row.website && row.website.trim().length > 3) score += 10;
  if (row.description && row.description.trim().length > 10) score += 10;
  if (row.hours) score += 10;
  if (row.social_media && Object.keys(row.social_media).length > 0) score += 5;
  if (row.amenities && row.amenities.length > 0) score += 5;
  return score;
}

// --- Lead score ---
function calcLeadScore(opts: {
  dataQuality: number;
  reviewCount: number;
  rating: number;
  category: string;
  hasWebsite: boolean;
  isWarmTarget: boolean;
}): number {
  const dataFactor = opts.dataQuality; // 0-100
  let reviewFactor = 0;
  if (opts.reviewCount > 100) reviewFactor = 100;
  else if (opts.reviewCount > 50) reviewFactor = 80;
  else if (opts.reviewCount > 20) reviewFactor = 60;
  else if (opts.reviewCount > 5) reviewFactor = 40;
  else reviewFactor = 20;

  const categoryDemand = HIGH_DEMAND_CATEGORIES.has(opts.category) ? 100 : 30;
  const websiteFactor = opts.hasWebsite ? 100 : 0;
  const warmFactor = opts.isWarmTarget ? 100 : 0;

  return Math.round(
    dataFactor * 0.25 +
      reviewFactor * 0.25 +
      categoryDemand * 0.25 +
      websiteFactor * 0.15 +
      warmFactor * 0.1
  );
}

// --- CSV parser ---
// Handles quoted fields, commas inside quotes, and windows line endings
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// --- Main import ---
async function main() {
  console.log("=== Platinum Directory CSV Import ===\n");

  const rootDir = path.resolve(__dirname, "..");
  const masterFile = path.join(rootDir, "FRANK_05_MASTER_LIST_20260204_1137.csv");
  const warmFile = path.join(rootDir, "FRANK_04_WARM_TARGETS_20260204_1137.csv");

  if (!fs.existsSync(masterFile)) {
    console.error(`Master list not found: ${masterFile}`);
    process.exit(1);
  }
  if (!fs.existsSync(warmFile)) {
    console.error(`Warm targets not found: ${warmFile}`);
    process.exit(1);
  }

  // --- Step 1: Load/create categories ---
  console.log("Loading existing categories...");
  const { data: existingCats } = await supabase.from("categories").select("id, name, slug");
  const catMap = new Map<string, string>(); // name → id
  for (const c of existingCats || []) {
    catMap.set(c.name, c.id);
  }
  console.log(`  Found ${catMap.size} existing categories`);

  // Create "Other Services" if not exists
  if (!catMap.has("Other Services")) {
    const { data: newCat } = await supabase
      .from("categories")
      .insert({ name: "Other Services", slug: "other-services", description: "Other businesses and services", icon: "🏢", display_order: 99 })
      .select("id")
      .single();
    if (newCat) catMap.set("Other Services", newCat.id);
  }

  // Resolve category: CSV category string → our category id
  function resolveCategory(csvCategory: string): string {
    if (!csvCategory || csvCategory.trim() === "") {
      return catMap.get("Other Services")!;
    }
    const cat = csvCategory.trim();

    // Direct mapping
    const mapped = CATEGORY_MAP[cat];
    if (mapped && catMap.has(mapped)) {
      return catMap.get(mapped)!;
    }

    // Fuzzy: check if any key in CATEGORY_MAP starts with the same word
    const firstWord = cat.split(" ")[0].toLowerCase();
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (key.toLowerCase().startsWith(firstWord) && catMap.has(val)) {
        return catMap.get(val)!;
      }
    }

    // Check if already matches an existing category name
    for (const [name, id] of catMap) {
      if (name.toLowerCase() === cat.toLowerCase()) return id;
    }

    // Fallback: Other Services
    return catMap.get("Other Services")!;
  }

  // --- Step 2: Read master list and build existing set for dedup ---
  console.log("\nReading master list CSV...");
  const masterContent = fs.readFileSync(masterFile, "utf-8");
  const masterRows = parseCSV(masterContent);
  console.log(`  Parsed ${masterRows.length} rows from master list`);

  // Check existing businesses for dedup
  console.log("Loading existing businesses for dedup...");
  const { data: existingBiz } = await supabase
    .from("businesses")
    .select("name, city");
  const existingSet = new Set<string>();
  for (const b of existingBiz || []) {
    existingSet.add(`${(b.name || "").toLowerCase().trim()}|${(b.city || "").toLowerCase().trim()}`);
  }
  console.log(`  Found ${existingSet.size} existing businesses`);

  const batchId = `csv_import_${Date.now()}`;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // --- Step 3: Import master list in batches of 100 ---
  console.log("\nImporting master list businesses...");
  const batch: any[] = [];

  for (const row of masterRows) {
    const name = (row["Business"] || "").trim();
    const city = (row["City"] || "Temecula").trim();
    const dedupKey = `${name.toLowerCase()}|${city.toLowerCase()}`;

    if (existingSet.has(dedupKey)) {
      skipped++;
      continue;
    }
    existingSet.add(dedupKey);

    const phone = formatPhone(row["Phone"] || "");
    const website = formatWebsite(row["Website"] || "");
    const address = (row["Address"] || "").trim();
    const rating = parseFloat(row["Rating"]) || 0;
    const reviewCount = parseInt(row["Reviews"]) || 0;
    const csvCategory = (row["Category"] || "").trim();
    const hours = parseHours(row["Hours"] || "");
    const hasGroupon = (row["Has Groupon"] || "").toLowerCase() === "true";
    const isInfluencer = (row["Is Influencer"] || "").toLowerCase() === "true";
    const validName = isValidName(name);

    if (!name) {
      skipped++;
      continue;
    }

    const categoryId = resolveCategory(csvCategory);
    const slug = slugify(name) + "-" + slugify(city);

    const qualityInput = {
      name,
      phone,
      address,
      email: "",
      website,
      description: "",
      hours,
      social_media: null,
      amenities: null,
    };
    const dataQuality = calcDataQuality(qualityInput);

    // Hot lead logic
    let isHotLead = hasGroupon;
    let hotLeadReason = hasGroupon ? "groupon_active" : "";
    if (!isHotLead && reviewCount > 50 && rating >= 4.0) {
      isHotLead = true;
      hotLeadReason = "high_reviews";
    }
    if (!isHotLead && HIGH_DEMAND_CATEGORIES.has(csvCategory)) {
      isHotLead = true;
      hotLeadReason = "high_demand_category";
    }

    const leadScore = calcLeadScore({
      dataQuality,
      reviewCount,
      rating,
      category: csvCategory,
      hasWebsite: !!website,
      isWarmTarget: false,
    });

    batch.push({
      name,
      slug,
      phone: phone || null,
      website: website || null,
      address: address || null,
      city,
      state: "CA",
      average_rating: rating,
      review_count: reviewCount,
      category_id: categoryId,
      hours,
      tier: "free",
      is_active: true,
      outreach_status: "not_contacted",
      import_source: "csv_import",
      import_batch_id: batchId,
      import_raw_data: {
        csv_category: csvCategory,
        has_groupon: hasGroupon,
        is_influencer: isInfluencer,
        source_file: "FRANK_05_MASTER_LIST",
      },
      data_quality_score: dataQuality,
      has_valid_name: validName,
      needs_enrichment: true,
      enrichment_status: "pending",
      is_hot_lead: isHotLead,
      hot_lead_reason: hotLeadReason || null,
      lead_score: leadScore,
    });

    // Insert in batches of 100
    if (batch.length >= 100) {
      const { error } = await supabase.from("businesses").insert(batch);
      if (error) {
        // Try one-by-one on batch error (likely slug conflicts)
        for (const item of batch) {
          const { error: singleErr } = await supabase.from("businesses").insert(item);
          if (singleErr) {
            // Try with unique slug suffix
            item.slug = item.slug + "-" + Math.random().toString(36).slice(2, 6);
            const { error: retryErr } = await supabase.from("businesses").insert(item);
            if (retryErr) {
              errors++;
            } else {
              imported++;
            }
          } else {
            imported++;
          }
        }
      } else {
        imported += batch.length;
      }
      batch.length = 0;

      if (imported % 500 < 100) {
        console.log(`  Progress: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      }
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    const { error } = await supabase.from("businesses").insert(batch);
    if (error) {
      for (const item of batch) {
        const { error: singleErr } = await supabase.from("businesses").insert(item);
        if (singleErr) {
          item.slug = item.slug + "-" + Math.random().toString(36).slice(2, 6);
          const { error: retryErr } = await supabase.from("businesses").insert(item);
          if (retryErr) errors++;
          else imported++;
        } else {
          imported++;
        }
      }
    } else {
      imported += batch.length;
    }
    batch.length = 0;
  }

  console.log(`\nMaster list import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);

  // --- Step 4: Read warm targets and mark as hot leads ---
  console.log("\nReading warm targets CSV...");
  const warmContent = fs.readFileSync(warmFile, "utf-8");
  const warmRows = parseCSV(warmContent);
  console.log(`  Parsed ${warmRows.length} warm target rows`);

  let warmMatched = 0;
  let warmNew = 0;

  for (const row of warmRows) {
    const name = (row["Business"] || "").trim();
    const city = (row["City"] || "Temecula").trim();
    const pitch = (row["Pitch"] || "").trim();

    if (!name) continue;

    // Try to find matching business by name + city
    const { data: matches } = await supabase
      .from("businesses")
      .select("id, lead_score")
      .ilike("name", name)
      .ilike("city", city)
      .limit(1);

    if (matches && matches.length > 0) {
      // Update existing: mark as hot lead
      const newScore = Math.min(100, (matches[0].lead_score || 0) + 10);
      await supabase
        .from("businesses")
        .update({
          is_hot_lead: true,
          hot_lead_reason: pitch || "no_google_presence",
          lead_score: newScore,
          import_raw_data: supabase.rpc ? undefined : undefined, // keep existing
        })
        .eq("id", matches[0].id);
      warmMatched++;
    } else {
      // Insert as new business
      const dedupKey = `${name.toLowerCase()}|${city.toLowerCase()}`;
      if (existingSet.has(dedupKey)) continue;
      existingSet.add(dedupKey);

      const phone = formatPhone(row["Phone"] || "");
      const website = formatWebsite(row["Website"] || "");
      const address = (row["Address"] || "").trim();
      const rating = parseFloat(row["Rating"]) || 0;
      const reviewCount = parseInt(row["Reviews"]) || 0;
      const csvCategory = (row["Category"] || "").trim();
      const categoryId = resolveCategory(csvCategory);
      const slug = slugify(name) + "-" + slugify(city) + "-" + Math.random().toString(36).slice(2, 6);
      const validName = isValidName(name);

      const qualityInput = { name, phone, address, email: "", website, description: "", hours: null, social_media: null, amenities: null };
      const dataQuality = calcDataQuality(qualityInput);
      const leadScore = calcLeadScore({
        dataQuality,
        reviewCount,
        rating,
        category: csvCategory,
        hasWebsite: !!website,
        isWarmTarget: true,
      });

      const { error } = await supabase.from("businesses").insert({
        name,
        slug,
        phone: phone || null,
        website: website || null,
        address: address || null,
        city,
        state: "CA",
        average_rating: rating,
        review_count: reviewCount,
        category_id: categoryId,
        tier: "free",
        is_active: true,
        outreach_status: "not_contacted",
        import_source: "csv_import",
        import_batch_id: batchId,
        import_raw_data: {
          csv_category: csvCategory,
          pitch,
          source_file: "FRANK_04_WARM_TARGETS",
        },
        data_quality_score: dataQuality,
        has_valid_name: validName,
        needs_enrichment: true,
        enrichment_status: "pending",
        is_hot_lead: true,
        hot_lead_reason: pitch || "no_google_presence",
        lead_score: leadScore,
      });

      if (error) errors++;
      else warmNew++;
    }

    if ((warmMatched + warmNew) % 200 === 0) {
      console.log(`  Warm targets progress: ${warmMatched} matched, ${warmNew} new`);
    }
  }

  console.log(`\nWarm targets complete: ${warmMatched} matched/updated, ${warmNew} new inserts`);

  // --- Step 5: Final summary ---
  const { count: totalCount } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("import_batch_id", batchId);

  const { count: hotCount } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("is_hot_lead", true)
    .eq("import_batch_id", batchId);

  const { data: qualityAvg } = await supabase
    .from("businesses")
    .select("data_quality_score")
    .eq("import_batch_id", batchId);

  const avgQuality = qualityAvg
    ? Math.round(qualityAvg.reduce((sum, b) => sum + b.data_quality_score, 0) / qualityAvg.length)
    : 0;

  console.log("\n=== IMPORT SUMMARY ===");
  console.log(`Batch ID: ${batchId}`);
  console.log(`Total imported: ${totalCount}`);
  console.log(`Hot leads: ${hotCount}`);
  console.log(`Average data quality: ${avgQuality}/100`);
  console.log(`Errors: ${errors}`);
  console.log("======================\n");
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
