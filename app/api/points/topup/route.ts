import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { POINTS_CONFIG } from "@/lib/points-config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { tier_index } = await req.json();

    if (tier_index < 0 || tier_index >= POINTS_CONFIG.TOPUP_TIERS.length) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tier = POINTS_CONFIG.TOPUP_TIERS[tier_index];
    const pointsToAdd = tier.points + tier.bonus;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: tier.price * 100,
            product_data: {
              name: `Points Wallet Top-Up — ${tier.label}`,
              description: `${pointsToAdd.toLocaleString()} points ($${(pointsToAdd / 1000).toFixed(2)} value)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        type: "wallet_topup",
        points_to_add: pointsToAdd.toString(),
        tier_price: tier.price.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/rewards?topup=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/rewards?topup=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Points top-up error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
