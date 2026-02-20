-- Fix RLS policies for businesses table
-- The original policy only allows reading active businesses.
-- Missing: owners reading their own inactive businesses, admins reading/updating all businesses.

-- Allow business owners to read their own businesses (including inactive/pending ones)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners read own businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Owners read own businesses"
      ON businesses FOR SELECT
      USING (owner_user_id = auth.uid());
  END IF;
END $$;

-- Allow admins to read ALL businesses (including inactive/pending)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Admins read all businesses"
      ON businesses FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- Allow admins to update ALL businesses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins update all businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Admins update all businesses"
      ON businesses FOR UPDATE
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- Allow admins to insert businesses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins insert businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Admins insert businesses"
      ON businesses FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- Allow admins to delete businesses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins delete businesses' AND tablename = 'businesses') THEN
    CREATE POLICY "Admins delete businesses"
      ON businesses FOR DELETE
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- Fix reviews table: add admin read policy for moderation
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all reviews' AND tablename = 'reviews') THEN
    CREATE POLICY "Admins read all reviews"
      ON reviews FOR SELECT
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;

-- Allow admins to update/delete reviews for moderation
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage reviews' AND tablename = 'reviews') THEN
    CREATE POLICY "Admins manage reviews"
      ON reviews FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('admin', 'super_admin')));
  END IF;
END $$;
