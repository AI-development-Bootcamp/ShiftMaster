-- Migration: Pin search_path for delete_client_cascade function
-- This prevents object shadowing attacks in SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION delete_client_cascade(p_client_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    -- Soft delete all tasks belonging to projects of this client
    UPDATE public.tasks
    SET active = false
    WHERE project_id IN (
        SELECT project_id FROM public.projects WHERE client_id = p_client_id
    );

    -- Soft delete all projects belonging to this client
    UPDATE public.projects
    SET active = false
    WHERE client_id = p_client_id;

    -- Soft delete the client itself
    UPDATE public.clients
    SET active = false
    WHERE client_id = p_client_id;
END;
$$;

-- Grant execute permission only to service_role (admin check is done at service layer)
-- Authenticated users cannot call this directly, preventing RLS bypass
GRANT EXECUTE ON FUNCTION delete_client_cascade(UUID) TO service_role;
