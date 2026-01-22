-- Unlock January 2026 for development/testing
-- Run this in your Supabase SQL Editor or psql

-- Check current locks
SELECT * FROM month_locks WHERE year = 2026 AND month = 1 AND unlocked_at IS NULL;

-- Unlock January 2026
UPDATE month_locks
SET unlocked_at = NOW(),
    unlocked_by = locked_by  -- Use the same user who locked it
WHERE year = 2026
  AND month = 1
  AND unlocked_at IS NULL;

-- Verify it's unlocked
SELECT * FROM month_locks WHERE year = 2026 AND month = 1;
