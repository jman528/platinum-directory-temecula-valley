-- ============================================
-- Phase 3 Section 2: Digital Agreement System
-- Run AFTER all Phase 2 migrations
-- ============================================

-- Business Agreements table
CREATE TABLE IF NOT EXISTS business_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  tier TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_title TEXT,
  signer_email TEXT NOT NULL,
  signer_phone TEXT,
  business_legal_name TEXT NOT NULL,
  business_address TEXT,
  signature_data TEXT,
  signature_type TEXT CHECK (signature_type IN ('typed', 'drawn')),
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  agreement_version TEXT DEFAULT '1.0',
  agreement_html TEXT,
  pdf_url TEXT,
  stripe_checkout_id TEXT,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  is_active BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agreements_business ON business_agreements(business_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON business_agreements(payment_status, is_active);

-- RLS
ALTER TABLE business_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all agreements"
  ON business_agreements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin'))
  );

CREATE POLICY "Business owners can view own agreements"
  ON business_agreements FOR SELECT
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
  );

-- Feature flag for digital agreements
INSERT INTO feature_flags (key, is_enabled, description)
VALUES ('digital_agreements', true, 'Enable digital agreement signing for Partner/Elite tiers')
ON CONFLICT (key) DO NOTHING;
