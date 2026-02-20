// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = 'https://platinumdirectorytemeculavalley.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/smart-offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/giveaway`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/partners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/rewards`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
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
    url: `${BASE_URL}/business/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Category pages
  const { data: categories } = await client
    .from('categories')
    .select('slug')

  const categoryPages: MetadataRoute.Sitemap = (categories || [])
    .filter(c => c.slug)
    .map(c => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

  // City pages
  const cities = ['temecula', 'murrieta', 'hemet', 'menifee', 'fallbrook', 'lake-elsinore', 'perris', 'wildomar']
  const cityPages: MetadataRoute.Sitemap = cities.map(c => ({
    url: `${BASE_URL}/city/${c}`,
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
        url: `${BASE_URL}/offers/${o.slug}`,
        lastModified: new Date(o.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
  } catch {
    // smart_offers table may not exist yet
  }

  return [...staticPages, ...businessPages, ...categoryPages, ...cityPages, ...offerPages]
}
