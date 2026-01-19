# Design: Month Lock UI

## Context

The `MonthLock` data model and mock data already exist in the codebase. The backend schema includes `lock_id`, `year`, `month`, `locked_at`, `locked_by`, and `unlocked_at`. This change adds the UI for admins to toggle month locks in the Entries Management Page. The implementation must be **RTL-compliant** with Hebrew text and prepare for future API integration without making real API calls yet.

### Stakeholders

- Admin users who need to close/open reporting periods
- Future backend developers who will implement the API endpoints

### Constraints

- Mock data only (no backend API calls)
- Admin-only feature (requires role check)
- RTL layout required
- Must prepare for smooth migration to real API (hooks/services architecture)
- Optimistic UI updates (no server confirmation delay)

## Goals / Non-Goals

### Goals

- Provide admin-only UI to toggle month locks visually
- Display current lock state from mock data
- Support year navigation (infinite past, no future limit by default)
- Prepare "API-ready" architecture (hooks + service layer)
- Log toggle operations to console for debugging
- Fully Hebrew/RTL interface

### Non-Goals

- Backend API implementation
- Enforcement of locks on entry/assignment edits
- Error handling UI (console.log only)
- Multi-admin conflict resolution
- Analytics/audit trails in UI

## Decisions

### 1. Component Architecture

**Decision**: Create a dedicated `MonthLocks/` directory under `admin/src/components/` with sub-components:

- `MonthLockButton.tsx` - Entry point button
- `MonthLockModal.tsx` - Modal container
- `YearNavigator.tsx` - Year selection header
- `MonthGrid.tsx` - 12-tile grid container
- `MonthTile.tsx` - Individual month tile

**Why**: Separation of concerns, testability, and alignment with existing admin component patterns (e.g., `TableShell/`, `FormShell/`).

**Alternatives considered**:
- Single monolithic component → Rejected: Hard to test and maintain
- Inline in `EntriesManagementPage` → Rejected: Page component would become too large

### 2. State Management

**Decision**: Use React local state for modal visibility and year selection. Use custom `useMonthLocks(year)` hook for lock data.

**Why**: Month locks are page-scoped and don't need global Redux state. The hook provides a clean boundary for swapping mock → API.

**Alternatives considered**:
- Redux slice for month locks → Rejected: Overkill for page-scoped UI state
- Direct mock import in components → Rejected: Tight coupling, hard to replace with API

### 3. Modal Implementation

**Decision**: Investigate existing modal/dialog patterns in the admin codebase during implementation. If none exist, create a simple modal with overlay + close handlers (X, click outside, ESC).

**Why**: The spec requires using existing patterns if available. A fallback plan is needed if no standard exists.

**Alternatives considered**:
- Always use third-party library (e.g., Radix UI) → Rejected: Adds dependency without checking existing code first
- Build complex modal system → Rejected: Over-engineering for a single feature

### 4. Color Coding

**Decision**: Use CSS classes for lock states:

- `.month-tile--locked` → Red background
- `.month-tile--unlocked` → Gray background

**Why**: Separation of styling from logic, aligns with existing CSS architecture.

### 5. Optimistic Updates

**Decision**: Update UI immediately on click without waiting for "server confirmation" (console.log only for now).

**Why**: Mock data has no latency, and the spec explicitly requires optimistic behavior.

**Rollback strategy**: When real API is added, implement error handling to revert UI state on failure (out of scope for this change).

### 6. API Preparation

**Decision**: Structure `useMonthLocks` to return:

```typescript
{
  locks: MonthLock[];       // Current locks for the year
  isLoading: boolean;       // Skeleton display trigger
  toggleLock: (year, month) => void;  // Console logs payload + updates state
}
```

**Why**: This interface mirrors a real API hook (e.g., RTK Query). When backend is ready, we swap the implementation without changing component code.

### 7. Internationalization

**Decision**: Add Hebrew translations for:

- Month names: `monthNames.january` → `ינואר`, etc.
- UI labels: `monthLocks.button`, `monthLocks.title`, etc.

Store in `admin/src/locales/he/translation.json`.

**Why**: Spec requires RTL and Hebrew. Matches existing i18n structure in the project.

## Risks / Trade-offs

### Risk: No existing modal pattern

**Mitigation**: If no modal exists, implement a minimal Dialog component with accessibility (focus trap, ESC key, aria-modal). Reuse it for future features.

### Risk: Mock data divergence from future API

**Mitigation**: Use TypeScript types from `shared/src/types/models.ts` to ensure mock matches backend schema. Document payload structure in code comments.

### Trade-off: Optimistic UI without rollback

**Benefit**: Instant feedback, simpler mock implementation.
**Cost**: Real API integration will require error handling logic.
**Decision**: Accept this cost. The spec explicitly scopes rollback as "out of scope" for this change.

## Migration Plan

### From Mock to API

1. Replace `useMonthLocks` implementation:
   - Use RTK Query or fetch hook to call `GET /api/v1/month-locks?year={year}`
   - Call `POST /api/v1/month-locks` (create) or `DELETE /api/v1/month-locks/{id}` (delete)
2. Add error handling (display errors, revert optimistic updates)
3. Remove mock data imports
4. No component code changes required (interface stays the same)

### Rollback

If the feature needs to be disabled:
1. Hide the `MonthLockButton` in `EntriesManagementPage`
2. Remove route/feature flag (if applicable)

## Open Questions

1. **Does the admin app have an existing modal/dialog component?**
   - **Resolution approach**: Search codebase during Task 2.2. If none found, build minimal Dialog.

2. **How is admin role checked in the current app?**
   - **Resolution approach**: Investigate auth context/hook in Task 2.1. Use same pattern for button visibility.

3. **Should we add i18n for month names even if they're standard?**
   - **Resolution approach**: Yes (per spec requirement for Hebrew). Use i18n `t('monthNames.january')` pattern.

4. **Should the modal support infinite future navigation or limit to current year + N?**
   - **Resolution approach**: Spec says "no mandatory limit". Default to infinite. Can add limit later if requested.
