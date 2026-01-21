# Tasks: Integrate Users API with Admin Management Page

## Progress Tracker

**Overall Progress:** 8/14 tasks completed

### Phase Status
- [x] **Phase 1:** Foundation (Toast Notifications) - 1/1 tasks
- [x] **Phase 2:** API Service Layer - 1/1 tasks
- [ ] **Phase 3:** Core Integration - 3/4 tasks
- [ ] **Phase 4:** UX Enhancements - 1/3 tasks
- [ ] **Phase 5:** Polish & Testing - 0/2 tasks

---

## Task Breakdown

### Phase 1: Foundation (Toast Notifications)

#### Task 1.1: Create Toast Notification Component
- [x] **TASK COMPLETE**

**Description:** Build reusable toast notification system for success/error feedback

**Steps:**
- [x] 1. Create `admin/src/components/Toast/Toast.tsx` component
  - [x] Support variants: success, error, warning, info
  - [x] Auto-dismiss after configurable duration (default: 5s)
  - [x] Manual dismiss via close button
  - [x] Accessible (ARIA labels, focus management)
- [x] 2. Create `admin/src/components/Toast/ToastContainer.tsx` manager
  - [x] Portal-based rendering at root level
  - [x] Stack multiple toasts vertically
  - [x] Z-index management
- [x] 3. Create `admin/src/components/Toast/useToast.ts` hook
  - [x] `showSuccess(message)`, `showError(message)`, `showWarning(message)`, `showInfo(message)`
  - [x] Global toast state management (React Context or simple state)
  - [x] Queue management for multiple toasts
- [x] 4. Create `admin/src/styles/Toast.css` styles
  - [x] RTL-aware positioning (bottom-right in LTR, bottom-left in RTL)
  - [x] Smooth animations (slide in/out)
  - [x] Responsive design (mobile + desktop)
  - [x] Color-coded by variant

**Validation:**
- [x] Toast appears on showSuccess/showError
- [x] Auto-dismisses after 5 seconds
- [x] Can manually dismiss
- [x] Multiple toasts stack correctly
- [x] Works on mobile and desktop

**Dependencies:** None

---

### Phase 2: API Service Layer

#### Task 2.1: Verify Backend API and Create Type Mappings
- [x] **TASK COMPLETE**

**Description:** Ensure backend endpoints work and create proper type mappings

**Steps:**
- [x] 1. Test `/api/v1/users` endpoints in Postman/curl
  - [x] GET `/api/v1/users?page=1&limit=20&active=true&search=...`
  - [x] POST `/api/v1/users` (create)
  - [x] GET `/api/v1/users/:id` (get single)
  - [x] PATCH `/api/v1/users/:id` (update)
  - [x] DELETE `/api/v1/users/:id` (soft delete)
- [x] 2. Document query parameters supported by backend
  - [x] Verify `search` parameter works
  - [x] Verify `active` filter works
  - [x] Verify `role` filter works
  - [x] Verify `page` and `limit` work
- [x] 3. Create type mapping helpers if needed
  - [x] Form data → API request
  - [x] API response → UI model

**Validation:**
- [x] All endpoints return expected status codes
- [x] Search/filter/pagination query params work
- [x] Response format matches documentation

**Dependencies:** Backend endpoints must be deployed

---

### Phase 3: Core Integration

#### Task 3.1: Implement User List Fetching with Server-Side Features
- [x] **TASK COMPLETE**

**Description:** Replace mock data with real API calls, add server-side search/filter/pagination

**Steps:**
- [x] 1. Add state for API integration in `EmployeesManagementPage.tsx`
  - [x] Add users, loading, error, totalItems, showActiveOnly state
- [x] 2. Create `fetchUsers` function
  - [x] Call `apiClient.get('/api/v1/users')` with query params
  - [x] Pass `{ page, limit: 11, search: searchQuery, active: showActiveOnly }`
  - [x] Handle loading state
  - [x] Handle errors gracefully
  - [x] Update `users`, `totalItems`, `totalPages`
- [x] 3. Add `useEffect` to fetch on mount and when filters change
  - [x] Triggers on: `page`, `searchQuery`, `showActiveOnly`, `sort` changes
  - [x] Debounce search input (300ms)
- [x] 4. Remove client-side filtering/pagination logic (now server-side)
- [x] 5. Add error boundary or error UI for fetch failures
- [x] 6. Add JWT token to request headers from auth state

**Validation:**
- [x] Users load from API on page mount
- [x] Loading spinner shows during fetch
- [x] Error message shows on API failure
- [x] Search triggers new API call
- [x] Pagination works with server data
- [x] Active filter toggle works

**Dependencies:** Task 2.1 (API verification)

---

#### Task 3.2: Implement Create User
- [x] **TASK COMPLETE**

**Description:** Wire up create user form to POST `/api/v1/users`

**Steps:**
- [x] 1. Update `handleSubmit` in `EmployeesManagementPage.tsx`
- [x] 2. When `activeForm === 'create'`:
  - [x] Map form values to API format (full_name, email, password, role, job_title)
  - [x] Set loading state
  - [x] Call `apiClient.post('/api/v1/users', userData)`
  - [x] On success:
    - [x] Show success toast: "עובד נוסף בהצלחה"
    - [x] Close form modal
    - [x] Refresh user list (re-fetch or optimistic update)
  - [x] On error:
    - [x] Show error toast with user-friendly message
    - [x] Handle `EMAIL_EXISTS` → "כתובת האימייל כבר קיימת במערכת"
    - [x] Handle `VALIDATION_ERROR` → Show field-specific error
    - [x] Handle generic → "שגיאה ביצירת עובד, נסה שוב"
    - [x] Keep form open for correction

**Validation:**
- [x] New user appears in table after creation
- [x] Success toast shows
- [x] Form closes on success
- [x] Email duplicate error shows toast
- [x] Validation errors show in toast
- [x] Loading state shows during API call

**Dependencies:** Task 1.1 (Toast), Task 3.1 (Fetch users)

---

#### Task 3.3: Implement Edit User
- [x] **TASK COMPLETE**

**Description:** Wire up edit user form to PATCH `/api/v1/users/:id`

**Steps:**
- [x] 1. Update `handleEditUser` to store user ID in state
- [x] 2. Update `handleSubmit` when `activeForm === 'edit'`
  - [x] Get user ID from state
  - [x] Map form values to API format (password optional)
  - [x] Set loading state
  - [x] Call `apiClient.patch(\`/api/v1/users/\${userId}\`, userData)`
  - [x] On success:
    - [x] Show success toast: "פרטי העובד עודכנו בהצלחה"
    - [x] Close form modal
    - [x] Refresh user list (or optimistic update)
  - [x] On error:
    - [x] Show error toast
    - [x] Handle `EMAIL_EXISTS`, `USER_NOT_FOUND`, `VALIDATION_ERROR`
    - [x] Keep form open

**Validation:**
- [x] User data updates in table after edit
- [x] Success toast shows
- [x] Form closes on success
- [x] Email duplicate error handled
- [x] User not found error handled

**Dependencies:** Task 1.1 (Toast), Task 3.1 (Fetch users)

---

#### Task 3.4: Implement Delete User (Soft Delete)
- [x] **TASK COMPLETE**

**Description:** Wire up delete action to DELETE `/api/v1/users/:id` with optimistic update

**Steps:**
- [x] 1. Update `handleConfirmDelete` in `EmployeesManagementPage.tsx`
  - [x] Get user ID from `deletingUser`
  - [ ] **Optimistic update:** Remove user from UI immediately (Skipped in favor of refetch)
  - [x] Set loading state
  - [x] Call `apiClient.delete(\`/api/v1/users/\${userId}\`)`
  - [x] On success:
    - [x] Show success toast: "העובד הוסר מהמערכת"
    - [x] Close confirmation modal
    - [x] Refetch user list in background (to sync state)
  - [x] On error:
    - [ ] **Rollback optimistic update:** Re-add user to list or refetch (Not needed without optimistic)
    - [x] Show error toast
    - [x] Handle `USER_NOT_FOUND`, `FORBIDDEN` (Handled by general error handler)
    - [x] Close confirmation modal
- [x] 2. Update soft delete behavior
  - [x] Verify backend sets `active = false` (not hard delete)
  - [x] Ensure user disappears from list if `showActiveOnly = true`

**Validation:**
- [ ] User disappears immediately from table (optimistic)
- [ ] Success toast shows
- [ ] User refetches in background
- [ ] Error rollback works if API fails
- [ ] Confirmation modal closes

**Dependencies:** Task 1.1 (Toast), Task 3.1 (Fetch users)

---

### Phase 4: UX Enhancements

#### Task 4.1: Add Loading States
- [ ] **TASK COMPLETE**

**Description:** Show loading spinners/skeletons during API operations

**Steps:**
- [ ] 1. Add loading spinner to table during initial fetch
- [ ] 2. Add loading state to form submit buttons ("שומר..." / "מוסיף...")
- [ ] 3. Add loading state to delete confirmation button
- [ ] 4. Disable form inputs during submission
- [ ] 5. Consider skeleton loading for table rows (optional)

**Validation:**
- [ ] Loading spinner shows on page mount
- [ ] Button shows "loading" text during submit
- [ ] Form inputs disabled during submit
- [ ] Delete button shows loading state

**Dependencies:** Task 3.1, 3.2, 3.3, 3.4

---

#### Task 4.2: Add Error Handling UI
- [x] **TASK COMPLETE**

**Description:** Show user-friendly error messages for all error scenarios

**Steps:**
- [x] 1. Create error message mapping (ERROR_MESSAGES object)
  - [x] EMAIL_EXISTS: 'כתובת האימייל כבר קיימת במערכת'
  - [x] USER_NOT_FOUND: 'המשתמש לא נמצא'
  - [x] VALIDATION_ERROR: 'אימות נתונים נכשל'
  - [x] FORBIDDEN: 'אין הרשאה לביצוע פעולה זו'
  - [x] NETWORK_ERROR: 'שגיאת רשת, בדוק את החיבור לאינטרנט'
  - [x] UNAUTHORIZED: 'נדרשת התחברות מחדש'
- [x] 2. Add error message extraction from API response
- [x] 3. Show empty state when no users found
- [x] 4. Show error state when fetch fails (with retry button)
- [x] 5. Add inline validation errors for forms (optional)

**Validation:**
- [x] Each error code shows Hebrew message
- [x] Network errors show appropriate message
- [x] Empty state shows when no results
- [x] Retry button works on fetch error

**Dependencies:** Task 3.1, 3.2, 3.3, 3.4

---

#### Task 4.3: Add Active User Filter Toggle
- [ ] **TASK COMPLETE**

**Description:** Allow toggling between active and all users

**Steps:**
- [ ] 1. Add toggle/checkbox UI element
  - [ ] Label: "הצג עובדים לא פעילים"
  - [ ] Position: Near search bar
  - [ ] Default: unchecked (show active only)
- [ ] 2. Update `showActiveOnly` state on toggle
- [ ] 3. Trigger refetch when toggled
- [ ] 4. Update query param: `active: showActiveOnly`
- [ ] 5. Show inactive users with visual indicator (grayed out, badge)

**Validation:**
- [ ] Toggle switches between active and all users
- [ ] API called with correct `active` param
- [ ] Inactive users visually distinguished

**Dependencies:** Task 3.1 (Fetch users)

---

### Phase 5: Polish & Testing

#### Task 5.1: Cleanup and Refactoring
- [ ] **TASK COMPLETE**

**Description:** Remove mock data, clean up code, ensure best practices

**Steps:**
- [ ] 1. Remove `mockUsers` import and usage
- [ ] 2. Remove client-side pagination/sorting logic (if fully server-side)
- [ ] 3. Extract API calls to separate service file (optional)
  - [ ] Create `admin/src/services/userService.ts`
  - [ ] Functions: `fetchUsers`, `createUser`, `updateUser`, `deleteUser`
- [ ] 4. Add TypeScript strict type checking
- [ ] 5. Add JSDoc comments for complex functions
- [ ] 6. Ensure proper error boundaries

**Validation:**
- [ ] No mock data references
- [ ] TypeScript compiles without errors
- [ ] Code follows project conventions

**Dependencies:** All previous tasks

---

### Phase 6: Task Employee Assignment Integration

#### Task 6.1: Backend - Users API Filtering
- [x] **TASK COMPLETE**

**Description:** Update Users API to support filtering by active status and text search

**Steps:**
- [x] 1. Update `UserRepository`
  - [x] Add `active` and `search` params to `findPaginated`
  - [x] Implement query filters (eq for active, ilike for search)
- [x] 2. Update `UsersService`
  - [x] Pass filters from `listUsers` to repository
- [x] 3. Update `UsersController`
  - [x] Extract `active` and `search` query params
  - [x] Update validation schema

**Validation:**
- [ ] `GET /api/v1/users?active=true` returns only active users
- [ ] `GET /api/v1/users?search=john` returns matching users

--------------------

#### Task 6.2: Backend - Task Assignments API
- [ ] **TASK PENDING**

**Description:** Create endpoints for creating and listing task assignments

**Steps:**
- [ ] 1. Create `AssignmentController`
  - [ ] `POST /api/v1/tasks/:taskId/assignments`: Create assignment
  - [ ] `GET /api/v1/tasks/:taskId/assignments`: List assignments (optional)
- [ ] 2. Register routes in `routes/tasks.ts` (or equivalent)

**Validation:**
- [ ] Can create assignment via API
- [ ] Enforces unique assignment constraint

--------------------

#### Task 6.3: Frontend - Refactor AssignmentPage Data Fetching
- [ ] **TASK PENDING**

**Description:** Replace mock data in AssignmentPage with real API calls

**Steps:**
- [ ] 1. Create `admin/src/services/assignmentService.ts` (or equivalent)
  - [ ] `fetchAssignments(filters)`
  - [ ] `assignEmployees(taskId, employeeIds)`
- [ ] 2. Update `AssignmentPage.tsx` to fetch tasks/assignments
  - [ ] Replace `mockTasks`, `mockProjects`, `mockClients`, `mockAdminTaskAssignments`
  - [ ] Implement loading and error states

**Validation:**
- [ ] Page loads real data from API
- [ ] Loading spinners work

**Dependencies:** Task 6.1, 6.2

--------------------

#### Task 6.4: Frontend - TaskEmployeeAssignmentForm Integration
- [ ] **TASK PENDING**

**Description:** Wire up the assignment form to fetch employees and submit assignments

**Steps:**
- [ ] 1. Fetch "Potential Employees" from API
  - [ ] Use `fetchUsers` with `active=true` filter
  - [ ] Handle server-side pagination if user count is large
- [ ] 2. Wire `onSubmit` in `AssignmentPage`
  - [ ] Call `apiClient.post('/api/v1/tasks/:id/assignments', ...)`
  - [ ] Handle success/error toasts
- [ ] 3. Handle "Active Assignments" pre-selection
  - [ ] Ensure `initialSelectedIds` reflects current server state

**Validation:**
- [ ] Form shows real "active" employees
- [ ] Submitting updates the backend
- [ ] Success/Error feedback works

**Dependencies:** Task 6.3

---

#### Task 5.2: Testing
- [ ] **TASK COMPLETE**

**Description:** Add tests for critical paths

**Steps:**
- [ ] 1. Add unit tests for toast component (optional)
- [ ] 2. Add integration tests for CRUD operations (optional, using MSW)
- [ ] 3. Manual testing checklist:
  - [ ] Create user (success)
  - [ ] Create user (duplicate email error)
  - [ ] Create user (validation error)
  - [ ] Edit user (success)
  - [ ] Edit user (duplicate email error)
  - [ ] Delete user (success)
  - [ ] Delete user (not found error)
  - [ ] Search users
  - [ ] Pagination
  - [ ] Active filter toggle
  - [ ] Loading states
  - [ ] Error states
  - [ ] Toast notifications
- [ ] 4. Test edge cases:
  - [ ] Network offline
  - [ ] Token expired (401)
  - [ ] Server error (500)
  - [ ] Empty search results

**Validation:**
- [ ] All manual tests pass
- [ ] Unit tests pass (if added)
- [ ] Edge cases handled gracefully

**Dependencies:** Task 5.1

---

## Task Sequencing

**Parallel Work:**
- Task 1.1 (Toast) can be done independently
- Task 2.1 (API verification) can be done independently

**Sequential Work:**
- Task 3.1 → Task 3.2, 3.3, 3.4 (must have fetch working first)
- Task 3.2, 3.3, 3.4 can be done in parallel (independent CRUD ops)
- Task 4.1, 4.2, 4.3 depend on Phase 3 completion
- Task 5.1, 5.2 are final polish

**Recommended Order:**
1. Task 1.1 (Toast) - foundation
2. Task 2.1 (API verification) - ensures backend ready
3. Task 3.1 (Fetch users) - core functionality
4. Task 3.2, 3.3, 3.4 (in any order) - CRUD operations
5. Task 4.1, 4.2, 4.3 (in any order) - UX polish
6. Task 5.1, 5.2 (final) - cleanup and testing
7. Phase 6 (Task Assignment) - can differ to after Phase 5 or parallel to Phase 3/4

## Estimated Effort

- **Phase 1:** ~2-3 hours (Toast component)
- **Phase 2:** ~1 hour (API verification)
- **Phase 3:** ~4-5 hours (Core integration)
- **Phase 4:** ~2-3 hours (UX enhancements)
- **Phase 5:** ~2 hours (Cleanup and testing)
- **Phase 6:** ~3-4 hours (Assignment integration)

**Total:** ~14-18 hours (for experienced developer)

## Testing Strategy

1. **Unit Tests:** Toast component
2. **Integration Tests:** CRUD operations (optional)
3. **Manual Testing:** Full user flow (see Task 5.2)
4. **Edge Case Testing:** Network errors, auth errors, validation errors

## Rollback Plan

If integration fails:
1. Keep mock data as fallback (`useMockData` flag)
2. Revert to client-side pagination/search
3. Use browser alerts instead of toast (temporary)
