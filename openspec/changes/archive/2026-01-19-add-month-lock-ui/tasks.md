# Implementation Tasks

## 1. Foundation

- [x] 1.1 Add Hebrew translations for month names (ינואר-דצמבר) and UI text to i18n files
- [x] 1.2 Create `useMonthLocks(year)` hook to load and toggle month locks with mock data
- [x] 1.3 Add console.log payload helpers for "prepare create" and "prepare delete" operations

## 2. UI Components

- [x] 2.1 Create `MonthLockButton` component (admin-only visibility check)
- [x] 2.2 Create `MonthLockModal` component with close handlers (X button, overlay click, ESC key)
- [x] 2.3 Create `YearNavigator` component (current year display, prev/next buttons)
- [x] 2.4 Create `MonthGrid` component (12-tile grid, RTL layout)
- [x] 2.5 Create `MonthTile` component (Hebrew month name, lock state coloring, click handler)

## 3. Integration

- [x] 3.1 Integrate `MonthLockButton` into `EntriesManagementPage` header
- [x] 3.2 Wire modal open/close state management
- [x] 3.3 Implement optimistic UI updates for lock toggle (immediate color change)
- [x] 3.4 Add loading skeleton for month grid during year transitions

## 4. Testing

- [x] 4.1 Write unit tests for `useMonthLocks` hook (mock data loading, toggle logic)
- [x] 4.2 Write component tests for `MonthTile` (lock/unlock click, color states)
- [x] 4.3 Write component tests for `YearNavigator` (year change, boundary handling)
- [x] 4.4 Write integration test for full modal workflow (open, navigate years, toggle months, close)
- [x] 4.5 Verify admin-only visibility (button hidden for non-admin users)

## 5. Documentation

- [x] 5.1 Add JSDoc comments to all new components and hooks
- [x] 5.2 Document payload structure for future API integration in code comments
- [x] 5.3 Update CLAUDE.md with location of month lock UI if relevant

## Dependencies

- Task 2.2 depends on 2.3, 2.4 (modal contains year nav and month grid)
- Task 2.4 depends on 2.5 (grid renders tiles)
- Task 3.1 depends on 2.1 (button component)
- Task 3.2 depends on 2.2 (modal component)
- Task 3.3 depends on 1.2 (toggle logic in hook)
- All testing tasks (4.x) depend on implementation tasks (1.x, 2.x, 3.x)
