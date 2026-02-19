-- ============================================================
-- Part 7: Admin access — Set Jesse and Frank as super_admins
-- ============================================================

-- Ensure user_type column supports admin values
-- (profiles table already has user_type TEXT, but let's add a CHECK if missing)

-- Set Jesse and Frank as super_admins by email
-- UPDATE these emails to match their actual accounts
UPDATE profiles
SET user_type = 'super_admin'
WHERE email IN (
  'jesse@platinumdirectory.com',
  'frank@platinumdirectory.com'
);

-- If you need to add by user ID instead, use:
-- UPDATE profiles SET user_type = 'super_admin' WHERE id = 'uuid-here';
