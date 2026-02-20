// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.type === 'credit_pack') {
        const userId = session.metadata.user_id
        const credits = parseInt(session.metadata.credits || '0', 10)
        const packId = session.metadata.pack_id

        if (userId && credits > 0) {
          // Add credits via the SQL function
          const { error } = await adminClient.rpc('add_ai_credits', {
            p_user_id: userId,
            p_credits: credits,
            p_reason: `Purchased ${packId}`,
            p_stripe_session_id: session.id,
          })
          if (error) {
            console.error('Failed to add credits:', error)
          }
        }
      } else if (session.metadata?.type === 'subscription') {
        // Handle subscription checkout completion
        const businessId = session.metadata.business_id
        const tier = session.metadata.tier
        if (businessId && tier) {
          await adminClient
            .from('businesses')
            .update({ tier, is_active: true })
            .eq('id', businessId)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const businessId = subscription.metadata?.business_id
      if (businessId) {
        const isActive = subscription.status === 'active' || subscription.status === 'trialing'
        await adminClient
          .from('businesses')
          .update({ is_active: isActive })
          .eq('id', businessId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const businessId = subscription.metadata?.business_id
      if (businessId) {
        await adminClient
          .from('businesses')
          .update({ tier: 'free' })
          .eq('id', businessId)
      }
      break
    }

    default:
      // Unhandled event type
      break
  }

  return NextResponse.json({ received: true })
}
