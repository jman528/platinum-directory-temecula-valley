-- ==================
-- DISCOUNT CODES
-- ==================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_month', 'waive_setup')),
  discount_value DECIMAL(10,2) NOT NULL,
  applies_to TEXT NOT NULL CHECK (applies_to IN ('subscription', 'smart_offer', 'ai_credits', 'setup_fee', 'any')),
  min_tier TEXT CHECK (min_tier IN ('free', 'verified_platinum', 'platinum_partner', 'platinum_elite')),
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_flash_deal BOOLEAN DEFAULT false,
  flash_deal_name TEXT,
  flash_deal_banner_text TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_discount_codes_flash ON discount_codes(is_flash_deal) WHERE is_flash_deal = true AND is_active = true;

-- Track every discount code redemption
CREATE TABLE IF NOT EXISTS discount_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id),
  user_id UUID REFERENCES profiles(id),
  business_id UUID REFERENCES businesses(id),
  applied_to TEXT NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_code ON discount_code_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON discount_code_redemptions(user_id);
