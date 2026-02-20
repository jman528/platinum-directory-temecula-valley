// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/', '/_next/', '/internal/'],
      },
    ],
    sitemap: 'https://platinumdirectorytemeculavalley.com/sitemap.xml',
    host: 'https://platinumdirectorytemeculavalley.com',
  }
}
