-- Set Jesse as super_admin and Frank as admin
-- Run this in Supabase SQL editor ONCE after first signup

-- Replace email if needed — use the email they signed up with
UPDATE profiles
SET user_type = 'super_admin'
WHERE email = 'jesse@platinumdirectorytemeculavalley.com';

-- Also Frank
UPDATE profiles
SET user_type = 'admin'
WHERE email = 'frank@platinumdirectorytemeculavalley.com';

-- Verify
SELECT id, email, user_type FROM profiles
WHERE email IN (
  'jesse@platinumdirectorytemeculavalley.com',
  'frank@platinumdirectorytemeculavalley.com'
);
