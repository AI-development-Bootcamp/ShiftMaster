# Spec: Client Entries State Management

**Capability:** `client-entries-state`
**Related to:** `frontend-client`

## ADDED Requirements

### Requirement: The client MUST implement Redux slice for entries with async thunks

The client MUST manage entry state using Redux Toolkit with async thunks for API calls.

#### Scenario: Create work entry thunk dispatches correct actions

**Given:**
- entriesSlice is registered in Redux store
- User is authenticated (auth token in authSlice)

**When:**
- `dispatch(createWorkEntry(entryData))` is called

**Then:**
- Async thunk dispatches pending action:
  - Type: 'entries/createWork/pending'
  - State.loading = true
  - State.error = null
- API call made to POST /api/v1/time-entries with:
  - entryData in request body
  - JWT token in Authorization header
- On success, dispatches fulfilled action:
  - Type: 'entries/createWork/fulfilled'
  - Payload: created entry from API
  - State.entries updated with new entry
  - State.loading = false
- On error, dispatches rejected action:
  - Type: 'entries/createWork/rejected'
  - Payload: error from API (with code, message, details)
  - State.error = payload
  - State.loading = false

---

#### Scenario: Fetch entries by month thunk loads entries

**Given:**
- entriesSlice state has no entries for '2026-01'
- Backend has 5 entries for user in January 2026

**When:**
- `dispatch(fetchEntriesByMonth({ year: 2026, month: 1 }))` is called

**Then:**
- Async thunk makes GET /api/v1/time-entries?startDate=2026-01-01&endDate=2026-01-31
- On success:
  - State.entries['2026-01'] = array of 5 entries
  - State.loading = false
- Entries keyed by month for efficient lookups

---

#### Scenario: Fetch entries with cached data skips API call

**Given:**
- State.entries['2026-01'] already has data
- cacheTimestamp for '2026-01' is less than 5 minutes old

**When:**
- `dispatch(fetchEntriesByMonth({ year: 2026, month: 1, forceRefresh: false }))` is called

**Then:**
- Thunk checks cache
- No API call made
- Existing state returned
- Loading state not triggered

---

#### Scenario: Create entry invalidates month cache

**Given:**
- State.entries['2026-01'] has cached data

**When:**
- `dispatch(createWorkEntry({ work_date: '2026-01-22', ... }))` succeeds

**Then:**
- New entry added to State.entries['2026-01'] array
- Cache timestamp for '2026-01' updated
- HomePage re-renders with new entry visible

---

### Requirement: The client MUST implement Redux slice for task tree

The client MUST manage task tree state for project/task selection.

#### Scenario: Fetch task tree thunk loads hierarchical data

**Given:**
- tasksSlice state has empty taskTree array
- Backend returns 2 projects with 5 total tasks

**When:**
- `dispatch(fetchTaskTree())` is called

**Then:**
- Async thunk makes GET /api/v1/me/task-tree
- On success:
  - State.taskTree = hierarchical array of projects with nested tasks
  - State.loading = false
  - State.lastFetched = timestamp
- Task tree cached for 5 minutes

---

#### Scenario: Selectors extract project groups for SelectionModal

**Given:**
- State.taskTree has projects

**When:**
- Component calls `selectProjectGroups(state)`

**Then:**
- Selector returns array in SelectionGroup format:
  ```typescript
  [
    {
      title: "Projects",
      items: ["Website Redesign", "Mobile App", ...]
    }
  ]
  ```
- Ready to pass to SelectionModal component

---

#### Scenario: Selectors filter tasks by selected project

**Given:**
- State.taskTree has 2 projects with tasks
- User selected project "Website Redesign"

**When:**
- Component calls `selectTasksForProject(state, "Website Redesign")`

**Then:**
- Selector returns only tasks for that project
- Formatted as SelectionGroup:
  ```typescript
  [
    {
      title: "Tasks",
      items: ["Frontend Dev", "API Integration", ...]
    }
  ]
  ```

---

### Requirement: Redux slices MUST implement error state management with error codes

Redux slices MUST store structured error objects with codes for proper error handling.

#### Scenario: API error with MONTH_LOCKED code stored in state

**Given:**
- User attempts to create entry for locked month

**When:**
- API returns 400 with:
  ```json
  {
    "success": false,
    "error": {
      "code": "MONTH_LOCKED",
      "message": "Month is locked",
      "details": { "year": 2026, "month": 1 }
    }
  }
  ```

**Then:**
- Thunk rejected action payload contains full error object
- State.error = { code: 'MONTH_LOCKED', message: '...', details: {...} }
- Component can check error.code to display appropriate UI

---

#### Scenario: Clear error on next action

**Given:**
- State.error has MONTH_LOCKED error from previous attempt

**When:**
- User attempts new action: `dispatch(createWorkEntry(newData))`

**Then:**
- Pending action clears State.error to null
- New error (if any) replaces old error
- Only one error shown at a time

---

### Requirement: The client MUST provide time format conversion utilities

The client MUST convert between 12-hour (UI) and 24-hour (API) time formats.

#### Scenario: Convert 12-hour time to 24-hour for API

**Given:**
- User selects time in UI: { hours: 9, minutes: 30, period: 'AM' }

**When:**
- `convertTo24Hour({ hours: 9, minutes: 30, period: 'AM' })` is called

**Then:**
- Returns '09:30:00'

---

#### Scenario: Convert 12 PM to 24-hour correctly

**Given:**
- User selects { hours: 12, minutes: 0, period: 'PM' }

**When:**
- `convertTo24Hour({ hours: 12, minutes: 0, period: 'PM' })` is called

**Then:**
- Returns '12:00:00' (not '24:00:00')

---

#### Scenario: Convert 12 AM to 24-hour correctly

**Given:**
- User selects { hours: 12, minutes: 0, period: 'AM' }

**When:**
- `convertTo24Hour({ hours: 12, minutes: 0, period: 'AM' })` is called

**Then:**
- Returns '00:00:00'

---

#### Scenario: Convert API time to 12-hour for display

**Given:**
- API returns entry with start_time='14:30:00'

**When:**
- `convertTo12Hour('14:30:00')` is called

**Then:**
- Returns { hours: 2, minutes: 30, period: 'PM' }

---

### Requirement: Redux slices MUST ensure type safety with shared types

Redux slices MUST use shared TypeScript types from /shared for API contracts.

#### Scenario: CreateWorkEntryRequest type enforced in thunk

**Given:**
- Thunk parameter must match CreateWorkEntryRequest interface

**When:**
- Developer calls `createWorkEntry({ invalid_field: 'value' })`

**Then:**
- TypeScript compiler error
- Invalid payload prevented at compile time

---

#### Scenario: API response typed as WorkEntry

**Given:**
- API returns work entry data

**When:**
- Thunk fulfillment receives response

**Then:**
- Payload typed as WorkEntry from shared types
- State.entries array typed as WorkEntry[]
- Components get full type safety when selecting entries

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.
