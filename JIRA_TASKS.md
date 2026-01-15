# AbraShiftMaster - Jira Task Breakdown
## For 4 Developers

---

## EPIC 0: Project Setup & Infrastructure

### Story 0.1: Monorepo Initial Setup
**Assignee:** Dev 1
**Story Points:** 8
**Priority:** Highest

**Description:**
Set up the complete monorepo structure with all workspaces, tooling, and basic configurations.

**Tasks:**
- [ ] Create root package.json with npm workspaces configuration
- [ ] Create tsconfig.base.json with shared TypeScript settings (strict mode enabled)
- [ ] Create .eslintrc.json with shared linting rules
- [ ] Create .prettierrc (2-space indentation, single quotes, semicolons required)
- [ ] Update .gitignore for monorepo patterns (node_modules, dist, .env, etc.)
- [ ] Create .env.example with all required environment variables
- [ ] Add root-level scripts: dev, build, test, lint, format

**Acceptance Criteria:**
- All config files created and working
- `npm install` runs successfully at root
- ESLint and Prettier work across all workspaces
- .env.example includes: VITE_API_URL, JWT_SECRET, DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY

---

### Story 0.2: Shared Package Setup
**Assignee:** Dev 1
**Story Points:** 5
**Priority:** Highest

**Description:**
Create the shared workspace with types, utilities, and API client code.

**Tasks:**
- [ ] Create /shared directory with proper structure (api/, utils/, types/)
- [ ] Create shared/package.json with dependencies (axios/fetch)
- [ ] Create shared/tsconfig.json extending base config
- [ ] Define shared TypeScript types (enums: UserRole, ProjectTimeFormat, EntryKind, AbsenceType, WorkLocation)
- [ ] Create API client wrapper with base configuration
- [ ] Add utility functions (date formatting, validation helpers)
- [ ] Export all types and utilities properly

**Acceptance Criteria:**
- Shared package builds successfully
- Types are properly exported
- Other workspaces can import from shared
- All enums match database schema

---

### Story 0.3: Client Frontend Scaffold
**Assignee:** Dev 2
**Story Points:** 8
**Priority:** Highest

**Description:**
Initialize the client (mobile PWA) React application with all configurations.

**Tasks:**
- [ ] Initialize Vite + React + TypeScript in /client
- [ ] Create client/package.json (React, Redux Toolkit, React Router, CSS)
- [ ] Configure vite.config.ts (port 5173, proxy to backend)
- [ ] Create client/tsconfig.json extending base
- [ ] Set up directory structure: components/, pages/, store/, hooks/, assets/, constants/, styles/, utils/
- [ ] Configure Redux store with Redux Toolkit
- [ ] Create basic App.tsx with routing setup (React Router)
- [ ] Add mobile-first CSS reset and base styles (RTL support for Hebrew)
- [ ] Configure Vitest for client tests
- [ ] Create basic layout components (Header, Navigation, Footer)

**Acceptance Criteria:**
- Application starts on port 5173
- Redux store is configured
- Routing works
- Mobile-first CSS is applied
- Can import from /shared workspace
- Hebrew RTL support is working

---

### Story 0.4: Admin Frontend Scaffold
**Assignee:** Dev 3
**Story Points:** 8
**Priority:** Highest

**Description:**
Initialize the admin (web) React application with all configurations.

**Tasks:**
- [ ] Initialize Vite + React + TypeScript in /admin
- [ ] Create admin/package.json (React, Redux Toolkit, React Router, CSS)
- [ ] Configure vite.config.ts (port 5174, proxy to backend)
- [ ] Create admin/tsconfig.json extending base
- [ ] Set up directory structure: components/, pages/, store/, hooks/, assets/, constants/, styles/, utils/
- [ ] Configure Redux store with Redux Toolkit (SEPARATE from client)
- [ ] Create basic App.tsx with routing setup
- [ ] Add CSS reset and base styles (RTL support)
- [ ] Configure Vitest for admin tests
- [ ] Create basic layout components (AdminHeader, Sidebar, Main)

**Acceptance Criteria:**
- Application starts on port 5174
- Redux store is configured (separate from client)
- Routing works
- RTL CSS is applied
- Can import from /shared workspace
- Admin layout is distinct from client

---

### Story 0.5: Backend Server Setup
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** Highest

**Description:**
Set up Express backend with TypeScript, middleware, and basic structure.

**Tasks:**
- [ ] Create /server directory with proper structure (routes/, controllers/, services/, middleware/, models/, db/, utils/)
- [ ] Create server/package.json (Express, TypeScript, cors, helmet, dotenv, jsonwebtoken, @supabase/supabase-js)
- [ ] Create server/tsconfig.json for Node.js
- [ ] Create basic Express app with TypeScript (src/index.ts)
- [ ] Configure CORS middleware (allow client and admin origins)
- [ ] Add helmet for security headers
- [ ] Create error handling middleware (centralized error handler)
- [ ] Create health check endpoint GET /api/health
- [ ] Configure nodemon for development
- [ ] Set up request logging middleware (morgan or custom)
- [ ] Configure Vitest for server tests

**Acceptance Criteria:**
- Server starts on port 3000
- Health check endpoint works
- CORS properly configured
- Error handling works
- TypeScript compiles successfully
- Can import from /shared workspace

---

### Story 0.6: Database Setup & Supabase Integration
**Assignee:** Dev 4
**Story Points:** 13
**Priority:** Highest

**Description:**
Set up Supabase connection and create all database tables according to schema.

**Tasks:**
- [ ] Create Supabase project
- [ ] Create /server/src/db/supabase.ts (Supabase client initialization)
- [ ] Create migration files for all tables:
  - users table with role enum
  - clients table
  - projects table with time_format_type enum
  - tasks table
  - admin_task_assignments table with unique constraint
  - entries table (unified work/absence) with unique constraint on (user_id, work_date)
  - entry_assignments table
  - month_locks table with unique constraint on (year, month)
- [ ] Create database enums: user_role, project_time_format_type, entry_kind, absence_type, work_location
- [ ] Set up all foreign key relationships
- [ ] Add indexes for performance (user_id, work_date, task_id, etc.)
- [ ] Create seed data script (test users, clients, projects, tasks)
- [ ] Update .env.example with Supabase credentials

**Acceptance Criteria:**
- All tables created successfully
- Foreign keys work correctly
- Unique constraints are enforced
- Enums are properly defined
- Seed data can be loaded
- Supabase client connects from server

---

### Story 0.7: Authentication & JWT Setup
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** High

**Description:**
Implement JWT-based authentication system.

**Tasks:**
- [ ] Create /server/src/middleware/auth.ts (JWT verification middleware)
- [ ] Create /server/src/utils/jwt.ts (token generation/verification utilities)
- [ ] Create /server/src/utils/password.ts (bcrypt hashing utilities)
- [ ] Create POST /api/auth/login endpoint (Controller + Service)
- [ ] Create auth middleware with role checking (isAdmin, isAuthenticated)
- [ ] Add JWT secret to environment variables
- [ ] Create login service layer (password verification, token generation)
- [ ] Add proper error responses (401, 403)
- [ ] Write unit tests for auth middleware

**Acceptance Criteria:**
- Login endpoint returns JWT token
- Passwords are hashed with bcrypt
- JWT middleware validates tokens correctly
- Role-based middleware works (admin vs regular)
- Unauthorized requests return 401
- Forbidden requests return 403

---

### Story 0.8: API Documentation with Swagger
**Assignee:** Dev 1
**Story Points:** 5
**Priority:** Medium

**Description:**
Set up Swagger/OpenAPI documentation for all API endpoints.

**Tasks:**
- [ ] Install swagger-jsdoc and swagger-ui-express
- [ ] Create /server/src/config/swagger.ts
- [ ] Configure Swagger UI route (GET /api-docs)
- [ ] Document authentication endpoints
- [ ] Create reusable Swagger components (schemas, responses, security)
- [ ] Add Swagger JSDoc comments template
- [ ] Document error response formats

**Acceptance Criteria:**
- Swagger UI accessible at /api-docs
- API documentation is clear and accurate
- All endpoints will be documented as they're built
- Authentication documented with JWT bearer

---

## EPIC 1: Authentication & User Management

### Story 1.1: Admin - Create User (Backend)
**Assignee:** Dev 4
**Story Points:** 5
**Priority:** High

**Description:**
Allow admins to create new users with role and credentials.

**Tasks:**
- [ ] Create POST /api/users endpoint (admin only)
- [ ] Create UsersController.createUser
- [ ] Create UsersService.createUser (hash password, check unique email)
- [ ] Validate required fields (full_name, email, password, role)
- [ ] Add Swagger documentation
- [ ] Write unit tests (valid creation, duplicate email, missing fields)
- [ ] Write integration test

**Acceptance Criteria:**
- Admin can create user with all required fields
- Email must be unique (400 error if duplicate)
- Password is hashed before storing
- New user is active by default
- Returns 201 with created user (without password)
- Non-admin gets 403 error

**API Contract:**
```
POST /api/users
Headers: Authorization: Bearer <admin_token>
Body: { full_name, email, password, role }
Response: 201 { user_id, full_name, email, role, active, created_at }
```

---

### Story 1.2: Login Flow (Backend + Frontend)
**Assignee:** Dev 2 (Frontend) + Dev 4 (Backend)
**Story Points:** 8
**Priority:** Highest

**Description:**
Implement complete login flow for both client and admin.

**Backend Tasks (Dev 4):**
- [ ] Verify POST /api/auth/login works correctly
- [ ] Return user info with token (role, full_name, user_id)
- [ ] Add rate limiting for login attempts
- [ ] Add Swagger documentation

**Client Frontend Tasks (Dev 2):**
- [ ] Create /client/src/pages/Login.tsx
- [ ] Create login form (email, password) with RTL support
- [ ] Create authSlice in Redux (store token, user info)
- [ ] Implement login API call using shared API client
- [ ] Store JWT in localStorage
- [ ] Add loading and error states
- [ ] Redirect to home after successful login
- [ ] Add form validation (email format, required fields)

**Admin Frontend Tasks (Dev 2):**
- [ ] Create /admin/src/pages/Login.tsx (similar to client)
- [ ] Create authSlice in admin Redux store
- [ ] Same login flow for admin users

**Acceptance Criteria:**
- User can log in with valid credentials
- Invalid credentials show error message
- JWT token is stored in localStorage
- User info is stored in Redux
- Redirect after login works
- Loading state shows during API call
- Hebrew UI with RTL layout

---

### Story 1.3: Protected Routes & Auth Guard
**Assignee:** Dev 2
**Story Points:** 5
**Priority:** High

**Description:**
Implement route protection based on authentication status and role.

**Tasks:**
- [ ] Create ProtectedRoute component for client
- [ ] Create ProtectedRoute component for admin
- [ ] Check JWT token on app load
- [ ] Implement auto-logout on token expiration
- [ ] Add route guards to all protected routes
- [ ] Redirect to login if not authenticated
- [ ] Create logout functionality (clear token and Redux state)

**Acceptance Criteria:**
- Unauthenticated users redirected to login
- Token validated on app initialization
- Logout clears all auth data
- Routes are properly protected
- Works for both client and admin apps

---

### Story 1.4: Admin - User Management UI
**Assignee:** Dev 3
**Story Points:** 13
**Priority:** Medium

**Description:**
Create admin interface for managing users (CRUD operations).

**Tasks:**
- [ ] Create GET /api/users endpoint (admin only) - Backend
- [ ] Create PUT /api/users/:id endpoint (admin only) - Backend
- [ ] Create DELETE /api/users/:id endpoint (soft delete, admin only) - Backend
- [ ] Create /admin/src/pages/Users/UsersList.tsx
- [ ] Create /admin/src/pages/Users/CreateUser.tsx
- [ ] Create /admin/src/pages/Users/EditUser.tsx
- [ ] Display users table with filters (active/inactive, role)
- [ ] Add create user form
- [ ] Add edit user functionality
- [ ] Add deactivate/activate user toggle
- [ ] Add password reset functionality
- [ ] Implement usersSlice in admin Redux

**Acceptance Criteria:**
- Admin can view all users
- Admin can create new user
- Admin can edit user details
- Admin can deactivate/activate users
- Soft delete works (user not removed from DB)
- Validation works on all forms
- Hebrew UI with proper RTL

---

## EPIC 2: Master Data Management (Clients, Projects, Tasks)

### Story 2.1: Clients Management (Backend)
**Assignee:** Dev 4
**Story Points:** 5
**Priority:** High

**Description:**
Create API endpoints for client CRUD operations.

**Tasks:**
- [ ] Create POST /api/clients (admin only)
- [ ] Create GET /api/clients (admin only, support active filter)
- [ ] Create GET /api/clients/:id (admin only)
- [ ] Create PUT /api/clients/:id (admin only)
- [ ] Create DELETE /api/clients/:id (soft delete, admin only)
- [ ] Create ClientsController with all methods
- [ ] Create ClientsService with business logic
- [ ] Validate required fields (name)
- [ ] Add Swagger documentation
- [ ] Write unit and integration tests

**Acceptance Criteria:**
- All CRUD endpoints work
- Name is required
- Clients are active by default
- Soft delete works (active = false)
- Deactivated clients can't be selected for new entries
- Returns proper error codes

---

### Story 2.2: Clients Management UI (Admin)
**Assignee:** Dev 3
**Story Points:** 8
**Priority:** High

**Description:**
Create admin UI for managing clients.

**Tasks:**
- [ ] Create /admin/src/pages/Clients/ClientsList.tsx
- [ ] Create /admin/src/pages/Clients/CreateClient.tsx
- [ ] Create /admin/src/pages/Clients/EditClient.tsx
- [ ] Display clients table with status (active/inactive)
- [ ] Add create client form (name, contact_info)
- [ ] Add edit client functionality
- [ ] Add activate/deactivate toggle
- [ ] Implement clientsSlice in Redux
- [ ] Show confirmation dialog before deactivate

**Acceptance Criteria:**
- Admin can view all clients
- Admin can create client
- Admin can edit client
- Admin can activate/deactivate clients
- Confirmation required before deactivate
- Hebrew UI with RTL

---

### Story 2.3: Projects Management (Backend)
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** High

**Description:**
Create API endpoints for project CRUD operations.

**Tasks:**
- [ ] Create POST /api/projects (admin only)
- [ ] Create GET /api/projects (admin only, support filters: client_id, active)
- [ ] Create GET /api/projects/:id (admin only)
- [ ] Create PUT /api/projects/:id (admin only)
- [ ] Create DELETE /api/projects/:id (soft delete, admin only)
- [ ] Create ProjectsController
- [ ] Create ProjectsService
- [ ] Validate: client_id, manager_user_id, name, start_date, time_format_type required
- [ ] Validate: end_date >= start_date
- [ ] Add Swagger documentation
- [ ] Write tests

**Acceptance Criteria:**
- All CRUD endpoints work
- Validation rules enforced
- Can filter by client
- Soft delete works
- Returns project with client and manager details

**API Contract:**
```
POST /api/projects
Body: {
  client_id,
  manager_user_id,
  name,
  description?,
  start_date,
  end_date?,
  time_format_type (sum | start_end)
}
```

---

### Story 2.4: Projects Management UI (Admin)
**Assignee:** Dev 3
**Story Points:** 13
**Priority:** High

**Description:**
Create admin UI for managing projects.

**Tasks:**
- [ ] Create /admin/src/pages/Projects/ProjectsList.tsx
- [ ] Create /admin/src/pages/Projects/CreateProject.tsx
- [ ] Create /admin/src/pages/Projects/EditProject.tsx
- [ ] Display projects table with client name, manager, dates, status
- [ ] Add filters (client, active/inactive)
- [ ] Create project form with all fields
- [ ] Add client dropdown (only active clients)
- [ ] Add manager dropdown (only active users)
- [ ] Add time format selector (sum / start_end)
- [ ] Add date pickers with validation
- [ ] Implement projectsSlice in Redux
- [ ] Show confirmation before deactivate

**Acceptance Criteria:**
- Admin can view all projects
- Admin can filter by client
- Admin can create project with all fields
- Date validation works (end >= start)
- Only active clients/managers appear in dropdowns
- Hebrew UI with RTL

---

### Story 2.5: Tasks Management (Backend)
**Assignee:** Dev 1
**Story Points:** 5
**Priority:** High

**Description:**
Create API endpoints for task CRUD operations.

**Tasks:**
- [ ] Create POST /api/tasks (admin only)
- [ ] Create GET /api/tasks (admin only, support filter: project_id)
- [ ] Create GET /api/tasks/:id (admin only)
- [ ] Create PUT /api/tasks/:id (admin only)
- [ ] Create DELETE /api/tasks/:id (soft delete, admin only)
- [ ] Create TasksController
- [ ] Create TasksService
- [ ] Validate: project_id, name required
- [ ] Validate: end_date >= start_date
- [ ] Add Swagger documentation
- [ ] Write tests

**Acceptance Criteria:**
- All CRUD endpoints work
- Tasks belong to a project
- Date validation works
- Can filter by project
- Returns task with project details

---

### Story 2.6: Tasks Management UI (Admin)
**Assignee:** Dev 3
**Story Points:** 8
**Priority:** High

**Description:**
Create admin UI for managing tasks.

**Tasks:**
- [ ] Create /admin/src/pages/Tasks/TasksList.tsx
- [ ] Create /admin/src/pages/Tasks/CreateTask.tsx
- [ ] Create /admin/src/pages/Tasks/EditTask.tsx
- [ ] Display tasks table with project name, dates
- [ ] Add filter by project
- [ ] Create task form (project, name, description, start_date, end_date)
- [ ] Add project dropdown (only active projects)
- [ ] Add date pickers with validation
- [ ] Implement tasksSlice in Redux

**Acceptance Criteria:**
- Admin can view all tasks
- Admin can filter by project
- Admin can create task
- Date validation works
- Only active projects in dropdown
- Hebrew UI with RTL

---

## EPIC 3: Task Assignments (Admin assigns tasks to users)

### Story 3.1: Task Assignment (Backend)
**Assignee:** Dev 1
**Story Points:** 8
**Priority:** High

**Description:**
Allow admins to assign/revoke tasks to users.

**Tasks:**
- [ ] Create POST /api/admin-task-assignments (admin only)
- [ ] Create GET /api/admin-task-assignments (admin only, filters: user_id, task_id)
- [ ] Create DELETE /api/admin-task-assignments/:id (revoke, admin only)
- [ ] Create AdminTaskAssignmentsController
- [ ] Create AdminTaskAssignmentsService
- [ ] Enforce unique constraint (user_id, task_id)
- [ ] Store assigned_by and assigned_at
- [ ] Revoke sets active=false and revoked_at
- [ ] Add Swagger documentation
- [ ] Write tests (duplicate assignment, revoke)

**Acceptance Criteria:**
- Admin can assign task to user
- Duplicate assignment returns 400 error
- Revoke marks assignment inactive
- Returns assignment with user and task details
- Only admin can perform these operations

**API Contract:**
```
POST /api/admin-task-assignments
Body: { user_id, task_id }
Response: {
  admin_task_assignment_id,
  user_id,
  task_id,
  assigned_by,
  assigned_at,
  active
}
```

---

### Story 3.2: Task Assignment UI (Admin)
**Assignee:** Dev 3
**Story Points:** 13
**Priority:** High

**Description:**
Create admin UI for assigning tasks to users.

**Tasks:**
- [ ] Create /admin/src/pages/Assignments/AssignmentsList.tsx
- [ ] Create /admin/src/pages/Assignments/CreateAssignment.tsx
- [ ] Display assignments table (user, task, project, assigned date, status)
- [ ] Add filters (user, project, active/revoked)
- [ ] Create assignment form (user dropdown, task dropdown)
- [ ] Show task's project when selecting task
- [ ] Add revoke assignment button
- [ ] Show confirmation before revoke
- [ ] Implement assignmentsSlice in Redux
- [ ] Handle duplicate assignment error gracefully

**Acceptance Criteria:**
- Admin can view all assignments
- Admin can filter by user and project
- Admin can create assignment
- Duplicate assignment shows error message
- Revoke requires confirmation
- Hebrew UI with RTL

---

### Story 3.3: User - View My Assigned Tasks (Backend + Frontend)
**Assignee:** Dev 2 (Frontend) + Dev 1 (Backend)
**Story Points:** 5
**Priority:** High

**Description:**
Allow users to view their assigned tasks for reporting.

**Backend Tasks (Dev 1):**
- [ ] Create GET /api/my-tasks (authenticated user)
- [ ] Filter: only active assignments for current user
- [ ] Filter: exclude inactive projects/clients
- [ ] Filter: exclude tasks outside date range (optional)
- [ ] Return task with project and client info
- [ ] Add Swagger documentation

**Frontend Tasks (Dev 2):**
- [ ] Create task selector component for client app
- [ ] Fetch assigned tasks on component load
- [ ] Display tasks grouped by client > project
- [ ] Filter by date range if needed
- [ ] Store in Redux (myTasksSlice)

**Acceptance Criteria:**
- User sees only assigned tasks
- Inactive projects/clients excluded
- Tasks display with client and project context
- Fast loading and caching
- Hebrew UI with RTL

---

## EPIC 4: Daily Entries (Work Reporting)

### Story 4.1: Create Daily Work Entry (Backend)
**Assignee:** Dev 1
**Story Points:** 8
**Priority:** Highest

**Description:**
Create endpoint for users to create daily work entries.

**Tasks:**
- [ ] Create POST /api/entries (authenticated user)
- [ ] Create EntriesController.createEntry
- [ ] Create EntriesService.createEntry
- [ ] Validate: one entry per user per day (unique constraint)
- [ ] Validate: month not locked
- [ ] Validate: work_date is a valid date
- [ ] Validate: if start_time and end_time provided, end > start
- [ ] Set entry_kind to 'work'
- [ ] Add Swagger documentation
- [ ] Write tests (duplicate day, locked month, validation)

**Acceptance Criteria:**
- User can create one entry per day
- Duplicate day returns 400 error
- Locked month returns 403 error
- Time validation works
- Returns created entry

**API Contract:**
```
POST /api/entries
Body: {
  work_date,
  start_time?,
  end_time?,
  description?
}
Response: 201 {
  entry_id,
  user_id,
  entry_kind: 'work',
  work_date,
  start_time,
  end_time,
  description,
  created_at
}
```

---

### Story 4.2: Daily Reporting UI (Client - Basic)
**Assignee:** Dev 2
**Story Points:** 13
**Priority:** Highest

**Description:**
Create mobile-first daily reporting interface for employees.

**Tasks:**
- [ ] Create /client/src/pages/DailyReport.tsx
- [ ] Create date picker (default: today)
- [ ] Create time pickers (start, end)
- [ ] Add description text area
- [ ] Show daily goal indicator (9 hours)
- [ ] Show progress toward goal
- [ ] Create entry creation form
- [ ] Implement entriesSlice in Redux
- [ ] Handle locked month error gracefully
- [ ] Add loading and error states
- [ ] Make fully responsive (mobile-first)

**Acceptance Criteria:**
- Mobile-first responsive design
- Date picker works
- Time validation (end > start)
- Shows 9-hour daily goal
- Shows progress indicator
- Error handling for locked months
- Hebrew UI with RTL
- Works on mobile devices

---

## EPIC 5: Entry Line Items (Task Assignment per Entry)

### Story 5.1: Add Task Line to Entry (Backend)
**Assignee:** Dev 1
**Story Points:** 13
**Priority:** Highest

**Description:**
Allow users to add task line items to their daily entries.

**Tasks:**
- [ ] Create POST /api/entry-assignments (authenticated user)
- [ ] Create EntryAssignmentsController.create
- [ ] Create EntryAssignmentsService.create
- [ ] Validate: entry belongs to current user
- [ ] Validate: task is assigned to user (check admin_task_assignments)
- [ ] Validate: location is required
- [ ] Validate: month not locked
- [ ] Validate: no duplicate (entry_id, task_id)
- [ ] Validate time format based on project.time_format_type:
  - sum: duration_minutes required, start/end not allowed
  - start_end: start_time and end_time required, duration not allowed
- [ ] Add Swagger documentation
- [ ] Write extensive tests (all validation cases)

**Acceptance Criteria:**
- User can add task line to their entry
- Task must be assigned to user
- Location required
- Time format validation works
- Duplicate task line returns 400
- Locked month returns 403
- Returns line with task/project/client info

**API Contract:**
```
POST /api/entry-assignments
Body: {
  entry_id,
  task_id,
  location (Office | Client | Home),
  // For sum projects:
  duration_minutes?,
  // For start_end projects:
  start_time?,
  end_time?
}
```

---

### Story 5.2: Multi-Task Daily Report UI (Client)
**Assignee:** Dev 2
**Story Points:** 21
**Priority:** Highest

**Description:**
Enhance daily report to support multiple task lines with time tracking.

**Tasks:**
- [ ] Enhance DailyReport page to show task lines
- [ ] Create task line form component
- [ ] Add client dropdown (fetch from assigned tasks)
- [ ] Add project dropdown (filter by selected client)
- [ ] Add task dropdown (filter by selected project)
- [ ] Add location selector (Office/Client/Home)
- [ ] Add time input based on project time format:
  - sum format: duration input
  - start_end format: start/end time pickers
- [ ] Show total hours reported
- [ ] Show remaining hours to 9-hour goal
- [ ] Prevent save if hours don't add up (warning, not blocking)
- [ ] Allow adding multiple task lines
- [ ] Allow editing task lines
- [ ] Allow deleting task lines
- [ ] Implement entryAssignmentsSlice
- [ ] Handle all validation errors

**Acceptance Criteria:**
- Can add multiple task lines to one entry
- Client > Project > Task cascade works
- Time format changes based on project
- Shows total and remaining hours
- Warning if not 9 hours
- Can edit and delete lines
- All validation works
- Mobile-first UI
- Hebrew with RTL

---

### Story 5.3: Edit/Delete Task Lines (Backend)
**Assignee:** Dev 1
**Story Points:** 5
**Priority:** High

**Description:**
Allow users to edit and delete their task lines.

**Tasks:**
- [ ] Create PUT /api/entry-assignments/:id (authenticated user)
- [ ] Create DELETE /api/entry-assignments/:id (authenticated user)
- [ ] Validate: line belongs to user's entry
- [ ] Validate: month not locked
- [ ] Same validation as create for edit
- [ ] Add Swagger documentation
- [ ] Write tests

**Acceptance Criteria:**
- User can edit their task lines
- User can delete their task lines
- Can't edit/delete if month locked
- Can't edit other users' lines
- Validation same as create

---

## EPIC 6: Absence Reporting

### Story 6.1: Create Absence Entry (Backend)
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** High

**Description:**
Allow users to create absence entries (sick, vacation, etc.).

**Tasks:**
- [ ] Enhance POST /api/entries to support entry_kind='absence'
- [ ] Validate: absence_type required when entry_kind=absence
- [ ] Validate: for non-partial absences, no work line items allowed
- [ ] Validate: vacation_partial can have work line items
- [ ] Create POST /api/entries/absence-range endpoint for vacation ranges
- [ ] vacation-range: create one entry per day in range
- [ ] Skip weekends (Saturday/Sunday) automatically
- [ ] Don't create if entry already exists for that day
- [ ] Add Swagger documentation
- [ ] Write tests (single absence, range, partial)

**Acceptance Criteria:**
- User can create single absence day
- User can create vacation range
- Weekends excluded from range
- Partial vacation allows work lines
- Other absence types don't allow work lines
- Returns all created entries

**API Contract:**
```
POST /api/entries
Body: {
  entry_kind: 'absence',
  absence_type: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other',
  work_date,
  attachment_path? (required for sick/reserve)
}

POST /api/entries/absence-range
Body: {
  absence_type,
  start_date,
  end_date
}
Response: [array of created entries]
```

---

### Story 6.2: Absence Reporting UI (Client)
**Assignee:** Dev 2
**Story Points:** 13
**Priority:** High

**Description:**
Create UI for reporting absences.

**Tasks:**
- [ ] Create /client/src/pages/AbsenceReport.tsx
- [ ] Add absence type selector (sick, vacation, vacation_partial, reserve, other)
- [ ] Add single date picker
- [ ] Add date range picker for vacation
- [ ] Add file upload for sick/reserve (attachment)
- [ ] Show checkbox "exclude weekends" (checked by default)
- [ ] Show preview of days that will be created for range
- [ ] For vacation_partial, allow adding work task lines
- [ ] Implement absence creation
- [ ] Handle file upload
- [ ] Show success message with created days

**Acceptance Criteria:**
- Can select absence type
- Can create single day absence
- Can create vacation range
- Weekends excluded by default
- Shows preview before creating range
- File upload works for sick/reserve
- Partial vacation allows work lines
- Hebrew UI with RTL

---

## EPIC 7: Month Locking (Admin)

### Story 7.1: Month Lock/Unlock (Backend)
**Assignee:** Dev 4
**Story Points:** 5
**Priority:** Medium

**Description:**
Allow admins to lock and unlock months.

**Tasks:**
- [ ] Create POST /api/month-locks (admin only)
- [ ] Create DELETE /api/month-locks/:year/:month (unlock, admin only)
- [ ] Create GET /api/month-locks (admin only)
- [ ] Create MonthLocksController
- [ ] Create MonthLocksService
- [ ] Enforce unique constraint (year, month)
- [ ] Store locked_by and locked_at
- [ ] Unlock sets unlocked_at
- [ ] Add helper function: isMonthLocked(year, month)
- [ ] Use in all entry/assignment validation
- [ ] Add Swagger documentation
- [ ] Write tests

**Acceptance Criteria:**
- Admin can lock month
- Duplicate lock returns 400
- Admin can unlock month
- Locked month blocks all edits
- Helper function works correctly
- Stores who locked/unlocked

**API Contract:**
```
POST /api/month-locks
Body: { year, month }

DELETE /api/month-locks/:year/:month
```

---

### Story 7.2: Month Lock UI (Admin)
**Assignee:** Dev 3
**Story Points:** 8
**Priority:** Medium

**Description:**
Create admin UI for locking and unlocking months.

**Tasks:**
- [ ] Create /admin/src/pages/MonthLocks/MonthLocksList.tsx
- [ ] Display calendar view or list of months
- [ ] Show locked/unlocked status
- [ ] Show who locked and when
- [ ] Add lock month button with month/year picker
- [ ] Add unlock button for locked months
- [ ] Show confirmation before lock/unlock
- [ ] Implement monthLocksSlice
- [ ] Show error if month already locked

**Acceptance Criteria:**
- Admin can view locked months
- Admin can lock new month
- Admin can unlock month
- Shows lock details (who, when)
- Confirmation required
- Error handling works
- Hebrew UI with RTL

---

## EPIC 8: Reporting & Views

### Story 8.1: Monthly View (Backend)
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** High

**Description:**
Create endpoints for monthly reporting views.

**Tasks:**
- [ ] Create GET /api/entries/my-month (authenticated user)
  - Query params: year, month
  - Return all entries for user in that month
  - Include entry_assignments with task/project/client details
- [ ] Create GET /api/entries/month-overview (admin only)
  - Query params: year, month, user_id?, client_id?, project_id?, task_id?
  - Return all entries for month with filters
  - Include user details
- [ ] Add pagination support
- [ ] Add Swagger documentation
- [ ] Write tests

**Acceptance Criteria:**
- User can view their monthly entries
- Admin can view all users' monthly entries
- Filters work correctly
- Returns complete entry details
- Pagination works
- Includes lock status for month

---

### Story 8.2: Monthly View UI (Client)
**Assignee:** Dev 2
**Story Points:** 13
**Priority:** High

**Description:**
Create monthly calendar view for users.

**Tasks:**
- [ ] Create /client/src/pages/MonthlyView.tsx
- [ ] Add month/year picker
- [ ] Create calendar component showing all days
- [ ] Color-code days: complete (9hrs), incomplete, absent, empty
- [ ] Show summary: total hours, absent days
- [ ] Click day to see details/edit
- [ ] Show lock status for month
- [ ] Disable editing if locked
- [ ] Mobile-first responsive design
- [ ] Implement monthlyViewSlice

**Acceptance Criteria:**
- Calendar shows full month
- Days color-coded by status
- Can navigate months
- Shows if month is locked
- Click day shows details
- Can't edit locked months
- Mobile-friendly
- Hebrew UI with RTL

---

### Story 8.3: Admin Reporting Dashboard
**Assignee:** Dev 3
**Story Points:** 21
**Priority:** Medium

**Description:**
Create comprehensive admin reporting dashboard.

**Tasks:**
- [ ] Create /admin/src/pages/Reports/MonthlyReport.tsx
- [ ] Add month/year picker
- [ ] Add filters: user, client, project, task
- [ ] Create table showing all entries
- [ ] Group by user option
- [ ] Show total hours per user
- [ ] Show absence summary
- [ ] Add export to CSV functionality
- [ ] Show lock status
- [ ] Allow editing entries (with audit trail)
- [ ] Implement reportsSlice

**Acceptance Criteria:**
- Admin can view all monthly entries
- Filters work correctly
- Can group by user
- Shows totals and summaries
- Can export to CSV
- Can edit entries (logged)
- Hebrew UI with RTL

---

## EPIC 9: Advanced Features

### Story 9.1: Timer Functionality (Client)
**Assignee:** Dev 2
**Story Points:** 13
**Priority:** Low

**Description:**
Add timer feature for tracking work time.

**Tasks:**
- [ ] Create timer component with start/stop
- [ ] Store timer state in localStorage
- [ ] Show running timer indicator
- [ ] Calculate duration on stop
- [ ] Pre-fill task line with duration
- [ ] Add pause/resume functionality
- [ ] Show notification when timer running
- [ ] Persist across page refresh

**Acceptance Criteria:**
- Can start timer
- Timer persists across refresh
- Shows running indicator
- Fills duration on stop
- Can pause and resume
- Mobile-friendly

---

### Story 9.2: Audit Trail for Admin Edits (Backend)
**Assignee:** Dev 4
**Story Points:** 8
**Priority:** Medium

**Description:**
Track all admin edits to user entries.

**Tasks:**
- [ ] Create audit_logs table (entity_type, entity_id, action, changed_by, changed_at, old_value, new_value)
- [ ] Create audit middleware for entry/assignment updates
- [ ] Log all admin edits
- [ ] Create GET /api/audit-logs endpoint (admin only)
- [ ] Add filters (entity, user, date range)
- [ ] Add Swagger documentation

**Acceptance Criteria:**
- All admin edits logged
- Can view audit trail
- Shows before/after values
- Can filter by entity and date

---

### Story 9.3: Notifications System
**Assignee:** Dev 1
**Story Points:** 13
**Priority:** Low

**Description:**
Add in-app notifications for important events.

**Tasks:**
- [ ] Create notifications table
- [ ] Create notification types (month_locked, assignment_added, etc.)
- [ ] Create GET /api/notifications endpoint
- [ ] Create PATCH /api/notifications/:id/read endpoint
- [ ] Add notification indicator in UI
- [ ] Create notifications panel
- [ ] Add real-time updates (polling or WebSocket)

**Acceptance Criteria:**
- Users receive notifications
- Can mark as read
- Shows unread count
- Notifications for key events

---

## EPIC 10: Testing & Quality

### Story 10.1: Backend Integration Tests
**Assignee:** Dev 4
**Story Points:** 13
**Priority:** Medium

**Description:**
Comprehensive integration tests for all API endpoints.

**Tasks:**
- [ ] Set up test database
- [ ] Write integration tests for auth endpoints
- [ ] Write integration tests for user endpoints
- [ ] Write integration tests for master data (clients, projects, tasks)
- [ ] Write integration tests for assignments
- [ ] Write integration tests for entries and line items
- [ ] Write integration tests for month locks
- [ ] Aim for 70%+ coverage
- [ ] Set up CI to run tests

**Acceptance Criteria:**
- All major flows tested
- 70%+ code coverage
- Tests run in CI
- Tests use test database

---

### Story 10.2: Frontend Unit Tests
**Assignee:** Dev 2 + Dev 3
**Story Points:** 13
**Priority:** Medium

**Description:**
Unit tests for key components and Redux logic.

**Tasks:**
- [ ] Test Redux slices (actions, reducers)
- [ ] Test key components (forms, validation)
- [ ] Test utility functions
- [ ] Test API client functions
- [ ] Aim for 60%+ coverage
- [ ] Set up CI to run tests

**Acceptance Criteria:**
- Key components tested
- Redux logic tested
- 60%+ coverage
- Tests run in CI

---

## EPIC 11: Deployment & DevOps

### Story 11.1: CI/CD Pipeline
**Assignee:** Dev 1
**Story Points:** 8
**Priority:** Medium

**Description:**
Set up GitHub Actions for CI/CD.

**Tasks:**
- [ ] Create .github/workflows/ci.yml
- [ ] Run linting on all workspaces
- [ ] Run tests on all workspaces
- [ ] Build all workspaces
- [ ] Set up branch protection rules
- [ ] Require PR reviews
- [ ] Require passing CI before merge

**Acceptance Criteria:**
- CI runs on every PR
- Linting, tests, build all pass
- Branch protection enabled
- PR reviews required

---

### Story 11.2: Vercel Deployment
**Assignee:** Dev 1
**Story Points:** 8
**Priority:** High

**Description:**
Deploy client, admin, and server to Vercel.

**Tasks:**
- [ ] Configure Vercel projects (client, admin, server)
- [ ] Set up environment variables
- [ ] Configure build commands
- [ ] Set up custom domains (optional)
- [ ] Configure CORS for production
- [ ] Test production deployment
- [ ] Create deployment documentation

**Acceptance Criteria:**
- All apps deployed to Vercel
- Environment variables configured
- Production builds work
- CORS configured correctly
- Documentation created

---

## Story Point Summary by Developer

### Dev 1 (Backend + DevOps)
- Total Stories: 10
- Total Story Points: **89**
- Focus: Backend API, shared setup, DevOps

### Dev 2 (Client Frontend)
- Total Stories: 11
- Total Story Points: **105**
- Focus: Mobile PWA, user features

### Dev 3 (Admin Frontend)
- Total Stories: 9
- Total Story Points: **84**
- Focus: Admin web app, management UIs

### Dev 4 (Backend + Database)
- Total Stories: 12
- Total Story Points: **102**
- Focus: Backend API, database, authentication

---

## Recommended Sprint Plan (2-week sprints)

### Sprint 1: Foundation
- Epic 0 (all setup stories)
- **Goal:** Working monorepo with all apps running

### Sprint 2: Auth & Master Data Backend
- Epic 1.1-1.3 (Auth backend + login)
- Epic 2.1, 2.3, 2.5 (Backend for clients, projects, tasks)

### Sprint 3: Master Data UI
- Epic 1.4 (User management UI)
- Epic 2.2, 2.4, 2.6 (Master data UIs)

### Sprint 4: Assignments
- Epic 3 (all assignment stories)

### Sprint 5: Daily Reporting Core
- Epic 4.1-4.2 (Basic entry creation)
- Epic 5.1-5.2 (Task lines)

### Sprint 6: Advanced Entry Features
- Epic 5.3 (Edit/delete lines)
- Epic 6 (Absence reporting)

### Sprint 7: Reporting & Views
- Epic 8 (all reporting stories)
- Epic 7 (month locking)

### Sprint 8: Polish & Testing
- Epic 9 (advanced features - selected)
- Epic 10 (testing)
- Epic 11 (deployment)

---

## Notes
- Hebrew UI required throughout
- RTL support in all pages
- Mobile-first for client app
- Story points based on Fibonacci scale
- All APIs require Swagger documentation
- All features require tests
- Each story should have clear acceptance criteria
