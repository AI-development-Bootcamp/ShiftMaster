# Tasks — Add Assignment Entity CRUD

## Phase 1: Backend Validation Schemas

1. [x] **Create client validation schemas** (`server/src/validations/clientValidation.ts`)
   - `createClientSchema`: name (required), contact_info (optional)
   - `updateClientSchema`: all fields optional
   - `getClientSchema`: UUID validation

2. [x] **Create project validation schemas** (`server/src/validations/projectValidation.ts`)
   - `createProjectSchema`: name, client_id, manager_user_id, start_date (required); end_date, description, time_format_type optional (default: sum)
   - `updateProjectSchema`: all fields optional
   - `getProjectSchema`: UUID validation

3. [x] **Create task validation schemas** (`server/src/validations/taskValidation.ts`)
   - `createTaskSchema`: name, project_id (required); description, end_date optional
   - `updateTaskSchema`: all fields optional
   - `getTaskSchema`: UUID validation

---

## Phase 2: Backend Services

4. **Extend ClientsService** - Add `createClient`, `updateClient`, `deleteClient`
   - Validate admin role
   - On delete: cascade soft-delete to projects via ProjectsService

5. **Extend ProjectsService** - Add `createProject`, `updateProject`, `deleteProject`
   - Validate admin role, validate client_id and manager_user_id exist
   - Default time_format_type to 'sum'
   - On delete: cascade soft-delete to tasks via TasksService

6. **Extend TasksService** - Add `createTask`, `updateTask`, `deleteTask`
   - Validate admin role, validate project_id exists

---

## Phase 3: Backend Controllers & Routes

7. **Extend clientsController** - Add handlers for POST, PATCH, DELETE
8. **Extend projectsController** - Add handlers for POST, PATCH, DELETE
9. **Extend tasksController** - Add handlers for POST, PATCH, DELETE

10. **Update route files** to register new endpoints:
    - `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`
    - `POST /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`
    - `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`

---

## Phase 4: Backend Tests

11. **Add clientsController.test.ts** - Test CRUD operations
12. **Add projectsController.test.ts** - Test CRUD operations
13. **Extend tasksController.test.ts** - Add create/update/delete tests
14. **Add clientsService.test.ts** - Test cascade delete
15. **Add projectsService.test.ts** - Test cascade delete

**Verification**: `cd server && npm test` — all tests pass

---

## Phase 5: Frontend Translations

16. **Update he.json** - Add form field translations
17. **Update en.json** - Add English translations

---

## Phase 6: Frontend Forms

18. **Refactor createClient.ts** - Convert to i18n, export as function
19. **Refactor createProject.ts** - Add manager dropdown, time_format_type, convert to i18n
20. **Refactor createTask.ts** - Convert to i18n

---

## Phase 7: Frontend Service & Page

21. **Extend assignmentService.ts** - Add CRUD methods for clients, projects, tasks

22. **Update AssignmentPage.tsx**:
    - Wire `handleFormSubmit` to call correct API based on form type
    - Wire `handleConfirmDelete` to call correct delete API
    - Pass dynamic options (clients, projects, users) to form fields
    - Refresh data after successful operations

**Final Verification**: Manual testing in browser per verification plan
