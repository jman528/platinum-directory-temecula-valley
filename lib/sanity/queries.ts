export const BUSINESS_SEARCH_QUERY = `
*[_type == "business" && status == "active"
  && ($query == "" || name match $query + "*" || description match $query + "*" || $query in tags)
  && ($category == "" || primaryCategory->slug.current == $category)
  && ($city == "" || city == $city)
] | order(
  select(
    tier == "platinum_elite" => 0,
    tier == "platinum_partner" => 1,
    tier == "verified_platinum" => 2,
    true => 3
  ) asc,
  isFeatured desc,
  averageRating desc,
  reviewCount desc
) [$start...$end] {
  _id, name, slug, description,
  primaryCategory->{name, slug, icon},
  subcategories[]->{name, slug},
  logo, coverImage,
  address, city, state, zip, neighborhood, geopoint,
  phone, website,
  priceRange, amenities, cuisineTypes,
  hours,
  averageRating, reviewCount,
  googleRating, googleReviewCount,
  tier, isVerified, isFeatured,
  smartOffers[isActive == true]{title, offerPrice, originalPrice, validUntil}
}`;

export const FEATURED_BUSINESSES_QUERY = `
*[_type == "business" && status == "active" && (tier == "verified_platinum" || tier == "platinum_partner" || tier == "platinum_elite") && isVerified == true] | order(
  select(
    tier == "platinum_elite" => 0,
    tier == "platinum_partner" => 1,
    tier == "verified_platinum" => 2,
    true => 3
  ) asc,
  averageRating desc
) [0...6] {
  _id, name, slug, description,
  primaryCategory->{name, slug, icon},
  logo, coverImage,
  city, state, zip,
  phone, website,
  averageRating, reviewCount,
  googleRating, googleReviewCount,
  tier, isVerified, isFeatured
}`;

export const BUSINESS_BY_SLUG_QUERY = `
*[_type == "business" && slug.current == $slug][0] {
  _id, name, slug, description, longDescription,
  primaryCategory->{name, slug, icon},
  subcategories[]->{name, slug},
  tags,
  address, city, state, zip, neighborhood, geopoint,
  phone, email, website,
  socialLinks,
  logo, coverImage, gallery, videoUrl,
  hours,
  priceRange, amenities, cuisineTypes, paymentMethods, languages,
  yearEstablished,
  googleRating, googleReviewCount, googlePlaceId,
  smartOffers[isActive == true],
  tier, status, isVerified, isFeatured,
  ownerClerkId, ownerEmail, ownerName, claimedAt,
  averageRating, reviewCount,
  seoTitle, seoDescription
}`;

export const CATEGORIES_QUERY = `
*[_type == "category" && isActive == true] | order(order asc) {
  _id, name, slug, description, icon, image, order, businessCount
}`;

export const BUSINESSES_BY_CATEGORY_QUERY = `
*[_type == "business" && status == "active" && primaryCategory->slug.current == $categorySlug] | order(
  select(
    tier == "platinum_elite" => 0,
    tier == "platinum_partner" => 1,
    tier == "verified_platinum" => 2,
    true => 3
  ) asc,
  isFeatured desc,
  averageRating desc
) [$start...$end] {
  _id, name, slug, description,
  primaryCategory->{name, slug, icon},
  logo, coverImage,
  city, state, zip,
  phone, website,
  averageRating, reviewCount,
  googleRating, googleReviewCount,
  tier, isVerified, isFeatured
}`;

export const BUSINESSES_BY_CITY_QUERY = `
*[_type == "business" && status == "active" && city == $city] | order(
  select(
    tier == "platinum_elite" => 0,
    tier == "platinum_partner" => 1,
    tier == "verified_platinum" => 2,
    true => 3
  ) asc,
  isFeatured desc,
  averageRating desc
) [$start...$end] {
  _id, name, slug, description,
  primaryCategory->{name, slug, icon},
  logo, coverImage,
  address, city, state, zip,
  phone, website,
  averageRating, reviewCount,
  tier, isVerified, isFeatured
}`;

export const ACTIVE_GIVEAWAY_QUERY = `
*[_type == "giveaway" && isActive == true && giveawayType == $type][0] {
  _id, title, description,
  giveawayType, prizeValue, prizeDescription,
  eligibility, requiredTiers,
  startDate, endDate, drawingFrequency,
  image, entryCount,
  sponsoringBusinesses[]->{name, slug, logo},
  rules
}`;

export const REVIEWS_BY_BUSINESS_QUERY = `
*[_type == "review" && business._ref == $businessId && status == "approved"] | order(publishedAt desc) [0...20] {
  _id, authorName, authorAvatar, rating, title, body, photos, publishedAt,
  ownerResponse
}`;

export const BUSINESS_COUNT_QUERY = `count(*[_type == "business" && status == "active"])`;

export const BUSINESSES_BY_OWNER_QUERY = `
*[_type == "business" && ownerClerkId == $clerkId] {
  _id, name, slug, description,
  primaryCategory->{name, slug, icon},
  logo, coverImage,
  city, state, zip,
  tier, status, isVerified, isFeatured,
  averageRating, reviewCount
}`;

export const LEADS_BY_BUSINESS_QUERY = `
*[_type == "lead" && business._ref == $businessId] | order(_createdAt desc) [0...50] {
  _id, customerName, customerEmail, customerPhone,
  message, service, status, source, _createdAt
}`;
