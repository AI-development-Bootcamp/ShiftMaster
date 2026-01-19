-- Migration: Create Row Level Security policies
-- Created: 2026-01-18
-- Description: Create RLS policies for all tables to enforce access control
-- Note: These policies assume Supabase Auth integration with user_id in JWT claims
-- For backend operations using service_role key, these policies are bypassed

-- Create a helper function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/admin),
-- bypassing RLS on the users table when it queries it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the user exists in the public.users table with role 'admin'
  -- NOTE: We rely on a custom claim 'user_id' (integer) in the JWT, not the standard UUID auth.uid().
  -- This architecture uses integer IDs for users.
  -- Ensure that your auth service mints tokens with this 'user_id' claim.
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = (auth.jwt() ->> 'user_id')::bigint
    AND role = 'admin'
  ) INTO is_admin;

  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can read all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint)
  WITH CHECK (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can update all users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Admins can insert new users
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can delete users (soft delete via active flag is preferred)
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Regular users can read active clients
CREATE POLICY "clients_select_users" ON clients
  FOR SELECT
  USING (active = true);

-- Admins can read all clients
CREATE POLICY "clients_select_admin" ON clients
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Only admins can insert clients
CREATE POLICY "clients_insert_admin" ON clients
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can update clients
CREATE POLICY "clients_update_admin" ON clients
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can delete clients
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Regular users can read active projects
CREATE POLICY "projects_select_users" ON projects
  FOR SELECT
  USING (active = true);

-- Admins can read all projects
CREATE POLICY "projects_select_admin" ON projects
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Only admins can insert projects
CREATE POLICY "projects_insert_admin" ON projects
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can update projects
CREATE POLICY "projects_update_admin" ON projects
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can delete projects
CREATE POLICY "projects_delete_admin" ON projects
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can read tasks they are assigned to (via admin_task_assignments)
CREATE POLICY "tasks_select_assigned" ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_task_assignments ata
      WHERE ata.task_id = tasks.task_id
      AND ata.user_id = (auth.jwt() ->> 'user_id')::bigint
      AND ata.active = true
    )
  );

-- Admins can read all tasks
CREATE POLICY "tasks_select_admin" ON tasks
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Only admins can insert tasks
CREATE POLICY "tasks_insert_admin" ON tasks
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can update tasks
CREATE POLICY "tasks_update_admin" ON tasks
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can delete tasks
CREATE POLICY "tasks_delete_admin" ON tasks
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- ADMIN_TASK_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

ALTER TABLE admin_task_assignments ENABLE ROW LEVEL SECURITY;

-- Users can read their own task assignments
CREATE POLICY "admin_task_assignments_select_own" ON admin_task_assignments
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can read all task assignments
CREATE POLICY "admin_task_assignments_select_admin" ON admin_task_assignments
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Only admins can insert task assignments
CREATE POLICY "admin_task_assignments_insert_admin" ON admin_task_assignments
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can update task assignments
CREATE POLICY "admin_task_assignments_update_admin" ON admin_task_assignments
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can delete task assignments
CREATE POLICY "admin_task_assignments_delete_admin" ON admin_task_assignments
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- ENTRIES TABLE POLICIES
-- ============================================================================

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own entries
CREATE POLICY "entries_select_own" ON entries
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can read all entries
CREATE POLICY "entries_select_admin" ON entries
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Users can insert their own entries
CREATE POLICY "entries_insert_own" ON entries
  FOR INSERT
  WITH CHECK (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can insert entries for any user
CREATE POLICY "entries_insert_admin" ON entries
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Users can update their own entries
CREATE POLICY "entries_update_own" ON entries
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint)
  WITH CHECK (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can update all entries
CREATE POLICY "entries_update_admin" ON entries
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Users can delete their own entries
CREATE POLICY "entries_delete_own" ON entries
  FOR DELETE
  USING (user_id = (auth.jwt() ->> 'user_id')::bigint);

-- Admins can delete all entries
CREATE POLICY "entries_delete_admin" ON entries
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- ENTRY_ASSIGNMENTS TABLE POLICIES
-- ============================================================================

ALTER TABLE entry_assignments ENABLE ROW LEVEL SECURITY;

-- Users can read assignments for their own entries
CREATE POLICY "entry_assignments_select_own" ON entry_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.entry_id = entry_assignments.entry_id
      AND e.user_id = (auth.jwt() ->> 'user_id')::bigint
    )
  );

-- Admins can read all entry assignments
CREATE POLICY "entry_assignments_select_admin" ON entry_assignments
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Users can insert assignments for their own entries
CREATE POLICY "entry_assignments_insert_own" ON entry_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.entry_id = entry_assignments.entry_id
      AND e.user_id = (auth.jwt() ->> 'user_id')::bigint
    )
  );

-- Admins can insert any entry assignments
CREATE POLICY "entry_assignments_insert_admin" ON entry_assignments
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Users can update assignments for their own entries
CREATE POLICY "entry_assignments_update_own" ON entry_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.entry_id = entry_assignments.entry_id
      AND e.user_id = (auth.jwt() ->> 'user_id')::bigint
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.entry_id = entry_assignments.entry_id
      AND e.user_id = (auth.jwt() ->> 'user_id')::bigint
    )
  );

-- Admins can update all entry assignments
CREATE POLICY "entry_assignments_update_admin" ON entry_assignments
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Users can delete assignments for their own entries
CREATE POLICY "entry_assignments_delete_own" ON entry_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.entry_id = entry_assignments.entry_id
      AND e.user_id = (auth.jwt() ->> 'user_id')::bigint
    )
  );

-- Admins can delete all entry assignments
CREATE POLICY "entry_assignments_delete_admin" ON entry_assignments
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================================================
-- MONTH_LOCKS TABLE POLICIES
-- ============================================================================

ALTER TABLE month_locks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read month locks
CREATE POLICY "month_locks_select_all" ON month_locks
  FOR SELECT
  USING (auth.jwt() IS NOT NULL);

-- Only admins can insert month locks
CREATE POLICY "month_locks_insert_admin" ON month_locks
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can update month locks
CREATE POLICY "month_locks_update_admin" ON month_locks
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Only admins can delete month locks
CREATE POLICY "month_locks_delete_admin" ON month_locks
  FOR DELETE
  USING (
    public.is_admin()
  );
