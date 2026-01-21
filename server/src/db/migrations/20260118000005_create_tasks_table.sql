-- Migration: Create tasks table
-- Created: 2026-01-18
-- Description: Create tasks table for specific work items within projects

CREATE TABLE tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_task_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Indexes for common queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);

-- Comments
COMMENT ON TABLE tasks IS 'Specific work items within projects';
COMMENT ON CONSTRAINT chk_task_dates ON tasks IS 'Ensure end_date is not before start_date when both are set';
