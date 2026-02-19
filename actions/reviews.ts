'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// NOTE: A "reviews" table must exist in Supabase with columns:
//   id (UUID PK), business_id (UUID FK -> businesses), user_id (UUID FK -> profiles),
//   author_name (TEXT), author_avatar (TEXT), rating (INTEGER), title (TEXT),
//   body (TEXT), status (TEXT default 'pending'), published_at (TIMESTAMPTZ),
//   created_at (TIMESTAMPTZ default NOW())
// If it does not yet exist, run the migration to create it.

export async function createReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch user profile for author info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const adminClient = createAdminClient()

  const { data: review, error } = await adminClient
    .from('reviews')
    .insert({
      business_id: formData.get('businessId') as string,
      user_id: user.id,
      author_name: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
      author_avatar: profile?.avatar_url || '',
      rating: Number(formData.get('rating')),
      title: (formData.get('title') as string) || '',
      body: (formData.get('body') as string) || '',
      status: 'pending',
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Review creation error:', error)
    throw new Error('Failed to create review')
  }

  return review
}
