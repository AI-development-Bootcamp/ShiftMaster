-- Migration: Create entries table
-- Created: 2026-01-18
-- Description: Create entries table for unified work and absence entries (one row per user per day)

CREATE TABLE entries (
  entry_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  entry_kind entry_kind NOT NULL,
  work_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  absence_type absence_type,
  attachment_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  last_modified_at TIMESTAMPTZ,
  CONSTRAINT uq_user_work_date UNIQUE (user_id, work_date),
  CONSTRAINT chk_absence_type CHECK (
    (entry_kind = 'absence' AND absence_type IS NOT NULL) OR
    (entry_kind = 'work' AND absence_type IS NULL)
  )
);

-- Indexes for common queries
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_work_date ON entries(work_date);
CREATE INDEX idx_entries_entry_kind ON entries(entry_kind);
CREATE INDEX idx_entries_user_date_range ON entries(user_id, work_date);

-- Comments
COMMENT ON TABLE entries IS 'Unified table for work and absence entries - one row per user per calendar day';
COMMENT ON COLUMN entries.entry_kind IS 'Type of entry: work or absence';
COMMENT ON COLUMN entries.work_date IS 'Single calendar day for this entry';
COMMENT ON COLUMN entries.absence_type IS 'Type of absence (required when entry_kind is absence)';
COMMENT ON COLUMN entries.attachment_path IS 'Path to attachment file (e.g., medical certificate for sick leave)';
COMMENT ON CONSTRAINT uq_user_work_date ON entries IS 'Ensure one entry per user per day';
COMMENT ON CONSTRAINT chk_absence_type ON entries IS 'Ensure absence_type is set only for absence entries';
