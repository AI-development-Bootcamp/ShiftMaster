# Change: Add Clock-Based Time Tracking

## Why

Users need a streamlined real-time time tracking system with clock-in/clock-out workflow, task association, and unified timeline view combining work entries and absences. The database schema supports this via the unified `entries` table, but the API and frontend workflows are missing.

## What Changes

**Backend API Changes:**
- Add `POST /api/v1/entries/clock-in` - Creates entry with start_time
- Add `PATCH /api/v1/entries/:id/clock-out` - Updates entry with end_time and creates task assignment
- Add `GET /api/v1/entries/timeline` - Returns unified work+absence timeline grouped by date
- Validation: time overlap detection, 24-hour daily limit, task assignment checks, month lock enforcement

**Frontend Changes:**
- TimerDisplay component with clock-in/clock-out button
- TaskSelectionModal for selecting task on clock-out
- TimelineList component with DayCard grouping (one card per day, expandable sessions)
- Timer state persistence in localStorage
- Redux slices: timerSlice (timer state) and timelineSlice (timeline data)

**Design Decisions:**
- Keep unified `entries` table (no schema changes)
- Entry created immediately on clock-in (not on clock-out)
- Task selection required on clock-out
- One card per day in UI (shows total time, expands for session details)

## Impact

**New Capabilities:**
- `clock-time-tracking` - Real-time time tracking with clock-in/clock-out
- `unified-entries-api` - Unified timeline merging work and absences

**Benefits:**
- Users can track time in real-time without manual data entry
- Multiple work sessions per day properly tracked
- Work entries and absences displayed together in clean timeline
- Timer state recovers if user closes app

**Risks:**
- User forgets to clock out → Mitigation: localStorage persistence, reminder notifications
- Timer runs while app closed → Mitigation: Resume timer on app reopen
- Overlapping work sessions → Mitigation: Backend validation with clear error messages
- Task not assigned to user → Mitigation: Show only assigned tasks in modal
