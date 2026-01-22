# Proposal: Integrate Timer with Entry Management

## Change ID

`integrate-timer-with-entries`

## Summary

Integrate the running timer on the HomePage with the daily entry list and manual report modal to create a seamless workflow: starting the timer creates a new entry in the list, and stopping it opens the manual report modal pre-populated with start and end times.

## Problem Statement

Currently, the timer on the HomePage (client/src/components/TimerDisplay) operates in isolation:

- Starting the timer doesn't create any visible entry or record
- Stopping the timer simply resets the display without capturing the time worked
- Users must manually open the manual report modal and enter start/end times separately
- There's no visual feedback in the entry list when a timer is running

This creates a disconnected user experience where time tracking and time reporting are separate workflows.

## Proposed Solution

Implement a tightly integrated timer workflow:

### When Timer Starts

1. Create a new "in-progress" entry in the daily entry list
2. The entry appears for today's date with a "running" status indicator
3. Store the start time timestamp

### When Timer Stops

1. Calculate the elapsed time from start to stop
2. Open the ManualReportModal automatically
3. Pre-populate the modal with:
   - Work date: today
   - Start time: captured when timer started
   - End time: current time when timer stopped
   - Active tab: "work" (not "absence")
4. Allow user to add task assignments and finalize the entry

### Visual Feedback

- The "in-progress" entry in the list shows:
  - Today's date
  - "Running" or "In Progress" status badge
  - Live elapsed time (synced with timer display)
  - No expand/collapse functionality until saved

## Affected Components

### Client (Mobile PWA)

**Modified Files:**

- `client/src/pages/Home/HomePage.tsx` - Add timer state management and entry creation logic
- `client/src/components/DailyEntryCard/DailyEntryCard.tsx` - Support "running" status type
- `client/src/components/StatusBadge/StatusBadge.tsx` - Add "running" status variant
- `client/src/features/manual-report/components/ManualReportModal/ManualReportModal.tsx` - Accept pre-populated time values

**New Types/Interfaces:**

- `TimerState` interface to track running timer metadata
- `RunningEntry` type for in-progress entries

### State Management

- No Redux changes needed initially (local component state)
- Future: Consider Redux slice for timer state persistence

## User Experience Impact

### Positive

- Streamlined workflow: start → work → stop → report
- No manual time entry needed
- Visual confirmation that time is being tracked
- Reduced friction in daily reporting

### Considerations

- User may accidentally stop timer - consider confirmation dialog if substantial time elapsed
- What happens if user navigates away while timer running? (Future: persist to localStorage)
- What if user wants to discard the timer session? (Add "Cancel" option in modal)

## Technical Risks

### Low Risk

- UI state management complexity is minimal
- Components already exist, just need integration
- No backend changes required for MVP

### Considerations

- Timer accuracy: client-side timers can drift
- State synchronization between timer display and entry list
- Edge cases: user starts timer, closes app, reopens (future enhancement)

## Implementation Approach

### Phase 1: Basic Integration (This Proposal)

- Timer start creates entry in local state
- Timer stop opens modal with pre-populated times
- Entry list shows running status

### Phase 2: Persistence (Future)

- Persist running timer to localStorage
- Restore timer state on app reload
- Sync with backend for cross-device support

## Acceptance Criteria

1. Starting timer creates visible entry in today's list
2. Entry shows "running" status with live elapsed time
3. Stopping timer opens ManualReportModal
4. Modal is pre-populated with correct start/end times
5. Modal is on "work" tab (not "absence")
6. User can complete or cancel the entry
7. Completed entry replaces the "running" entry in the list

## Alternatives Considered

### Alternative 1: Timer as Separate Feature

- Keep timer isolated
- Just log start/end times in background
- Don't show in entry list until saved

**Rejected:** Lacks visual feedback, users won't know if timer is working

### Alternative 2: Inline Editing

- Allow editing timer entry directly in the list
- No modal popup

**Rejected:** Not enough space for task assignment selection on mobile

## Open Questions

1. Should there be a maximum timer duration limit? (e.g., 12 hours)
2. What happens if user starts a second timer while one is already running?
3. Should we persist timer state across app reloads? (Future phase)
4. Should the running entry be expandable to show partial details?

## Dependencies

- Existing ManualReportModal component
- Existing DailyEntryCard component
- Existing StatusBadge component

## Success Metrics

- Reduced time from work completion to report submission
- Increased daily reporting completion rate
- User feedback on workflow improvement

## Timeline Estimate

- Design and spec: Already complete (this proposal)
- Implementation: 1-2 days
- Testing: 1 day
- Review and refinement: 0.5 day

**Total:** Approximately 2-4 days

## Rollback Plan

Changes are client-side only and additive. Rollback is simple:

1. Remove timer start/stop entry creation logic
2. Revert StatusBadge changes
3. Remove modal pre-population logic

No data migration or backend changes needed.
