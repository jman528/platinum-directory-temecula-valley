-- ============================================================
-- Part 5: Fix auth trigger — profile creation blocked by RLS
--
-- Problem: handle_new_user() inserts into profiles on sign-up,
-- but RLS has no INSERT policy. Even with SECURITY DEFINER the
-- function may have been created under a non-superuser role.
--
-- Fix: Recreate with SECURITY DEFINER + SET search_path, owned
-- by postgres so it fully bypasses RLS. Also add a service-role
-- INSERT policy as a safety net.
-- ============================================================

-- 1. Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'PD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'referred_by', NULL)
  );
  RETURN NEW;
END;
$$;

-- Ensure the function is owned by postgres (bypasses RLS)
ALTER FUNCTION handle_new_user() OWNER TO postgres;

-- 2. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Add INSERT policy on profiles so the service role / trigger can insert
-- (SECURITY DEFINER as postgres already bypasses, but this is a safety net
--  and also allows the service_role key to insert via the API)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Service creates profile on signup'
  ) THEN
    CREATE POLICY "Service creates profile on signup"
      ON profiles FOR INSERT
      WITH CHECK (true);
  END IF;
END;
$$;
