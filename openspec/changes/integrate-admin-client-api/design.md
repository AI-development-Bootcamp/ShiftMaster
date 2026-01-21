# Design: Admin Client API Integration

## Context

The admin application currently uses static mock data for displaying and managing clients. The backend server has complete CRUD endpoints at `/api/v1/clients` protected by JWT authentication. The shared package already provides an `ApiClient` class that handles authentication via `localStorage`.

## Goals

- Connect all client management operations (list, create, update, delete) to the real server
- Maintain existing UI/UX patterns (forms, modals, tables)
- Properly handle async states (loading, error, success)

## Non-Goals

- User authentication flow (assumed handled elsewhere)
- Token refresh/renewal logic
- Migration of projects/tasks/other entities (future changes)

## Decisions

### 1. Service Layer Approach

**Decision**: Create a dedicated `admin/src/api/clientsApi.ts` service module.

**Rationale**: 
- Centralizes all client-related API calls in one place
- Easy to mock for testing
- Follows pattern established by shared `ApiClient`

### 2. Token Handling

**Decision**: Rely on the shared `ApiClient` which automatically reads `auth_token` from `localStorage`.

**Rationale**: The user explicitly stated they manage their JWT token manually. The shared API client already has an interceptor that attaches the token to all requests.

### 3. Form Field Mapping

**Decision**: Map form fields to API fields directly:
- `clientName` → `name`
- `contactDetails` → `contact_info`

**Rationale**: Simple, direct mapping without transformation layers.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| No token present → 401 errors | Clear error handling in UI; user is aware they need to set token |
| Backend validation errors | Display server error messages in form |
| Race conditions on rapid updates | Disable form during submission |

## Open Questions

None — scope is intentionally minimal for this first phase.
