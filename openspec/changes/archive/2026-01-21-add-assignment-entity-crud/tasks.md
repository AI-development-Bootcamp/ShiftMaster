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

4. [x] **Extend ClientsService** - Add `createClient`, `updateClient`, `deleteClient`
   - Validate admin role
   - On delete: cascade soft-delete to projects via ProjectsService

5. [x] **Extend ProjectsService** - Add `createProject`, `updateProject`, `deleteProject`
   - Validate admin role, validate client_id and manager_user_id exist
   - Default time_format_type to 'sum'
   - On delete: cascade soft-delete to tasks via TasksService

6. [x] **Extend TasksService** - Add `createTask`, `updateTask`, `deleteTask`
   - Validate admin role, validate project_id exists

---

## Phase 3: Backend Controllers & Routes

7. [x] **Extend clientsController** - Add handlers for POST, PATCH, DELETE
   - Use ClientsService
   - Return 201 for create, 200 for update/delete
   - Handle 403, 404, 400 errors

8. [x] **Extend projectsController** - Add handlers for POST, PATCH, DELETE
   - Use ProjectsService
   - Handle errors

9. [x] **Extend tasksController** - Add handlers for POST, PATCH, DELETE
   - Use TasksService
   - Handle errors

10. [x] **Update route files** (`clients.ts`, `projects.ts`, `tasks.ts`)
    - Register new POST, PATCH, DELETE endpoints
    - Ensure `isAuthenticated` and `isAdmin` middleware is applied`, `DELETE /clients/:id`
    - `POST /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`
    - `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`

---

## Phase 4: Backend Tests

11. [x] **Add clientsController.test.ts** - Test CRUD operations
12. [x] **Add projectsController.test.ts** - Test CRUD operations
13. [x] **Extend tasksController.test.ts** - Add create/update/delete tests
14. [x] **Add clientsService.test.ts** - Test cascade delete
15. [x] **Add projectsService.test.ts** - Test cascade delete

**Verification**: `cd server && npm test` — all tests pass

---

## Phase 5: Frontend Translations

16. [x] **Update he.json** - Add form field translations
17. [x] **Update en.json** - Add English translations

---

## Phase 6: Frontend Forms

18. [x] **Refactor createClient.ts** - Convert to i18n, export as function
19. [x] **Refactor createProject.ts** - Add manager dropdown, time_format_type, convert to i18n
20. [x] **Refactor createTask.ts** - Convert to i18n

---

## Phase 7: Frontend Service & Page

21. [x] **Extend assignmentService.ts** - Add CRUD methods for clients, projects, tasks

22. [x] **Update AssignmentPage.tsx**:
    - Wire `handleFormSubmit` to call correct API based on form type
    - Wire `handleConfirmDelete` to call correct delete API
    - Pass dynamic options (clients, projects, users) to form fields
    - Refresh data after successful operations

**Final Verification**: Manual testing in browser per verification plan
