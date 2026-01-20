-- Migration: Create projects table
-- Created: 2026-01-18
-- Description: Create projects table for work initiatives

CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
  manager_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  time_format_type project_time_format_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for common queries
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_user_id ON projects(manager_user_id);
CREATE INDEX idx_projects_active ON projects(active);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Comments
COMMENT ON TABLE projects IS 'Work initiatives with managers, dates, and time format rules';
COMMENT ON COLUMN projects.active IS 'Soft delete flag - false means project is deleted';
COMMENT ON COLUMN projects.time_format_type IS 'Determines how time is reported: sum (total duration) or start_end (start and end times)';
COMMENT ON CONSTRAINT chk_project_dates ON projects IS 'Ensure end_date is not before start_date';
