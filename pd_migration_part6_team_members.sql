-- ============================================================
-- Part 6: Business team members for multi-user access
-- ============================================================

CREATE TABLE IF NOT EXISTS business_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'business_staff'
    CHECK (role IN ('business_owner', 'business_staff', 'business_manager')),
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked')),
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE (business_id, invited_email)
);

CREATE INDEX IF NOT EXISTS idx_team_members_business ON business_team_members(business_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON business_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON business_team_members(invited_email);

-- RLS
ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;

-- Business owners can manage their team
CREATE POLICY "Owners manage team" ON business_team_members
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
  );

-- Team members can read their own membership
CREATE POLICY "Members read own membership" ON business_team_members
  FOR SELECT USING (user_id = auth.uid());

-- Service role insert policy for invitations
CREATE POLICY "Service inserts team members" ON business_team_members
  FOR INSERT WITH CHECK (true);
