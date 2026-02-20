import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { logWebhookEvent } from '@/lib/webhook-logger'

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

  try {
    switch (event.type) {
      // ── CHECKOUT ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await logWebhookEvent(event, {
          user_id: session.metadata?.user_id,
          business_id: session.metadata?.business_id,
        })

        if (session.metadata?.type === 'credit_pack') {
          // AI credit purchase
          const userId = session.metadata.user_id
          const credits = parseInt(session.metadata.credits || '0', 10)
          const packId = session.metadata.pack_id
          if (userId && credits > 0) {
            await adminClient.rpc('add_ai_credits', {
              p_user_id: userId,
              p_credits: credits,
              p_reason: `Purchased ${packId}`,
              p_stripe_session_id: session.id,
            })
          }
        } else if (session.mode === 'subscription' || session.metadata?.type === 'subscription') {
          // Subscription checkout (with possible setup fee)
          const businessId = session.metadata?.business_id
          const tier = session.metadata?.tier
          const setupFeeIncluded = session.metadata?.setup_fee_included === 'true'
          const discountCode = session.metadata?.discount_code

          if (businessId && tier) {
            const updateData: Record<string, any> = {
              tier,
              is_active: true,
              subscription_status: 'active',
              subscription_stripe_id: session.subscription as string,
            }

            if (setupFeeIncluded) {
              updateData.setup_fee_status = 'paid'
              updateData.setup_fee_paid_at = new Date().toISOString()
              if (discountCode) updateData.discount_code_used = discountCode
            }

            await adminClient
              .from('businesses')
              .update(updateData)
              .eq('id', businessId)
          }
        } else if (session.metadata?.offer_id) {
          // Smart Offer purchase — increment claim count
          const offerId = session.metadata.offer_id
          const { data: offer } = await adminClient
            .from('offers')
            .select('current_claims')
            .eq('id', offerId)
            .single()
          if (offer) {
            await adminClient
              .from('offers')
              .update({ current_claims: (offer.current_claims || 0) + 1 })
              .eq('id', offerId)
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await logWebhookEvent(event, {
          user_id: session.metadata?.user_id,
          business_id: session.metadata?.business_id,
        })
        break
      }

      // ── SUBSCRIPTIONS ──
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.business_id
        await logWebhookEvent(event, { business_id: businessId })

        if (businessId) {
          await adminClient
            .from('businesses')
            .update({
              subscription_status: 'active',
              subscription_stripe_id: subscription.id,
            })
            .eq('id', businessId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.business_id
        await logWebhookEvent(event, { business_id: businessId })

        if (businessId) {
          const statusMap: Record<string, string> = {
            active: 'active',
            trialing: 'active',
            past_due: 'past_due',
            canceled: 'cancelled',
            unpaid: 'past_due',
            incomplete: 'incomplete',
            incomplete_expired: 'cancelled',
            paused: 'paused',
          }
          const status = statusMap[subscription.status] || subscription.status

          await adminClient
            .from('businesses')
            .update({
              subscription_status: status,
              is_active: status === 'active',
            })
            .eq('id', businessId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.business_id
        await logWebhookEvent(event, { business_id: businessId })

        if (businessId) {
          await adminClient
            .from('businesses')
            .update({
              tier: 'free',
              subscription_status: 'cancelled',
              subscription_stripe_id: null,
            })
            .eq('id', businessId)
        }
        break
      }

      // ── INVOICES ──
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string | null
        await logWebhookEvent(event)

        if (subscriptionId) {
          // Find business by subscription ID
          const { data: biz } = await adminClient
            .from('businesses')
            .select('id, owner_id')
            .eq('subscription_stripe_id', subscriptionId)
            .single()

          if (biz) {
            await adminClient
              .from('businesses')
              .update({ subscription_status: 'active' })
              .eq('id', biz.id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string | null
        await logWebhookEvent(event)

        if (subscriptionId) {
          const { data: biz } = await adminClient
            .from('businesses')
            .select('id, owner_id')
            .eq('subscription_stripe_id', subscriptionId)
            .single()

          if (biz) {
            await adminClient
              .from('businesses')
              .update({ subscription_status: 'past_due' })
              .eq('id', biz.id)
          }
        }
        break
      }

      // ── CONNECT ──
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await logWebhookEvent(event)

        const connectStatus = account.charges_enabled && account.payouts_enabled
          ? 'active'
          : account.details_submitted
            ? 'pending'
            : 'not_connected'

        await adminClient
          .from('businesses')
          .update({ stripe_connect_status: connectStatus })
          .eq('stripe_connect_id', account.id)
        break
      }

      case 'payout.paid': {
        await logWebhookEvent(event)
        break
      }

      case 'payout.failed': {
        await logWebhookEvent(event)
        console.error('Payout failed:', event.data.object)
        break
      }

      // ── CHARGES ──
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await logWebhookEvent(event)

        // If refund is related to a smart offer, reverse the claim
        if (charge.metadata?.offer_id) {
          await adminClient
            .from('offer_claims')
            .update({ status: 'refunded' })
            .eq('stripe_session_id', charge.payment_intent as string)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        await logWebhookEvent(event)
        console.error('Dispute created:', dispute.id, dispute.reason)
        break
      }

      case 'charge.dispute.closed': {
        await logWebhookEvent(event)
        break
      }

      default:
        // Unhandled event type — log for observability
        await logWebhookEvent(event)
        break
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err)
    // Still return 200 to prevent Stripe retries on known errors
  }

  return NextResponse.json({ received: true })
}
