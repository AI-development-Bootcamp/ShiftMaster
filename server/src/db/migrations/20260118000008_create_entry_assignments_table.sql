-- Migration: Create entry_assignments table
-- Created: 2026-01-18
-- Description: Create entry_assignments table for task-level work lines within entries

CREATE TABLE entry_assignments (
  entry_assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(entry_id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE RESTRICT,
  location work_location NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_time_format CHECK (
    (start_time IS NOT NULL AND end_time IS NOT NULL AND duration_minutes IS NULL) OR
    (start_time IS NULL AND end_time IS NULL AND duration_minutes IS NOT NULL)
  ),
  CONSTRAINT chk_duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Indexes for common queries
CREATE INDEX idx_entry_assignments_entry_id ON entry_assignments(entry_id);
CREATE INDEX idx_entry_assignments_task_id ON entry_assignments(task_id);
CREATE INDEX idx_entry_assignments_location ON entry_assignments(location);

-- Comments
COMMENT ON TABLE entry_assignments IS 'Task-level work lines within an entry';
COMMENT ON COLUMN entry_assignments.location IS 'Work location: Office, Client, or Home';
COMMENT ON COLUMN entry_assignments.start_time IS 'Start time (required for start_end format projects)';
COMMENT ON COLUMN entry_assignments.end_time IS 'End time (required for start_end format projects)';
COMMENT ON COLUMN entry_assignments.duration_minutes IS 'Duration in minutes (required for sum format projects)';
COMMENT ON CONSTRAINT chk_time_format ON entry_assignments IS 'Ensure either start/end times OR duration is set, not both';
COMMENT ON CONSTRAINT chk_duration_positive ON entry_assignments IS 'Ensure duration is positive when set';
