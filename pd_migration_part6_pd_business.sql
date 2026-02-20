-- Insert Platinum Directory itself as a business listing
-- Run this after all other migrations

-- First, find or create the category
DO $$
DECLARE
  cat_id UUID;
BEGIN
  -- Try to find existing "Technology & Digital Services" or similar category
  SELECT id INTO cat_id FROM categories
  WHERE slug IN ('technology-digital-services', 'marketing-advertising', 'technology')
  LIMIT 1;

  -- If no matching category, use NULL
  IF cat_id IS NULL THEN
    SELECT id INTO cat_id FROM categories LIMIT 1;
  END IF;

  -- Insert PD if not already present
  IF NOT EXISTS (
    SELECT 1 FROM businesses WHERE name = 'Platinum Directory Temecula Valley'
  ) THEN
    INSERT INTO businesses (
      name, slug, description, category_id,
      city, state, zip_code,
      website, phone,
      tier, is_active, is_featured, is_verified, is_claimed,
      average_rating, review_count,
      outreach_status
    ) VALUES (
      'Platinum Directory Temecula Valley',
      'platinum-directory-temecula-valley',
      'Temecula Valley''s premier business directory and marketing platform. Connecting local businesses with 3.4 million annual visitors through AI-powered lead generation, Smart Offers, and digital marketing.',
      cat_id,
      'Temecula', 'CA', '92591',
      'https://platinumdirectorytemeculavalley.com', NULL,
      'platinum_elite', true, true, true, true,
      5.0, 0,
      'not_contacted'
    );
  END IF;
END $$;
