# Tasks: Integrate Client Time Entries with Backend

**Change ID:** `integrate-client-time-entries`

## Task Breakdown

Tasks are ordered to deliver user-visible progress incrementally and highlight dependencies.

---

## Phase 1: Shared Types and Error Codes (Foundation)

### Task 1.1: Define shared types for entries
**Priority:** P0 (Blocker for all other tasks)
**Estimated effort:** Small

- [ ] Create `/shared/src/types/entries.ts`
- [ ] Define `CreateWorkEntryRequest` interface
- [ ] Define `WorkEntry` interface with all fields
- [ ] Define `EntryAssignment` interface
- [ ] Define `EntryAssignmentInput` interface
- [ ] Define `WorkLocation` enum
- [ ] Export all types from `/shared/src/types/index.ts`

**Validation:**
- TypeScript compilation passes
- Types are importable in both client and server

---

### Task 1.2: Define shared types for absences
**Priority:** P0 (Blocker for absence features)
**Estimated effort:** Small

- [ ] Create `/shared/src/types/absences.ts`
- [ ] Define `CreateAbsenceEntryRequest` interface
- [ ] Define `AbsenceEntry` interface
- [ ] Define `AbsenceType` enum (sick, vacation, vacation_partial, reserve, other)
- [ ] Export all types from `/shared/src/types/index.ts`

**Validation:**
- TypeScript compilation passes
- Types are importable in both client and server

---

### Task 1.3: Define error codes and types
**Priority:** P0 (Blocker for error handling)
**Estimated effort:** Small

- [ ] Create `/shared/src/types/errors.ts`
- [ ] Define `EntryErrorCode` enum (MONTH_LOCKED, TASK_NOT_ASSIGNED, etc.)
- [ ] Define `ApiError` interface
- [ ] Define `ValidationError` interface
- [ ] Export from `/shared/src/types/index.ts`

**Validation:**
- Error codes are comprehensive
- TypeScript compilation passes

---

## Phase 2: Backend Database Layer

### Task 2.1: Create Entry model with database queries
**Priority:** P0 (Blocker for backend services)
**Estimated effort:** Medium
**Depends on:** Task 1.1

- [ ] Create `/server/src/models/Entry.ts`
- [ ] Implement `Entry.create()` - Insert entry
- [ ] Implement `Entry.findById()` - Get entry by ID
- [ ] Implement `Entry.findByUserAndDate()` - Check existing entry
- [ ] Implement `Entry.findByUserAndDateRange()` - Get entries for month
- [ ] Implement `Entry.update()` - Update existing entry
- [ ] Add proper TypeScript types for all methods
- [ ] Add database indexes for queries

**Validation:**
- All methods tested with mock data
- Queries use parameterized statements
- Returns match shared types

---

### Task 2.2: Create EntryAssignment model
**Priority:** P0 (Blocker for work entries)
**Estimated effort:** Medium
**Depends on:** Task 1.1

- [ ] Create `/server/src/models/EntryAssignment.ts`
- [ ] Implement `EntryAssignment.createMany()` - Bulk insert assignments
- [ ] Implement `EntryAssignment.findByEntryId()` - Get assignments for entry
- [ ] Implement `EntryAssignment.deleteByEntryId()` - Remove old assignments
- [ ] Add proper TypeScript types

**Validation:**
- Bulk insert works with transaction
- Foreign key constraints enforced

---

### Task 2.3: Create Task model for task tree queries
**Priority:** P1 (Needed for task tree endpoint)
**Estimated effort:** Small
**Depends on:** None

- [ ] Create `/server/src/models/Task.ts`
- [ ] Implement `Task.findAssignedToUser()` - Get user's assigned tasks with project info
- [ ] Join with projects, clients, admin_task_assignments
- [ ] Filter by active=true, revoked_at IS NULL
- [ ] Return hierarchical structure (projects → tasks)

**Validation:**
- Query returns nested structure
- Only active, assigned tasks returned
- Includes project metadata (time_format_type, etc.)

---

## Phase 3: Backend Services (Business Logic)

### Task 3.1: Create month lock service
**Priority:** P0 (Blocker for entry creation)
**Estimated effort:** Small

- [ ] Create `/server/src/services/monthLockService.ts`
- [ ] Implement `checkLocked(workDate)` - Throws error if locked
- [ ] Parse year/month from work_date
- [ ] Query month_locks table
- [ ] Throw AppError with MONTH_LOCKED code if locked

**Validation:**
- Throws error for locked months
- Allows unlocked months
- Includes year/month in error details

---

### Task 3.2: Create task assignment verification service
**Priority:** P0 (Blocker for work entries)
**Estimated effort:** Small

- [ ] Create `/server/src/services/taskAssignmentService.ts`
- [ ] Implement `verifyUserAssignedToTasks(userId, taskIds)` - Throws if not assigned
- [ ] Query admin_task_assignments table
- [ ] Check active=true, revoked_at IS NULL
- [ ] Throw AppError with TASK_NOT_ASSIGNED code if any task not assigned

**Validation:**
- Rejects unassigned tasks
- Allows assigned tasks
- Handles multiple tasks correctly

---

### Task 3.3: Create time format validation service
**Priority:** P0 (Blocker for work entries)
**Estimated effort:** Medium
**Depends on:** Task 2.3

- [ ] Create `/server/src/services/timeFormatService.ts`
- [ ] Implement `validateAssignmentTimeFormat(assignment, project)` - Validates time fields
- [ ] If project.time_format_type === 'start_end': require start_time, end_time
- [ ] If project.time_format_type === 'sum': require duration_minutes
- [ ] Throw AppError with TIME_FORMAT_MISMATCH code if invalid

**Validation:**
- Rejects mismatched formats
- Accepts correct formats
- Clear error messages

---

### Task 3.4: Create entry service for work entries
**Priority:** P0 (Blocker for work entry endpoint)
**Estimated effort:** Large
**Depends on:** Tasks 2.1, 2.2, 3.1, 3.2, 3.3

- [ ] Create `/server/src/services/entryService.ts`
- [ ] Implement `createWorkEntry(userId, entryData)`:
  - [ ] Check month not locked
  - [ ] Verify user assigned to all tasks
  - [ ] Fetch projects for tasks, validate time formats
  - [ ] Check for existing entry (upsert logic)
  - [ ] Create entry + assignments in transaction
  - [ ] Return created entry with assignments
- [ ] Implement `getEntriesByDateRange(userId, startDate, endDate)`:
  - [ ] Query entries with date filter
  - [ ] Join assignments, tasks, projects
  - [ ] Return formatted data
- [ ] Add comprehensive error handling

**Validation:**
- Creates entry with assignments
- Upserts existing entry
- Enforces all business rules
- Transaction rolls back on error

---

### Task 3.5: Create absence service
**Priority:** P0 (Blocker for absence endpoint)
**Estimated effort:** Medium
**Depends on:** Tasks 2.1, 3.1

- [ ] Create `/server/src/services/absenceService.ts`
- [ ] Implement `createAbsenceEntry(userId, absenceData)`:
  - [ ] Check month not locked (for all dates in range)
  - [ ] If date range provided, create multiple entries (one per day)
  - [ ] If single date, create one entry
  - [ ] Handle upsert for existing entries
  - [ ] Return created entry/entries
- [ ] Implement `getAbsencesByDateRange(userId, startDate, endDate)`
- [ ] Add validation for absence_type

**Validation:**
- Creates single-day absence
- Creates multi-day absence (range)
- Upserts existing entries
- Enforces month lock check

---

### Task 3.6: Create task tree service
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Small
**Depends on:** Task 2.3

- [ ] Create `/server/src/services/taskTreeService.ts`
- [ ] Implement `getUserTaskTree(userId)`:
  - [ ] Call Task.findAssignedToUser(userId)
  - [ ] Transform to hierarchical structure (projects → tasks)
  - [ ] Include project metadata (time_format_type, client_name, etc.)
  - [ ] Return sorted by project name, task name

**Validation:**
- Returns hierarchical structure
- Only active, assigned tasks
- Includes all necessary metadata

---

## Phase 4: Backend Controllers and Routes

### Task 4.1: Create time entries controller
**Priority:** P0 (Blocker for time entries API)
**Estimated effort:** Medium
**Depends on:** Task 3.4

- [ ] Create `/server/src/controllers/timeEntriesController.ts`
- [ ] Implement `create(req, res)`:
  - [ ] Parse request body
  - [ ] Extract userId from req.user (JWT)
  - [ ] Call entryService.createWorkEntry()
  - [ ] Return 201 with created entry
  - [ ] Handle errors (400, 500)
- [ ] Implement `list(req, res)`:
  - [ ] Parse query params (startDate, endDate)
  - [ ] Extract userId from req.user
  - [ ] Call entryService.getEntriesByDateRange()
  - [ ] Return 200 with entries array
- [ ] Add input validation middleware

**Validation:**
- Returns correct status codes
- Handles validation errors
- Returns consistent response format

---

### Task 4.2: Create absences controller
**Priority:** P0 (Blocker for absences API)
**Estimated effort:** Medium
**Depends on:** Task 3.5

- [ ] Create `/server/src/controllers/absencesController.ts`
- [ ] Implement `create(req, res)`:
  - [ ] Parse request body (work_date or start_date/end_date)
  - [ ] Extract userId from req.user
  - [ ] Call absenceService.createAbsenceEntry()
  - [ ] Return 201 with created entry/entries
- [ ] Implement `list(req, res)`:
  - [ ] Parse query params
  - [ ] Call absenceService.getAbsencesByDateRange()
  - [ ] Return 200 with absences array
- [ ] Add input validation

**Validation:**
- Handles single-day and range requests
- Returns correct response format
- Validates absence_type enum

---

### Task 4.3: Create me controller for user-specific endpoints
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small
**Depends on:** Task 3.6

- [ ] Create `/server/src/controllers/meController.ts`
- [ ] Implement `getProfile(req, res)` - Return user info
- [ ] Implement `getTaskTree(req, res)`:
  - [ ] Extract userId from req.user
  - [ ] Call taskTreeService.getUserTaskTree()
  - [ ] Return 200 with task tree
- [ ] Add query param handling (includeInactive, projectId filters)

**Validation:**
- Returns user's assigned tasks only
- Respects filter parameters
- Returns consistent format

---

### Task 4.4: Create time entries routes
**Priority:** P0 (Blocker for client integration)
**Estimated effort:** Small
**Depends on:** Task 4.1

- [ ] Create `/server/src/routes/time-entries.ts`
- [ ] Add `POST /api/v1/time-entries` → timeEntriesController.create
- [ ] Add `GET /api/v1/time-entries` → timeEntriesController.list
- [ ] Add authenticate middleware
- [ ] Export router

**Validation:**
- Routes accessible at correct paths
- Authentication required
- Returns from controllers work

---

### Task 4.5: Create absences routes
**Priority:** P0 (Blocker for client integration)
**Estimated effort:** Small
**Depends on:** Task 4.2

- [ ] Create `/server/src/routes/absences.ts`
- [ ] Add `POST /api/v1/absences` → absencesController.create
- [ ] Add `GET /api/v1/absences` → absencesController.list
- [ ] Add authenticate middleware
- [ ] Export router

**Validation:**
- Routes accessible
- Authentication required

---

### Task 4.6: Create me routes
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small
**Depends on:** Task 4.3

- [ ] Create `/server/src/routes/me.ts`
- [ ] Add `GET /api/v1/me` → meController.getProfile
- [ ] Add `GET /api/v1/me/task-tree` → meController.getTaskTree
- [ ] Add authenticate middleware
- [ ] Export router

**Validation:**
- Routes accessible
- Returns user-specific data

---

### Task 4.7: Register routes in main server
**Priority:** P0 (Blocker for endpoints to work)
**Estimated effort:** Trivial
**Depends on:** Tasks 4.4, 4.5, 4.6

- [ ] Update `/server/src/routes/index.ts`
- [ ] Import time-entries, absences, me routes
- [ ] Register routes with app
- [ ] Test that endpoints are accessible

**Validation:**
- All routes accessible via Postman/curl
- 401 without auth token
- 200/201 with valid requests

---

## Phase 5: Client API Client Layer

### Task 5.1: Create entries API client
**Priority:** P0 (Blocker for Redux integration)
**Estimated effort:** Medium
**Depends on:** Task 1.1, Task 1.3

- [ ] Create `/shared/src/api/entriesApi.ts`
- [ ] Implement `createWork(entryData, token)` - POST /api/v1/time-entries
- [ ] Implement `getByMonth(year, month, token)` - GET /api/v1/time-entries
- [ ] Add error parsing (map to EntryErrorCode)
- [ ] Add request/response type checking
- [ ] Export functions

**Validation:**
- Functions call correct endpoints
- Errors are parsed correctly
- TypeScript types match shared types

---

### Task 5.2: Create absences API client
**Priority:** P0 (Blocker for Redux integration)
**Estimated effort:** Small
**Depends on:** Task 1.2, Task 1.3

- [ ] Create `/shared/src/api/absencesApi.ts`
- [ ] Implement `create(absenceData, token)` - POST /api/v1/absences
- [ ] Implement `getByMonth(year, month, token)` - GET /api/v1/absences
- [ ] Add error parsing
- [ ] Export functions

**Validation:**
- Functions call correct endpoints
- Handles single-day and range requests

---

### Task 5.3: Create tasks API client
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small

- [ ] Create `/shared/src/api/tasksApi.ts`
- [ ] Implement `getTaskTree(token)` - GET /api/v1/me/task-tree
- [ ] Add error parsing
- [ ] Export function

**Validation:**
- Returns hierarchical task tree
- Parses errors correctly

---

## Phase 6: Client Redux Integration

### Task 6.1: Create entries Redux slice
**Priority:** P0 (Blocker for UI integration)
**Estimated effort:** Large
**Depends on:** Task 5.1

- [ ] Create `/client/src/store/slices/entriesSlice.ts`
- [ ] Define initial state: { entries: {}, loading: false, error: null }
- [ ] Create `createWorkEntry` async thunk
- [ ] Create `fetchEntriesByMonth` async thunk
- [ ] Create `createAbsenceEntry` async thunk (or separate slice)
- [ ] Add reducers for pending/fulfilled/rejected states
- [ ] Export actions and selectors
- [ ] Register in store

**Validation:**
- Thunks call API client correctly
- State updates on success/error
- Selectors return correct data

---

### Task 6.2: Create tasks Redux slice
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Medium
**Depends on:** Task 5.3

- [ ] Create `/client/src/store/slices/tasksSlice.ts`
- [ ] Define initial state: { taskTree: [], loading: false, error: null }
- [ ] Create `fetchTaskTree` async thunk
- [ ] Add reducers
- [ ] Export actions and selectors
- [ ] Register in store

**Validation:**
- Task tree loaded correctly
- Hierarchical structure preserved

---

### Task 6.3: Create time conversion utilities
**Priority:** P0 (Needed for time format conversion)
**Estimated effort:** Small

- [ ] Update `/client/src/features/manual-report/utils/time.ts`
- [ ] Implement `convertTo24Hour(timeValue)` - 12-hour to HH:MM:SS
- [ ] Implement `convertTo12Hour(timeString)` - HH:MM:SS to 12-hour
- [ ] Add unit tests

**Validation:**
- Conversions are accurate
- Edge cases handled (12 AM, 12 PM)

---

## Phase 7: Client UI Integration

### Task 7.1: Connect ManualReportModal to Redux for work entries
**Priority:** P0 (Core user flow)
**Estimated effort:** Large
**Depends on:** Tasks 6.1, 6.3

- [ ] Update `/client/src/features/manual-report/components/ManualReportModal/ManualReportModal.tsx`
- [ ] Import Redux hooks and actions
- [ ] Replace `handleSave()` for work tab:
  - [ ] Build entry data from projectEntries state
  - [ ] Convert times to 24-hour format
  - [ ] Dispatch `createWorkEntry(entryData)`
  - [ ] Handle loading state
  - [ ] Handle success (close modal, show toast)
  - [ ] Handle error (show ErrorBanner)
- [ ] Add loading spinner during submission
- [ ] Add error banner component

**Validation:**
- Entry created on backend
- Modal closes on success
- Errors displayed correctly

---

### Task 7.2: Connect ManualReportModal to Redux for absence entries
**Priority:** P0 (Core user flow)
**Estimated effort:** Medium
**Depends on:** Task 6.1

- [ ] Update ManualReportModal absence tab handler
- [ ] Replace `handleSave()` for absence tab:
  - [ ] Build absence data from AbsenceTab state
  - [ ] Dispatch `createAbsenceEntry(absenceData)`
  - [ ] Handle loading/error states
- [ ] Test single-day and multi-day absences

**Validation:**
- Absence created on backend
- Multi-day ranges create multiple entries
- Errors displayed

---

### Task 7.3: Load task tree when modal opens
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Medium
**Depends on:** Tasks 6.2, 7.1

- [ ] Update ManualReportModal
- [ ] Add useEffect to fetch task tree on modal open
- [ ] Replace hardcoded `projectGroups`, `taskGroups` with task tree data
- [ ] Transform task tree to SelectionGroup format
- [ ] Show loading state while fetching
- [ ] Handle errors (show message if no tasks assigned)

**Validation:**
- Real tasks appear in selectors
- Only assigned tasks shown
- Loading state displayed

---

### Task 7.4: Add error handling UI components
**Priority:** P0 (Required for error UX)
**Estimated effort:** Medium
**Depends on:** Task 1.3

- [ ] Create `/client/src/components/ErrorBanner/ErrorBanner.tsx`
- [ ] Accept error code and details props
- [ ] Display localized error messages based on code
- [ ] Add close button
- [ ] Style with CSS (error colors, icon)
- [ ] Add to ManualReportModal

**Error messages to support:**
- [ ] MONTH_LOCKED: "Cannot save entry - {month} {year} is locked"
- [ ] TASK_NOT_ASSIGNED: "You are not assigned to this task"
- [ ] TIME_FORMAT_MISMATCH: "Time format does not match project requirements"
- [ ] INVALID_TIME_RANGE: "End time must be after start time"
- [ ] NETWORK_ERROR: "Failed to connect to server. Please try again."

**Validation:**
- Error messages display correctly
- Localized (Hebrew translations)
- Dismissable

---

### Task 7.5: Add loading states to ManualReportModal
**Priority:** P1 (Better UX)
**Estimated effort:** Small
**Depends on:** Task 7.1

- [ ] Add loading spinner overlay when submitting
- [ ] Disable save button while loading
- [ ] Show "Saving..." text
- [ ] Prevent modal close while submitting

**Validation:**
- Loading state visible
- Cannot submit twice
- Cannot close during save

---

### Task 7.6: Load entries on HomePage mount
**Priority:** P0 (Core user flow)
**Estimated effort:** Large
**Depends on:** Task 6.1

- [ ] Update `/client/src/pages/Home/HomePage.tsx`
- [ ] Import Redux hooks and actions
- [ ] Replace `loadEntriesForMonth()` with Redux:
  - [ ] useEffect on month change
  - [ ] Dispatch `fetchEntriesByMonth({ year, month })`
  - [ ] Select entries from Redux store
  - [ ] Map to DailyEntry format
- [ ] Handle loading state (show spinner)
- [ ] Handle errors (show error message)

**Validation:**
- Entries load on month change
- Loading spinner shown
- Entries display in calendar

---

### Task 7.7: Transform backend entries to DailyEntry format
**Priority:** P0 (Needed for HomePage display)
**Estimated effort:** Medium
**Depends on:** Task 7.6

- [ ] Create `/client/src/utils/entryTransformers.ts`
- [ ] Implement `transformWorkEntryToDailyEntry(workEntry)`:
  - [ ] Map entry fields to DailyEntry interface
  - [ ] Format times (24-hour to 12-hour)
  - [ ] Calculate total hours from assignments
  - [ ] Map assignments to tasks array
- [ ] Implement `transformAbsenceEntryToDailyEntry(absenceEntry)`
- [ ] Add unit tests

**Validation:**
- Backend data maps correctly
- DailyEntryCard displays entries
- Times formatted correctly

---

## Phase 8: Testing and Validation

### Task 8.1: Write backend unit tests
**Priority:** P1 (Quality assurance)
**Estimated effort:** Large
**Depends on:** Phase 3 (Services)

- [ ] Test entryService:
  - [ ] createWorkEntry success
  - [ ] createWorkEntry with month locked (error)
  - [ ] createWorkEntry with unassigned task (error)
  - [ ] createWorkEntry upsert existing entry
- [ ] Test absenceService:
  - [ ] createAbsenceEntry single day
  - [ ] createAbsenceEntry date range
- [ ] Test taskTreeService:
  - [ ] getUserTaskTree returns assigned tasks only

**Validation:**
- 80%+ code coverage on services
- All error paths tested

---

### Task 8.2: Write backend integration tests
**Priority:** P1 (Quality assurance)
**Estimated effort:** Large
**Depends on:** Phase 4 (Routes)

- [ ] Test POST /api/v1/time-entries:
  - [ ] 201 with valid data
  - [ ] 400 with month locked
  - [ ] 401 without auth
- [ ] Test GET /api/v1/time-entries:
  - [ ] 200 with entries
  - [ ] Empty array if no entries
- [ ] Test POST /api/v1/absences
- [ ] Test GET /api/v1/me/task-tree

**Validation:**
- All endpoints tested
- Status codes correct
- Response formats match spec

---

### Task 8.3: Write client Redux tests
**Priority:** P2 (Quality assurance)
**Estimated effort:** Medium
**Depends on:** Phase 6 (Redux)

- [ ] Test entriesSlice:
  - [ ] createWorkEntry thunk success
  - [ ] createWorkEntry thunk error
  - [ ] fetchEntriesByMonth thunk
- [ ] Test tasksSlice:
  - [ ] fetchTaskTree thunk

**Validation:**
- Thunks dispatch correct actions
- State updates correctly

---

### Task 8.4: Write client component tests
**Priority:** P2 (Quality assurance)
**Estimated effort:** Medium
**Depends on:** Phase 7 (UI)

- [ ] Test ManualReportModal:
  - [ ] Calls createWorkEntry on save
  - [ ] Shows error banner on failure
  - [ ] Loads task tree on open
- [ ] Test HomePage:
  - [ ] Loads entries on mount
  - [ ] Shows loading spinner
  - [ ] Displays entries in calendar

**Validation:**
- User flows tested
- Error states tested

---

### Task 8.5: End-to-end testing
**Priority:** P1 (Quality assurance)
**Estimated effort:** Medium
**Depends on:** Phase 7 (UI)

- [ ] Test complete work entry flow:
  - [ ] Open ManualReportModal
  - [ ] Select project, task, time
  - [ ] Save entry
  - [ ] Verify entry appears on HomePage
- [ ] Test absence entry flow
- [ ] Test error scenarios:
  - [ ] Locked month error
  - [ ] Unassigned task error

**Validation:**
- All user flows work end-to-end
- No console errors
- Data persists correctly

---

### Task 8.6: Localization (Hebrew translations)
**Priority:** P1 (Required for production)
**Estimated effort:** Small

- [ ] Update `/client/src/i18n/locales/he.json`
- [ ] Add error message translations
- [ ] Add loading state translations
- [ ] Test with Hebrew locale

**Validation:**
- All messages translated
- RTL layout correct

---

## Phase 9: Documentation and Deployment

### Task 9.1: Update API documentation
**Priority:** P2 (Documentation)
**Estimated effort:** Small

- [ ] Verify `/openspec/project.md` API documentation matches implementation
- [ ] Add examples with real request/response data
- [ ] Document error codes

**Validation:**
- Documentation accurate
- Examples work

---

### Task 9.2: Add README for manual report feature
**Priority:** P3 (Documentation)
**Estimated effort:** Trivial

- [ ] Create `/client/src/features/manual-report/README.md`
- [ ] Document component structure
- [ ] Document Redux integration
- [ ] Document data flow

**Validation:**
- Developers can understand architecture

---

### Task 9.3: Deploy to staging
**Priority:** P1 (Required before production)
**Estimated effort:** Small

- [ ] Merge to dev branch
- [ ] Verify CI/CD passes
- [ ] Test on staging environment
- [ ] Get QA approval

**Validation:**
- Staging works
- No regressions

---

## Summary

**Total tasks:** 54
**P0 (Blocker):** 25 tasks
**P1 (High):** 14 tasks
**P2 (Medium):** 3 tasks
**P3 (Low):** 1 task

**Estimated timeline:** 2-3 weeks
- Phase 1-2 (Foundation + Backend DB): 2 days
- Phase 3-4 (Backend Services + Routes): 3 days
- Phase 5-6 (Client API + Redux): 2 days
- Phase 7 (UI Integration): 4 days
- Phase 8 (Testing): 3 days
- Phase 9 (Documentation): 1 day

**Key dependencies:**
- Shared types must be completed first
- Backend must be working before client integration
- Redux must be working before UI integration
- Testing can be done in parallel with implementation

**Parallelizable work:**
- Backend and client API client (after shared types done)
- Redux slice and UI components (can be stubbed)
- Tests can be written during implementation
