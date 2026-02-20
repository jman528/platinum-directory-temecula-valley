-- Activate all seeded businesses so they appear in search results
-- The search query filters by is_active = true, but imported/seeded businesses
-- default to is_active = false (pending verification).
-- This activates them so the directory isn't empty on launch.

UPDATE businesses SET is_active = true WHERE is_active = false;
