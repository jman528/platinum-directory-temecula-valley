// lib/enrichment/yelp.ts
// Uses Yelp Fusion API
export async function enrichFromYelp(businessName: string, city: string) {
  const apiKey = process.env.YELP_API_KEY
  if (!apiKey) return null

  const searchUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(businessName)}&location=${encodeURIComponent(city + ', CA')}&limit=1`

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!res.ok) return null
  const data = await res.json()

  if (!data.businesses?.length) return null
  const biz = data.businesses[0]

  // Get more details including photos
  const detailRes = await fetch(`https://api.yelp.com/v3/businesses/${biz.id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  const detail = detailRes.ok ? await detailRes.json() : biz

  const photoSources = detail.photos || (biz.image_url ? [biz.image_url] : [])
  const images = photoSources
    .filter(Boolean)
    .map((url: string) => ({
      url,
      source: 'yelp' as const,
      alt: businessName,
    }))

  const priceMap: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

  return {
    rating: biz.rating,
    review_count: biz.review_count,
    yelp_url: biz.url,
    images,
    price_range: priceMap[biz.price?.length || 2],
    categories: biz.categories?.map((c: { title: string }) => c.title) || [],
  }
}
