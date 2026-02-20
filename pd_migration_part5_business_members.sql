-- Business Members / Team Members tables for multi-user business access
-- Run this migration to add team member support

-- Main business_members table (used by claim flow)
CREATE TABLE IF NOT EXISTS business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES profiles(id),
  invited_email TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_business ON business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_profile ON business_members(profile_id);

ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own memberships' AND tablename = 'business_members') THEN
    CREATE POLICY "Users can view their own memberships"
      ON business_members FOR SELECT
      USING (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can manage members' AND tablename = 'business_members') THEN
    CREATE POLICY "Business owners can manage members"
      ON business_members FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all members' AND tablename = 'business_members') THEN
    CREATE POLICY "Admins can manage all members"
      ON business_members FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- business_team_members table (used by dashboard settings invite flow)
CREATE TABLE IF NOT EXISTS business_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'business_staff' CHECK (role IN ('business_owner', 'business_admin', 'business_staff')),
  invited_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, invited_email)
);

CREATE INDEX IF NOT EXISTS idx_business_team_members_business ON business_team_members(business_id);

ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members viewable by business owner' AND tablename = 'business_team_members') THEN
    CREATE POLICY "Team members viewable by business owner"
      ON business_team_members FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all team members' AND tablename = 'business_team_members') THEN
    CREATE POLICY "Admins manage all team members"
      ON business_team_members FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;
