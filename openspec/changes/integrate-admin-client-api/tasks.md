# Tasks: Integrate Admin Client API

## 1. API Service Layer

- [x] 1.1 Create `admin/src/api/clientsApi.ts` with typed functions for:
  - `fetchClients()` — GET /api/v1/clients
  - `createClient(data)` — POST /api/v1/clients
  - `updateClient(id, data)` — PATCH /api/v1/clients/:id
  - `deleteClient(id)` — DELETE /api/v1/clients/:id

## 2. Update AssignmentPage

- [x] 2.1 Replace mock client data with `fetchClients()` API call
- [x] 2.2 Update `handleFormSubmit` for create client to call `createClient()`
- [x] 2.3 Update `handleEditClient` flow to call `updateClient()` on submit
- [x] 2.4 Update `handleConfirmDelete` for clients to call `deleteClient()`
- [x] 2.5 Add loading/error states for async operations

## 3. Update EntriesManagementPage

- [x] 3.1 Replace mock client data with `fetchClients()` API call
- [x] 3.2 Update create client form submission to call `createClient()`

## 4. Testing & Verification

> **Note**: These require running the server and admin app together with a valid JWT token in localStorage.

- [ ] 4.1 Manually test create client flow end-to-end
- [ ] 4.2 Manually test edit client flow end-to-end
- [ ] 4.3 Manually test delete client flow end-to-end
- [x] 4.4 Verify error handling when token is missing/invalid

## 5. Enhance Project Creation Form (User Request)

- [x] 5.1 Filter client dropdown options to show only `active` clients
- [x] 5.2 Sort client dropdown options lexicographically (A-Z)
- [x] 5.3 Apply to `AssignmentPage.tsx`
- [x] 5.4 Apply to `EntriesManagementPage.tsx`
