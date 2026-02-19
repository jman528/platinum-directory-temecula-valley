-- ============================================================
-- Part 4: Add slug column to offers table
-- ============================================================

-- Add slug column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing offers
UPDATE offers
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
  || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE offers ALTER COLUMN slug SET NOT NULL;
ALTER TABLE offers ADD CONSTRAINT offers_slug_unique UNIQUE (slug);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_offers_slug ON offers(slug);
