-- Outreach Tracking Columns for businesses table
-- Run this migration to add/ensure outreach columns exist

-- Add outreach columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='outreach_status') THEN
    ALTER TABLE businesses ADD COLUMN outreach_status text DEFAULT 'not_contacted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='outreach_last_contacted_at') THEN
    ALTER TABLE businesses ADD COLUMN outreach_last_contacted_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='outreach_notes') THEN
    ALTER TABLE businesses ADD COLUMN outreach_notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='outreach_next_follow_up') THEN
    ALTER TABLE businesses ADD COLUMN outreach_next_follow_up date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='total_call_attempts') THEN
    ALTER TABLE businesses ADD COLUMN total_call_attempts integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='outreach_method') THEN
    ALTER TABLE businesses ADD COLUMN outreach_method text;
  END IF;
END $$;

-- Update the CHECK constraint to include all valid outreach statuses
-- First drop if exists, then recreate
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_outreach_status_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_outreach_status_check
  CHECK (outreach_status IS NULL OR outreach_status IN (
    'not_contacted', 'attempted', 'contacted', 'interested',
    'converted', 'declined', 'dnc',
    'follow_up', 'appointment_set', 'appointment_completed',
    'closed_won', 'closed_lost', 'not_interested',
    'voicemail', 'no_answer', 'wrong_number',
    'pending_verification'
  ));

-- Helper function to increment call attempts
CREATE OR REPLACE FUNCTION increment_call_attempts(business_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET total_call_attempts = COALESCE(total_call_attempts, 0) + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
