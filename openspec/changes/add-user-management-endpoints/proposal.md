# Change: Add User Management Endpoints


## Why

Enable admins to manage user accounts programmatically via the API, supporting onboarding, role management, updates, and account deactivation.

---

## What Changes

This proposal introduces a set of admin-only user management endpoints that allow full lifecycle management of user accounts, including:

* Creating new user accounts for onboarding new employees
* Reading and listing existing users
* Updating user information (e.g., name, email, role, status)
* Managing user roles and permissions
* Deactivating user accounts using a soft-delete mechanism instead of permanent removal

### New API Endpoints

- POST /api/v1/users
- GET /api/v1/users
- GET /api/v1/users/:id
- PATCH /api/v1/users/:id
- DELETE /api/v1/users/:id

### New Files

- `server/src/controllers/usersController.ts` - HTTP request handlers
- `server/src/services/usersService.ts` - Business logic using UserRepository
- `server/src/routes/users.ts` - Route definitions with auth middleware
- `server/src/validations/userValidation.ts` - Zod schemas for request validation

### Existing Architecture Used

- `server/src/db/repositories/UserRepository.ts` - Repository pattern for data access (exists in separate branch, will be merged)
  - Uses `create()`, `findById()`, `findAll()`, `update()`, `delete()` (soft delete)
  - Uses `findByEmail()` for email uniqueness checks

**Note:** If UserRepository is not yet available, create temporary stub implementation that will be replaced after repository branch merge.

### Modified Files

- `server/src/routes/index.ts` - Register users routes
- `server/src/app.ts` - Mount users router (if needed)

### Testing

- Unit tests for controller methods
- Unit tests for service methods
- Integration tests for all endpoints
- Test coverage for validation and error cases

---

## Impact

* Admins gain full control over user management without relying on manual database operations
* Enables scalable onboarding and offboarding workflows
* Improves security by allowing controlled role and permission updates
* Lays the groundwork for future admin tooling and automation
* Existing authentication flows remain unchanged; login continues to work only for active users

### Affected Specs

- **backend-server**: Adding user management requirements

### Affected Code

- **New modules created**:
  - server/src/routes/users.ts:1 (route definitions)
  - server/src/controllers/usersController.ts:1 (HTTP handlers)
  - server/src/services/usersService.ts:1 (business logic)
  - server/src/validations/userValidation.ts:1 (Zod schemas)

- **Auth middleware integration**:
  - isAuthenticated: server/src/middleware/auth.ts:21
  - isAdmin: server/src/middleware/auth.ts:81
  - Applied in routes: server/src/routes/users.ts:2, :127, :227, :284, :374, :482, :533

- **Repository interface dependency**:
  - IUserRepository: server/src/db/types/repositories.ts:24
  - UserRepository implementation: server/src/db/repositories/UserRepository.ts:7

- **Password utilities used**:
  - hashPassword: server/src/utils/password.ts:19
  - comparePassword: server/src/utils/password.ts:36

- **Pull Request**: [PR `#18`](https://github.com/AI-development-Bootcamp/ShiftMaster/pull/18)

### Breaking Changes

None - this is additive functionality only.

### Dependencies

- Requires admin authentication (existing `isAdmin` middleware)
- **Depends on `UserRepository`** (exists in separate branch, pending merge)
  - If not merged yet: create temporary stub/mock that matches repository interface
  - Will be replaced with actual repository after branch merge
- Uses password hashing utilities (existing `password.ts`)

## Security Considerations

- All endpoints require admin authentication
- Passwords are hashed before storage using bcrypt
- Email uniqueness is enforced at database level
- Soft delete preserves data integrity
- No password field in responses

## Acceptance Criteria

- [ ] Admin can create users with required fields (full_name, email, password, role)
- [ ] Email uniqueness is enforced (400 error for duplicates)
- [ ] Passwords are hashed before storage
- [ ] New users are active by default
- [ ] Admin can list all users with pagination
- [ ] Admin can retrieve individual user details
- [ ] Admin can update user information
- [ ] Admin can soft delete users (active=false)
- [ ] Non-admin users get 403 errors on all endpoints
- [ ] All endpoints have Swagger documentation
- [ ] All endpoints have comprehensive tests
