// app/api/enrichment/scrape/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { enrichBusiness } from '@/lib/enrichment/orchestrator'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin' && profile?.user_type !== 'super_admin' && profile?.user_type !== 'business_owner') {
    return null
  }
  return user
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { businessId } = await req.json()

  if (!businessId) {
    return NextResponse.json({ error: 'businessId required' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Fetch business
  const { data: business, error } = await adminClient
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  if (!business.website) {
    return NextResponse.json({ error: 'Business has no website URL set' }, { status: 400 })
  }

  // Run enrichment
  const enriched = await enrichBusiness(
    businessId,
    business.website,
    business.name,
    business.city || 'Temecula'
  )

  // Log to data_enrichment_log (if table exists)
  try {
    await adminClient.from('data_enrichment_log').insert({
      business_id: businessId,
      source: 'multi_source',
      raw_data: enriched,
      status: 'pending_review',
      confidence_score: enriched.confidence_score,
      fields_found: Object.keys(enriched).filter(k => {
        const val = enriched[k as keyof typeof enriched]
        return val !== null && val !== undefined &&
               (Array.isArray(val) ? val.length > 0 : true)
      }),
      triggered_by: 'manual',
    })
  } catch {
    // data_enrichment_log table may not exist yet — that's OK
  }

  return NextResponse.json({ enriched, businessId })
}

// PATCH — Apply approved fields to business record
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { businessId, approvedFields } = await req.json()
  const adminClient = createAdminClient()

  // Build update object from approved fields only
  const update: Record<string, unknown> = {}

  const fieldMap: Record<string, string> = {
    description: 'description',
    phone: 'phone',
    email: 'email',
    address: 'address',
    city: 'city',
    state: 'state',
    hours: 'business_hours',
    social_links: 'social_links',
    images: 'gallery_images',
    cover_image_url: 'cover_image_url',
    logo_url: 'logo_url',
    seo_title: 'seo_title',
    seo_description: 'seo_description',
    seo_keywords: 'seo_keywords',
    schema_type: 'schema_type',
    aggregate_rating: 'average_rating',
    aggregate_review_count: 'review_count',
    amenities: 'amenities',
    services: 'services',
    price_range: 'price_range',
  }

  for (const [field, value] of Object.entries(approvedFields)) {
    const dbField = fieldMap[field]
    if (dbField) {
      // Format phone numbers
      if (field === 'phone' && typeof value === 'string') {
        const digits = value.replace(/\D/g, '')
        const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
        update[dbField] = normalized.length === 10
          ? `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`
          : value
      } else {
        update[dbField] = value
      }
    }
  }

  update.enriched_at = new Date().toISOString()
  update.enrichment_score = approvedFields.confidence_score

  const { error } = await adminClient
    .from('businesses')
    .update(update)
    .eq('id', businessId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, fieldsApplied: Object.keys(update) })
}
