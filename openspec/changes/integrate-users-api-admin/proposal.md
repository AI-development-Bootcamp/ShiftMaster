# Proposal: Integrate Users API with Admin Management Page

## Overview

Connect the Admin app's EmployeesManagementPage to the backend `/api/v1/users` endpoints, replacing mock data with real API integration. Add proper CRUD operations, loading/error states, soft delete handling, admin authorization, and toast notifications for user feedback.

## Problem Statement

The EmployeesManagementPage currently uses mock data and has no backend integration:
- All operations (create/edit/delete) only log to console
- No API calls to server
- No loading or error states
- No user feedback after operations
- Client-side pagination/sorting/filtering only
- Missing validation and authorization checks

## Proposed Solution

### 1. Backend API Integration
- Connect to existing `/api/v1/users` endpoints (already implemented)
- Use shared `apiClient` from `@shared/api`
- Handle soft deletes via `active` flag (no hard deletes)
- Validate admin role before operations (server handles auth, client shows appropriate UI)

### 2. State Management
- Add loading states for all async operations (fetch, create, update, delete)
- Add error handling with user-friendly error messages
- Implement optimistic updates for delete operations
- Manage server-side pagination, sorting, and search

### 3. User Feedback
- Create toast notification component for success/error messages
- Show notifications after create/edit/delete operations
- Display inline errors for form validation failures

### 4. Data Filtering
- Default to showing only active users
- Add server-side search support (send query to backend)
- Use backend pagination instead of client-side
- Support role filtering via backend query params

### 5. Form Integration
- Map form fields to API request format
  - Form: `jobTitle` → API: `job_title`
  - Form: `full_name` → API: `full_name`
  - Form: `role` values ("admin"/"regular") → API: UserRole enum
- Handle password field properly (required for create, optional for edit)
- Validate email uniqueness via API error handling

## Key Requirements

### Must Have
1. Full CRUD operations with backend API
2. Loading and error states
3. Toast notifications for user feedback
4. Server-side search/filter/pagination
5. Soft delete handling (active flag)
6. Optimistic UI updates for delete
7. Proper error handling and user-friendly messages
8. Filter active users by default

### Should Have
1. Form validation matching backend rules
2. Role-based UI adjustments (admin warnings)
3. Email uniqueness validation feedback

### Won't Have (Out of Scope)
1. Backend changes (API already exists)
2. Authentication changes (JWT already implemented)
3. Permission management UI

## Impact Analysis

### Files to Modify
- `admin/src/pages/EmployeesManagementPage/EmployeesManagementPage.tsx` - Main integration
- `admin/src/components/FormShell/FormShell.tsx` - May need minor adjustments

### Files to Create
- `admin/src/components/Toast/Toast.tsx` - Toast notification component
- `admin/src/components/Toast/ToastContainer.tsx` - Toast manager
- `admin/src/components/Toast/useToast.ts` - Toast hook
- `admin/src/styles/Toast.css` - Toast styles
- `admin/src/types/toast.ts` - Toast types (optional, can use inline)

### Dependencies
- Existing: `@shared/api` (ApiClient)
- Existing: `@shared/types` (User, UserRole)
- Existing: `/api/v1/users` backend endpoints
- Existing: JWT authentication middleware

## Risk Assessment

### Low Risk
- Backend API already tested and working
- Soft delete pattern already established in project
- Authentication/authorization handled by backend

### Medium Risk
- Server-side search requires backend query support (needs verification)
- Toast notification system is new (may need iteration)
- Error handling coverage (need to handle all error codes)

### Mitigation
- Test all API error responses
- Add comprehensive error messages for common scenarios
- Fallback to client-side search if server-side not ready
- Use defensive programming for edge cases

## Success Criteria

1. Users can create new employees via API
2. Users can edit existing employees via API
3. Users can soft-delete employees (sets active=false)
4. Loading states show during API calls
5. Success toasts appear after operations
6. Error toasts show user-friendly messages
7. Table refreshes after operations
8. Search queries sent to backend
9. Only active users shown by default
10. Pagination works with backend data

## Open Questions

1. ✅ **RESOLVED:** Should we show only active users by default? → Yes, active only
2. ✅ **RESOLVED:** Toast notification approach? → Create new Toast component
3. ✅ **RESOLVED:** Delete behavior? → Optimistic update (remove row immediately, refetch in background)
4. ✅ **RESOLVED:** Server-side search support? → Yes, add server-side search

## Dependencies

- Backend: `/api/v1/users` endpoints (already implemented)
- Shared: `ApiClient` and type definitions
- Auth: JWT token from Redux auth state

## Timeline Estimate

This is a design proposal - implementation will be broken into tasks after approval.

## Related Changes

- Related to: `add-user-management-endpoints` (backend implementation)
- Depends on: Authentication system (already in place)
- Enables: Full admin user management workflow
