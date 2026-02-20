-- AI Credits system
-- Add credits column to profiles if not present
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_credits_balance INTEGER DEFAULT 0;

-- Credit transaction log
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  credits_delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_txns_user ON ai_credit_transactions(user_id);

ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own credit transactions" ON ai_credit_transactions;
CREATE POLICY "Users see own credit transactions" ON ai_credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Function to add credits atomically
CREATE OR REPLACE FUNCTION add_ai_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_reason TEXT,
  p_stripe_session_id TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_balance = ai_credits_balance + p_credits,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO ai_credit_transactions (
    user_id, credits_delta, reason, stripe_session_id, created_at
  ) VALUES (
    p_user_id, p_credits, p_reason, p_stripe_session_id, NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
