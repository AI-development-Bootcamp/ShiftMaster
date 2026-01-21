# Add CRUD Operations for Clients, Projects, and Tasks

## Summary

Implement full create, update, and soft-delete functionality for **Clients**, **Projects**, and **Tasks** in the Assignment Page of the admin panel. This enables admins to manage the complete assignment hierarchy directly from the UI.

## Background

The Assignment Page currently displays tasks grouped by client and project with "Edit" and "Delete" dropdown menus, but these operations are not yet wired to backend APIs. The frontend form configurations exist (`createClient.ts`, `createProject.ts`, `createTask.ts`) but contain hardcoded dropdown options and Hebrew labels instead of i18n keys.

The backend has read-only endpoints (`GET /clients`, `GET /projects`, `GET /tasks`) while the database schema and RLS policies already support full CRUD for admin users.

## User Review Required

> [!IMPORTANT]
> **Cascade Soft-Delete Behavior**: When a client is soft-deleted, all related projects will be soft-deleted. When a project is soft-deleted, all related tasks will be soft-deleted. This is a deliberate choice to maintain data consistency.

## Proposed Changes

### Server — Controllers Layer

#### [MODIFY] [clientsController.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/controllers/clientsController.ts)
- Add `createClient`, `updateClient`, `deleteClient` handlers
- Follow usersController pattern for validation and error handling

#### [MODIFY] [projectsController.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/controllers/projectsController.ts)
- Add `createProject`, `updateProject`, `deleteProject` handlers
- Include manager_user_id in create/update operations

#### [MODIFY] [tasksController.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/controllers/tasksController.ts)
- Add `createTask`, `updateTask`, `deleteTask` handlers

---

### Server — Services Layer

#### [MODIFY] [clientsService.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/services/clientsService.ts)
- Add `createClient`, `updateClient`, `deleteClient` methods with admin-only enforcement
- Implement cascade soft-delete for related projects

#### [MODIFY] [projectsService.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/services/projectsService.ts)
- Add `createProject`, `updateProject`, `deleteProject` methods
- Default `time_format_type` to `'sum'`
- Implement cascade soft-delete for related tasks

#### [MODIFY] [tasksService.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/services/tasksService.ts)
- Add `createTask`, `updateTask`, `deleteTask` methods

---

### Server — Routes

#### [MODIFY] [clients.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/routes/clients.ts)
- Add `POST /`, `PATCH /:id`, `DELETE /:id` routes

#### [MODIFY] [projects.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/routes/projects.ts)
- Add `POST /`, `PATCH /:id`, `DELETE /:id` routes

#### [MODIFY] [tasks.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/routes/tasks.ts)
- Add `POST /`, `PATCH /:id`, `DELETE /:id` routes

---

### Server — Validations

#### [NEW] [clientValidation.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/validations/clientValidation.ts)
- Zod schemas: `createClientSchema`, `updateClientSchema`, `getClientSchema`

#### [NEW] [projectValidation.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/validations/projectValidation.ts)
- Zod schemas for project CRUD with manager_user_id and time_format_type

#### [NEW] [taskValidation.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/server/src/validations/taskValidation.ts)
- Zod schemas for task CRUD with project_id reference

---

### Admin — Forms

#### [MODIFY] [createClient.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/components/forms/createClient.ts)
- Replace Hebrew labels with i18n translation keys
- Export field configs as functions that accept translation function

#### [MODIFY] [createProject.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/components/forms/createProject.ts)
- Add manager dropdown field (dynamic options from users)
- Add time_format_type dropdown (default: sum)
- Replace hardcoded client options with dynamic loading
- Convert to i18n keys

#### [MODIFY] [createTask.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/components/forms/createTask.ts)
- Replace hardcoded project options with dynamic loading
- Convert to i18n keys

---

### Admin — Services

#### [MODIFY] [assignmentService.ts](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/services/assignmentService.ts)
- Add `createClient`, `updateClient`, `deleteClient`
- Add `createProject`, `updateProject`, `deleteProject`
- Add `createTask`, `updateTask`, `deleteTask`

---

### Admin — Page

#### [MODIFY] [AssignmentPage.tsx](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/pages/AssignmentPage/AssignmentPage.tsx)
- Wire `handleFormSubmit` to actual API calls based on `activeForm` type
- Wire `handleConfirmDelete` to actual delete API calls
- Pass dynamic dropdown options to forms (clients, projects, users)

---

### Translations

#### [MODIFY] [he.json](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/locales/he.json)
- Add form field labels and placeholders for clients, projects, tasks

#### [MODIFY] [en.json](file:///Users/roy/Desktop/Roy/abra%20bootcamp/AbraShiftMaster/admin/src/locales/en.json)
- Add corresponding English translations

---

## Verification Plan

### Automated Tests

```bash
# Run server tests after implementation
cd server && npm test
```

New tests to add:
- `server/src/tests/controllers/clientsController.test.ts` - CRUD operations
- `server/src/tests/controllers/projectsController.test.ts` - CRUD operations  
- `server/src/tests/controllers/tasksController.test.ts` - Add create/update/delete tests
- `server/src/tests/services/clientsService.test.ts` - Cascade delete behavior
- `server/src/tests/services/projectsService.test.ts` - Cascade delete behavior

### Manual Verification

1. **Create Flow**: From Assignment Page, click "Create" dropdown → Add Client → Fill form → Submit → Verify client appears in table
2. **Edit Flow**: Click Edit dropdown on a row → Edit Client → Modify name → Save → Verify update in table
3. **Delete Flow**: Click Delete dropdown → Delete Client → Confirm → Verify client and related projects/tasks are removed
4. **Form Validation**: Submit forms with invalid data → Verify error messages appear
5. **i18n**: Switch language to English → Verify form labels update
