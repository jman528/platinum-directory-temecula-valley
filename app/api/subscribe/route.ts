import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PRICES, SETUP_FEE_PRICES } from "@/lib/stripe-price-ids";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const TIER_MAP: Record<string, keyof typeof SUBSCRIPTION_PRICES> = {
  verified_platinum: "verified",
  platinum_partner: "partner",
  platinum_elite: "elite",
};

const SETUP_FEE_MAP: Record<string, keyof typeof SETUP_FEE_PRICES> = {
  verified_platinum: "verified_setup",
  platinum_partner: "partner_setup",
  platinum_elite: "elite_setup",
};

export async function POST(req: NextRequest) {
  try {
    const { tier, billing_period, business_id, discount_code } = await req.json();

    if (!tier || !billing_period || !business_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user owns this business
    const { data: biz } = await supabase
      .from("businesses")
      .select("id, name, owner_id, tier, setup_fee_status")
      .eq("id", business_id)
      .single();

    if (!biz || biz.owner_id !== user.id) {
      return NextResponse.json({ error: "Business not found or access denied" }, { status: 403 });
    }

    const tierKey = TIER_MAP[tier];
    if (!tierKey) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceMap = SUBSCRIPTION_PRICES[tierKey];
    const priceId = priceMap[billing_period as keyof typeof priceMap];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const stripe = getStripe();

    // Build line items: subscription + one-time setup fee
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: priceId, quantity: 1 },
    ];

    // Add setup fee if not already paid or waived
    const setupFeeKey = SETUP_FEE_MAP[tier];
    const needsSetupFee = biz.setup_fee_status !== "paid" && biz.setup_fee_status !== "waived";
    if (needsSetupFee && setupFeeKey) {
      lineItems.push({
        price: SETUP_FEE_PRICES[setupFeeKey],
        quantity: 1,
      });
    }

    // Validate and apply discount code
    let couponId: string | undefined;
    if (discount_code) {
      const validateRes = await fetch(`${baseUrl}/api/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discount_code, applies_to: "setup_fee", user_id: user.id, tier }),
      });
      const validateData = await validateRes.json();
      if (validateData.valid) {
        // Try to use as Stripe coupon
        try {
          await stripe.coupons.retrieve(discount_code.toUpperCase());
          couponId = discount_code.toUpperCase();
        } catch {
          // Not a Stripe coupon — discount applied on our side only
        }
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: lineItems,
      success_url: `${baseUrl}/dashboard?upgraded=1`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: user.email,
      metadata: {
        business_id: biz.id,
        tier,
        user_id: user.id,
        setup_fee_included: needsSetupFee ? "true" : "false",
        discount_code: discount_code || "",
      },
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
