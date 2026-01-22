# Spec Delta: Clock-Based Time Tracking

**Capability:** `clock-time-tracking`
**Change:** `add-clock-time-tracking`
**Type:** New capability

## ADDED Requirements

### Requirement: Clock-in creates work entry

The system SHALL create a work entry with start_time immediately when the user clocks in.

#### Scenario: User clocks in to start work

**Given** user is authenticated and on the home page
**And** no timer is currently running for the user
**When** user taps "Start Work" button
**Then** POST `/api/v1/entries/clock-in` with `work_date` and `start_time`
**And** backend creates entry with `entry_kind='work'`, `start_time` set, `end_time=null`
**And** response includes `entry_id`
**And** frontend stores entry_id and starts timer display

#### Scenario: Clock-in fails when month is locked

**Given** user attempts to clock in for a date in a locked month
**When** POST `/api/v1/entries/clock-in` is called
**Then** backend returns 403 Forbidden
**And** error message indicates month is locked

#### Scenario: Clock-in fails when existing active timer

**Given** user already has an entry with `end_time=null` for today
**When** user attempts to clock in again
**Then** frontend prevents action with "Active timer already running" message
**Or** backend returns 409 Conflict if frontend check bypassed

---

### Requirement: Clock-out updates entry with end time and task

The system SHALL update the entry with end_time and create task assignment when the user clocks out.

#### Scenario: User clocks out and selects task

**Given** user has active timer running (entry with `end_time=null`)
**When** user taps "Stop Work" button
**Then** frontend displays TaskSelectionModal with assigned tasks only
**When** user selects task and location, then confirms
**Then** PATCH `/api/v1/entries/:id/clock-out` with `end_time`, `task_id`, `location`
**And** backend validates user has `admin_task_assignment` for selected task
**And** backend updates entry with `end_time`
**And** backend creates `entry_assignment` with task, location, and time range
**And** response includes updated entry with assignments

#### Scenario: Clock-out fails without valid task assignment

**Given** user has active timer
**When** user attempts to clock out with task they are not assigned to
**Then** backend returns 403 Forbidden
**And** error message indicates user not assigned to task

#### Scenario: Clock-out validates no time overlap

**Given** user has other entries for the same date
**When** user clocks out with end_time that overlaps existing entry
**Then** backend returns 400 Bad Request
**And** error message indicates time overlap

---

### Requirement: Timer state persists across sessions

The system MUST preserve active timer state when the user closes and reopens the app.

#### Scenario: App recovers active timer on reload

**Given** user clocked in and timer is running
**And** user closes the app (or browser tab)
**When** user reopens the app
**Then** frontend checks localStorage for `activeEntry`
**And** frontend fetches entry from backend to verify it exists
**And** frontend resumes timer display with elapsed time calculated from `start_time`

#### Scenario: App clears timer state after clock-out

**Given** user clocked out successfully
**Then** frontend removes `activeEntry` from localStorage
**And** timer display resets to "Start Work" button

---

### Requirement: Task selection shows assigned tasks only

The task selection modal MUST show only tasks for which the user has active admin_task_assignment.

#### Scenario: Modal displays user's assigned tasks

**Given** user taps "Stop Work" button
**When** TaskSelectionModal opens
**Then** frontend fetches tasks from GET `/api/v1/tasks/assigned`
**And** modal displays tasks grouped by project
**And** only tasks with active `admin_task_assignment` for user are shown

#### Scenario: User searches for task in modal

**Given** TaskSelectionModal is open with task list
**When** user types in search box
**Then** task list filters by task name or project name

---

### Requirement: Multiple work sessions create separate entries

The system SHALL create separate entry rows when users clock in multiple times on the same day.

#### Scenario: User clocks in twice on same day

**Given** user clocked in, selected task, and clocked out successfully
**And** all entries are complete (have `end_time` and task)
**When** user clocks in again on the same day
**Then** backend creates new entry row with new `entry_id`
**And** frontend treats it as separate session

#### Scenario: User sees multiple sessions in timeline

**Given** user has two complete entries for same `work_date`
**When** user views timeline
**Then** frontend displays one card for the date
**And** card shows total time (sum of both sessions)
**And** expanding card shows both sessions individually

---

### Requirement: Daily work time limits

The system MUST enforce a 24-hour maximum total work time per user per day.

#### Scenario: Clock-out exceeds 24-hour daily limit

**Given** user already has 20 hours of entries for today
**When** user attempts to clock out after 5 more hours
**Then** backend returns 400 Bad Request
**And** error message indicates daily limit exceeded

#### Scenario: Clock-out creates valid non-overlapping session

**Given** user has entry from 09:00-12:00 today
**When** user clocks in at 13:00 and clocks out at 17:00
**Then** backend validates no overlap
**And** entry saves successfully

---

### Requirement: Time editing after entry creation

The system SHALL allow users to edit start_time and end_time after the entry is complete.

#### Scenario: User edits completed entry times

**Given** user has completed entry with `start_time=09:00`, `end_time=17:00`
**When** user taps entry in timeline and edits times to `start_time=09:30`, `end_time=16:30`
**Then** PATCH `/api/v1/entries/:id` with new times
**And** backend validates no overlap with other entries
**And** backend validates new times within 24-hour limit
**And** backend updates entry and recalculates `entry_assignment` times

#### Scenario: Edit fails for active timer

**Given** user has entry with `end_time=null` (timer running)
**When** user attempts to edit the entry
**Then** frontend disables edit action
**Or** backend returns 400 Bad Request if frontend bypassed
**And** error message indicates must clock out first

---

### Requirement: Manual entry flow support

The system MUST continue to support manual entry creation without using clock-in/clock-out workflow.

#### Scenario: User creates manual entry with all fields

**Given** user taps "Manual Report" button
**When** user fills form with `work_date`, `start_time`, `end_time`, task, location
**And** submits form
**Then** POST `/api/v1/entries` (existing endpoint)
**And** backend creates complete entry with assignment in single transaction
**And** timeline refreshes to show new entry

#### Scenario: Manual entry validates like clock-out

**Given** user creates manual entry
**Then** backend applies same validations (overlap, 24-hour limit, task assignment, month lock)
