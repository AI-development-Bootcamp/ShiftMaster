# Tasks: Integrate Client Time Entries with Backend (UPDATED)

**Change ID:** `integrate-client-time-entries`

## ✅ Already Implemented (Skip These)

The following are **already complete** in the codebase:

### Database Layer (DONE)
- ✅ EntryRepository with findByUserIdAndDate, findByUserIdAndDateRange
- ✅ EntryAssignmentRepository with findByEntryId
- ✅ TaskRepository with findByProjectId, findActive
- ✅ MonthLockRepository with findByYearAndMonth, isMonthLocked
- ✅ AdminTaskAssignmentRepository with findByUserId, findByTaskId
- ✅ All entity types (Entry, EntryAssignment, Task, etc.) from database.types.ts
- ✅ BaseRepository with CRUD operations

### Existing Services & Controllers
- ✅ assignmentsService (for admin task assignments)
- ✅ tasksService, projectsService, clientsService, usersService
- ✅ Corresponding controllers and routes

---

## Task Breakdown (What Needs to be Done)

Tasks are ordered to deliver user-visible progress incrementally.

---

## Phase 1: Shared Types and Error Codes (Foundation)

### Task 1.1: Define shared types for entries
**Priority:** P0 (Blocker for all other tasks)
**Estimated effort:** Small

- [x] Create `/shared/src/types/entries.ts`
- [x] Define `CreateWorkEntryRequest` interface
- [x] Define `WorkEntryResponse` interface (extends backend Entry type)
- [x] Define `EntryAssignmentInput` interface for request
- [x] Define `EntryAssignmentResponse` interface for response (with joined data)
- [x] Re-export WorkLocation from backend types
- [x] Export all types from `/shared/src/types/index.ts`

**Validation:**
- TypeScript compilation passes
- Types are importable in both client and server

---

### Task 1.2: Define shared types for absences
**Priority:** P0 (Blocker for absence features)
**Estimated effort:** Small

- [x] Create `/shared/src/types/absences.ts`
- [x] Define `CreateAbsenceEntryRequest` interface (single day or range)
- [x] Define `AbsenceEntryResponse` interface
- [x] Re-export AbsenceType from backend types
- [x] Export all types from `/shared/src/types/index.ts`

**Validation:**
- TypeScript compilation passes
- Types are importable in both client and server

---

### Task 1.3: Define error codes and types
**Priority:** P0 (Blocker for error handling)
**Estimated effort:** Small

- [x] Create `/shared/src/types/errors.ts`
- [x] Define `EntryErrorCode` enum (MONTH_LOCKED, TASK_NOT_ASSIGNED, TIME_FORMAT_MISMATCH, etc.)
- [x] Define `ApiError` interface
- [x] Define `ValidationError` interface
- [x] Export from `/shared/src/types/index.ts`

**Validation:**
- Error codes are comprehensive
- TypeScript compilation passes

---

## Phase 2: Backend Services (Business Logic)

### Task 2.1: Create month lock service utility
**Priority:** P0 (Blocker for entry creation)
**Estimated effort:** Small

- [x] Create `/server/src/services/monthLockService.ts`
- [x] Implement `checkLocked(workDate)` - Throws error if locked
- [x] Use existing MonthLockRepository
- [x] Parse year/month from work_date
- [x] Throw custom error with MONTH_LOCKED code if locked

**Validation:**
- Throws error for locked months
- Allows unlocked months
- Includes year/month in error details

---

### Task 2.2: Create task assignment verification service utility
**Priority:** P0 (Blocker for work entries)
**Estimated effort:** Small

- [x] Create `/server/src/services/taskAssignmentVerification.ts` (or add to existing assignmentsService)
- [x] Implement `verifyUserAssignedToTasks(userId, taskIds)` - Throws if not assigned
- [x] Use existing AdminTaskAssignmentRepository
- [x] Check active=true for all task IDs
- [x] Throw custom error with TASK_NOT_ASSIGNED code if any task not assigned

**Validation:**
- Rejects unassigned tasks
- Allows assigned tasks
- Handles multiple tasks correctly

---

### Task 2.3: Create time format validation service
**Priority:** P0 (Blocker for work entries)
**Estimated effort:** Medium

- [x] Create `/server/src/services/timeFormatValidation.ts`
- [x] Implement `validateAssignmentTimeFormat(assignment, projectTimeFormat)` - Validates time fields
- [x] If time_format_type === 'start_end': require start_time, end_time
- [x] If time_format_type === 'sum': require duration_minutes
- [x] Throw custom error with TIME_FORMAT_MISMATCH code if invalid

**Validation:**
- Rejects mismatched formats
- Accepts correct formats
- Clear error messages

---

### Task 2.4: Create entry service for work entries
**Priority:** P0 (Blocker for work entry endpoint)
**Estimated effort:** Large

- [x] Create `/server/src/services/entriesService.ts`
- [x] Use existing EntryRepository, EntryAssignmentRepository
- [x] Implement `createWorkEntry(userId, entryData)`:
  - [x] Check month not locked (use monthLockService)
  - [x] Verify user assigned to all tasks (use taskAssignmentVerification)
  - [x] Fetch projects for tasks to get time_format_type
  - [x] Validate time formats (use timeFormatValidation)
  - [x] Check for existing entry with findByUserIdAndDate (upsert logic)
  - [x] Create entry + assignments in transaction
  - [x] Return created entry with assignments joined
- [x] Implement `getEntriesByDateRange(userId, startDate, endDate)`:
  - [x] Query entries with date filter
  - [x] Join assignments using EntryAssignmentRepository
  - [x] Join tasks/projects for assignment details
  - [x] Return formatted data
- [x] Add comprehensive error handling

**Validation:**
- Creates entry with assignments
- Upserts existing entry for same date
- Enforces all business rules
- Transaction rolls back on error

---

### Task 2.5: Create absence service
**Priority:** P0 (Blocker for absence endpoint)
**Estimated effort:** Medium

- [x] Create `/server/src/services/absencesService.ts`
- [x] Use existing EntryRepository
- [x] Implement `createAbsenceEntry(userId, absenceData)`:
  - [x] Check month not locked for all dates in range (use monthLockService)
  - [x] If date range provided, create multiple entries (loop per day)
  - [x] If single date, create one entry
  - [x] Handle upsert for existing entries (use findByUserIdAndDate)
  - [x] Return created entry/entries
- [x] Implement `getAbsencesByDateRange(userId, startDate, endDate)`
- [x] Add validation for absence_type enum

**Validation:**
- Creates single-day absence
- Creates multi-day absence (range)
- Upserts existing entries
- Enforces month lock check for all dates

---

### Task 2.6: Create task tree service
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Medium

- [x] Create `/server/src/services/taskTreeService.ts`
- [x] Use existing AdminTaskAssignmentRepository, TaskRepository, ProjectRepository
- [x] Implement `getUserTaskTree(userId, options?)`:
  - [x] Get user's active admin_task_assignments
  - [x] Join with tasks and projects
  - [x] Group tasks by project
  - [x] Include project metadata (time_format_type, client_name, etc.)
  - [x] Filter by active if !includeInactive
  - [x] Return hierarchical structure (projects → tasks)
- [x] Support query filters (includeInactive, projectId)

**Validation:**
- Returns hierarchical structure
- Only active, assigned tasks (when includeInactive=false)
- Includes all necessary project metadata

---

## Phase 3: Backend Controllers and Routes

### Task 3.1: Create time entries controller
**Priority:** P0 (Blocker for time entries API)
**Estimated effort:** Medium

- [x] Create `/server/src/controllers/timeEntriesController.ts`
- [x] Implement `create(req, res)`:
  - [x] Parse request body
  - [x] Extract userId from req.user (JWT from existing auth middleware)
  - [x] Call entriesService.createWorkEntry()
  - [x] Return 201 with created entry
  - [x] Handle errors (400, 500) with consistent error format
- [x] Implement `list(req, res)`:
  - [x] Parse query params (startDate, endDate)
  - [x] Extract userId from req.user
  - [x] Call entriesService.getEntriesByDateRange()
  - [x] Return 200 with entries array
- [x] Add input validation middleware (or inline validation)

**Validation:**
- Returns correct status codes
- Handles validation errors
- Returns consistent response format matching project.md API spec

---

### Task 3.2: Create absences controller
**Priority:** P0 (Blocker for absences API)
**Estimated effort:** Medium

- [x] Create `/server/src/controllers/absencesController.ts`
- [x] Implement `create(req, res)`:
  - [x] Parse request body (work_date or start_date/end_date)
  - [x] Extract userId from req.user
  - [x] Call absencesService.createAbsenceEntry()
  - [x] Return 201 with created entry/entries
- [x] Implement `list(req, res)`:
  - [x] Parse query params (startDate, endDate, absenceType filter)
  - [x] Call absencesService.getAbsencesByDateRange()
  - [x] Return 200 with absences array
- [x] Add input validation

**Validation:**
- Handles single-day and range requests
- Returns correct response format
- Validates absence_type enum

---

### Task 3.3: Create me controller for user-specific endpoints
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small

- [x] Create `/server/src/controllers/meController.ts`
- [x] Implement `getTaskTree(req, res)`:
  - [x] Extract userId from req.user
  - [x] Parse query params (includeInactive, projectId)
  - [x] Call taskTreeService.getUserTaskTree()
  - [x] Return 200 with task tree
- [x] Optional: Implement `getProfile(req, res)` if not already in usersController

**Validation:**
- Returns user's assigned tasks only
- Respects filter parameters
- Returns consistent format

---

### Task 3.4: Create time entries routes
**Priority:** P0 (Blocker for client integration)
**Estimated effort:** Small

- [x] Create `/server/src/routes/time-entries.ts`
- [x] Import existing authenticate middleware
- [x] Add `POST /api/v1/time-entries` → timeEntriesController.create
- [x] Add `GET /api/v1/time-entries` → timeEntriesController.list
- [x] Export router

**Validation:**
- Routes accessible at correct paths
- Authentication required
- Returns from controllers work

---

### Task 3.5: Create absences routes
**Priority:** P0 (Blocker for client integration)
**Estimated effort:** Small

- [x] Create `/server/src/routes/absences.ts`
- [x] Import authenticate middleware
- [x] Add `POST /api/v1/absences` → absencesController.create
- [x] Add `GET /api/v1/absences` → absencesController.list
- [x] Export router

**Validation:**
- Routes accessible
- Authentication required

---

### Task 3.6: Create me routes
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small

- [x] Create `/server/src/routes/me.ts`
- [x] Import authenticate middleware
- [x] Add `GET /api/v1/me/task-tree` → meController.getTaskTree
- [x] Optional: Add `GET /api/v1/me` → meController.getProfile (if needed)
- [x] Export router

**Validation:**
- Routes accessible
- Returns user-specific data

---

### Task 3.7: Register routes in main server
**Priority:** P0 (Blocker for endpoints to work)
**Estimated effort:** Trivial

- [x] Update `/server/src/routes/index.ts`
- [x] Import time-entries, absences, me routes
- [x] Register routes with app (matching existing pattern)
- [x] Test that endpoints are accessible

**Validation:**
- All routes accessible via Postman/curl
- 401 without auth token
- 200/201 with valid requests

---

## Phase 4: Client API Client Layer

### Task 4.1: Create entries API client
**Priority:** P0 (Blocker for Redux integration)
**Estimated effort:** Medium

- [x] Create `/shared/src/api/entriesApi.ts`
- [x] Implement `createWork(entryData, token)` - POST /api/v1/time-entries
- [x] Implement `getByMonth(year, month, token)` - GET /api/v1/time-entries
- [x] Add error parsing (map backend errors to EntryErrorCode)
- [x] Add request/response type checking with shared types
- [x] Export functions

**Validation:**
- Functions call correct endpoints
- Errors are parsed correctly
- TypeScript types match shared types

---

### Task 4.2: Create absences API client
**Priority:** P0 (Blocker for Redux integration)
**Estimated effort:** Small

- [x] Create `/shared/src/api/absencesApi.ts`
- [x] Implement `create(absenceData, token)` - POST /api/v1/absences
- [x] Implement `getByMonth(year, month, token)` - GET /api/v1/absences
- [x] Add error parsing
- [x] Export functions

**Validation:**
- Functions call correct endpoints
- Handles single-day and range requests

---

### Task 4.3: Create tasks API client
**Priority:** P1 (Needed for task tree)
**Estimated effort:** Small

- [x] Create `/shared/src/api/tasksApi.ts`
- [x] Implement `getTaskTree(token)` - GET /api/v1/me/task-tree
- [x] Add error parsing
- [x] Export function

**Validation:**
- Returns hierarchical task tree
- Parses errors correctly

---

## Phase 5: Client Redux Integration

### Task 5.1: Create entries Redux slice
**Priority:** P0 (Blocker for UI integration)
**Estimated effort:** Large

- [x] Create `/client/src/store/slices/entriesSlice.ts`
- [x] Define initial state: { entries: {}, loading: false, error: null }
- [x] Create `createWorkEntry` async thunk
- [x] Create `fetchEntriesByMonth` async thunk
- [x] Create `createAbsenceEntry` async thunk
- [x] Add reducers for pending/fulfilled/rejected states
- [x] Export actions and selectors
- [x] Register in store index.ts

**Validation:**
- Thunks call API client correctly (with token from authSlice)
- State updates on success/error
- Selectors return correct data

---

### Task 5.2: Create tasks Redux slice
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Medium

- [x] Create `/client/src/store/slices/tasksSlice.ts`
- [x] Define initial state: { taskTree: [], loading: false, error: null }
- [x] Create `fetchTaskTree` async thunk
- [x] Add reducers
- [x] Export actions and selectors (including project/task group formatters)
- [x] Register in store

**Validation:**
- Task tree loaded correctly
- Hierarchical structure preserved

---

### Task 5.3: Create time conversion utilities
**Priority:** P0 (Needed for time format conversion)
**Estimated effort:** Small

- [ ] Update `/client/src/features/manual-report/utils/time.ts`
- [ ] Implement `convertTo24Hour(timeValue)` - 12-hour to HH:MM:SS
- [ ] Implement `convertTo12Hour(timeString)` - HH:MM:SS to 12-hour
- [ ] Handle edge cases (12 AM → 00:00, 12 PM → 12:00)
- [ ] Add unit tests

**Validation:**
- Conversions are accurate
- Edge cases handled correctly

---

## Phase 6: Client UI Integration

### Task 6.1: Connect ManualReportModal to Redux for work entries
**Priority:** P0 (Core user flow)
**Estimated effort:** Large

- [ ] Update `/client/src/features/manual-report/components/ManualReportModal/ManualReportModal.tsx`
- [ ] Import Redux hooks, actions, selectors
- [ ] Replace `handleSave()` for work tab:
  - [ ] Build entry data from projectEntries state
  - [ ] Convert times to 24-hour format (use convertTo24Hour)
  - [ ] Dispatch `createWorkEntry(entryData)`
  - [ ] Handle loading state (disable save button)
  - [ ] Handle success (close modal, show success message)
  - [ ] Handle error (show ErrorBanner with error.code)
- [ ] Add loading spinner during submission
- [ ] Add ErrorBanner component

**Validation:**
- Entry created on backend
- Modal closes on success
- Errors displayed correctly with localized messages

---

### Task 6.2: Connect ManualReportModal to Redux for absence entries
**Priority:** P0 (Core user flow)
**Estimated effort:** Medium

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

### Task 6.3: Load task tree when modal opens
**Priority:** P1 (Needed for task selection)
**Estimated effort:** Medium

- [x] Update ManualReportModal
- [x] Add useEffect to fetch task tree on modal open (if not cached)
- [x] Replace hardcoded `projectGroups`, `taskGroups` with task tree data from Redux
- [x] Transform task tree to SelectionGroup format using selectors
- [ ] Show loading state while fetching
- [ ] Handle errors (show message if no tasks assigned)

**Validation:**
- Real tasks appear in selectors
- Only assigned tasks shown
- Loading state displayed

---

### Task 6.4: Add error handling UI components
**Priority:** P0 (Required for error UX)
**Estimated effort:** Medium

- [x] Create `/client/src/components/ErrorBanner/ErrorBanner.tsx`
- [x] Accept error code and details props
- [x] Display localized error messages based on EntryErrorCode
- [x] Add close button
- [x] Style with CSS (error colors, icon)
- [ ] Add to ManualReportModal

**Error messages to support (Hebrew):**
- [x] MONTH_LOCKED: "לא ניתן לשמור דיווח - {month} {year} נעול"
- [x] TASK_NOT_ASSIGNED: "אינך משובץ למשימה: {taskName}"
- [x] TIME_FORMAT_MISMATCH: "פורמט שעות שגוי - פרויקט זה דורש {format}"
- [x] INVALID_TIME_RANGE: "שעת סיום חייבת להיות אחרי שעת התחלה"
- [x] NETWORK_ERROR: "שגיאת רשת - נסה שנית"

**Validation:**
- Error messages display correctly
- Localized (Hebrew translations added to he.json)
- Dismissable

---

### Task 6.5: Add loading states to ManualReportModal
**Priority:** P1 (Better UX)
**Estimated effort:** Small

- [ ] Add loading spinner overlay when submitting
- [ ] Disable save button while loading (text: "שומר...")
- [ ] Prevent modal close while submitting

**Validation:**
- Loading state visible
- Cannot submit twice
- Cannot close during save

---

### Task 6.6: Load entries on HomePage mount
**Priority:** P0 (Core user flow)
**Estimated effort:** Large

- [x] Update `/client/src/pages/Home/HomePage.tsx`
- [x] Import Redux hooks, actions, selectors
- [x] Replace `loadEntriesForMonth()` with Redux:
  - [x] useEffect on currentMonthIndex/currentYear change
  - [x] Dispatch `fetchEntriesByMonth({ year, month })`
  - [x] Select entries from Redux store for that month
  - [x] Map entries to DailyEntry format (use transformer utility)
- [x] Handle loading state (show spinner)
- [ ] Handle errors (show error message)

**Validation:**
- Entries load on month change
- Loading spinner shown
- Entries display in calendar

---

### Task 6.7: Transform backend entries to DailyEntry format
**Priority:** P0 (Needed for HomePage display)
**Estimated effort:** Medium

- [x] Create `/client/src/utils/entryTransformers.ts`
- [x] Implement `transformWorkEntryToDailyEntry(workEntry)`:
  - [x] Map entry fields to DailyEntry interface
  - [x] Convert times from 24-hour to display format (use convertTo12Hour)
  - [x] Calculate total hours from assignments
  - [x] Map assignments to tasks array
  - [x] Extract projects list
- [x] Implement `transformAbsenceEntryToDailyEntry(absenceEntry)`:
  - [x] Map to DailyEntry with type from absence_type
  - [x] Include emoji for absence type
- [ ] Add unit tests

**Validation:**
- Backend data maps correctly to DailyEntry format
- DailyEntryCard displays entries properly
- Times formatted correctly for display

---

## Phase 7: Testing and Validation

### Task 7.1: Write backend unit tests for services
**Priority:** P1 (Quality assurance)
**Estimated effort:** Large

- [ ] Test entriesService:
  - [ ] createWorkEntry success
  - [ ] createWorkEntry with month locked (error)
  - [ ] createWorkEntry with unassigned task (error)
  - [ ] createWorkEntry upsert existing entry
- [ ] Test absencesService:
  - [ ] createAbsenceEntry single day
  - [ ] createAbsenceEntry date range
- [ ] Test taskTreeService:
  - [ ] getUserTaskTree returns assigned tasks only

**Validation:**
- 80%+ code coverage on services
- All error paths tested

---

### Task 7.2: Write backend integration tests
**Priority:** P1 (Quality assurance)
**Estimated effort:** Large

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
- Response formats match API spec

---

### Task 7.3: Write client Redux tests
**Priority:** P2 (Quality assurance)
**Estimated effort:** Medium

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

### Task 7.4: Write client component tests
**Priority:** P2 (Quality assurance)
**Estimated effort:** Medium

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

### Task 7.5: End-to-end testing
**Priority:** P1 (Quality assurance)
**Estimated effort:** Medium

- [ ] Test complete work entry flow:
  - [ ] Login as user
  - [ ] Open ManualReportModal
  - [ ] Select project, task, time (real data from task tree)
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

### Task 7.6: Localization (Hebrew translations)
**Priority:** P1 (Required for production)
**Estimated effort:** Small

- [ ] Update `/client/src/i18n/locales/he.json`
- [ ] Add error message translations for all EntryErrorCode values
- [ ] Add loading state translations ("שומר...", etc.)
- [ ] Test with Hebrew locale

**Validation:**
- All messages translated
- RTL layout correct

---

## Phase 8: Documentation and Deployment

### Task 8.1: Update API documentation
**Priority:** P2 (Documentation)
**Estimated effort:** Small

- [ ] Verify `/openspec/project.md` API documentation matches implementation
- [ ] Add examples with real request/response data from tests
- [ ] Document error codes and their meanings

**Validation:**
- Documentation accurate
- Examples work

---

### Task 8.2: Deploy to staging
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

**Total tasks:** 47 (reduced from 54 - removed 7 database layer tasks)
**P0 (Blocker):** 21 tasks
**P1 (High):** 13 tasks
**P2 (Medium):** 3 tasks

**Estimated timeline:** 1.5-2 weeks (reduced from 2-3 weeks)
- Phase 1 (Shared types): 1 day
- Phase 2 (Services): 3 days
- Phase 3 (Controllers + Routes): 2 days
- Phase 4 (Client API): 1 day
- Phase 5 (Redux): 2 days
- Phase 6 (UI Integration): 3 days
- Phase 7 (Testing): 2 days
- Phase 8 (Documentation): 1 day

**Key dependencies:**
- Shared types must be completed first
- Services must be working before controllers
- Controllers/routes must be working before client integration
- Redux must be working before UI integration
- Testing can be done in parallel with implementation

**Parallelizable work:**
- Client API client and Redux slice (after shared types done)
- UI components can be stubbed while backend is being built
- Tests can be written during implementation
