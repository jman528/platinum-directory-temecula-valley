/**
 * Stripe Product & Price Setup Script (TEST mode)
 *
 * Creates all subscription products, one-time setup fees,
 * prices, and coupon codes in Stripe test mode.
 *
 * Usage:
 *   npx tsx scripts/stripe-setup.ts
 *
 * Requires STRIPE_SECRET_KEY in .env.local (must be a test key: sk_test_...)
 */

import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("ERROR: STRIPE_SECRET_KEY is not set in .env.local");
  process.exit(1);
}
if (!secretKey.startsWith("sk_test_")) {
  console.error(
    "ERROR: STRIPE_SECRET_KEY must be a TEST key (sk_test_...). Refusing to run against live."
  );
  process.exit(1);
}

const stripe = new Stripe(secretKey);

// ── Helpers ──────────────────────────────────────────────────

function dollars(amount: number): number {
  return Math.round(amount * 100); // Stripe uses cents
}

// ── Data ─────────────────────────────────────────────────────

interface SubscriptionTier {
  name: string;
  key: string;
  prices: {
    label: string;
    constName: string;
    amount: number;
    interval: Stripe.PriceCreateParams.Recurring.Interval;
    intervalCount: number;
  }[];
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    name: "Verified Platinum",
    key: "verified",
    prices: [
      { label: "Monthly",   constName: "PRICE_VERIFIED_MONTHLY",   amount: 99,    interval: "month", intervalCount: 1 },
      { label: "Quarterly",  constName: "PRICE_VERIFIED_QUARTERLY", amount: 267,   interval: "month", intervalCount: 3 },
      { label: "6-Month",    constName: "PRICE_VERIFIED_6MONTH",    amount: 504,   interval: "month", intervalCount: 6 },
      { label: "Annual",     constName: "PRICE_VERIFIED_ANNUAL",    amount: 950,   interval: "year",  intervalCount: 1 },
    ],
  },
  {
    name: "Platinum Partner",
    key: "partner",
    prices: [
      { label: "Monthly",   constName: "PRICE_PARTNER_MONTHLY",   amount: 799,   interval: "month", intervalCount: 1 },
      { label: "Quarterly",  constName: "PRICE_PARTNER_QUARTERLY", amount: 2157,  interval: "month", intervalCount: 3 },
      { label: "6-Month",    constName: "PRICE_PARTNER_6MONTH",    amount: 4074,  interval: "month", intervalCount: 6 },
      { label: "Annual",     constName: "PRICE_PARTNER_ANNUAL",    amount: 7670,  interval: "year",  intervalCount: 1 },
    ],
  },
  {
    name: "Platinum Elite",
    key: "elite",
    prices: [
      { label: "Monthly",   constName: "PRICE_ELITE_MONTHLY",   amount: 3500,  interval: "month", intervalCount: 1 },
      { label: "Quarterly",  constName: "PRICE_ELITE_QUARTERLY", amount: 9450,  interval: "month", intervalCount: 3 },
      { label: "6-Month",    constName: "PRICE_ELITE_6MONTH",    amount: 17850, interval: "month", intervalCount: 6 },
      { label: "Annual",     constName: "PRICE_ELITE_ANNUAL",    amount: 33600, interval: "year",  intervalCount: 1 },
    ],
  },
];

interface SetupFee {
  name: string;
  constName: string;
  amount: number;
}

const setupFees: SetupFee[] = [
  { name: "Verified Setup Fee", constName: "PRICE_VERIFIED_SETUP", amount: 500 },
  { name: "Partner Setup Fee",  constName: "PRICE_PARTNER_SETUP",  amount: 1000 },
  { name: "Elite Setup Fee",    constName: "PRICE_ELITE_SETUP",    amount: 1500 },
];

interface CouponDef {
  id: string;
  name: string;
  percentOff: number;
}

const coupons: CouponDef[] = [
  { id: "SETUP25",   name: "25% Off Setup Fee", percentOff: 25 },
  { id: "SETUP50",   name: "50% Off Setup Fee", percentOff: 50 },
  { id: "SETUP75",   name: "75% Off Setup Fee", percentOff: 75 },
  { id: "SETUPFREE", name: "100% Off Setup Fee (Waive)", percentOff: 100 },
];

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("=== Stripe Product & Price Setup (TEST MODE) ===\n");

  const priceMap: Record<string, string> = {};
  const couponMap: Record<string, string> = {};
  const productIds: Record<string, string> = {};

  // ── 1. Subscription Products & Prices ──

  for (const tier of subscriptionTiers) {
    console.log(`Creating product: ${tier.name}`);
    const product = await stripe.products.create({
      name: tier.name,
      description: `${tier.name} subscription for Platinum Directory Temecula Valley`,
      metadata: { tier: tier.key, type: "subscription" },
    });
    productIds[tier.key] = product.id;
    console.log(`  Product ID: ${product.id}`);

    for (const p of tier.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: dollars(p.amount),
        currency: "usd",
        recurring: {
          interval: p.interval,
          interval_count: p.intervalCount,
        },
        metadata: { tier: tier.key, label: p.label },
        nickname: `${tier.name} - ${p.label}`,
      });
      priceMap[p.constName] = price.id;
      console.log(`  ${p.label}: $${p.amount} → ${price.id}`);
    }
    console.log();
  }

  // ── 2. One-Time Setup Fee Products & Prices ──

  console.log("Creating setup fee products...");
  for (const fee of setupFees) {
    const product = await stripe.products.create({
      name: fee.name,
      description: `One-time setup fee for Platinum Directory`,
      metadata: { type: "setup_fee" },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: dollars(fee.amount),
      currency: "usd",
      metadata: { type: "setup_fee" },
      nickname: fee.name,
    });
    priceMap[fee.constName] = price.id;
    console.log(`  ${fee.name}: $${fee.amount} → ${price.id}`);
  }
  console.log();

  // ── 3. Coupon Codes ──

  console.log("Creating coupon codes...");
  for (const c of coupons) {
    const coupon = await stripe.coupons.create({
      id: c.id,
      name: c.name,
      percent_off: c.percentOff,
      duration: "once",
      metadata: { internal: "true" },
    });
    couponMap[c.id] = coupon.id;
    console.log(`  ${c.id}: ${c.percentOff}% off → ${coupon.id}`);
  }
  console.log();

  // ── 4. Write lib/stripe-price-ids.ts ──

  const tsLines = [
    `/**`,
    ` * Stripe Price IDs (TEST MODE)`,
    ` * Auto-generated by scripts/stripe-setup.ts`,
    ` * Do NOT edit manually — re-run the script to regenerate.`,
    ` */`,
    ``,
    `// ── Subscription Prices ──`,
    ``,
  ];

  for (const tier of subscriptionTiers) {
    tsLines.push(`// ${tier.name}`);
    for (const p of tier.prices) {
      tsLines.push(`export const ${p.constName} = "${priceMap[p.constName]}";`);
    }
    tsLines.push(``);
  }

  tsLines.push(`// ── One-Time Setup Fees ──`);
  tsLines.push(``);
  for (const fee of setupFees) {
    tsLines.push(`export const ${fee.constName} = "${priceMap[fee.constName]}";`);
  }

  tsLines.push(``);
  tsLines.push(`// ── Coupon Codes ──`);
  tsLines.push(``);
  for (const c of coupons) {
    tsLines.push(`export const COUPON_${c.id} = "${couponMap[c.id]}";`);
  }

  tsLines.push(``);
  tsLines.push(`// ── Lookup Maps ──`);
  tsLines.push(``);
  tsLines.push(`export const SUBSCRIPTION_PRICES = {`);
  for (const tier of subscriptionTiers) {
    tsLines.push(`  ${tier.key}: {`);
    for (const p of tier.prices) {
      const key = p.label.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^(\d)/, "_$1");
      tsLines.push(`    ${key}: ${p.constName},`);
    }
    tsLines.push(`  },`);
  }
  tsLines.push(`} as const;`);
  tsLines.push(``);
  tsLines.push(`export const SETUP_FEE_PRICES = {`);
  for (const fee of setupFees) {
    const key = fee.constName.replace("PRICE_", "").toLowerCase();
    tsLines.push(`  ${key}: ${fee.constName},`);
  }
  tsLines.push(`} as const;`);
  tsLines.push(``);

  const tsContent = tsLines.join("\n");
  const tsPath = path.resolve(__dirname, "../lib/stripe-price-ids.ts");
  fs.writeFileSync(tsPath, tsContent);
  console.log(`Wrote ${tsPath}`);

  // ── 5. Append to .env.example ──

  const envExamplePath = path.resolve(__dirname, "../.env.example");
  let envContent = fs.readFileSync(envExamplePath, "utf-8");

  // Remove old stripe price section if present
  envContent = envContent.replace(
    /\n# === STRIPE PRICE IDS[\s\S]*?(?=\n# ===|$)/,
    ""
  );

  const envLines = [
    "",
    "# === STRIPE PRICE IDS (auto-generated — TODO: copy from Stripe dashboard) ===",
  ];

  for (const tier of subscriptionTiers) {
    for (const p of tier.prices) {
      envLines.push(`# TODO: ${p.constName}=${priceMap[p.constName]}`);
    }
  }
  for (const fee of setupFees) {
    envLines.push(`# TODO: ${fee.constName}=${priceMap[fee.constName]}`);
  }
  envLines.push("");
  envLines.push("# === STRIPE COUPON CODES (auto-generated) ===");
  for (const c of coupons) {
    envLines.push(`# TODO: COUPON_${c.id}=${couponMap[c.id]}`);
  }
  envLines.push("");

  fs.writeFileSync(envExamplePath, envContent.trimEnd() + "\n" + envLines.join("\n"));
  console.log(`Updated ${envExamplePath}`);

  // ── Summary ──

  console.log("\n=== SUMMARY ===\n");
  console.log("SUBSCRIPTION PRICES:");
  for (const tier of subscriptionTiers) {
    console.log(`  ${tier.name}:`);
    for (const p of tier.prices) {
      console.log(`    ${p.constName} = ${priceMap[p.constName]}`);
    }
  }
  console.log("\nSETUP FEE PRICES:");
  for (const fee of setupFees) {
    console.log(`  ${fee.constName} = ${priceMap[fee.constName]}`);
  }
  console.log("\nCOUPON CODES:");
  for (const c of coupons) {
    console.log(`  ${c.id} = ${couponMap[c.id]}`);
  }
  console.log("\nDone! All created in TEST mode.");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
