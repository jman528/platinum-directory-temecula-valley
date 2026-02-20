-- Migration: Syndication tables for Phase 4

CREATE TABLE IF NOT EXISTS syndication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  platform text NOT NULL,
  post_type text NOT NULL,
  post_content text,
  post_url text,
  image_url text,
  status text DEFAULT 'pending',
  error_message text,
  engagement_data jsonb DEFAULT '{}',
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS syndication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  platform text NOT NULL,
  post_type text NOT NULL,
  template_text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citation_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  service_provider text DEFAULT 'brightlocal',
  submission_date timestamptz DEFAULT now(),
  directories_count int DEFAULT 300,
  status text DEFAULT 'submitted',
  nap_data jsonb NOT NULL,
  pd_mention_in_description boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS syndication_status text DEFAULT 'none';

ALTER TABLE syndication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE citation_submissions ENABLE ROW LEVEL SECURITY;

INSERT INTO feature_flags (flag_key, enabled, description)
VALUES ('social_syndication', false, 'Auto-post to social media when businesses are verified')
ON CONFLICT (flag_key) DO NOTHING;
