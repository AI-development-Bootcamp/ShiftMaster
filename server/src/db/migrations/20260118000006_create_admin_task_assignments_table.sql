-- Migration: Create admin_task_assignments table
-- Created: 2026-01-18
-- Description: Create admin_task_assignments table for admin-assigned user-to-task relationships

CREATE TABLE admin_task_assignments (
  admin_task_assignment_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  task_id BIGINT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  assigned_by BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT uq_user_task UNIQUE (user_id, task_id)
);

-- Indexes for common queries
CREATE INDEX idx_admin_task_assignments_user_id ON admin_task_assignments(user_id);
CREATE INDEX idx_admin_task_assignments_task_id ON admin_task_assignments(task_id);
CREATE INDEX idx_admin_task_assignments_assigned_by ON admin_task_assignments(assigned_by);
CREATE INDEX idx_admin_task_assignments_active ON admin_task_assignments(active);

-- Comments
COMMENT ON TABLE admin_task_assignments IS 'Admin-assigned user-to-task relationships';
COMMENT ON COLUMN admin_task_assignments.assigned_by IS 'User ID of admin who created this assignment (must be admin role)';
COMMENT ON COLUMN admin_task_assignments.active IS 'Whether assignment is currently active';
COMMENT ON COLUMN admin_task_assignments.revoked_at IS 'Timestamp when assignment was revoked (null if active)';
COMMENT ON CONSTRAINT uq_user_task ON admin_task_assignments IS 'Prevent duplicate assignment of same user to same task';
