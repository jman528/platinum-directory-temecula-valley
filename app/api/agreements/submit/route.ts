import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";
import { headers } from "next/headers";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const TIER_CONFIG: Record<string, { name: string; monthly: number; setup: number }> = {
  "platinum-partner": { name: "Platinum Partner", monthly: 799, setup: 1000 },
  "platinum-elite": { name: "Platinum Elite", monthly: 3500, setup: 1500 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tier,
      business_id,
      businessLegalName,
      signerName,
      signerTitle,
      signerEmail,
      signerPhone,
      businessAddress,
      signatureData,
      signatureType,
      user_agent,
    } = body;

    const config = TIER_CONFIG[tier];
    if (!config) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    if (!businessLegalName || !signerName || !signerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get client IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Create agreement record
    const { data: agreement, error: insertError } = await adminClient
      .from("business_agreements")
      .insert({
        business_id: business_id || null,
        tier,
        signer_name: signerName,
        signer_title: signerTitle || null,
        signer_email: signerEmail,
        signer_phone: signerPhone || null,
        business_legal_name: businessLegalName,
        business_address: businessAddress || null,
        signature_data: signatureType === "drawn" ? signatureData : null,
        signature_type: signatureType,
        ip_address: ip,
        user_agent: user_agent || null,
        agreement_version: "1.0",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Agreement insert error:", insertError);
      return NextResponse.json({ error: "Failed to save agreement" }, { status: 500 });
    }

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: signerEmail,
      line_items: [
        // Monthly subscription
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            product_data: {
              name: `${config.name} Membership`,
              description: `Monthly membership for Platinum Directory Temecula Valley`,
            },
            unit_amount: config.monthly * 100,
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          agreement_id: agreement.id,
          tier,
          business_id: business_id || "",
        },
      },
      metadata: {
        agreement_id: agreement.id,
        tier,
        business_id: business_id || "",
        setup_fee: config.setup.toString(),
      },
      success_url: `${baseUrl}/agreement/success?session_id={CHECKOUT_SESSION_ID}&agreement_id=${agreement.id}`,
      cancel_url: `${baseUrl}/agreement/${tier}${business_id ? `?business_id=${business_id}` : ""}`,
    });

    // Update agreement with stripe checkout ID
    await adminClient
      .from("business_agreements")
      .update({ stripe_checkout_id: session.id })
      .eq("id", agreement.id);

    return NextResponse.json({ checkout_url: session.url, agreement_id: agreement.id });
  } catch (err) {
    console.error("Agreement submission error:", err);
    return NextResponse.json({ error: "Failed to process agreement" }, { status: 500 });
  }
}
