// lib/enrichment/firecrawl.ts
import FirecrawlApp from '@mendable/firecrawl-js'

export async function enrichFromFirecrawl(websiteUrl: string, businessName: string) {
  if (!process.env.FIRECRAWL_API_KEY) return null

  const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

  // Use the v2 extract() method for structured data extraction
  const result = await firecrawl.extract({
    urls: [websiteUrl],
    prompt: `Extract all business information from this website for: ${businessName}`,
    schema: {
      type: 'object',
      properties: {
        business_name: { type: 'string', description: 'The official business name' },
        tagline: { type: 'string', description: 'Business tagline or slogan' },
        description: { type: 'string', description: 'Full business description, min 200 chars' },
        phone: { type: 'string', description: 'Primary phone number' },
        email: { type: 'string', description: 'Primary contact email' },
        address: { type: 'string', description: 'Full street address' },
        city: { type: 'string' },
        state: { type: 'string' },
        zip: { type: 'string' },
        hours: {
          type: 'array',
          description: 'Business hours for each day',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string' },
              open: { type: 'string' },
              close: { type: 'string' },
              closed: { type: 'boolean' },
            },
          },
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of services or menu items offered',
        },
        amenities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Amenities like parking, WiFi, pet-friendly, etc.',
        },
        price_range: {
          type: 'string',
          enum: ['$', '$$', '$$$', '$$$$'],
        },
        social_media: {
          type: 'object',
          description: 'All social media profile links found on the page',
          properties: {
            facebook: { type: 'string' },
            instagram: { type: 'string' },
            twitter: { type: 'string' },
            tiktok: { type: 'string' },
            youtube: { type: 'string' },
            linkedin: { type: 'string' },
            yelp: { type: 'string' },
            tripadvisor: { type: 'string' },
            opentable: { type: 'string' },
            pinterest: { type: 'string' },
          },
        },
        logo_url: { type: 'string', description: 'URL of the business logo' },
        image_urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'All relevant business/product image URLs found on the page',
        },
        schema_type: {
          type: 'string',
          description: 'Schema.org type: Restaurant, Winery, LocalBusiness, Hotel, Spa, etc.',
        },
      },
    },
  })

  if (!result.success || !result.data) return null

  const data = result.data as Record<string, unknown>

  // Parse social links into our format
  const social_links: { platform: string; url: string; handle?: string }[] = []
  const socialMedia = data.social_media as Record<string, string> | undefined
  if (socialMedia) {
    for (const [platform, url] of Object.entries(socialMedia)) {
      if (url && typeof url === 'string') {
        const handle = extractHandle(url)
        social_links.push({ platform, url, handle })
      }
    }
  }

  // Parse images — filter to likely business images (not tracking pixels, etc.)
  const imageUrls = (data.image_urls as string[]) || []
  const images = imageUrls
    .filter((url: string) => isValidImageUrl(url))
    .map((url: string) => ({
      url,
      source: 'website' as const,
      alt: businessName,
    }))

  return {
    name: data.business_name as string | undefined,
    description: data.description as string | undefined,
    phone: data.phone as string | undefined,
    email: data.email as string | undefined,
    address: data.address as string | undefined,
    city: data.city as string | undefined,
    state: data.state as string | undefined,
    zip: data.zip as string | undefined,
    hours: data.hours as { day: string; open: string; close: string; closed?: boolean }[] | undefined,
    services: data.services as string[] | undefined,
    amenities: data.amenities as string[] | undefined,
    price_range: data.price_range as string | undefined,
    logo_url: data.logo_url as string | undefined,
    social_links,
    images,
    schema_type: data.schema_type as string | undefined,
  }
}

function extractHandle(url: string): string | undefined {
  try {
    const path = new URL(url).pathname
    const parts = path.split('/').filter(Boolean)
    return parts[parts.length - 1] ? `@${parts[parts.length - 1]}` : undefined
  } catch {
    return undefined
  }
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  const hasImageExt = /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/.test(lower)
  const isImageCdn = lower.includes('cloudinary') || lower.includes('imgix') || lower.includes('unsplash')
  const notTracking = !lower.includes('pixel') && !lower.includes('beacon') && !lower.includes('1x1')
  return (hasImageExt || isImageCdn) && notTracking
}
