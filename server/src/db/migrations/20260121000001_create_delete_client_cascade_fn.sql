-- Migration: Create transactional cascade delete function for clients
-- This function deletes a client and cascades soft-deletes to all related
-- projects and tasks atomically within a single transaction.

CREATE OR REPLACE FUNCTION delete_client_cascade(p_client_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Soft delete all tasks belonging to projects of this client
    UPDATE tasks
    SET active = false
    WHERE project_id IN (
        SELECT project_id FROM projects WHERE client_id = p_client_id
    );

    -- Soft delete all projects belonging to this client
    UPDATE projects
    SET active = false
    WHERE client_id = p_client_id;

    -- Soft delete the client itself
    UPDATE clients
    SET active = false
    WHERE client_id = p_client_id;
END;
$$;

-- Grant execute permission only to service_role (admin check is done at service layer)
-- Authenticated users cannot call this directly, preventing RLS bypass
GRANT EXECUTE ON FUNCTION delete_client_cascade(UUID) TO service_role;
