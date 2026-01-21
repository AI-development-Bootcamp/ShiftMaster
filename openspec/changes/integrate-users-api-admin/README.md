# Users API Integration for Admin Management Page

**Change ID:** `integrate-users-api-admin`
**Status:** Proposed
**Type:** Feature Enhancement

## Quick Summary

Connect the Admin app's EmployeesManagementPage to the backend `/api/v1/users` API, replacing mock data with real CRUD operations, server-side search/filter/pagination, and toast notifications for user feedback.

## What This Changes

### Before
- ❌ Mock data only, no backend integration
- ❌ All operations log to console, nothing persists
- ❌ Client-side pagination/search/filter
- ❌ No loading or error states
- ❌ No user feedback after operations

### After
- ✅ Full CRUD integration with backend API
- ✅ Real data persistence
- ✅ Server-side pagination/search/filter (scalable)
- ✅ Loading spinners during operations
- ✅ Toast notifications for success/error feedback
- ✅ Optimistic updates for snappy UX
- ✅ Soft delete handling (active flag)

## Key Features

1. **Toast Notification System** - Custom toast component for success/error messages
2. **Server-Side Search** - Scalable search with backend query params
3. **Optimistic Deletes** - Immediate UI update, background API call
4. **Active User Filter** - Show only active users by default (toggle to see all)
5. **Error Handling** - User-friendly Hebrew error messages
6. **Type Safety** - Strong TypeScript types across frontend-backend

## Files Changed

### New Files
- `admin/src/components/Toast/Toast.tsx`
- `admin/src/components/Toast/ToastContainer.tsx`
- `admin/src/components/Toast/useToast.ts`
- `admin/src/styles/Toast.css`
- `shared/src/types/api/users.ts` (optional)

### Modified Files
- `admin/src/pages/EmployeesManagementPage/EmployeesManagementPage.tsx`

## Read More

- **[proposal.md](./proposal.md)** - High-level overview and goals
- **[design.md](./design.md)** - Architectural decisions and trade-offs
- **[tasks.md](./tasks.md)** - Step-by-step implementation tasks
- **[specs/admin-frontend/spec.md](./specs/admin-frontend/spec.md)** - Detailed requirements
- **[specs/shared-types/spec.md](./specs/shared-types/spec.md)** - API type definitions

## Quick Start

1. Review [proposal.md](./proposal.md) for context
2. Read [design.md](./design.md) for architectural decisions
3. Follow [tasks.md](./tasks.md) for implementation steps
4. Refer to spec files for detailed requirements

## Dependencies

- Backend `/api/v1/users` endpoints (already implemented)
- `@shared/api` (ApiClient)
- JWT authentication (already in place)

## Validation

```bash
openspec validate integrate-users-api-admin --strict
```

**Status:** ✅ Valid
