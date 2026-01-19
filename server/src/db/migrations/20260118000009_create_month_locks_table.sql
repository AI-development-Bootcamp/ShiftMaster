-- Migration: Create month_locks table
-- Created: 2026-01-18
-- Description: Create month_locks table for admin controls to prevent editing historical data

CREATE TABLE month_locks (
  lock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT uq_year_month UNIQUE (year, month)
);

-- Indexes for common queries
CREATE INDEX idx_month_locks_year_month ON month_locks(year, month);
CREATE INDEX idx_month_locks_locked_by ON month_locks(locked_by);

-- Comments
COMMENT ON TABLE month_locks IS 'Admin controls to prevent editing of historical data (presence of row = locked)';
COMMENT ON COLUMN month_locks.year IS 'Year of the lock (e.g., 2024)';
COMMENT ON COLUMN month_locks.month IS 'Month of the lock (1-12)';
COMMENT ON COLUMN month_locks.locked_by IS 'User ID of admin who locked the month';
COMMENT ON CONSTRAINT uq_year_month ON month_locks IS 'Ensure same year+month cannot start multiple locks';
