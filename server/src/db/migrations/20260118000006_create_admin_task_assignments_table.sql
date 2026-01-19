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

-- Function to enforce assigned_by integrity
CREATE OR REPLACE FUNCTION enforce_assigned_by()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id BIGINT;
BEGIN
  -- Extract user_id from JWT claims (assumed to be stored as 'user_id' in app_metadata or user_metadata for this project's pattern)
  -- Or typically auth.uid() if using Supabase Auth UUIDs. 
  -- Since this schema uses BIGINT user_id, we extract it from custom claim or metadata.
  -- For now, we trust the auth.jwt() ->> 'user_id' if available, otherwise fallback (or skip for service role)
  
  -- Note: In a real Supabase Auth scenario with UUIDs, this would be: NEW.assigned_by != auth.uid()
  -- Here we assume the app sets a custom claim 'user_id' in the JWT for the integer ID.
  current_user_id := (auth.jwt() ->> 'user_id')::BIGINT;
  
  -- Allow service role (which might not have user_id claim) or if claim is missing (dev context) to bypass if needed,
  -- but strictly enforcing helps security. 
  IF current_user_id IS NOT NULL AND NEW.assigned_by != current_user_id THEN
    RAISE EXCEPTION 'assigned_by must match the authenticated user id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before insert or update
CREATE TRIGGER trg_enforce_assigned_by
  BEFORE INSERT OR UPDATE ON admin_task_assignments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_assigned_by();
