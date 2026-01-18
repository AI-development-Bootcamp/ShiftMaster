# Tasks: Add User Routes

## Phase 1: Service Layer (Mock Implementation)

- [ ] Create `server/src/services/userService.ts` with mock data storage
- [ ] Implement `getUserById(id: number)` - Get user by ID
- [ ] Implement `getUserByEmail(email: string)` - Get user by email
- [ ] Implement `getCurrentUser(userId: number)` - Get current authenticated user
- [ ] Implement `createUser(userData)` - Create new user with validation
- [ ] Implement `updateUser(id, updates)` - Update user fields
- [ ] Implement `changePassword(userId, currentPassword, newPassword)` - Change password
- [ ] Implement `activateUser(id)` - Set active=true
- [ ] Implement `deactivateUser(id)` - Set active=false
- [ ] Implement `listUsers(filters, pagination)` - List with search/filter/pagination
- [ ] Implement `bulkDeactivateUsers(ids)` - Bulk deactivate
- [ ] Add email uniqueness validation
- [ ] Add password strength validation utility
- [ ] Seed mock data with sample users (admin + regular users)

## Phase 2: Validation Schemas

- [ ] Create `server/src/validations/userValidation.ts` with Zod schemas
- [ ] Schema: `createUserSchema` (full_name, email, password, role)
- [ ] Schema: `updateUserSchema` (full_name?, email?, role?)
- [ ] Schema: `changePasswordSchema` (current_password, new_password)
- [ ] Schema: `listUsersQuerySchema` (page, limit, search, role, active, sort, order)
- [ ] Schema: `userIdParamSchema` (id validation)
- [ ] Add email format validation
- [ ] Add password strength validation (min 8 chars, letter + number)
- [ ] Add role enum validation ('admin' | 'regular')

## Phase 3: Controller Layer

- [ ] Create `server/src/controllers/userController.ts`
- [ ] Implement `getCurrentUser` - GET /users/me handler
- [ ] Implement `updateCurrentUser` - PUT /users/me handler
- [ ] Implement `changePassword` - PATCH /users/me/password handler
- [ ] Implement `listUsers` - GET /users handler (admin)
- [ ] Implement `getUserById` - GET /users/:id handler (admin)
- [ ] Implement `createUser` - POST /users handler (admin)
- [ ] Implement `updateUser` - PUT /users/:id handler (admin)
- [ ] Implement `activateUser` - PATCH /users/:id/activate handler (admin)
- [ ] Implement `deactivateUser` - PATCH /users/:id/deactivate handler (admin)
- [ ] Implement `deleteUser` - DELETE /users/:id handler (admin, soft delete)
- [ ] Implement `bulkDeactivateUsers` - POST /users/bulk-deactivate handler (admin)
- [ ] Add proper error handling (400, 401, 403, 404, 409, 500)
- [ ] Add self-access validation (regular users can only access their own data)

## Phase 4: Routes

- [ ] Create `server/src/routes/users.ts`
- [ ] Add profile routes (isAuthenticated only):
  - [ ] GET /users/me
  - [ ] PUT /users/me
  - [ ] PATCH /users/me/password
- [ ] Add admin routes (isAuthenticated + isAdmin):
  - [ ] GET /users (with query params)
  - [ ] GET /users/:id
  - [ ] POST /users
  - [ ] PUT /users/:id
  - [ ] PATCH /users/:id/activate
  - [ ] PATCH /users/:id/deactivate
  - [ ] DELETE /users/:id
  - [ ] POST /users/bulk-deactivate
- [ ] Add Swagger/OpenAPI documentation for all endpoints
- [ ] Update `server/src/routes/index.ts` to include user routes

## Phase 5: Testing

- [ ] Create `server/src/tests/services/userService.test.ts`
  - [ ] Test getUserById (found, not found)
  - [ ] Test getUserByEmail (found, not found)
  - [ ] Test getCurrentUser
  - [ ] Test createUser (success, duplicate email, invalid data)
  - [ ] Test updateUser (success, not found, invalid data)
  - [ ] Test changePassword (success, wrong current password, weak new password)
  - [ ] Test activateUser/deactivateUser
  - [ ] Test listUsers (pagination, filtering, searching, sorting)
  - [ ] Test bulkDeactivateUsers
  - [ ] Test email uniqueness validation
  - [ ] Test password strength validation

- [ ] Create `server/src/tests/controllers/userController.test.ts`
  - [ ] Test getCurrentUser (success, unauthorized)
  - [ ] Test updateCurrentUser (success, unauthorized, validation errors)
  - [ ] Test changePassword (success, wrong password, weak password, unauthorized)
  - [ ] Test listUsers (success, unauthorized, forbidden, pagination)
  - [ ] Test getUserById (success, not found, unauthorized, forbidden)
  - [ ] Test createUser (success, duplicate email, validation errors, unauthorized, forbidden)
  - [ ] Test updateUser (success, not found, unauthorized, forbidden, self-access check)
  - [ ] Test activateUser/deactivateUser (success, not found, unauthorized, forbidden)
  - [ ] Test deleteUser (success, not found, unauthorized, forbidden)
  - [ ] Test bulkDeactivateUsers (success, unauthorized, forbidden)
  - [ ] Test all error responses (400, 401, 403, 404, 409, 500)

- [ ] Create `server/src/tests/routes/users.test.ts`
  - [ ] Test GET /api/v1/users/me (success, 401)
  - [ ] Test PUT /api/v1/users/me (success, 401, 400)
  - [ ] Test PATCH /api/v1/users/me/password (success, 401, 400)
  - [ ] Test GET /api/v1/users (success, 401, 403, pagination, filters)
  - [ ] Test GET /api/v1/users/:id (success, 401, 403, 404)
  - [ ] Test POST /api/v1/users (success, 401, 403, 400, 409)
  - [ ] Test PUT /api/v1/users/:id (success, 401, 403, 404, 400)
  - [ ] Test PATCH /api/v1/users/:id/activate (success, 401, 403, 404)
  - [ ] Test PATCH /api/v1/users/:id/deactivate (success, 401, 403, 404)
  - [ ] Test DELETE /api/v1/users/:id (success, 401, 403, 404)
  - [ ] Test POST /api/v1/users/bulk-deactivate (success, 401, 403, 400)
  - [ ] Test response content types and structures

- [ ] Create `server/src/tests/validations/userValidation.test.ts`
  - [ ] Test createUserSchema validation
  - [ ] Test updateUserSchema validation
  - [ ] Test changePasswordSchema validation
  - [ ] Test listUsersQuerySchema validation
  - [ ] Test userIdParamSchema validation
  - [ ] Test email format validation
  - [ ] Test password strength validation

## Phase 6: Documentation & Cleanup

- [ ] Add JSDoc comments to all service methods
- [ ] Add JSDoc comments to all controller methods
- [ ] Ensure all Swagger documentation is complete and accurate
- [ ] Add TODO comments marking where DB integration will happen
- [ ] Verify all error responses match specification
- [ ] Run linter and fix any issues
- [ ] Run type checker and fix any issues
- [ ] Ensure all tests pass
- [ ] Update ENV_VARIABLES.md if needed
