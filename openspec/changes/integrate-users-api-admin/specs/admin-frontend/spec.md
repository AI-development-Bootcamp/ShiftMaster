# Spec Delta: Admin Frontend - Users Management Integration

## Capability

Integrate Admin app's EmployeesManagementPage with backend `/api/v1/users` API, replacing mock data with real CRUD operations, server-side search/filter/pagination, and user feedback via toast notifications.

## ADDED Requirements

### Requirement: Toast Notification System

The Admin app SHALL provide a reusable toast notification component for displaying temporary success, error, warning, and info messages to users.

#### Scenario: Show success toast after user creation
- GIVEN admin creates a new user successfully
- WHEN the API returns 201 success
- THEN a green success toast SHALL appear with message "עובד נוסף בהצלחה"
- AND the toast SHALL auto-dismiss after 5 seconds
- AND the user can manually dismiss it early

#### Scenario: Show error toast on API failure
- GIVEN admin attempts to create a user with duplicate email
- WHEN the API returns 400 with `EMAIL_EXISTS` code
- THEN a red error toast SHALL appear with message "כתובת האימייל כבר קיימת במערכת"
- AND the toast SHALL remain until manually dismissed or 5 seconds elapse

#### Scenario: Multiple toasts stack correctly
- GIVEN admin triggers multiple operations quickly
- WHEN multiple success/error events occur
- THEN toasts SHALL stack vertically without overlapping
- AND newest toasts SHALL appear at the top of the stack
- AND each toast SHALL auto-dismiss independently

---

### Requirement: Users List with Server-Side Features

The EmployeesManagementPage SHALL fetch users from `/api/v1/users` with server-side pagination, search, and filtering instead of client-side processing.

#### Scenario: Fetch users on page load
- GIVEN admin navigates to EmployeesManagementPage
- WHEN the page mounts
- THEN the page SHALL send `GET /api/v1/users?page=1&limit=11&active=true`
- AND display loading spinner while fetching
- AND populate table with returned users
- AND display pagination controls based on `totalPages`

#### Scenario: Server-side search
- GIVEN admin types "john" in search box
- WHEN 300ms debounce completes
- THEN the page SHALL send `GET /api/v1/users?page=1&limit=11&active=true&search=john`
- AND update table with filtered results from server
- AND reset to page 1

#### Scenario: Filter active users
- GIVEN admin toggles "הצג עובדים לא פעילים" checkbox
- WHEN checkbox is checked
- THEN the page SHALL send `GET /api/v1/users?page=1&limit=11&active=false`
- AND show both active and inactive users
- AND visually distinguish inactive users (grayed out or badge)

#### Scenario: Pagination with server-side data
- GIVEN admin is viewing page 1 of users
- WHEN admin clicks page 2
- THEN the page SHALL send `GET /api/v1/users?page=2&limit=11&active=true&search=...`
- AND update table with page 2 data

#### Scenario: Handle empty results
- GIVEN admin searches for a non-existent user
- WHEN API returns empty `users` array
- THEN table SHALL show empty state message "לא נמצאו עובדים"
- AND pagination SHALL be hidden

#### Scenario: Handle fetch error
- GIVEN API is unavailable
- WHEN page attempts to fetch users
- THEN page SHALL show error message "שגיאה בטעינת נתונים"
- AND provide "נסה שוב" retry button

---

### Requirement: Create User via API

The create user form SHALL send POST request to `/api/v1/users` and handle success/error responses.

#### Scenario: Successfully create user
- GIVEN admin fills out create user form
- WHEN admin clicks "הוסף עובד"
- THEN form SHALL send POST `/api/v1/users` with:
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "regular",
    "job_title": "Developer"
  }
  ```
- AND show loading state on submit button ("מוסיף...")
- AND disable form inputs during submission
- WHEN API returns 201 success
- THEN show success toast "עובד נוסף בהצלחה"
- AND close form modal
- AND refetch users list to show new user

#### Scenario: Handle duplicate email error
- GIVEN admin creates user with existing email
- WHEN API returns 400 with `EMAIL_EXISTS` code
- THEN show error toast "כתובת האימייל כבר קיימת במערכת"
- AND keep form open for correction
- AND clear loading state

#### Scenario: Handle validation error
- GIVEN admin submits invalid data (e.g., password too short)
- WHEN API returns 400 with `VALIDATION_ERROR` code
- THEN show error toast with validation details
- AND keep form open

#### Scenario: Handle unauthorized error
- GIVEN admin's JWT token is expired
- WHEN API returns 401
- THEN show error toast "נדרשת התחברות מחדש"
- AND optionally redirect to login

---

### Requirement: Edit User via API

The edit user form SHALL send PATCH request to `/api/v1/users/:id` and update user data.

#### Scenario: Successfully edit user
- GIVEN admin clicks edit on user row
- WHEN form opens with pre-filled values
- THEN password field SHALL be empty (not pre-filled for security)
- AND other fields SHALL show current user data
- WHEN admin updates fields and submits
- THEN form SHALL send PATCH `/api/v1/users/:id` with changed fields
- AND show loading state ("שומר...")
- WHEN API returns 200 success
- THEN show success toast "פרטי העובד עודכנו בהצלחה"
- AND close form
- AND update user in table (refetch or optimistic update)

#### Scenario: Handle user not found error
- GIVEN admin edits a user that was deleted by another admin
- WHEN API returns 404 with `USER_NOT_FOUND` code
- THEN show error toast "המשתמש לא נמצא"
- AND close form
- AND refetch users list

#### Scenario: Edit without password change
- GIVEN admin edits user without changing password
- WHEN password field is left empty
- THEN form SHALL NOT include `password` in PATCH request
- AND backend SHALL keep existing password

---

### Requirement: Delete User (Soft Delete) via API

The delete action SHALL send DELETE request to `/api/v1/users/:id` with optimistic UI update.

#### Scenario: Successfully delete user
- GIVEN admin clicks delete on user row
- WHEN confirmation modal appears
- AND admin confirms deletion
- THEN immediately remove user from table (optimistic update)
- AND send DELETE `/api/v1/users/:id`
- WHEN API returns 200 success
- THEN show success toast "העובד הוסר מהמערכת"
- AND close confirmation modal
- AND refetch users list in background to sync state

#### Scenario: Handle delete API error
- GIVEN admin deletes user but API fails
- WHEN API returns error (500, 404, etc.)
- THEN rollback optimistic update (re-add user to table)
- OR refetch entire users list
- AND show error toast with appropriate message
- AND close confirmation modal

#### Scenario: Soft delete behavior
- GIVEN admin deletes user
- WHEN DELETE API succeeds
- THEN backend SHALL set `active = false` (not hard delete)
- AND user SHALL disappear from table if "show active only" is enabled
- AND user SHALL remain visible if "show all users" is enabled (with inactive badge)

---

### Requirement: Loading States

All async operations SHALL display loading indicators to provide user feedback.

#### Scenario: Loading state during initial fetch
- GIVEN page is loading for first time
- WHEN users are being fetched
- THEN table SHALL show loading spinner or skeleton rows
- AND table content SHALL be hidden until data loads

#### Scenario: Loading state during form submission
- GIVEN admin submits create/edit form
- WHEN API request is in progress
- THEN submit button SHALL show "שומר..." or "מוסיף..."
- AND all form inputs SHALL be disabled
- AND button SHALL be disabled

#### Scenario: Loading state during delete
- GIVEN admin confirms deletion
- WHEN DELETE request is in progress
- THEN confirm button SHALL show "מוחק..."
- AND button SHALL be disabled

---

### Requirement: Error Handling

All API errors SHALL be handled gracefully with user-friendly Hebrew messages.

#### Scenario: Map error codes to Hebrew messages
- GIVEN API returns error with code
- WHEN error code is one of:
  - `EMAIL_EXISTS` → "כתובת האימייל כבר קיימת במערכת"
  - `USER_NOT_FOUND` → "המשתמש לא נמצא"
  - `VALIDATION_ERROR` → "אימות נתונים נכשל"
  - `FORBIDDEN` → "אין הרשאה לביצוע פעולה זו"
  - `UNAUTHORIZED` → "נדרשת התחברות מחדש"
- THEN show corresponding Hebrew message in toast

#### Scenario: Handle network errors
- GIVEN network is offline or API is unreachable
- WHEN API request fails with network error
- THEN show error toast "שגיאת רשת, בדוק את החיבור לאינטרנט"

#### Scenario: Handle generic server errors
- GIVEN API returns 500 internal server error
- WHEN no specific error code is provided
- THEN show error toast "שגיאת שרת, נסה שוב מאוחר יותר"

---

### Requirement: JWT Token Authentication

All API requests SHALL include JWT token from auth state in Authorization header.

#### Scenario: Include JWT in API requests
- GIVEN admin is authenticated
- WHEN any API request is made to `/api/v1/users`
- THEN request SHALL include header `Authorization: Bearer <token>`
- AND token SHALL be retrieved from Redux auth state

#### Scenario: Handle expired token
- GIVEN admin's JWT token has expired
- WHEN API returns 401 Unauthorized
- THEN show error toast "נדרשת התחברות מחדש"
- AND optionally redirect to login page
- OR trigger token refresh flow (if implemented)

---

## REMOVED Requirements

### Requirement: Client-Side Pagination and Search

The EmployeesManagementPage SHALL NOT use client-side pagination, sorting, and search.

**Reason:** Replaced by server-side pagination, sorting, and search (see "Users List with Server-Side Features" requirement above). Client-side approach does not scale for large user lists.

#### Scenario: Remove client-side filtering logic
- GIVEN EmployeesManagementPage previously filtered users locally
- WHEN new server-side integration is implemented
- THEN all client-side filter/sort/pagination logic SHALL be removed
- AND replaced with server-side query parameters

---

### Requirement: Mock User Data

The EmployeesManagementPage SHALL NOT use mock user data.

**Reason:** Replaced with real API integration.

#### Scenario: Remove mock data imports
- GIVEN EmployeesManagementPage previously imported `mockUsers`
- WHEN real API integration is implemented
- THEN `mockUsers` import SHALL be removed
- AND all references to mock data SHALL be replaced with API calls

---

## Cross-References

- **Related Capability:** `backend-server` (provides `/api/v1/users` endpoints)
- **Depends On:** Authentication system (JWT tokens)
- **Depends On:** `@shared/api` (ApiClient)
- **Depends On:** `@shared/types` (User, UserRole)

---

## Implementation Notes

### Component Structure
```
admin/src/
├── components/
│   ├── Toast/
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── useToast.ts
│   │   └── index.ts
│   └── ...
├── pages/
│   └── EmployeesManagementPage/
│       └── EmployeesManagementPage.tsx (MODIFIED)
├── services/ (optional)
│   └── userService.ts
└── styles/
    └── Toast.css
```

### State Management
- Use local component state for users, loading, error
- Use Redux auth state for JWT token
- Consider extracting API calls to service layer for reusability

### API Request Format
```typescript
// Create User
POST /api/v1/users
{
  full_name: string,
  email: string,
  password: string,
  role: 'admin' | 'regular',
  job_title?: string | null
}

// Update User
PATCH /api/v1/users/:id
{
  full_name?: string,
  email?: string,
  password?: string, // optional, omit to keep existing
  role?: 'admin' | 'regular',
  job_title?: string | null,
  active?: boolean
}

// Fetch Users
GET /api/v1/users?page=1&limit=11&active=true&search=query&role=admin

// Delete User (soft delete)
DELETE /api/v1/users/:id
```

### Error Code Mapping
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_EXISTS: 'כתובת האימייל כבר קיימת במערכת',
  USER_NOT_FOUND: 'המשתמש לא נמצא',
  VALIDATION_ERROR: 'אימות נתונים נכשל',
  FORBIDDEN: 'אין הרשאה לביצוע פעולה זו',
  UNAUTHORIZED: 'נדרשת התחברות מחדש',
  NETWORK_ERROR: 'שגיאת רשת, בדוק את החיבור לאינטרנט',
  SERVER_ERROR: 'שגיאת שרת, נסה שוב מאוחר יותר',
};
```

---

## Testing Considerations

1. **Unit Tests:** Toast component behavior
2. **Integration Tests:** Mock API responses and test CRUD flows
3. **Manual Tests:** Full user journey (create, edit, delete, search, filter)
4. **Edge Cases:** Network errors, token expiration, validation errors, concurrent operations

---

## Accessibility

- Toast notifications MUST have ARIA live regions
- Loading states MUST announce to screen readers
- Form validation errors MUST be associated with inputs
- Focus management for modals and toasts

---

## Performance

- Debounce search input (300ms) to reduce API calls
- Use optimistic updates for delete to improve perceived performance
- Consider caching recent user list to reduce refetches
- Implement request cancellation for abandoned searches
