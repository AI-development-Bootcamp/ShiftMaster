# Proposal: Integrate Admin Project Management API

## Summary
Integrate the Admin Client's project management features with the real server API, replacing mock data. This includes project creation, editing, deletion, and managing "Time Format" settings via the UI.

## Problem
Currently, the admin dashboard uses `mockProjects` for all project-related operations (`AssignmentPage`, `EntriesManagementPage`), handling data locally.

## Solution
1. Create a `projectsApi.ts` service.
2. Update `AssignmentPage` to fetch, create, edit, and delete projects via API.
3. Update `EntriesManagementPage` to fetch projects and update `time_format_type` via API.
4. Ensure `createProject` form sends required fields (`manager_user_id`, `time_format_type`) by defaulting them if not present in the UI form.

## Risks
- `manager_user_id` is required by backend but not selected in form. Will default to current user.
- `time_format_type` is required. Will default to `sum`.
