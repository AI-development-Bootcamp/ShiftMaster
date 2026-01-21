# Change: Integrate Admin Client Management with Real Server API

## Why

Currently, the admin panel uses mock data (`mocks/clients.ts`) for client management. The server already has fully implemented CRUD endpoints for clients at `/api/v1/clients`. This change connects the admin UI forms to the real backend, enabling actual data persistence for clients.

## What Changes

- Replace mock client data with real API calls in `AssignmentPage.tsx` and `EntriesManagementPage.tsx`
- Create a dedicated `clientsApi.ts` service layer in admin to handle client CRUD operations
- Wire the create/edit/delete client form handlers to call the server endpoints
- Handle loading states and errors appropriately
- **Assumes**: The user has a valid JWT token stored in `localStorage` (key: `auth_token`)

## Impact

- Affected specs: `frontend-admin`
- Affected code:
  - `admin/src/api/clientsApi.ts` (NEW) — Service layer for client API calls
  - `admin/src/pages/AssignmentPage/AssignmentPage.tsx` — Replace mock data with API calls
  - `admin/src/pages/EntriesManagementPage/EntriesManagementPage.tsx` — Replace mock data with API calls
  - Client form handlers will perform actual server mutations

## Scope

This proposal focuses **only on client management**. Projects, tasks, and other entities will be integrated in follow-up changes.
