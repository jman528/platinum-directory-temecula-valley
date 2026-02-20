// app/api/search/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/router'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  // Use AI to parse natural language query into structured filters
  const parsePrompt = `Parse this business search query into structured JSON filters.
Query: "${query}"

Return ONLY valid JSON with these optional fields:
{
  "keywords": "wine tasting",
  "category": "Wineries",
  "minRating": 4,
  "priceRange": "$$",
  "openNow": true,
  "city": "Temecula",
  "amenities": ["pet-friendly", "outdoor seating"],
  "tier": null
}

Only include fields that are explicitly mentioned or strongly implied. Return null for missing fields.
Valid categories: Wineries, Restaurants, Spas, Hotels, Shopping, Entertainment, Services, Health & Wellness, Automotive, Real Estate, Wedding & Events, Breweries, Golf, Outdoor Activities.
Valid cities: Temecula, Murrieta, Hemet, Menifee, Fallbrook, Lake Elsinore, Perris, Wildomar, Sun City, Winchester, Canyon Lake.`

  let filters: Record<string, unknown> = { keywords: query }
  try {
    const aiResponse = await callAI(
      [{ role: 'user', content: parsePrompt }],
      { maxTokens: 300, temperature: 0.1, preferredProvider: 'groq' }
    )
    const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      filters = JSON.parse(jsonMatch[0])
    }
  } catch {
    filters = { keywords: query }
  }

  // Execute structured search against Supabase
  const supabase = await createClient()

  let dbQuery = supabase
    .from('businesses')
    .select('id, name, slug, description, tier, phone, website, city, average_rating, review_count, cover_image_url, is_featured, price_range, categories(name, slug)')
    .eq('is_active', true)
    .order('tier', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(20)

  const keywords = (filters.keywords as string) || query
  if (keywords) {
    dbQuery = dbQuery.or(`name.ilike.%${keywords}%,description.ilike.%${keywords}%,city.ilike.%${keywords}%`)
  }
  if (filters.city && typeof filters.city === 'string') {
    dbQuery = dbQuery.ilike('city', filters.city)
  }
  if (filters.minRating && typeof filters.minRating === 'number') {
    dbQuery = dbQuery.gte('average_rating', filters.minRating)
  }
  if (filters.category && typeof filters.category === 'string') {
    const { data: catRow } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${filters.category}%`)
      .limit(1)
      .single()
    if (catRow) {
      dbQuery = dbQuery.eq('category_id', catRow.id)
    }
  }

  const { data: businesses } = await dbQuery
  return NextResponse.json({
    filters,
    results: businesses || [],
    query,
    resultCount: businesses?.length || 0,
  })
}
