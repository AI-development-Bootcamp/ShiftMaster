-- Migration: Create month_locks table
-- Created: 2026-01-18
-- Description: Create month_locks table for admin controls to prevent editing historical data

CREATE TABLE month_locks (
  lock_id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  unlocked_at TIMESTAMPTZ,
  CONSTRAINT uq_year_month UNIQUE (year, month)
);

-- Indexes for common queries
CREATE INDEX idx_month_locks_year_month ON month_locks(year, month);
CREATE INDEX idx_month_locks_locked_by ON month_locks(locked_by);
CREATE INDEX idx_month_locks_status ON month_locks(year, month, unlocked_at);

-- Comments
COMMENT ON TABLE month_locks IS 'Admin controls to prevent editing of historical data';
COMMENT ON COLUMN month_locks.year IS 'Year of the lock (e.g., 2024)';
COMMENT ON COLUMN month_locks.month IS 'Month of the lock (1-12)';
COMMENT ON COLUMN month_locks.locked_by IS 'User ID of admin who locked the month (must be admin role)';
COMMENT ON COLUMN month_locks.unlocked_at IS 'Timestamp when month was unlocked (null if currently locked)';
COMMENT ON CONSTRAINT uq_year_month ON month_locks IS 'Ensure same year+month cannot exist twice';
