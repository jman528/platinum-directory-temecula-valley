-- Run this in Supabase SQL Editor AFTER Jesse has signed up/in at least once
-- This sets Jesse's account to super_admin

-- First find the user ID:
-- SELECT id, email FROM auth.users ORDER BY created_at LIMIT 10;

-- Then update the profile (replace the email below with Jesse's actual email):
UPDATE profiles
SET user_type = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'jesse@platinumdirectorytemeculavalley.com'
);

-- Also Frank as admin
UPDATE profiles
SET user_type = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'frank@platinumdirectorytemeculavalley.com'
);

-- Verify it worked:
SELECT id, email, user_type FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE user_type IN ('super_admin', 'admin');
