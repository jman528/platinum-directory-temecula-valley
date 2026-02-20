// lib/enrichment/google-places.ts
export async function enrichFromGooglePlaces(businessName: string, city: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  // Step 1: Find the place
  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName + ' ' + city + ' CA')}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,opening_hours,formatted_phone_number,website,photos,price_level,types,url&key=${apiKey}`

  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()

  if (!searchData.candidates?.length) return null

  const place = searchData.candidates[0]

  // Step 2: Get photos (up to 5)
  const images: { url: string; source: 'google_places'; alt: string }[] = []
  if (place.photos?.length) {
    for (const photo of place.photos.slice(0, 5)) {
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${apiKey}`
      try {
        const photoRes = await fetch(photoUrl, { redirect: 'follow' })
        if (photoRes.ok) {
          images.push({
            url: photoRes.url,
            source: 'google_places',
            alt: businessName,
          })
        }
      } catch {
        images.push({ url: photoUrl, source: 'google_places', alt: businessName })
      }
    }
  }

  // Parse hours
  const hours = place.opening_hours?.weekday_text?.map((text: string) => {
    const [day, timeRange] = text.split(': ')
    const [open, close] = (timeRange || '').split(' – ')
    return {
      day: day?.trim(),
      open: open?.trim() || '',
      close: close?.trim() || '',
      closed: timeRange?.toLowerCase().includes('closed') || false,
    }
  }) || []

  return {
    phone: place.formatted_phone_number,
    address: place.formatted_address,
    rating: place.rating,
    review_count: place.user_ratings_total,
    maps_url: place.url,
    hours,
    images,
    price_level: place.price_level,
    types: place.types,
  }
}
