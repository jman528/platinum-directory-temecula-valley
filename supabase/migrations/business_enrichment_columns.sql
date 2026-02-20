-- Add enrichment columns to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_range TEXT CHECK (price_range IN ('$','$$','$$$','$$$$')),
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'LocalBusiness',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrichment_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aggregate_review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS third_party_reviews JSONB DEFAULT '[]';
