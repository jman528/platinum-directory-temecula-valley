import { createClient } from "@sanity/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2025-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

// CSV column mapping from GHL export
// The "email" column actually contains street addresses
// Real fields: first_name, last_name, email (=address), phone, company

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 96);
}

function parseCityFromAddress(address: string): { city: string; parsed: string } {
  const temeculaZips = ["92590", "92591", "92592", "92593"];
  const murrietaZips = ["92562", "92563"];
  const hemetZips = ["92543", "92544", "92545", "92546"];
  const menifeeZips = ["92584", "92585", "92586"];
  const fallbrookZips = ["92028"];
  const lakeElsinoreZips = ["92530", "92532"];
  const perrisZips = ["92570", "92571", "92572"];
  const wildomarZips = ["92595"];
  const winchesterZips = ["92596"];
  const canyonLakeZips = ["92587"];

  const zipMatch = address.match(/\b(9\d{4})\b/);
  const zip = zipMatch?.[1] || "";

  if (temeculaZips.includes(zip)) return { city: "Temecula", parsed: address };
  if (murrietaZips.includes(zip)) return { city: "Murrieta", parsed: address };
  if (hemetZips.includes(zip)) return { city: "Hemet", parsed: address };
  if (menifeeZips.includes(zip)) return { city: "Menifee", parsed: address };
  if (fallbrookZips.includes(zip)) return { city: "Fallbrook", parsed: address };
  if (lakeElsinoreZips.includes(zip)) return { city: "Lake Elsinore", parsed: address };
  if (perrisZips.includes(zip)) return { city: "Perris", parsed: address };
  if (wildomarZips.includes(zip)) return { city: "Wildomar", parsed: address };
  if (winchesterZips.includes(zip)) return { city: "Winchester", parsed: address };
  if (canyonLakeZips.includes(zip)) return { city: "Canyon Lake", parsed: address };

  // Try city name in address string
  const cityNames = ["Temecula", "Murrieta", "Hemet", "Menifee", "Fallbrook", "Lake Elsinore", "Perris", "Wildomar", "Winchester", "Sun City", "Canyon Lake"];
  for (const cn of cityNames) {
    if (address.toLowerCase().includes(cn.toLowerCase())) {
      return { city: cn, parsed: address };
    }
  }

  return { city: "Temecula", parsed: address }; // Default
}

async function importMasterList(filePath: string) {
  console.log(`Reading ${filePath}...`);
  const csvContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  console.log(`Found ${records.length} records`);

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const tx = client.transaction();

    for (const row of batch) {
      const company = row.company?.trim();
      const phone = row.phone?.trim();
      // The "email" column contains the street address
      const address = row.email?.trim() || "";

      if (!company) {
        skipped++;
        continue;
      }

      const slug = slugify(company);
      const { city } = parseCityFromAddress(address);

      tx.createOrReplace({
        _id: `imported-${slug}`,
        _type: "business",
        name: company,
        slug: { _type: "slug", current: slug },
        phone: phone || undefined,
        address: address || undefined,
        city,
        state: "CA",
        tier: "free",
        status: "active",
        isVerified: false,
        isFeatured: false,
        averageRating: 0,
        reviewCount: 0,
        seoTitle: `${company} - Temecula Valley Business Directory`,
        tags: ["imported", "ghl-master-list"],
      });

      created++;
    }

    try {
      await tx.commit();
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} processed`);
    } catch (err) {
      errors += batch.length;
      console.error(`  Batch error:`, err);
    }
  }

  console.log(`\nImport complete: ${created} created, ${skipped} skipped, ${errors} errors`);
}

async function tagWarmTargets(warmTargetPath: string) {
  console.log(`\nTagging warm targets from ${warmTargetPath}...`);
  const csvContent = fs.readFileSync(warmTargetPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  let tagged = 0;
  for (const row of records) {
    const company = row.company?.trim();
    if (!company) continue;
    const slug = slugify(company);
    const docId = `imported-${slug}`;

    try {
      await client.patch(docId).setIfMissing({ tags: [] }).append("tags", ["warm-target"]).commit();
      tagged++;
    } catch {
      // Document may not exist
    }
  }

  console.log(`Tagged ${tagged} warm targets`);
}

// Usage:
// npx tsx scripts/import-ghl-businesses.ts <master-list-path> [warm-target-path]
async function main() {
  const masterPath = process.argv[2];
  const warmPath = process.argv[3];

  if (!masterPath) {
    console.log("Usage: npx tsx scripts/import-ghl-businesses.ts <master-list.csv> [warm-targets.csv]");
    console.log("\nExpected CSV format (GHL export):");
    console.log("  Columns: first_name, last_name, email (=address), phone, company");
    console.log("\nFiles from C:\\evm-systems-core:");
    console.log("  - FRANK_05_MASTER_LIST_20260204_1137.csv (7,831 businesses)");
    console.log("  - FRANK_04_WARM_TARGETS_20260204_1137.csv (3,000 priority leads)");
    console.log("  - ghl-contacts.csv (full GHL export)");
    process.exit(1);
  }

  await importMasterList(masterPath);

  if (warmPath) {
    await tagWarmTargets(warmPath);
  }

  console.log("\n✅ Import complete!");
}

main().catch(console.error);
