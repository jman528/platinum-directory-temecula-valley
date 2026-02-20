// app/api/credits/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { CREDIT_PACKS } from '@/lib/credits/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId, businessId } = await req.json()

  const pack = CREDIT_PACKS.find(p => p.id === packId)
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const totalCredits = pack.credits + ('bonus' in pack ? (pack.bonus ?? 0) : 0)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pack.name} — ${totalCredits} AI Credits`,
            description: pack.description,
          },
          unit_amount: pack.price_cents,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'credit_pack',
        pack_id: packId,
        business_id: businessId || '',
        user_id: user.id,
        credits: String(totalCredits),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/credits?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Credit purchase error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
