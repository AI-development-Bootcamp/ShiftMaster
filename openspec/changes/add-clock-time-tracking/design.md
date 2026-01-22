# Design: Clock-Based Time Tracking

## Architecture Overview

This feature adds clock-in/clock-out time tracking on top of the existing unified `entries` table without schema changes.

## Data Model (No Changes)

We continue using the existing `entries` table schema:

```
entries
├── entry_id (PK)
├── user_id (FK)
├── entry_kind ('work' | 'absence')
├── work_date (DATE)
├── start_time (TIME, nullable)
├── end_time (TIME, nullable)
├── absence_type (nullable, for absence entries)
└── ... (other fields)

entry_assignments
├── entry_assignment_id (PK)
├── entry_id (FK)
├── task_id (FK)
├── location (work_location)
└── ... (time fields based on project format)
```

### Entry Lifecycle States

A work entry can exist in three states:

1. **Active Timer** - Has `start_time`, no `end_time`, no task assignment
2. **Stopped (Incomplete)** - Has `start_time` and `end_time`, but no task assignment yet
3. **Complete** - Has `start_time`, `end_time`, and task assignment(s)

## API Design

### Clock-Based Endpoints

#### POST /api/v1/entries/clock-in
Creates entry with start_time only.

**Request:**
```json
{
  "work_date": "2026-01-22",
  "start_time": "09:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry_id": 123,
    "user_id": "uuid",
    "entry_kind": "work",
    "work_date": "2026-01-22",
    "start_time": "09:00:00",
    "end_time": null
  }
}
```

#### PATCH /api/v1/entries/:id/clock-out
Updates entry with end_time and creates task assignment.

**Request:**
```json
{
  "end_time": "17:00:00",
  "task_id": 456,
  "location": "Office"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry_id": 123,
    "work_date": "2026-01-22",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "assignments": [{
      "entry_assignment_id": 789,
      "task_id": 456,
      "location": "Office",
      "start_time": "09:00:00",
      "end_time": "17:00:00"
    }]
  }
}
```

### Unified Timeline Endpoint

#### GET /api/v1/entries/timeline
Returns all entries (work + absence) for a user, grouped by date.

**Query Parameters:**
- `user_id` (admin only, optional) - View another user's timeline
- `start_date` (optional) - Filter from date (YYYY-MM-DD)
- `end_date` (optional) - Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "work_date": "2026-01-22",
        "total_work_minutes": 480,
        "entries": [
          {
            "entry_id": 123,
            "entry_kind": "work",
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "assignments": [
              {
                "entry_assignment_id": 789,
                "task_id": 456,
                "task_name": "Backend API",
                "project_name": "TimeTracker",
                "location": "Office",
                "duration_minutes": 480
              }
            ]
          }
        ],
        "absences": []
      },
      {
        "work_date": "2026-01-21",
        "total_work_minutes": 0,
        "entries": [],
        "absences": [
          {
            "entry_id": 124,
            "entry_kind": "absence",
            "absence_type": "sick",
            "start_time": null,
            "end_time": null
          }
        ]
      }
    ]
  }
}
```

## Frontend Architecture

### Redux State Structure

```typescript
interface TimerState {
  activeEntry: {
    entry_id: number;
    work_date: string;
    start_time: string;
  } | null;
  isRunning: boolean;
  elapsedSeconds: number;
}

interface TimelineState {
  entries: TimelineDay[];
  loading: boolean;
  error: string | null;
}

interface TimelineDay {
  work_date: string;
  total_work_minutes: number;
  entries: WorkEntry[];
  absences: AbsenceEntry[];
  isExpanded: boolean; // UI state for day card
}
```

### Component Hierarchy

```
HomePage
├── TimerDisplay (clock-in/out button + running timer)
├── TimelineList
│   └── DayCard (one per date)
│       ├── DayHeader (date, total time, expand/collapse)
│       ├── WorkSessionList (when expanded)
│       │   └── WorkSessionItem (individual entry with edit)
│       └── AbsenceList (when expanded)
│           └── AbsenceItem
└── TaskSelectionModal (shown on clock-out)
    └── TaskPicker (shows assigned tasks)
```

### User Flows

#### Flow 1: Clock-In
1. User taps "Start Work" button
2. Frontend dispatches `clockIn()` thunk
3. POST `/api/v1/entries/clock-in` with current time
4. Backend creates entry, returns entry_id
5. Redux stores `activeEntry` and starts timer
6. localStorage saves entry_id for recovery

#### Flow 2: Clock-Out
1. User taps "Stop Work" button
2. Frontend shows TaskSelectionModal
3. User selects task and location
4. Frontend dispatches `clockOut()` thunk
5. PATCH `/api/v1/entries/:id/clock-out` with task info
6. Backend updates entry and creates assignment
7. Redux clears `activeEntry`, stops timer
8. localStorage cleared
9. Timeline refreshed

#### Flow 3: Manual Entry
1. User taps "Manual Report" button
2. Existing manual report form opens
3. User fills start_time, end_time, task, location
4. POST `/api/v1/entries` (existing endpoint)
5. Backend creates complete entry with assignment
6. Timeline refreshed

#### Flow 4: Edit Time
1. User taps on work session in timeline
2. Edit modal shows current start/end times
3. User adjusts times
4. PATCH `/api/v1/entries/:id` (existing endpoint)
5. Backend validates no overlap, updates entry
6. Timeline refreshed

## Validation Rules

### Backend Validation

1. **Month Lock Check** - Entry's work_date must not be in locked month
2. **Task Assignment** - User must have active `admin_task_assignment` for selected task
3. **Time Overlap** - New/edited entry must not overlap with existing entries for same user+date
4. **24-Hour Limit** - Total work time for user+date must not exceed 24 hours
5. **End After Start** - `end_time` must be after `start_time`
6. **Date Consistency** - `work_date` must match the calendar day

### Frontend Validation

1. **Active Timer Check** - Prevent starting new timer if one already running
2. **Task Selection Required** - Clock-out disabled until task selected
3. **Visual Overlap Warning** - Highlight overlapping times in UI before saving

## Edge Cases

### Case 1: User Closes App While Timer Running
- **Detection:** On app mount, check localStorage for `activeEntry`
- **Recovery:** Load entry from backend, resume timer display
- **Action:** User can continue or clock out

### Case 2: User Forgets to Clock Out
- **Detection:** Backend query finds entries with `start_time` but no `end_time` older than X hours
- **User Action:** User sees "Resume or Close" prompt in UI
- **Admin Action:** Admin can force-close with estimated end time

### Case 3: Multiple Sessions Same Day
- **Storage:** Each clock-in creates new entry row
- **Display:** Timeline shows one card per day, expands to show all sessions
- **Calculation:** Total time sums all sessions

### Case 4: Editing While Timer Active
- **Rule:** Cannot edit entry that has no `end_time` (still active)
- **UI:** Edit button disabled for active entries
- **Workaround:** Must clock out first, then edit

## Performance Considerations

### Database Queries

- Timeline endpoint uses single query with JOINs to fetch entries + assignments + tasks
- Index on `(user_id, work_date)` for fast filtering
- Pagination recommended for large date ranges

### Frontend Optimization

- Timeline rendered with virtual scrolling for long lists
- Day cards lazy-load expanded content
- Timer uses `requestAnimationFrame` for smooth updates
- Debounce timeline refresh after edits

## Testing Strategy

### Backend Tests
- Unit tests for entry creation/update logic
- Integration tests for clock-in/clock-out flow
- Validation tests for overlap and time limits
- Month lock enforcement tests

### Frontend Tests
- Timer component starts/stops correctly
- Task selection modal shows assigned tasks only
- Timeline displays entries grouped by day
- Edit flow updates entries correctly

### E2E Tests
- Complete clock-in → clock-out → task selection flow
- Manual entry creation flow
- Timeline loads and displays correctly
- Editing times validates and saves
