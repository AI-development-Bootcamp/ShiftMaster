# Change: Implement TableShell Admin Generic Table Component

## Why

Admin interfaces require a standardized, reusable table component for displaying paginated data from the backend. Currently, the admin UI lacks a consistent table implementation, leading to potential inconsistencies and duplicated code. TableShell provides a controlled, API-ready presentation layer with fixed layout, RTL support, and well-defined cell types.

## What Changes

- **ADDED**: `TableShell` component in `/admin/src/components/TableShell/`
- **ADDED**: Cell type components: TextCell, RadioCell, BoolCell, ActionsCell, TagsCell
- **ADDED**: Empty state rendering with `empty_space.svg` filling the table body
- **ADDED**: Loading state with skeleton rows
- **ADDED**: Server-side pagination support via footer
- **ADDED**: Server-side sorting support via header
- **ADDED**: Fixed viewport-relative sizing (866:1080 height ratio)
- **ADDED**: RTL-only layout with strict alignment rules
- **BREAKING**: None (New component, no existing code affected)

## Impact

- Affected specs: `frontend-admin` (new capability: table-shell)
- Affected code:
  - `/admin/src/components/TableShell/` (new directory)
  - `/admin/src/assets/empty_space.svg` (existing asset)
  - Pages that will use TableShell (EntriesManagementPage, EmployeesManagementPage)

## Non-Goals (Explicit)

- No internal data fetching
- No infinite scroll
- No internal table scrolling
- No client-side sorting or pagination
- No row click navigation
- No inline text editing
- No per-row permissions
- No dynamic height/width based on content

## Design References

- Header height: `0.75 × RowHeight`
- Footer height: `1 × RowHeight` (hidden if `totalPages <= 1`)
- Table height: `80.185%` of viewport height (866:1080 ratio)
- Empty state: `empty_space.svg` centered, filling entire body area
