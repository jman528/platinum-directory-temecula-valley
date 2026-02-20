'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Globe, MapPin, Star } from 'lucide-react'
import Link from 'next/link'

const sourceBadge: Record<string, { label: string; color: string; icon: string }> = {
  website: { label: 'Your Website', color: 'text-blue-400', icon: '🌐' },
  google_places: { label: 'Google', color: 'text-green-400', icon: '📍' },
  yelp: { label: 'Yelp', color: 'text-red-400', icon: '⭐' },
}

interface EnrichmentData {
  name?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  hours?: { day: string; open: string; close: string; closed?: boolean }[]
  services?: string[]
  amenities?: string[]
  price_range?: string
  logo_url?: string
  social_links?: { platform: string; url: string; handle?: string }[]
  images?: { url: string; source: string; alt: string }[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  schema_type?: string
  aggregate_rating?: number
  aggregate_review_count?: number
  reviews?: { source: string; rating: number; review_count: number; url?: string }[]
  confidence_score?: number
  sources_used?: string[]
  cover_image_url?: string
}

export default function EnrichmentReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [enriched, setEnriched] = useState<EnrichmentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [selectedCover, setSelectedCover] = useState<string>('')
  const [applied, setApplied] = useState(false)

  async function runEnrichment() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/enrichment/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Enrichment failed')
      setEnriched(data.enriched)
      // Auto-select all fields that have values
      const fields = new Set<string>()
      for (const [key, value] of Object.entries(data.enriched)) {
        if (value !== null && value !== undefined && key !== 'sources_used' && key !== 'confidence_score' && key !== 'reviews') {
          if (Array.isArray(value) ? value.length > 0 : true) {
            fields.add(key)
          }
        }
      }
      setSelectedFields(fields)
      if (data.enriched.cover_image_url) setSelectedCover(data.enriched.cover_image_url)
      else if (data.enriched.images?.[0]?.url) setSelectedCover(data.enriched.images[0].url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function toggleField(field: string) {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  function selectAll() {
    if (!enriched) return
    const fields = new Set<string>()
    for (const [key, value] of Object.entries(enriched)) {
      if (value !== null && value !== undefined && key !== 'sources_used' && key !== 'confidence_score' && key !== 'reviews') {
        if (Array.isArray(value) ? value.length > 0 : true) {
          fields.add(key)
        }
      }
    }
    setSelectedFields(fields)
  }

  async function applySelected() {
    if (!enriched) return
    setApplying(true)
    try {
      const approvedFields: Record<string, unknown> = { confidence_score: enriched.confidence_score }
      for (const field of selectedFields) {
        approvedFields[field] = enriched[field as keyof EnrichmentData]
      }
      if (selectedCover) approvedFields.cover_image_url = selectedCover

      const res = await fetch('/api/enrichment/scrape', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: id, approvedFields }),
      })
      if (!res.ok) throw new Error('Failed to apply fields')
      setApplied(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const enrichableFields = enriched
    ? Object.entries(enriched).filter(([key, value]) =>
        value !== null && value !== undefined &&
        key !== 'sources_used' && key !== 'confidence_score' && key !== 'reviews' &&
        (Array.isArray(value) ? value.length > 0 : true)
      )
    : []

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/listings" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Enrich Listing</h1>
      </div>

      {applied ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Enrichment Applied!</h2>
          <p className="mt-2 text-gray-400">{selectedFields.size} fields have been updated on your listing.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard/listings" className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
              Back to Listings
            </Link>
            <Link href={`/dashboard/listings`} className="rounded-lg bg-pd-blue px-4 py-2 text-sm text-white hover:bg-pd-blue/80">
              View Listing
            </Link>
          </div>
        </div>
      ) : !enriched ? (
        <div className="glass-card p-12 text-center">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-pd-purple-light" />
              <h2 className="mt-4 text-xl font-bold text-white">Enriching your listing...</h2>
              <p className="mt-2 text-gray-400">Scraping website, Google Places, and Yelp for data. This may take 15-30 seconds.</p>
            </>
          ) : (
            <>
              <Globe className="mx-auto h-12 w-12 text-pd-purple-light" />
              <h2 className="mt-4 text-xl font-bold text-white">AI-Powered Listing Enrichment</h2>
              <p className="mt-2 max-w-lg mx-auto text-gray-400">
                We&apos;ll scan your website, Google Places, and Yelp to automatically fill in missing details,
                photos, business hours, social links, and SEO metadata.
              </p>
              {error && (
                <div className="mt-4 mx-auto max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <button
                onClick={runEnrichment}
                className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-pd-gold px-8 py-3 font-semibold text-white hover:opacity-90"
              >
                Start Enrichment (15 credits)
              </button>
              <p className="mt-2 text-xs text-gray-500">You can review all changes before applying them.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Confidence Score */}
          <div className="glass-card mb-6 p-4">
            <div className="mb-2 flex justify-between">
              <span className="font-semibold text-white">Listing Completeness</span>
              <span className="font-bold text-pd-gold">{enriched.confidence_score ?? 0}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pd-gold transition-all duration-1000"
                style={{ width: `${enriched.confidence_score ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white/50">
              Data sourced from: {enriched.sources_used?.join(', ') || 'website'}
            </p>
          </div>

          {/* Review Aggregation */}
          {enriched.reviews && enriched.reviews.length > 0 && (
            <div className="glass-card mb-6 p-4">
              <h3 className="mb-3 font-semibold text-white">Review Aggregation</h3>
              <div className="grid grid-cols-3 gap-3">
                {enriched.reviews.map(r => (
                  <div key={r.source} className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-2xl font-bold text-pd-gold">{r.rating}</div>
                    <div className="text-sm text-yellow-400">{'★'.repeat(Math.round(r.rating))}</div>
                    <div className="text-xs capitalize text-white/60">{r.source}</div>
                    <div className="text-xs text-white/40">{r.review_count.toLocaleString()} reviews</div>
                  </div>
                ))}
              </div>
              {enriched.aggregate_rating && (
                <div className="mt-3 rounded-lg border border-pd-gold/30 bg-pd-gold/10 p-3">
                  <span className="font-semibold text-pd-gold">Combined: </span>
                  <span className="text-white">
                    {enriched.aggregate_rating} ★ across {enriched.aggregate_review_count?.toLocaleString()} reviews
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Enrichable Fields */}
          <div className="glass-card mb-6 p-4">
            <h3 className="mb-3 font-semibold text-white">
              Enriched Fields ({enrichableFields.length} found)
            </h3>
            <div className="space-y-2">
              {enrichableFields.map(([key, value]) => (
                <label key={key} className="flex items-start gap-3 rounded-lg p-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedFields.has(key)}
                    onChange={() => toggleField(key)}
                    className="mt-1 accent-pd-gold"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium capitalize text-white">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400 truncate">
                      {Array.isArray(value)
                        ? `${value.length} item${value.length !== 1 ? 's' : ''}`
                        : typeof value === 'object'
                          ? JSON.stringify(value).slice(0, 80)
                          : String(value).slice(0, 120)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Image Gallery */}
          {enriched.images && enriched.images.length > 0 && (
            <div className="glass-card mb-6 p-4">
              <h3 className="mb-3 font-semibold text-white">
                Photos Found ({enriched.images.length})
                <span className="ml-2 text-sm text-white/40">Click to set as cover</span>
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {enriched.images.map((img) => (
                  <div
                    key={img.url}
                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      selectedCover === img.url ? 'border-pd-gold' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedCover(img.url)}
                  >
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    <div className="absolute right-1 top-1">
                      <span className="rounded bg-black/60 px-1 text-xs text-white">
                        {sourceBadge[img.source]?.icon || '📷'}
                      </span>
                    </div>
                    {selectedCover === img.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-pd-gold/20">
                        <span className="text-sm font-bold text-pd-gold">Cover ✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {enriched.social_links && enriched.social_links.length > 0 && (
            <div className="glass-card mb-6 p-4">
              <h3 className="mb-3 font-semibold text-white">Social Media Links Found</h3>
              {enriched.social_links.map(link => (
                <div key={link.platform} className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    id={`social-${link.platform}`}
                    className="accent-pd-gold"
                  />
                  <label htmlFor={`social-${link.platform}`} className="flex flex-1 items-center gap-2">
                    <span className="capitalize text-white">{link.platform}</span>
                    {link.handle && <span className="text-sm text-white/40">{link.handle}</span>}
                  </label>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="max-w-40 truncate text-sm text-blue-400 hover:underline">
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Action Bar */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="glass-card sticky bottom-0 border-t border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-white/60">
                {selectedFields.size} of {enrichableFields.length} fields selected
              </div>
              <div className="flex gap-3">
                <button onClick={selectAll} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                  Select All
                </button>
                <Link href="/dashboard/listings" className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                  Cancel
                </Link>
                <button
                  onClick={applySelected}
                  disabled={applying || selectedFields.size === 0}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-pd-gold px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {applying ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    `Apply ${selectedFields.size} Fields`
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
