# Proposal: Integrate Client Time Entries with Backend

**Change ID:** `integrate-client-time-entries`
**Status:** Draft
**Created:** 2026-01-22

## Summary

Connect the client app's manual report feature (work and absence entry modal) to the backend API. This includes building the complete backend API for time/absence entries, implementing Redux state management in the client, and creating a full error handling UI.

## Problem

The client app has a fully functional manual report UI (`/client/src/features/manual-report/`) but no backend integration:
- Work and absence data is only stored in local React state
- HomePage calendar view shows empty state (no entries loaded from backend)
- Project/task selection uses hardcoded placeholder data
- No persistence when users save entries

The backend has:
- ✅ Complete database schema with migrations
- ✅ All repository layer (EntryRepository, EntryAssignmentRepository, TaskRepository, MonthLockRepository, etc.)
- ✅ Entity types from database (Entry, EntryAssignment, etc.)
- ❌ **Missing**: Services for entry business logic (entryService, absenceService, taskTreeService)
- ❌ **Missing**: Controllers and routes for time entries, absences, and task tree endpoints
- API documentation exists in `project.md` but endpoints are not implemented

## Goals

1. **Enable users to save work entries** - Create time entries with task assignments that persist to the database
2. **Enable users to save absence entries** - Create absence entries (sick, vacation, etc.) that persist to the database
3. **Display saved entries** - Load and show entries on the HomePage calendar view
4. **Provide task selection** - Fetch user's assigned tasks from backend for the manual report modal
5. **Comprehensive error handling** - Full error UI for validation failures, locked months, and network errors
6. **Use existing auth** - Leverage JWT tokens from the existing authSlice

## Non-Goals

- Entry editing/updating (will be addressed separately)
- Entry deletion (will be addressed separately)
- Admin features for viewing all user entries
- Timer functionality integration
- Calendar month navigation optimizations
- File upload for absence attachments

## Impact

**Users:**
- ✅ Can save work/absence entries that persist across sessions
- ✅ See their historical entries when browsing months
- ✅ Select only tasks they're assigned to (real data, not placeholders)
- ✅ Get clear error messages when something goes wrong

**Codebase:**
- New backend routes: `time-entries.ts`, `absences.ts`, `me.ts`
- New backend services: `entryService.ts`, `absenceService.ts`, `taskTreeService.ts`
- New Redux slices: `entriesSlice.ts`, `tasksSlice.ts`
- Integration between existing manual report UI and new backend

## Scope

### In Scope
- Backend API implementation:
  - `POST /api/v1/time-entries` - Create work entry
  - `GET /api/v1/time-entries` - List user's entries (filtered by date)
  - `POST /api/v1/absences` - Create absence entry(ies)
  - `GET /api/v1/absences` - List user's absences (filtered by date)
  - `GET /api/v1/me/task-tree` - Fetch user's assigned tasks/projects

- Client Redux integration:
  - Redux slice for entries with async thunks
  - Redux slice for user's task tree
  - API client functions in `/shared`

- Client UI integration:
  - Connect ManualReportModal to Redux (save work/absence entries)
  - Load task tree when modal opens
  - Display entries on HomePage calendar view
  - Error handling UI (validation errors, locked months, network errors)

- Data validation:
  - Month lock checks
  - Task assignment verification
  - Time format validation (start_end vs sum)
  - One entry per user per day constraint

### Out of Scope
- Entry update/edit functionality
- Entry deletion
- File upload for absence attachments
- Admin endpoints for viewing all entries
- Reporting/analytics features
- Timer integration with entries
- Optimistic updates (will wait for server confirmation)

## Dependencies

- ✅ Authentication system (authSlice exists, JWT middleware working)
- ✅ Database schema with migrations (all tables exist)
- ✅ **All repository layer** (EntryRepository, EntryAssignmentRepository, etc. implemented)
- ✅ Entity types from database (database.types.ts generated)
- ✅ Manual report UI (fully implemented in client)
- ✅ BaseRepository pattern established (used by existing services)
- ⚠️ Task assignment system (admin must assign users to tasks first)
- ⚠️ Month locks (admin can lock months to prevent entry creation)

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| One entry per day constraint conflicts with existing data | Low | High | Implement upsert logic: update existing entry if one exists for that date |
| Time format validation complexity (start_end vs sum) | Medium | Medium | Create robust validation service that checks project's time_format_type |
| Month lock errors confuse users | Medium | Low | Clear error messages explaining why entry can't be saved |
| Task tree endpoint performance with large datasets | Low | Medium | Use database indexes, limit to active tasks/projects |
| Network errors lose user's entered data | Medium | High | Store draft state in localStorage before submitting |

## Alternatives Considered

### Alternative 1: Implement only work entries first, absence entries later
**Rejected:** User requested both together (scope priority B). Splitting would require two separate integration efforts and duplicate error handling.

### Alternative 2: Implement update/delete in same change
**Rejected:** Too large a change. Better to get create + read working first, then add update/delete in follow-up.

### Alternative 3: Use optimistic updates for better UX
**Rejected:** Adds complexity around rollback and error handling. Start with simple server-confirmed updates.

### Alternative 4: Fetch task tree once on app load, cache in Redux
**Rejected:** Task assignments can change. Better to fetch when modal opens to ensure fresh data.

## Success Criteria

1. **Functional:**
   - User can create work entry with multiple task assignments
   - User can create single-day absence entry
   - User can create multi-day absence entry (vacation range)
   - Entries appear on HomePage calendar after creation
   - Only assigned tasks appear in project/task selectors

2. **Error Handling:**
   - Locked month error displays clear message
   - Task not assigned error prevents submission
   - Time format mismatch error shows validation message
   - Network errors display retry option

3. **Data Integrity:**
   - No duplicate entries for same user/date (upsert behavior)
   - Time format matches project requirements
   - Only assigned tasks can be reported
   - Locked months are immutable

## Open Questions

1. Should we implement draft saving in localStorage for network resilience?
   - **Recommendation:** Yes, minimal implementation - save draft before API call, clear on success

2. Should HomePage entries be paginated or load all for the month?
   - **Recommendation:** Load all for current month (typically <31 entries), paginate if performance issues

3. Should we validate total hours against daily quota (9 hours)?
   - **Recommendation:** Yes, client-side warning if missing hours, but allow submission (business rule may change)

4. How to handle timezone differences between client and server?
   - **Recommendation:** All dates as DATE type (no time), times as TIME type (no timezone), work_date is user's local date

## Related Changes

- `add-user-management-endpoints` - Provides user authentication foundation
- `initialize-database-layer` - Created database schema for entries
- Future: `implement-entry-editing` - Will add update/delete functionality
- Future: `implement-timer-integration` - Will connect timer to entry creation
