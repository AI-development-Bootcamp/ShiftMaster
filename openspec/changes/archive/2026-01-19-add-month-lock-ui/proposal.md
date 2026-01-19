# Change: Add Month Lock UI

## Why

Admins need the ability to lock/unlock months to prevent users from editing time entries in closed periods. This ensures data integrity for finalized reporting periods (e.g., after payroll is processed or reports are submitted). Currently, the `MonthLock` data model exists in the codebase with mock data, but there is no UI to manage these locks.

## What Changes

- **[NEW]** Month Lock button in Entries Management Page (admin-only visibility)
- **[NEW]** Month Lock Modal with year navigation and 12-month grid
- **[NEW]** Visual lock/unlock toggle with optimistic UI updates
- **[NEW]** Mock data integration layer (API-ready hooks for future backend)
- **[NEW]** RTL-compliant Hebrew UI for all month lock components

This change adds **UI-only** month lock management. Backend enforcement of locked months on entry edits is **out of scope** for this change.

## Impact

- **Affected specs**: `frontend-admin`, `admin-table`
- **Affected code**:
  - `admin/src/pages/EntriesManagementPage/` - Add button to trigger modal
  - `admin/src/components/` - New `MonthLocks/` directory with modal, grid, tiles
  - `admin/src/mocks/monthLocks.ts` - Already exists, will be consumed
  - `admin/src/hooks/` - New `useMonthLocks` hook for mock data integration
  - `admin/src/locales/` - Hebrew translations for all month names and UI text

## Non-Goals (Explicit)

- Backend API implementation (mock-only in this change)
- Enforcement of month locks on entry/assignment edits across the system
- UI error overlays (errors logged to console only)
- Multi-admin conflict resolution or race condition handling
- Granular permissions beyond admin-only visibility
- Analytics or audit UI for lock history

## Dependencies

- Existing `MonthLock` type in `shared/src/types/models.ts`
- Existing `mockMonthLocks` in `admin/src/mocks/monthLocks.ts`
- Existing modal/dialog patterns in admin (if any, will be investigated during implementation)
- Admin role check mechanism (existing)
