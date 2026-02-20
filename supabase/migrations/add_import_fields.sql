-- Add import tracking and hot lead scoring to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual'
  CHECK (import_source IN ('manual', 'csv_import', 'google_places', 'enrichment'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS import_batch_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS import_raw_data JSONB;

-- Data quality tracking
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0;
  -- 0-100 score: name=20, phone=15, address=15, email=10, website=10,
  -- description=10, hours=10, social_media=5, amenities=5
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS has_valid_name BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS needs_enrichment BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending'
  CHECK (enrichment_status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS enrichment_batch_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

-- Hot lead scoring
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_hot_lead BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hot_lead_reason TEXT;
  -- e.g., 'groupon_active', 'yelp_deals', 'high_reviews', 'facebook_ads', 'competitor_platform'
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
  -- 0-100: combines data quality, deal activity, review count, category demand

-- Setup fee tracking (from Section 4)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS setup_fee_status TEXT DEFAULT 'not_applicable'
  CHECK (setup_fee_status IN ('not_applicable', 'unpaid', 'paid', 'waived'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS setup_fee_paid_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS setup_fee_amount DECIMAL(10,2);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS discount_code_used TEXT;

-- Google Maps integration
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_place_id TEXT;
  -- Google's unique place identifier, used to construct embed URLs and direct links
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
  -- Full Google Maps link: https://maps.google.com/?cid=XXXXX or constructed from place_id
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_business_claimed BOOLEAN DEFAULT false;
  -- Whether the business has claimed their Google Business Profile
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_presence_score INTEGER DEFAULT 0;
  -- 0-100: has listing=20, claimed=15, has photos=15, has hours=15, rating>=4=15, reviews>10=10, description=10

-- Rich content (video/media embeds for paid tiers)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS description_rich JSONB;
  -- TipTap JSON for rich text (paid tiers). Plain 'description' remains for free tier.
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS video_embeds JSONB DEFAULT '[]'::jsonb;
  -- Array of {url, title, type: 'youtube'|'vimeo'|'custom', sort_order}
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
  -- Google Street View or Matterport tour URL (Elite tier)

-- Indexes for import/enrichment queries
CREATE INDEX IF NOT EXISTS idx_businesses_data_quality ON businesses(data_quality_score, is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_hot_lead ON businesses(is_hot_lead, outreach_status) WHERE is_hot_lead = true;
CREATE INDEX IF NOT EXISTS idx_businesses_enrichment ON businesses(enrichment_status, needs_enrichment);
CREATE INDEX IF NOT EXISTS idx_businesses_import_batch ON businesses(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_businesses_lead_score ON businesses(lead_score DESC) WHERE is_active = true;
