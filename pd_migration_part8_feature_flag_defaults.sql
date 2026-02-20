-- ================================================
-- PD Migration Part 8: Feature Flag Defaults
-- ================================================
-- Ensures all Phase 2 feature flags exist with correct defaults.
-- ON CONFLICT (key) DO NOTHING preserves any manual overrides.

INSERT INTO feature_flags (key, enabled, description) VALUES
  ('custom_smtp',                false, 'Postmark email integration'),
  ('ghl_integration',           false, 'GoHighLevel CRM sync'),
  ('twilio_progressive_dialer', false, 'Twilio calling system'),
  ('discount_codes',            true,  'Discount code system'),
  ('flash_deals',               true,  'Flash deal banners'),
  ('setup_fee_tracking',        true,  'Track one-time setup fees')
ON CONFLICT (key) DO NOTHING;
