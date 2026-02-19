import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { PLATFORM_FEES } from "@/lib/constants";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const { offerId } = await req.json();

    if (!offerId) {
      return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the offer with business details
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select("*, businesses(id, name, slug, tier, stripe_connect_id)")
      .eq("id", offerId)
      .eq("is_active", true)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found or inactive" }, { status: 404 });
    }

    const o = offer as any;
    const biz = o.businesses;

    // Check if sold out
    if (o.max_claims && o.current_claims >= o.max_claims) {
      return NextResponse.json({ error: "This offer is sold out" }, { status: 400 });
    }

    // Check expiration
    if (o.expires_at && new Date(o.expires_at) < new Date()) {
      return NextResponse.json({ error: "This offer has expired" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const priceInCents = Math.round(o.offer_price * 100);

    // Calculate platform fee
    const tier = biz?.tier || "free";
    const feeConfig = PLATFORM_FEES[tier as keyof typeof PLATFORM_FEES] || PLATFORM_FEES.free;
    const platformFeeAmount = Math.round(priceInCents * feeConfig.platformFee);

    // Build Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: o.title,
              description: `${biz?.name} — ${o.offer_type === "voucher" ? "QR Voucher" : "Local Deal"}`,
              ...(o.cover_image_url ? { images: [o.cover_image_url] } : {}),
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/offers/${o.slug}?success=1`,
      cancel_url: `${baseUrl}/offers/${o.slug}`,
      metadata: {
        offer_id: o.id,
        business_id: biz?.id,
        offer_slug: o.slug,
        platform_fee_cents: String(platformFeeAmount),
      },
    };

    // If the business has Stripe Connect, use destination charge
    if (biz?.stripe_connect_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: biz.stripe_connect_id,
        },
      };
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
