'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createBusiness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const slug = name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `business-${Date.now()}`

  const adminClient = createAdminClient()

  const { data: business, error } = await adminClient
    .from('businesses')
    .insert({
      name,
      slug,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      city: (formData.get('city') as string) || 'Temecula',
      state: 'CA',
      zip_code: formData.get('zip') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      owner_user_id: user.id,
      tier: 'free',
      is_active: false, // pending review
      is_featured: false,
      average_rating: 0,
      review_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Business creation error:', error)
    throw new Error('Failed to create business')
  }

  return business
}

export async function updateBusiness(businessId: string, data: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify the user owns this business
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_user_id', user.id)
    .single()

  if (fetchError || !business) {
    throw new Error('Business not found or unauthorized')
  }

  const adminClient = createAdminClient()

  const { data: updated, error } = await adminClient
    .from('businesses')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    console.error('Business update error:', error)
    throw new Error('Failed to update business')
  }

  return updated
}

export async function claimBusiness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const businessId = formData.get('businessId') as string

  const adminClient = createAdminClient()

  // Check that business exists and is unclaimed
  const { data: business, error: fetchError } = await adminClient
    .from('businesses')
    .select('id, owner_user_id')
    .eq('id', businessId)
    .is('owner_user_id', null)
    .single()

  if (fetchError || !business) {
    throw new Error('Business not found or already claimed')
  }

  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const ownerName = (formData.get('ownerName') as string) || profile?.full_name || user.email || ''

  const { data: updated, error } = await adminClient
    .from('businesses')
    .update({
      owner_user_id: user.id,
      is_claimed: true,
      claimed_by: ownerName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    console.error('Claim error:', error)
    throw new Error('Failed to claim business')
  }

  return updated
}
