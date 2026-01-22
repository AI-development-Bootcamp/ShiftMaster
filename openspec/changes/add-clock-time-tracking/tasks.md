# Tasks: Add Clock-Based Time Tracking

**Change ID:** `add-clock-time-tracking`

## Implementation Checklist

### Backend: Clock-In/Clock-Out API

- [x] **Create entries routes for clock operations**
  - Add `POST /api/v1/entries/clock-in` route
  - Add `PATCH /api/v1/entries/:id/clock-out` route
  - Register routes in `server/src/routes/index.ts`

- [x] **Implement entriesController clock methods**
  - `clockIn()` - Creates entry with start_time only
  - `clockOut()` - Updates entry with end_time and creates assignment
  - Validate month locks in both methods
  - Return proper error codes (403 for locked, 409 for conflicts)

- [ ] **Create entriesService business logic**
  - `createClockEntry()` - Insert entry with start_time
  - `updateClockOutEntry()` - Update entry and create assignment in transaction
  - `validateNoActiveTimer()` - Check for existing entry without end_time
  - `validateTimeOverlap()` - Check new times don't overlap existing entries
  - `validateDailyLimit()` - Check total time doesn't exceed 24 hours
  - `validateTaskAssignment()` - Check user has admin_task_assignment for task

- [ ] **Add database queries in entriesService**
  - Query to find active timer: `SELECT * FROM entries WHERE user_id=? AND end_time IS NULL`
  - Query to find overlapping entries: check time ranges for same user+date
  - Query to calculate daily total: sum durations for user+date

### Backend: Unified Timeline API

- [ ] **Create timeline endpoint**
  - Add `GET /api/v1/entries/timeline` route
  - Register in routes file

- [ ] **Implement timelineController**
  - Parse query params: `user_id`, `start_date`, `end_date`
  - Validate admin access if user_id provided
  - Default to current month if no dates
  - Call service and return formatted response

- [ ] **Create timelineService**
  - `getTimeline(userId, startDate?, endDate?)` - Main query function
  - SQL query with LEFT JOINs: `entries → entry_assignments → tasks → projects`
  - Group results by work_date in application code
  - Calculate `total_work_minutes` per day
  - Mark entries as `is_active` if end_time is null
  - Check month_locks and add `is_locked` flag

- [ ] **Optimize timeline query**
  - Add database index on `(user_id, work_date)`
  - Ensure query uses LIMIT/OFFSET for large ranges
  - Test performance with mock data (100+ entries)

### Backend: Testing

- [ ] **Write unit tests for entriesService**
  - Test `createClockEntry()` creates entry correctly
  - Test `validateNoActiveTimer()` detects existing timer
  - Test `validateTimeOverlap()` catches overlaps
  - Test `validateDailyLimit()` enforces 24-hour rule
  - Test `validateTaskAssignment()` checks assignments

- [ ] **Write integration tests for clock-in/clock-out**
  - Test POST `/api/v1/entries/clock-in` creates entry
  - Test PATCH `/api/v1/entries/:id/clock-out` updates and assigns task
  - Test clock-in fails on locked month (403)
  - Test clock-out fails without valid task assignment (403)
  - Test clock-out fails on time overlap (400)

- [ ] **Write integration tests for timeline**
  - Test GET `/api/v1/entries/timeline` returns grouped entries
  - Test filtering by date range works correctly
  - Test admin can fetch other user's timeline
  - Test regular user cannot fetch other's timeline (403)
  - Test timeline includes all fields (tasks, projects, assignments)

### Frontend: Redux State Management

- [ ] **Create timerSlice**
  - State: `activeEntry`, `isRunning`, `elapsedSeconds`
  - Actions: `setActiveEntry`, `clearActiveEntry`, `updateElapsed`
  - Thunks: `clockIn()`, `clockOut()`, `resumeTimer()`

- [ ] **Create timelineSlice**
  - State: `timeline` (array of TimelineDay), `loading`, `error`
  - Actions: `setTimeline`, `setLoading`, `setError`, `toggleDayExpanded`
  - Thunks: `fetchTimeline(startDate, endDate)`

- [ ] **Add API client methods**
  - `apiClient.clockIn(workDate, startTime)`
  - `apiClient.clockOut(entryId, endTime, taskId, location)`
  - `apiClient.getTimeline(startDate?, endDate?, userId?)`
  - `apiClient.getAssignedTasks()`

### Frontend: Timer Display Component

- [ ] **Create TimerDisplay component**
  - Display "Start Work" button when no active timer
  - Display running timer with HH:MM:SS when active
  - Display "Stop Work" button when timer running
  - Store entry_id in localStorage on clock-in
  - Clear localStorage on clock-out

- [ ] **Implement timer logic**
  - Use `setInterval` to update elapsed time every second
  - Calculate elapsed from `start_time` to current time
  - Format elapsed as HH:MM:SS
  - Handle app reload: check localStorage and resume timer

- [ ] **Add timer persistence**
  - On clock-in: save `{ entry_id, start_time }` to localStorage
  - On app mount: check localStorage, fetch entry, resume if exists
  - On clock-out: clear localStorage

### Frontend: Task Selection Modal

- [ ] **Create TaskSelectionModal component**
  - Display modal when user clicks "Stop Work"
  - Fetch assigned tasks on mount
  - Group tasks by project
  - Allow user to select task and location
  - Disable "Confirm" until task selected
  - Close modal and trigger clock-out thunk on confirm

- [ ] **Add task search functionality**
  - Add search input in modal
  - Filter tasks by name or project name
  - Highlight matching text

### Frontend: Timeline List Component

- [ ] **Create TimelineList component**
  - Fetch timeline on mount with current month
  - Display loading spinner while fetching
  - Display error message if fetch fails
  - Render DayCard for each date in timeline

- [ ] **Create DayCard component**
  - Display date and total work time
  - Display expand/collapse icon
  - Show count of entries and absences
  - Render WorkSessionList and AbsenceList when expanded
  - Toggle `isExpanded` state on click

- [ ] **Create WorkSessionItem component**
  - Display entry start_time, end_time, duration
  - Display task name and project name
  - Display location badge
  - Add "Edit" button (opens edit modal)
  - Disable edit if entry is locked or active

- [ ] **Create AbsenceItem component**
  - Display absence_type with icon
  - Display description if present
  - Show attachment link if present

### Frontend: Entry Edit Flow

- [ ] **Create EntryEditModal component**
  - Pre-fill form with current start_time and end_time
  - Allow user to adjust times
  - Validate end_time > start_time
  - Submit PATCH request on save
  - Refresh timeline on success

- [ ] **Add frontend validation**
  - Warn if new times overlap with other entries
  - Warn if total time exceeds 24 hours
  - Disable save if validation fails

### Frontend: Testing

- [ ] **Write component tests for TimerDisplay**
  - Test "Start Work" button triggers clock-in
  - Test timer updates every second
  - Test "Stop Work" button opens task modal
  - Test localStorage saves/clears correctly

- [ ] **Write component tests for TaskSelectionModal**
  - Test modal displays assigned tasks
  - Test task selection enables confirm button
  - Test confirm triggers clock-out
  - Test search filters tasks

- [ ] **Write component tests for TimelineList**
  - Test timeline fetches on mount
  - Test DayCard renders correctly
  - Test expand/collapse toggles
  - Test WorkSessionItem displays entry details

- [ ] **Write Redux slice tests**
  - Test timerSlice actions update state
  - Test timelineSlice actions update state
  - Test thunks call API correctly

### Documentation

- [ ] **Update openspec/project.md**
  - Document `POST /api/v1/entries/clock-in` endpoint
  - Document `PATCH /api/v1/entries/:id/clock-out` endpoint
  - Document `GET /api/v1/entries/timeline` endpoint
  - Add request/response examples
  - Document error codes

- [ ] **Update API Swagger docs**
  - Add clock-in endpoint to Swagger
  - Add clock-out endpoint to Swagger
  - Add timeline endpoint to Swagger

### E2E Testing

- [ ] **Write E2E test for clock workflow**
  - User logs in
  - User clicks "Start Work"
  - Timer starts and entry created
  - User clicks "Stop Work"
  - User selects task and confirms
  - Entry updates and appears in timeline

- [ ] **Write E2E test for multiple sessions**
  - User clocks in/out twice on same day
  - Timeline shows one card with two sessions
  - Total time is sum of both sessions

- [ ] **Write E2E test for manual entry**
  - User creates manual entry with form
  - Entry appears in timeline
  - Manual entry and clock entry coexist

## Dependency Order

These tasks must be completed sequentially:

1. Backend routes → controllers → services → tests (can't test without implementation)
2. Frontend Redux slices before components (components depend on state)
3. TimerDisplay before TaskSelectionModal (modal triggered by timer)
4. TimelineList components before E2E tests (need UI to test)

## Parallelizable Work

These tasks can be done in parallel:

- Backend clock-in/out implementation AND timeline implementation (independent features)
- Frontend timer components AND timeline components (separate UI areas)
- Unit tests while implementing (TDD approach)
- Documentation alongside implementation
