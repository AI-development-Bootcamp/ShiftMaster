# Design: Integrate Client Time Entries with Backend

**Change ID:** `integrate-client-time-entries`

## Architecture Overview

This change integrates the client's manual report feature with a new backend API layer, using Redux for state management and a consistent error handling pattern.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Port 5173)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌─────────────────────────────┐    │
│  │   HomePage     │────────▶│  Redux Store                │    │
│  │                │         │  - entriesSlice             │    │
│  │  - Load entries│         │  - tasksSlice (task tree)   │    │
│  │  - Display     │         │  - authSlice (existing)     │    │
│  │    calendar    │         └─────────────────────────────┘    │
│  └────────────────┘                      │                      │
│         ▲                                │                      │
│         │                                ▼                      │
│  ┌────────────────┐         ┌─────────────────────────────┐    │
│  │ ManualReport   │────────▶│  Async Thunks               │    │
│  │ Modal          │         │  - createWorkEntry()        │    │
│  │                │         │  - createAbsenceEntry()     │    │
│  │  - Save entry  │         │  - fetchTaskTree()          │    │
│  │  - Task select │         │  - fetchEntriesByMonth()    │    │
│  └────────────────┘         └─────────────────────────────┘    │
│                                         │                       │
│                             ┌───────────▼───────────┐           │
│                             │  /shared/src/api/     │           │
│                             │  - entriesApi.ts      │           │
│                             │  - absencesApi.ts     │           │
│                             │  - tasksApi.ts        │           │
│                             └───────────────────────┘           │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      │ HTTP + JWT
                                      │
┌─────────────────────────────────────▼───────────────────────────┐
│                        SERVER (Port 3000)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                    Routes Layer                       │       │
│  │  /api/v1/time-entries  /api/v1/absences  /api/v1/me  │       │
│  └────────────────────────┬─────────────────────────────┘       │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────┐       │
│  │                 Controllers Layer                     │       │
│  │  - timeEntriesController.ts                          │       │
│  │  - absencesController.ts                             │       │
│  │  - meController.ts                                   │       │
│  └────────────────────────┬─────────────────────────────┘       │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────┐       │
│  │                  Services Layer                       │       │
│  │  - entryService.ts (business logic)                  │       │
│  │  - absenceService.ts                                 │       │
│  │  - taskTreeService.ts                                │       │
│  │  - monthLockService.ts (check locks)                 │       │
│  └────────────────────────┬─────────────────────────────┘       │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────┐       │
│  │                   Models Layer                        │       │
│  │  - Entry.ts (DB queries)                             │       │
│  │  - EntryAssignment.ts                                │       │
│  │  - Task.ts                                           │       │
│  └────────────────────────┬─────────────────────────────┘       │
│                           │                                      │
│                           ▼                                      │
│                    ┌─────────────┐                              │
│                    │  PostgreSQL  │                              │
│                    │  (Supabase)  │                              │
│                    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Existing Infrastructure

### ✅ Already Implemented

The following infrastructure already exists in the codebase:

**Database Layer (Repositories):**
- `EntryRepository` - CRUD + findByUserIdAndDate, findByUserIdAndDateRange
- `EntryAssignmentRepository` - CRUD + findByEntryId
- `TaskRepository` - CRUD + findByProjectId, findActive
- `MonthLockRepository` - findByYearAndMonth, isMonthLocked
- `AdminTaskAssignmentRepository` - findByUserId, findByTaskId, revoke
- `BaseRepository` - Generic CRUD operations with soft delete support

**Entity Types:**
- All database types generated from Supabase schema (`database.types.ts`)
- Type aliases for Entry, EntryAssignment, Task, etc.

**Database Connection:**
- Supabase client configured and exported
- Redis client for session management (if needed)

**Existing Services & Controllers:**
- `assignmentsService` - Manages admin task assignments
- `tasksService`, `projectsService`, `clientsService`, `usersService`
- Corresponding controllers and routes already following the pattern

## Key Design Decisions

### 1. Backend Architecture: Layered Pattern (EXISTING)

**Decision:** Use a strict layered architecture (Routes → Controllers → Services → Repositories → Database).

**Status:** ✅ Pattern already established in codebase. We will follow the same pattern for entry/absence endpoints.

**Rationale:**
- **Separation of concerns:** Each layer has a single responsibility
- **Testability:** Services can be tested independently of HTTP layer
- **Reusability:** Services can be called from multiple controllers
- **Maintainability:** Clear boundaries make changes easier to reason about

**Implementation:**
```typescript
// Routes: Define HTTP endpoints (NEW)
router.post('/time-entries', authenticate, timeEntriesController.create);

// Controllers: Parse request, call service, format response (NEW)
async create(req, res) {
  const userId = req.user.user_id; // From existing JWT middleware
  const data = await entriesService.createWorkEntry(userId, req.body);
  res.json({ success: true, data });
}

// Services: Business logic, validation, orchestration (NEW)
async createWorkEntry(userId, entryData) {
  await monthLockService.checkLocked(entryData.work_date);
  await verifyUserAssignedToTasks(userId, entryData.assignments.map(a => a.task_id));
  const existing = await entryRepo.findByUserIdAndDate(userId, entryData.work_date);
  if (existing) {
    return await entryRepo.update(existing[0].entry_id, entryData);
  }
  return await entryRepo.create({ ...entryData, user_id: userId });
}

// Repositories: Database queries (ALREADY EXISTS ✅)
// EntryRepository extends BaseRepository
async findByUserIdAndDate(userId, date) {
  return this.dbConnection.from('entries')
    .select('*')
    .eq('user_id', userId)
    .eq('work_date', date);
}
```

### 2. Client State Management: Redux with Async Thunks

**Decision:** Use Redux Toolkit with createAsyncThunk for API calls, not RTK Query.

**Rationale:**
- **Consistency:** Project already uses Redux Toolkit (see authSlice)
- **Flexibility:** Thunks give more control over loading states and error handling
- **Simplicity:** Fewer abstractions than RTK Query for this use case
- **Offline support:** Easier to add draft saving and retry logic later

**Implementation:**
```typescript
// entriesSlice.ts
export const createWorkEntry = createAsyncThunk(
  'entries/createWork',
  async (entryData: CreateWorkEntryRequest, { getState, rejectWithValue }) => {
    try {
      const token = selectAuthToken(getState());
      return await entriesApi.createWork(entryData, token);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const entriesSlice = createSlice({
  name: 'entries',
  initialState: { entries: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkEntry.pending, (state) => { state.loading = true; })
      .addCase(createWorkEntry.fulfilled, (state, action) => {
        state.entries.push(action.payload);
        state.loading = false;
      })
      .addCase(createWorkEntry.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});
```

### 3. Error Handling: Centralized Error Codes

**Decision:** Define error codes as constants, handle in both backend and client.

**Rationale:**
- **Consistency:** Same error codes across backend and client
- **Internationalization:** Error messages can be translated on client
- **Type safety:** TypeScript enums for error codes
- **Testing:** Easy to test specific error scenarios

**Implementation:**
```typescript
// shared/src/types/errors.ts
export enum EntryErrorCode {
  MONTH_LOCKED = 'MONTH_LOCKED',
  TASK_NOT_ASSIGNED = 'TASK_NOT_ASSIGNED',
  TIME_FORMAT_MISMATCH = 'TIME_FORMAT_MISMATCH',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
}

// Backend
throw new AppError('Month is locked', EntryErrorCode.MONTH_LOCKED, 400);

// Client
{error.code === EntryErrorCode.MONTH_LOCKED && (
  <ErrorBanner>
    {t('errors.monthLocked', { year, month })}
  </ErrorBanner>
)}
```

### 4. Data Transformation: Shared Types

**Decision:** Define shared TypeScript types in `/shared/src/types/entries.ts`.

**Rationale:**
- **Type safety:** Compile-time checks for API contracts
- **Single source of truth:** One definition used by both client and server
- **Refactoring safety:** Type changes propagate automatically
- **Documentation:** Types serve as API documentation

**Implementation:**
```typescript
// shared/src/types/entries.ts
export interface CreateWorkEntryRequest {
  work_date: string; // ISO date string
  start_time?: string; // HH:MM:SS
  end_time?: string;
  description?: string;
  assignments: EntryAssignmentInput[];
}

export interface EntryAssignmentInput {
  task_id: number;
  location: WorkLocation;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
}

export interface WorkEntry {
  entry_id: number;
  user_id: number;
  entry_kind: 'work';
  work_date: string;
  // ... all fields from database
  assignments: EntryAssignment[];
}
```

### 5. Time Format Handling: Client-Side Adaptation

**Decision:** ManualReportModal uses 12-hour format (AM/PM), convert to 24-hour for API.

**Rationale:**
- **User experience:** 12-hour format is more intuitive for users
- **Database consistency:** TIME fields use 24-hour format (HH:MM:SS)
- **Existing UI:** Modal already uses AM/PM pickers
- **Localization ready:** Time format can be changed per locale later

**Implementation:**
```typescript
// client/src/features/manual-report/utils/time.ts
export function convertTo24Hour(time: TimeValue): string {
  let hours = time.hours;
  if (time.period === 'PM' && hours !== 12) hours += 12;
  if (time.period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:00`;
}

export function convertTo12Hour(timeString: string): TimeValue {
  const [hours24] = timeString.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 % 12 || 12;
  return { hours, minutes, period };
}
```

### 6. Entry Deduplication: Upsert Pattern

**Decision:** "One entry per user per day" enforced by upsert logic, not database constraint.

**Rationale:**
- **Flexibility:** Database unique constraint would cause errors
- **User experience:** Updating existing entry is smoother than error message
- **Phased rollout:** Can add update endpoint later without breaking changes
- **Transaction safety:** Upsert handles race conditions

**Implementation:**
```typescript
// server/src/services/entryService.ts
async createWorkEntry(userId: number, entryData: CreateWorkEntryRequest) {
  // Check if entry exists for this user/date
  const existing = await Entry.findByUserAndDate(userId, entryData.work_date);

  if (existing) {
    // Update existing entry and its assignments
    return await Entry.update(existing.entry_id, entryData);
  } else {
    // Create new entry
    return await Entry.create(userId, entryData);
  }
}
```

### 7. Task Tree Caching: Fetch on Modal Open

**Decision:** Fetch task tree when ManualReportModal opens, cache in Redux.

**Rationale:**
- **Freshness:** Task assignments may change, need latest data
- **Performance:** Only fetch when needed (modal may never open)
- **Simplicity:** No complex cache invalidation logic
- **UX:** Loading state shown while fetching (acceptable for modal)

**Implementation:**
```typescript
// ManualReportModal.tsx
useEffect(() => {
  if (isOpen && !taskTree.length) {
    dispatch(fetchTaskTree());
  }
}, [isOpen, taskTree.length, dispatch]);
```

### 8. Month Lock Validation: Server-Side Only

**Decision:** Month lock checks only on backend, not client.

**Rationale:**
- **Security:** Client-side checks can be bypassed
- **Consistency:** Single source of truth (database)
- **Simplicity:** No need to fetch lock status on client
- **Error handling:** Clear error message when lock detected

**Implementation:**
```typescript
// server/src/services/monthLockService.ts
async checkLocked(workDate: string): Promise<void> {
  const { year, month } = parseDate(workDate);
  const lock = await MonthLock.findActive(year, month);

  if (lock) {
    throw new AppError(
      'Month is locked',
      EntryErrorCode.MONTH_LOCKED,
      400,
      { year, month, locked_at: lock.locked_at }
    );
  }
}
```

## Data Flow Examples

### Create Work Entry Flow

```
1. User fills out ManualReportModal (Work tab)
   - Selects project: "Website Redesign"
   - Selects task: "Frontend Development"
   - Sets time: 9:00 AM - 5:00 PM
   - Sets location: "Office"

2. User clicks "Save"
   ↓
3. ManualReportModal.handleSave()
   - Validates total hours (missing hours dialog if < 9)
   - Builds entry data with assignments
   ↓
4. dispatch(createWorkEntry(entryData))
   ↓
5. Redux thunk calls entriesApi.createWork()
   - Converts 12-hour time to 24-hour
   - Includes JWT token from authSlice
   ↓
6. POST /api/v1/time-entries
   ↓
7. timeEntriesController.create()
   - Parses request body
   - Extracts userId from JWT
   - Calls service
   ↓
8. entryService.createWorkEntry()
   - Checks month not locked
   - Verifies user assigned to tasks
   - Validates time format matches project
   - Checks for existing entry (upsert)
   - Creates entry + assignments in transaction
   ↓
9. Response flows back to client
   - Success: Entry added to Redux store
   - Error: Error state set, ErrorBanner shown
   ↓
10. HomePage refreshes entries list
    - New entry appears in calendar
```

### Load Entries for Month Flow

```
1. User navigates to HomePage
   - Displays current month (November 2025)

2. useEffect triggers on month change
   ↓
3. dispatch(fetchEntriesByMonth({ year: 2025, month: 11 }))
   ↓
4. Redux thunk calls entriesApi.getByMonth()
   ↓
5. GET /api/v1/time-entries?startDate=2025-11-01&endDate=2025-11-30
   ↓
6. timeEntriesController.list()
   - Parses query params
   - Extracts userId from JWT
   - Calls service
   ↓
7. entryService.getEntriesByDateRange()
   - Queries entries for user in date range
   - Joins with entry_assignments, tasks, projects
   - Returns formatted data
   ↓
8. Response flows back to client
   - Entries stored in Redux
   - HomePage maps entries to DailyEntryCard components
   ↓
9. User sees calendar with their entries
```

## Alternative Approaches Considered

### RTK Query vs Redux Thunks

**Considered:** Use RTK Query for automatic caching and refetching.

**Rejected because:**
- Adds abstraction layer that team is not familiar with
- Harder to customize loading states and error handling
- Overkill for this relatively simple API integration
- Would require refactoring existing authSlice pattern

### Optimistic Updates

**Considered:** Update UI immediately, rollback on error.

**Rejected because:**
- Adds complexity with rollback logic
- Risk of UI showing stale data if rollback fails
- Not critical for MVP (entries aren't created frequently)
- Can add later if UX testing shows need

### Client-Side Month Lock Check

**Considered:** Fetch month lock status on client before submission.

**Rejected because:**
- Extra API call for every month
- Still need server-side check (security)
- Error message on submission is acceptable UX
- Lock status rarely changes (monthly admin operation)

### Single Entry Endpoint for Work + Absence

**Considered:** One `POST /api/v1/entries` endpoint that handles both types.

**Rejected because:**
- Different validation rules (absence can't have task assignments except vacation_partial)
- Different request/response shapes (absence has attachment_path, etc.)
- Clearer API contract with separate endpoints
- Matches project.md API documentation

## Performance Considerations

### Database Queries

**Indexing:**
```sql
-- Required indexes for entry queries
CREATE INDEX idx_entries_user_date ON entries(user_id, work_date);
CREATE INDEX idx_entry_assignments_entry ON entry_assignments(entry_id);
CREATE INDEX idx_entry_assignments_task ON entry_assignments(task_id);
```

**N+1 Query Prevention:**
- Use JOIN to fetch entry + assignments in single query
- Include task/project names in response (avoid client-side lookups)

### Client Caching

**Redux Store:**
- Entries keyed by month (e.g., `entries['2025-11']`)
- Only fetch if not already cached
- Invalidate cache when new entry created

**Task Tree:**
- Cache in Redux after first fetch
- Refresh on manual trigger or after timeout (5 minutes)

## Security Considerations

### Authorization

**User can only:**
- Create entries for themselves (userId from JWT, not request body)
- View their own entries (enforced by WHERE user_id = :userId)
- Report time on tasks they're assigned to (verified by admin_task_assignments)

**Admin can:**
- (Out of scope for this change, but future: view all users' entries)

### Input Validation

**Required checks:**
- work_date is valid date string (YYYY-MM-DD)
- time strings match HH:MM:SS format
- task_id exists and user is assigned
- location is valid enum value
- description length < 1000 characters

### SQL Injection Prevention

- All queries use parameterized statements (Supabase client)
- No raw SQL with string interpolation

## Testing Strategy

### Backend Tests

**Unit tests (Services):**
```typescript
describe('entryService.createWorkEntry', () => {
  it('should create entry with assignments', async () => { ... });
  it('should throw error if month locked', async () => { ... });
  it('should throw error if task not assigned', async () => { ... });
  it('should update existing entry for same date', async () => { ... });
});
```

**Integration tests (Routes):**
```typescript
describe('POST /api/v1/time-entries', () => {
  it('should return 201 with created entry', async () => { ... });
  it('should return 400 if month locked', async () => { ... });
  it('should return 401 if not authenticated', async () => { ... });
});
```

### Client Tests

**Redux tests:**
```typescript
describe('createWorkEntry thunk', () => {
  it('should dispatch fulfilled action on success', async () => { ... });
  it('should dispatch rejected action on API error', async () => { ... });
});
```

**Component tests:**
```typescript
describe('ManualReportModal', () => {
  it('should call createWorkEntry on save', async () => { ... });
  it('should show error banner on month locked', async () => { ... });
});
```

## Migration and Rollout

**Phase 1: Shared Types (Day 1)**
- Define shared TypeScript types for entries, absences, errors
- Export from /shared

**Phase 2: Backend Services (Days 2-4)**
- Implement services: entriesService, absencesService, taskTreeService, monthLockService
- Add validation and business logic
- Test with unit tests

**Phase 3: Backend API (Days 5-6)**
- Implement controllers and routes
- Connect to existing auth middleware
- Test with Postman/curl and integration tests

**Phase 4: Client API Layer (Day 7)**
- Create API client functions in /shared
- Add error parsing and type safety

**Phase 5: Client Redux (Days 8-9)**
- Create Redux slices for entries and tasks
- Implement async thunks
- Add selectors and reducers

**Phase 6: UI Integration (Days 10-12)**
- Connect ManualReportModal to Redux
- Add error handling UI with localized messages
- Load task tree for project/task selection
- Connect HomePage to display entries
- Add loading states

**Phase 7: Testing (Days 13-14)**
- Backend unit and integration tests
- Client Redux and component tests
- End-to-end user flow testing
- Localization testing

**Phase 8: Deploy (Day 15)**
- Merge to dev
- CI/CD validation
- Staging deployment
- QA approval

## Future Enhancements

- Entry editing/deletion
- Draft saving in localStorage
- Offline support with sync queue
- Bulk entry import
- Entry templates
- Timer integration
