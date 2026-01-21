# Design: TableShell Component Architecture

## Context

TableShell is the primary table component for Admin UI, designed to display paginated, server-side data with consistent layout and behavior. It must integrate with multiple pages (Entries, Employees, etc.) while maintaining strict visual and behavioral consistency.

### Stakeholders
- Admin users (view/interact with tables)
- Admin pages (consume TableShell)
- Backend API (provides paginated data)

### Constraints
- RTL-only (Hebrew interface)
- Fixed viewport-relative sizing
- No client-side data manipulation
- API-ready but currently using mock data

## Goals / Non-Goals

### Goals
- Provide a single, reusable table component for all admin data tables
- Ensure consistent layout across all states (loading, empty, normal)
- Support server-side pagination and sorting
- Define clear cell type contracts (text, radio, boolean, actions, tags)
- Fixed dimensions relative to viewport

### Non-Goals
- No data fetching logic (controlled component)
- No infinite scroll or virtual scrolling
- No row selection or bulk operations (phase 1)
- No column resizing or reordering
- No nested/expandable rows

## Decisions

### Decision 1: Controlled Component Pattern
**What**: TableShell receives all data, pagination state, and sort state as props. All changes are communicated via callbacks.

**Why**: 
- Keeps business logic in parent components/pages
- Enables easy integration with Redux state
- Makes testing straightforward
- Future-proofs for API integration

### Decision 2: Fixed Viewport-Relative Sizing
**What**: Table dimensions are defined as ratios of viewport (height: 866/1080 = 80.185%)

**Why**:
- Consistent appearance across screen sizes
- No layout shifts between states
- Predictable integration with sidebar and header

**Trade-off**: Less flexible for varied content, but ensures visual consistency.

### Decision 3: Cell Type System
**What**: Five distinct cell types with fixed contracts:
- `text`: Single-line, ellipsis overflow
- `radio`: Inline enum selection (immediate callback)
- `boolean`: Checkbox (immediate callback)
- `actions`: Edit/Delete/Add buttons (with confirm for delete)
- `tags`: Display tags with overflow indicator (N+)

**Why**: Covers all current admin table needs while maintaining simplicity.

### Decision 4: Empty State = Full Body Image
**What**: When `totalItems === 0` and `isLoading === false`, the entire body area displays `empty_space.svg` centered.

**Why**: 
- Clear visual feedback for empty data
- No ambiguity about table status
- Consistent with design system

### Decision 5: Skeleton Loading
**What**: Loading state shows skeleton rows matching `pageSize`.

**Why**: 
- Maintains layout stability during load
- Provides visual feedback
- Header remains visible during loading

## Component Structure

```text
TableShell/
├── TableShell.tsx          # Main container, orchestrates header/body/footer
├── TableShell.css          # All styling (single file for component)
├── types.ts                # Type definitions
├── index.ts                # Public exports
├── components/
│   ├── TableHeader.tsx     # Column headers, sort indicators
│   ├── TableBody.tsx       # Row rendering, cell delegation
│   ├── TableFooter.tsx     # Pagination controls
│   └── cells/
│       ├── TextCell.tsx
│       ├── RadioCell.tsx
│       ├── BoolCell.tsx
│       ├── ActionsCell.tsx
│       └── TagsCell.tsx
└── USAGE.md                # Implementation examples
```

## Data Contract

### Props Interface (Simplified)
```typescript
interface TableShellProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  sort: SortState | null;
  isLoading: boolean;
  emptyStateImageSrc?: string;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SortState | null) => void;
  onRadioChange?: (args) => void;
  onBoolChange?: (args) => void;
  rowActions?: RowActionsConfig<T>;
}
```

### API Response Format (Mock Contract)
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

## Risks / Trade-offs

### Risk 1: Fixed Sizing Inflexibility
**Risk**: Some pages may need different table dimensions.
**Mitigation**: Use CSS class overrides for exceptional cases. Document in USAGE.md.

### Risk 2: Cell Type Limitations
**Risk**: Future needs may require cell types not currently defined.
**Mitigation**: Cell type system is extensible. New types can be added without breaking existing ones.

### Risk 3: Performance with Large Datasets
**Risk**: Rendering many rows may cause performance issues.
**Mitigation**: Server-side pagination limits visible rows. PageSize fixed at 10.

## Migration Plan

1. **Phase 1**: Implement core TableShell with text, radio, actions cells
2. **Phase 2**: Add boolean and tags cells
3. **Phase 3**: Integrate with API when backend ready (replace mock data)

## Open Questions

None - all behaviors locked in spec.
