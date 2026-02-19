-- Fix City Names on Business Listings
-- Run this in Supabase SQL editor

-- 1. Fix businesses with null, empty, or 'undefined' city — default to Temecula
UPDATE businesses
SET city = 'Temecula', state = 'CA', zip_code = '92590'
WHERE (city IS NULL OR city = '' OR city = 'undefined')
  AND (state = 'CA' OR state IS NULL);

-- 2. Fix businesses where city shows 'temecula valley' variant
UPDATE businesses
SET city = 'Temecula'
WHERE city ILIKE '%temecula valley%';

-- 3. Trim whitespace from city names
UPDATE businesses
SET city = TRIM(city)
WHERE city != TRIM(city);

-- 4. Verify the fix
SELECT city, state, COUNT(*) as count
FROM businesses
GROUP BY city, state
ORDER BY count DESC;
