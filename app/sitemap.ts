// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://platinumdirectorytemeculavalley.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — always included even if Supabase is unreachable
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

  // City pages — static, no DB needed
  const cities = ['temecula', 'murrieta', 'hemet', 'menifee', 'fallbrook', 'lake-elsinore', 'perris', 'wildomar', 'canyon-lake', 'winchester', 'french-valley']
  const cityPages: MetadataRoute.Sitemap = cities.map(c => ({
    url: `${BASE_URL}/city/${c}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Guard: if env vars are missing, return static pages only
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return [...staticPages, ...cityPages]
  }

  const client = createClient(supabaseUrl, supabaseKey)

  // Dynamic business pages
  let businessPages: MetadataRoute.Sitemap = []
  try {
    const { data: businesses } = await client
      .from('businesses')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000)

    businessPages = (businesses || []).map(b => ({
      url: `${BASE_URL}/business/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Supabase unreachable — continue with static pages
  }

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const { data: categories } = await client
      .from('categories')
      .select('slug')

    categoryPages = (categories || [])
      .filter(c => c.slug)
      .map(c => ({
        url: `${BASE_URL}/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }))
  } catch {
    // categories table may not exist yet
  }

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
