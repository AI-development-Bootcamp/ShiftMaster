# Spec: Client Entries UI Integration

**Capability:** `client-entries-ui`
**Related to:** `frontend-client`

## ADDED Requirements

### Requirement: ManualReportModal MUST save work entries to backend

ManualReportModal MUST integrate with Redux to save work entries via API.

#### Scenario: User saves work entry with single task assignment

**Given:**
- ManualReportModal is open on Work tab
- User has filled out:
  - Selected date: 2026-01-22
  - Project: "Website Redesign"
  - Task: "Frontend Dev"
  - Location: "Office"
  - Start time: 9:00 AM
  - End time: 5:00 PM
  - Description: "Implemented login form"

**When:**
- User clicks "Save" button

**Then:**
- Modal dispatches `createWorkEntry()` with:
  ```typescript
  {
    work_date: '2026-01-22',
    start_time: '09:00:00',
    end_time: '17:00:00',
    description: 'Implemented login form',
    assignments: [
      {
        task_id: 1,
        location: 'Office',
        start_time: '09:00:00',
        end_time: '17:00:00'
      }
    ]
  }
  ```
- Save button becomes disabled with "Saving..." text
- On success:
  - Modal closes
  - Success toast message shown
  - HomePage refreshes to show new entry
- On error:
  - ErrorBanner appears with message
  - Modal stays open
  - User can correct and retry

---

#### Scenario: User saves work entry with multiple task assignments

**Given:**
- User has added 2 project entries:
  1. Project "Website Redesign", Task "Frontend Dev", 9:00 AM - 1:00 PM
  2. Project "Mobile App", Task "Testing", 2:00 PM - 5:00 PM

**When:**
- User clicks "Save"

**Then:**
- Modal dispatches `createWorkEntry()` with assignments array containing 2 items
- Both assignments included in single entry for the day
- Total hours validated (8 hours total)

---

#### Scenario: User saves with missing hours warning

**Given:**
- User has filled only 5 hours of work (daily quota is 9)
- Missing hours dialog is enabled (not "Don't show again")

**When:**
- User clicks "Save"

**Then:**
- Missing hours dialog appears: "You have 4 hours remaining. Complete or save anyway?"
- If user clicks "Complete": dialog closes, can add more hours
- If user clicks "Save anyway": proceeds with createWorkEntry
- If user clicks "Don't show again": saves and sets preference to skip dialog

---

### Requirement: ManualReportModal MUST save absence entries to backend

ManualReportModal MUST integrate with Redux to save absence entries.

#### Scenario: User saves single-day sick leave

**Given:**
- ManualReportModal is open on Absence tab
- User has selected:
  - Date: 2026-01-22
  - Absence type: Sick (sick emoji)
  - Description: "Flu symptoms"

**When:**
- User clicks "Save"

**Then:**
- Modal dispatches `createAbsenceEntry()` with:
  ```typescript
  {
    work_date: '2026-01-22',
    absence_type: 'sick',
    description: 'Flu symptoms'
  }
  ```
- On success: modal closes, entry appears on HomePage
- On error: ErrorBanner shown

---

#### Scenario: User saves multi-day vacation

**Given:**
- User has selected:
  - Date range: Feb 10 - Feb 14 (5 days)
  - Absence type: Vacation
  - Description: "Annual leave"

**When:**
- User clicks "Save"

**Then:**
- Modal dispatches `createAbsenceEntry()` with:
  ```typescript
  {
    start_date: '2026-02-10',
    end_date: '2026-02-14',
    absence_type: 'vacation',
    description: 'Annual leave'
  }
  ```
- On success: 5 entries created, all appear on HomePage
- Loading indicator shown during multi-day creation

---

### Requirement: ManualReportModal MUST load task tree for selection

The modal MUST fetch user's assigned tasks when opened.

#### Scenario: Task tree loaded when modal opens

**Given:**
- tasksSlice has no cached task tree (or cache expired)
- Modal is closed

**When:**
- User clicks "Manual Report" button
- Modal opens

**Then:**
- useEffect triggers `dispatch(fetchTaskTree())`
- Loading state shown in project/task selectors
- When loaded:
  - Project selector populated with user's projects
  - Task selector populated based on selected project
  - No hardcoded placeholder data

---

#### Scenario: Cached task tree used if recent

**Given:**
- tasksSlice has task tree cached 2 minutes ago (< 5 min threshold)

**When:**
- Modal opens

**Then:**
- No API call made
- Selectors populated immediately from cache
- No loading state

---

#### Scenario: User has no assigned tasks

**Given:**
- Task tree returns empty projects array

**When:**
- Modal opens and task tree loads

**Then:**
- Project selector shows message: "No projects assigned"
- Task selector disabled
- Error message: "You are not assigned to any tasks. Contact your manager."
- Save button disabled

---

### Requirement: HomePage MUST load entries for current month

HomePage MUST fetch and display entries when month changes.

#### Scenario: HomePage loads entries on mount

**Given:**
- HomePage displays November 2025
- User has 10 entries in November 2025 (7 work, 3 absence)

**When:**
- HomePage component mounts

**Then:**
- useEffect triggers `dispatch(fetchEntriesByMonth({ year: 2025, month: 11 }))`
- Loading spinner shown while fetching
- When loaded:
  - 10 DailyEntryCard components rendered
  - Sorted by date descending
  - Each card shows entry summary
  - Loading state removed

---

#### Scenario: User navigates to previous month

**Given:**
- HomePage shows November 2025 with cached entries
- User has entries in October 2025

**When:**
- User clicks previous month button
- Month changes to October 2025

**Then:**
- useEffect detects month change
- Dispatches `fetchEntriesByMonth({ year: 2025, month: 10 })`
- Loading spinner shown
- October entries displayed
- November entries removed from view

---

#### Scenario: HomePage shows empty state for month with no entries

**Given:**
- User has no entries in February 2026

**When:**
- HomePage displays February 2026
- fetchEntriesByMonth returns empty array

**Then:**
- Empty state illustration shown
- Message: "No reports for this month"
- Subtitle: "Create a report using the button below"
- No loading spinner

---

#### Scenario: HomePage shows future month empty state

**Given:**
- Current date is January 2026
- User navigates to March 2026 (future)

**When:**
- HomePage displays March 2026

**Then:**
- Empty state shows different message
- Title: "Future month"
- Subtitle: "You cannot create reports for future months"
- No entries loaded (skip API call)

---

### Requirement: The UI MUST implement error handling with localized messages

The error UI MUST display user-friendly messages for all error scenarios.

#### Scenario: Month locked error displays clear message

**Given:**
- User tries to save entry for January 2025
- API returns MONTH_LOCKED error

**When:**
- Error received in Redux state

**Then:**
- ErrorBanner component appears with:
  - Red background
  - Error icon
  - Message: "לא ניתן לשמור דיווח - ינואר 2025 נעול" (Hebrew)
  - Close button
- Save button re-enabled
- User can close banner and correct date

---

#### Scenario: Task not assigned error with task name

**Given:**
- User tries to save entry for task they're not assigned to
- API returns TASK_NOT_ASSIGNED error with details: { task_id: 5, task_name: "Testing" }

**When:**
- Error displayed

**Then:**
- ErrorBanner shows: "אינך משובץ למשימה: Testing"
- Clear what went wrong
- User can remove that task and retry

---

#### Scenario: Time format mismatch error

**Given:**
- Project requires 'sum' format
- User provided start/end times instead of duration

**When:**
- API returns TIME_FORMAT_MISMATCH error

**Then:**
- ErrorBanner shows: "פורמט שעות שגוי - פרויקט זה דורש הזנת משך זמן"
- Explains what format is required
- User can switch to duration input

---

#### Scenario: Network error with retry option

**Given:**
- API call fails with network error (e.g., ECONNREFUSED)

**When:**
- Error caught in thunk

**Then:**
- ErrorBanner shows:
  - Message: "שגיאת רשת - לא ניתן להתחבר לשרת"
  - "נסה שנית" (Retry) button
- When clicked:
  - Banner shows loading indicator
  - Retries same API call
  - On success: closes banner
  - On failure: shows error again

---

#### Scenario: Validation error displays field-specific message

**Given:**
- User submits entry with invalid time range (end before start)
- API returns INVALID_TIME_RANGE error

**When:**
- Error displayed

**Then:**
- ErrorBanner shows: "שעת סיום חייבת להיות אחרי שעת התחלה"
- Highlights time picker fields
- User corrects and resubmits

---

### Requirement: Loading states MUST prevent double submission

The UI MUST show loading states and disable actions during API calls.

#### Scenario: Save button disabled during submission

**Given:**
- User clicks "Save" in ManualReportModal

**When:**
- createWorkEntry thunk is pending

**Then:**
- Save button shows:
  - Text: "שומר..." (Saving...)
  - Spinner icon
  - Disabled state (cannot click again)
- Modal close button disabled
- Modal overlay click disabled
- Prevents double submission

---

#### Scenario: Loading overlay on multi-day absence creation

**Given:**
- User saves 10-day vacation

**When:**
- createAbsenceEntry thunk is pending

**Then:**
- Full-screen loading overlay shown
- Message: "יוצר 10 רשומות..." (Creating 10 entries...)
- Progress indicator or spinner
- Cannot interact with modal
- Prevents modal close

---

### Requirement: The system MUST transform backend data to UI format

Backend entry data MUST be transformed to DailyEntry format for display.

#### Scenario: Work entry transformed to DailyEntry

**Given:**
- Backend returns entry:
  ```json
  {
    "entry_id": 1,
    "user_id": 10,
    "entry_kind": "work",
    "work_date": "2026-01-22",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "description": "Development work",
    "assignments": [
      {
        "task_id": 1,
        "task_name": "Frontend Dev",
        "project_name": "Website Redesign",
        "location": "Office",
        "start_time": "09:00:00",
        "end_time": "17:00:00"
      }
    ]
  }
  ```

**When:**
- `transformWorkEntryToDailyEntry(entry)` is called

**Then:**
- Returns DailyEntry:
  ```typescript
  {
    id: '1',
    date: '2026-01-22',
    type: 'work',
    hours: 8,
    status: 'approved',
    projects: ['Website Redesign'],
    tasks: [
      {
        name: 'Frontend Dev',
        hours: 8,
        project: 'Website Redesign',
        location: 'Office'
      }
    ],
    description: 'Development work'
  }
  ```
- Times converted from 24-hour to display format
- Hours calculated from time range

---

#### Scenario: Absence entry transformed to DailyEntry

**Given:**
- Backend returns absence entry with absence_type='vacation'

**When:**
- `transformAbsenceEntryToDailyEntry(entry)` is called

**Then:**
- Returns DailyEntry with:
  - type: 'vacation'
  - hours: 9 (full day)
  - projects: []
  - tasks: []
  - Includes emoji for absence type

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.
