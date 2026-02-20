// lib/enrichment/ai-enhance.ts
import { callAI } from '@/lib/ai/router'

export async function enhanceWithAI(
  data: Record<string, unknown>,
  businessName: string,
  city: string
) {
  const prompt = `You are an expert SEO copywriter and local business marketing specialist.
Given this raw business data for "${businessName}" in ${city}, California, return ONLY valid JSON with these fields:

RAW DATA:
${JSON.stringify({
  description: data.description,
  services: data.services,
  amenities: data.amenities,
  hours: data.hours,
  price_range: data.price_range,
  categories: data.categories_suggested,
  reviews: data.reviews,
}, null, 2)}

Return JSON with EXACTLY these fields (no extra text):
{
  "description": "SEO-optimized description, 200-400 words, naturally includes location (${city}, Temecula Valley, CA), highlights key offerings, uses active voice, compelling for visitors",
  "seo_title": "60 char max. Format: [Business Name] - [Key Offering] | Temecula Valley",
  "seo_description": "160 char max. Compelling meta description with location and key value prop",
  "seo_keywords": ["array", "of", "10-15", "relevant", "local", "keywords"],
  "schema_type": "Most specific Schema.org type: Restaurant|Winery|HealthClub|Spa|LocalBusiness|Hotel|etc"
}`

  const result = await callAI(
    [{ role: 'user', content: prompt }],
    { maxTokens: 1000, temperature: 0.3, preferredProvider: 'groq' }
  )

  try {
    const cleaned = result.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return {}
  }
}
