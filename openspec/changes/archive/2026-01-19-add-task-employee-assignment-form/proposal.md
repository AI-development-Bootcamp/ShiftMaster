# Change: Add Task Employee Assignment Form with TableShell Selection

## Why

Admin users need a form to assign employees to tasks. The form requires multi-select functionality within a table, but the current TableShell component lacks row selection capability. This change adds:
1. A `selection` column type to TableShell for multi-row selection (with selection persistence across pagination)
2. A `TaskEmployeeAssignmentForm` component that uses TableShell for employee assignment, following the FormShell modal pattern

## What Changes

- **ADDED**: `type: 'selection'` column type in TableShell for multi-select rows
- **ADDED**: `selectedRowKeys` and `onSelectionChange` props to TableShell
- **ADDED**: Selection persistence across page changes (IDs retained when navigating pages)
- **ADDED**: `SelectionCell` component for rendering checkboxes
- **ADDED**: `TaskEmployeeAssignmentForm` component as FormShell-style modal
- **BREAKING**: None (additive changes only)

## Impact

- Affected specs:
  - `admin-table` (extended: selection column type, pagination selection persistence)
  - `frontend-admin` (new capability: task-employee-assignment-form)
- Affected code:
  - `/admin/src/components/TableShell/` (extended with selection support)
  - `/admin/src/components/task/TaskEmployeeAssignmentForm/` (new directory)

## Non-Goals (Explicit)

- No "select all" checkbox in header (header cell remains empty)
- No server-side selection persistence (client-side only)
- No inline employee creation or editing
- No row click toggle selection (checkbox only)
- No single-select mode (only multi-select)

## Design References

- **Form Structure**: FormShell-like modal (overlay, header with close button, content area, footer with action button)
- Selection column: First visual column in RTL (rightmost)
- Header cell: Empty (no text, no icon)
- Tick/Checkbox: Standard UI kit checkbox
- Context pills: Capsule-shaped, read-only
- Selection persists across: search filtering, page navigation
