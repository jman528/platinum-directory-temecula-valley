// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://platinumdirectorytemeculavalley.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/giveaway`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/partners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/rewards`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/smart-offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  // Dynamic business pages
  const { data: businesses } = await client
    .from('businesses')
    .select('slug, updated_at')
    .eq('is_active', true)
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(10000)

  const businessPages: MetadataRoute.Sitemap = (businesses || []).map(b => ({
    url: `${baseUrl}/business/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category pages
  const { data: categories } = await client
    .from('categories')
    .select('slug')

  const categoryPages: MetadataRoute.Sitemap = (categories || [])
    .filter(c => c.slug)
    .map(c => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

  // City pages
  const cities = ['temecula', 'murrieta', 'hemet', 'menifee', 'fallbrook', 'lake-elsinore', 'perris', 'wildomar']
  const cityPages: MetadataRoute.Sitemap = cities.map(c => ({
    url: `${baseUrl}/city/${c}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Active Smart Offers
  let offerPages: MetadataRoute.Sitemap = []
  try {
    const { data: offers } = await client
      .from('smart_offers')
      .select('slug, updated_at')
      .eq('status', 'active')

    offerPages = (offers || [])
      .filter(o => o.slug)
      .map(o => ({
        url: `${baseUrl}/offers/${o.slug}`,
        lastModified: new Date(o.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
  } catch {
    // smart_offers table may not exist yet
  }

  return [...staticPages, ...businessPages, ...categoryPages, ...cityPages, ...offerPages]
}
