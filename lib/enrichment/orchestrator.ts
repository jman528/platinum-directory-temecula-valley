// lib/enrichment/orchestrator.ts
import { enrichFromFirecrawl } from './firecrawl'
import { enrichFromGooglePlaces } from './google-places'
import { enrichFromYelp } from './yelp'
import { enhanceWithAI } from './ai-enhance'

export interface EnrichmentResult {
  // Core fields
  name?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string

  // Hours
  hours?: {
    day: string
    open: string
    close: string
    closed?: boolean
  }[]

  // Rich media
  images: {
    url: string
    alt?: string
    source: 'website' | 'google_places' | 'yelp' | 'social'
    width?: number
    height?: number
  }[]
  logo_url?: string
  cover_image_url?: string

  // Social
  social_links: {
    platform: string
    url: string
    handle?: string
  }[]

  // Reviews
  reviews: {
    source: 'google' | 'yelp' | 'tripadvisor' | 'facebook'
    rating: number
    review_count: number
    url?: string
  }[]
  aggregate_rating?: number
  aggregate_review_count?: number

  // Business details
  menu_items?: string[]
  services?: string[]
  amenities?: string[]
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  cuisine_types?: string[]
  categories_suggested?: string[]

  // SEO
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  schema_type?: string

  // Source metadata
  sources_used: string[]
  enriched_at: string
  confidence_score: number
}

export async function enrichBusiness(
  _businessId: string,
  websiteUrl: string,
  businessName: string,
  city: string = 'Temecula'
): Promise<EnrichmentResult> {
  const results: Partial<EnrichmentResult> = {
    images: [],
    social_links: [],
    reviews: [],
    sources_used: [],
  }

  // Run all enrichment sources in parallel
  const [firecrawlData, googleData, yelpData] = await Promise.allSettled([
    enrichFromFirecrawl(websiteUrl, businessName),
    enrichFromGooglePlaces(businessName, city),
    enrichFromYelp(businessName, city),
  ])

  // Merge Firecrawl data (highest priority — direct from their website)
  if (firecrawlData.status === 'fulfilled' && firecrawlData.value) {
    const fc = firecrawlData.value
    Object.assign(results, {
      name: fc.name,
      description: fc.description,
      phone: fc.phone,
      email: fc.email,
      address: fc.address,
      hours: fc.hours,
      services: fc.services,
      amenities: fc.amenities,
      logo_url: fc.logo_url,
    })
    results.images!.push(...(fc.images || []))
    results.social_links!.push(...(fc.social_links || []))
    results.sources_used!.push('website')
  }

  // Merge Google Places data
  if (googleData.status === 'fulfilled' && googleData.value) {
    const gp = googleData.value
    if (gp.rating) {
      results.reviews!.push({
        source: 'google',
        rating: gp.rating,
        review_count: gp.review_count || 0,
        url: gp.maps_url,
      })
    }
    if (!results.phone && gp.phone) results.phone = gp.phone
    if (!results.address && gp.address) results.address = gp.address
    if (!results.hours?.length && gp.hours?.length) results.hours = gp.hours
    if (gp.images?.length) results.images!.push(...gp.images)
    results.sources_used!.push('google_places')
  }

  // Merge Yelp data
  if (yelpData.status === 'fulfilled' && yelpData.value) {
    const y = yelpData.value
    if (y.rating) {
      results.reviews!.push({
        source: 'yelp',
        rating: y.rating,
        review_count: y.review_count || 0,
        url: y.yelp_url,
      })
    }
    if (y.images?.length) results.images!.push(...y.images)
    if (y.price_range) results.price_range = y.price_range as EnrichmentResult['price_range']
    if (y.categories?.length) results.categories_suggested = y.categories
    results.sources_used!.push('yelp')
  }

  // Calculate aggregate rating
  if (results.reviews!.length > 0) {
    const totalReviews = results.reviews!.reduce((sum, r) => sum + r.review_count, 0)
    const weightedRating = results.reviews!.reduce(
      (sum, r) => sum + r.rating * r.review_count, 0
    )
    results.aggregate_rating = totalReviews > 0
      ? Math.round((weightedRating / totalReviews) * 10) / 10
      : undefined
    results.aggregate_review_count = totalReviews
  }

  // Deduplicate images and social links
  results.images = deduplicateImages(results.images!)
  results.social_links = deduplicateSocialLinks(results.social_links!)

  // Set best cover image
  if (results.images!.length > 0 && !results.cover_image_url) {
    results.cover_image_url = results.images![0].url
  }

  // AI post-processing: rewrite description for SEO, generate meta tags
  const aiEnhanced = await enhanceWithAI(results as Record<string, unknown>, businessName, city)
  Object.assign(results, aiEnhanced)

  // Confidence score based on data completeness
  results.confidence_score = calculateConfidence(results as EnrichmentResult)
  results.enriched_at = new Date().toISOString()

  return results as EnrichmentResult
}

function deduplicateImages(images: EnrichmentResult['images']) {
  const seen = new Set<string>()
  return images.filter(img => {
    const key = img.url.split('?')[0]
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 20)
}

function deduplicateSocialLinks(links: EnrichmentResult['social_links']) {
  const seen = new Set<string>()
  return links.filter(link => {
    if (seen.has(link.platform)) return false
    seen.add(link.platform)
    return true
  })
}

function calculateConfidence(result: EnrichmentResult): number {
  let score = 0
  if (result.name) score += 10
  if (result.description && result.description.length > 100) score += 15
  if (result.phone) score += 10
  if (result.address) score += 10
  if (result.hours?.length) score += 10
  if (result.images?.length >= 3) score += 10
  if (result.social_links?.length >= 1) score += 10
  if (result.reviews?.length >= 1) score += 15
  if (result.seo_title) score += 5
  if (result.seo_description) score += 5
  return Math.min(score, 100)
}
