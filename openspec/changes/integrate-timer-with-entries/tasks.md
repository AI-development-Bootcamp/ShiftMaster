# Implementation Tasks: Integrate Timer with Entries

## Overview

Sequential checklist for implementing timer-to-entry workflow integration.

## Pre-Implementation

- [x] Review and approve proposal.md
- [x] Review affected components and understand current state
- [x] Set up test environment

## Phase 1: Data Models and Types

- [x] Define `RunningEntry` type in `client/src/components/DailyEntryCard/DailyEntryCard.tsx`
  - Add `isRunning?: boolean` field to `DailyEntry` interface
  - Add `startTime?: string` field to track timer start
- [x] Add "running" status to `EntryStatus` type in `client/src/components/StatusBadge/StatusBadge.tsx`
- [x] Update `ManualReportModalProps` to accept optional `prefillStartTime` and `prefillEndTime` props

## Phase 2: Status Badge Enhancement

- [x] Update `StatusBadge` component to handle "running" status
  - Add CSS styling for running status (e.g., pulsing orange badge)
  - Add translated label for "running" status
  - Test visual appearance

## Phase 3: Timer State Management in HomePage

- [x] Add state for tracking running entry:
  - `runningEntryId: string | null` - ID of the entry being timed
  - `timerStartTime: Date | null` - When timer was started
- [x] Update `handleToggleTimer` function:
  - **When starting timer:**
    - Capture current timestamp as `timerStartTime`
    - Generate unique entry ID for today
    - Create new `DailyEntry` object with `isRunning: true`
    - Add entry to `entries` array (insert at top for today's date)
    - Set `runningEntryId` to track this entry
  - **When stopping timer:**
    - Calculate elapsed time
    - Capture current timestamp as end time
    - Remove running entry from `entries` array
    - Open ManualReportModal with pre-filled times
    - Reset `runningEntryId` and `timerStartTime` to null

## Phase 4: Entry List Integration

- [ ] Update `DailyEntryCard` to display running entries differently:
  - Show live elapsed time instead of static hours
  - Disable expand/collapse when `isRunning: true`
  - Display "running" status badge
  - Add visual indicator (e.g., subtle animation or pulsing border)
- [ ] Sync running entry's displayed time with timer in HomePage:
  - Pass `elapsedSeconds` to the running entry
  - Update display every second

## Phase 5: Manual Report Modal Pre-population

- [ ] Update `ManualReportModal` component:
  - Accept `prefillStartTime?: string` prop
  - Accept `prefillEndTime?: string` prop
  - If props provided, pre-populate WorkTab time fields
  - Ensure "work" tab is active when pre-filled (not "absence")
- [ ] Update `WorkTab` component:
  - Accept and use pre-filled start/end times
  - Display pre-filled values in time pickers
  - Allow user to edit times before saving

## Phase 6: Integration Testing

- [ ] Test timer start → entry creation flow
  - Verify entry appears in list with correct date
  - Verify "running" status displays correctly
  - Verify elapsed time updates in real-time
- [ ] Test timer stop → modal opening flow
  - Verify modal opens automatically
  - Verify start time matches timer start timestamp
  - Verify end time matches current time
  - Verify "work" tab is active
- [ ] Test edge cases:
  - Start timer, navigate month, verify entry still visible in current month view
  - Start timer, stop immediately (0 seconds elapsed)
  - Start timer, let run for extended period (e.g., 8+ hours)
- [ ] Test cancellation flow:
  - Open modal after timer stop
  - Close modal without saving
  - Verify running entry is removed from list

## Phase 7: Translations

- [ ] Add Hebrew translations for new UI text:
  - "running" status label
  - Any new confirmation messages
  - Updated tooltips or help text
- [ ] Add English translations (if supporting multiple languages)

## Phase 8: Polish and UX Refinement

- [ ] Add subtle animations:
  - Running entry appearance/disappearance
  - Timer stop → modal open transition
- [ ] Review mobile responsiveness:
  - Test on various screen sizes
  - Ensure touch targets are appropriately sized
- [ ] Add accessibility attributes:
  - ARIA labels for running status
  - Screen reader announcements for timer state changes

## Phase 9: Code Quality

- [ ] Write unit tests:
  - Test timer start creates entry
  - Test timer stop removes entry and opens modal
  - Test RunningEntry type and state management
- [ ] Run linter and fix any issues
- [ ] Run type checker and resolve any type errors
- [ ] Code review with team
- [ ] Address code review feedback

## Phase 10: Documentation

- [ ] Update component documentation:
  - Document new HomePage timer integration behavior
  - Document ManualReportModal pre-fill props
  - Document RunningEntry type
- [ ] Update user-facing documentation (if applicable)
- [ ] Add code comments for complex timer logic

## Post-Implementation

- [ ] Demo feature to stakeholders
- [ ] Gather initial user feedback
- [ ] Monitor for bugs or unexpected behavior
- [ ] Plan future enhancements (persistence, cross-device sync)

## Notes

- Each task should be completed and tested before moving to the next
- Mark tasks as complete `[x]` only after verification
- Add sub-tasks if a task becomes more complex than anticipated
- Track blockers or dependencies that arise during implementation
