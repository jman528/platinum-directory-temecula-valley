// components/seo/StructuredData.tsx
import Script from 'next/script'

export function BusinessStructuredData({ business }: { business: Record<string, unknown> }) {
  const schemaType = (business.schema_type as string) || 'LocalBusiness'
  const galleryImages = (business.gallery_images as { url: string }[]) || []
  const socialLinks = business.social_links as Record<string, string> | undefined
  const businessHours = business.business_hours as { day: string; open: string; close: string }[] | undefined

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `https://platinumdirectorytemeculavalley.com/business/${business.slug}`,
    name: business.name,
    description: business.description,
    url: business.website,
    telephone: business.phone,
    email: business.email,
    image: [
      business.logo_url,
      business.cover_image_url,
      ...galleryImages.map((i) => i.url),
    ].filter(Boolean),
    logo: business.logo_url ? {
      '@type': 'ImageObject',
      url: business.logo_url,
    } : undefined,
    address: business.address ? {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: (business.city as string) || 'Temecula',
      addressRegion: 'CA',
      postalCode: business.zip_code,
      addressCountry: 'US',
    } : undefined,
    geo: business.latitude ? {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    } : undefined,
    openingHoursSpecification: businessHours?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${h.day}`,
      opens: h.open,
      closes: h.close,
    })),
    aggregateRating: (business.aggregate_review_count as number) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: business.average_rating,
      reviewCount: business.aggregate_review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    priceRange: business.price_range,
    sameAs: socialLinks ? Object.values(socialLinks).filter(Boolean) : undefined,
    ...(schemaType === 'Winery' && {
      servesCuisine: business.cuisine_types,
      hasMap: `https://www.google.com/maps/search/${encodeURIComponent((business.name as string) + ' Temecula CA')}`,
    }),
    ...(schemaType === 'Restaurant' && {
      servesCuisine: business.cuisine_types,
      menu: business.menu_url,
      acceptsReservations: true,
    }),
    containedInPlace: {
      '@type': 'City',
      name: 'Temecula',
      containedInPlace: {
        '@type': 'State',
        name: 'California',
      },
    },
  }

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema))

  return (
    <Script
      id={`schema-${business.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  )
}

// Directory/Category page schema
export function DirectoryBreadcrumbSchema({ category, city }: { category?: string; city?: string }) {
  const items = [
    { name: 'Home', url: 'https://platinumdirectorytemeculavalley.com' },
    { name: 'Directory', url: 'https://platinumdirectorytemeculavalley.com/search' },
  ]
  if (category) items.push({ name: category, url: `https://platinumdirectorytemeculavalley.com/search?category=${encodeURIComponent(category)}` })
  if (city) items.push({ name: city, url: `https://platinumdirectorytemeculavalley.com/city/${encodeURIComponent(city)}` })

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Organization schema for the site itself (add to root layout)
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Platinum Directory Temecula Valley',
    url: 'https://platinumdirectorytemeculavalley.com',
    logo: 'https://platinumdirectorytemeculavalley.com/logo.png',
    description: 'The premier local business directory for Temecula Valley, California.',
    areaServed: {
      '@type': 'City',
      name: 'Temecula',
      containedInPlace: { '@type': 'State', name: 'California' },
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@platinumdirectorytemeculavalley.com',
    },
    sameAs: [
      'https://www.facebook.com/PlatinumDirectoryTV',
      'https://www.instagram.com/PlatinumDirectoryTV',
    ],
  }

  return (
    <Script
      id="org-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// FAQ schema for category pages and featured snippets
export function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (!faqs.length) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Smart Offer / Deal schema
export function OfferSchema({ offer, business }: { offer: Record<string, unknown>; business: Record<string, unknown> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.title,
    description: offer.description,
    price: offer.price,
    priceCurrency: 'USD',
    seller: {
      '@type': 'LocalBusiness',
      name: business.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: business.city,
        addressRegion: 'CA',
      },
    },
    validFrom: offer.valid_from,
    validThrough: offer.valid_until,
    availability: (offer.current_claims as number) < (offer.max_claims as number)
      ? 'https://schema.org/InStock'
      : 'https://schema.org/SoldOut',
    url: `https://platinumdirectorytemeculavalley.com/deals/${offer.slug}`,
  }

  return (
    <Script
      id={`offer-schema-${offer.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
