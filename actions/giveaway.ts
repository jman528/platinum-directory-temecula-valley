'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function enterConsumerGiveaway(formData: FormData) {
  const supabase = createAdminClient()

  const giveawayId = formData.get('giveawayId') as string
  const email = formData.get('email') as string

  // Determine type based on giveawayId convention
  const giveawayType = giveawayId === 'giveaway-business-elite' ? 'business' : 'consumer'

  // Check for existing entry
  const { data: existing } = await supabase
    .from('giveaway_entries')
    .select('id')
    .eq('email', email)
    .eq('giveaway_type', giveawayType)
    .maybeSingle()

  if (existing) throw new Error('You have already entered this giveaway')

  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data: entry, error } = await supabase
    .from('giveaway_entries')
    .insert({
      giveaway_type: giveawayType,
      full_name: formData.get('fullName') as string,
      email,
      phone: (formData.get('phone') as string) || '',
      city: formData.get('zipCode') as string, // Using city field for zip code (closest match in schema)
      referral_code: (formData.get('referredBy') as string) || null,
      total_entries: 1,
      bonus_entries: 0,
      agreed_to_rules: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Giveaway entry error:', error)
    throw new Error('Failed to enter giveaway')
  }

  return { ...entry, referralCode }
}

export async function addBonusEntries(entryId: string, bonusEntries: number, shareType: string) {
  const supabase = createAdminClient()

  // First fetch the current entry to calculate new totals
  const { data: current, error: fetchError } = await supabase
    .from('giveaway_entries')
    .select('bonus_entries, total_entries')
    .eq('id', entryId)
    .single()

  if (fetchError || !current) {
    throw new Error('Entry not found')
  }

  const { data: updated, error } = await supabase
    .from('giveaway_entries')
    .update({
      bonus_entries: (current.bonus_entries || 0) + bonusEntries,
      total_entries: (current.total_entries || 1) + bonusEntries,
    })
    .eq('id', entryId)
    .select()
    .single()

  if (error) {
    console.error('Bonus entries error:', error)
    throw new Error('Failed to add bonus entries')
  }

  return updated
}
