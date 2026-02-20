import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function logWebhookEvent(
  event: Stripe.Event,
  extra?: { user_id?: string; business_id?: string }
) {
  const adminClient = createAdminClient()
  const obj = event.data.object as any

  await adminClient.from('events').insert({
    event_type: `stripe.${event.type}`,
    event_data: obj,
    user_id: extra?.user_id || obj?.metadata?.user_id || null,
    business_id: extra?.business_id || obj?.metadata?.business_id || null,
  }).then(({ error }) => {
    if (error) console.error('Failed to log webhook event:', error)
  })
}
