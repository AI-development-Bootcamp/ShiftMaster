# Implementation Tasks

## 1. Setup and Validation

- [x] 1.1 Create `server/src/validations/userValidation.ts` with Zod schemas
  - [x] createUserSchema (full_name, email, password, role, job_title optional)
  - [x] updateUserSchema (all fields optional except user_id)
  - [x] getUserSchema (user_id validation)
  - [x] listUsersSchema (pagination: page, limit)
- [x] 1.2 Add email validation (proper email format)
- [x] 1.3 Add password validation (minimum 8 characters)
- [x] 1.4 Add role validation (enum: admin | regular)
- [x] 1.5 Write unit tests for validation schemas

## 2. Service Layer

**Note:** UserRepository exists in separate branch. If not yet merged, create temporary stub that matches the interface.

- [x] 2.1 Verify `UserRepository` is available or create temporary stub
  - [x] Check if `server/src/db/repositories/UserRepository.ts` exists
  - [x] If not: Create `server/src/db/repositories/UserRepository.stub.ts` with same interface
  - [x] Add TODO comment: "Replace with actual UserRepository after merge"
- [x] 2.2 Create `server/src/services/usersService.ts`
- [x] 2.3 Import and initialize `UserRepository` instance in service
- [x] 2.4 Implement `createUser(userData)` method
  - [x] Use `userRepo.findByEmail()` to check email uniqueness
  - [x] Hash password using existing password utility (`hashPassword()`)
  - [x] Use `userRepo.create()` to insert user with active=true
  - [x] Return created user (without password_hash)
- [x] 2.5 Implement `listUsers(page, limit)` method
  - [x] Use `userRepo.findAll()` to get all users
  - [x] Implement pagination logic (slice results)
  - [x] Return users without password_hash
  - [x] Include total count for pagination
- [x] 2.6 Implement `getUserById(userId)` method
  - [x] Use `userRepo.findById(userId)`
  - [x] Return null/throw if not found
  - [x] Exclude password_hash from response
- [x] 2.7 Implement `updateUser(userId, updates)` method
  - [x] Use `userRepo.findById()` to validate user exists
  - [x] If updating email, use `userRepo.findByEmail()` to check uniqueness
  - [x] If updating password, hash it first with `hashPassword()`
  - [x] Use `userRepo.update()` with only provided fields
  - [x] Return updated user (without password_hash)
- [x] 2.8 Implement `deleteUser(userId)` method (soft delete)
  - [x] Use `userRepo.delete(userId)` (supports soft delete for users)
  - [x] Return success confirmation
- [x] 2.9 Write unit tests for all service methods
  - [x] Test successful operations
  - [x] Test error cases (duplicate email, not found, etc.)
  - [x] Mock UserRepository methods

## 3. Controller Layer

- [x] 3.1 Create `server/src/controllers/usersController.ts`
- [x] 3.2 Implement `createUser` controller
  - [x] Validate request body with Zod schema
  - [x] Call usersService.createUser
  - [x] Return 201 with created user
  - [x] Handle duplicate email error (400)
  - [x] Handle validation errors (400)
- [x] 3.3 Implement `listUsers` controller
  - [x] Validate query parameters (page, limit)
  - [x] Set defaults (page=1, limit=20)
  - [x] Call usersService.listUsers
  - [x] Return 200 with users array and pagination metadata
- [x] 3.4 Implement `getUser` controller
  - [x] Validate user_id parameter
  - [x] Call usersService.getUserById
  - [x] Return 200 with user data
  - [x] Return 404 if not found
- [x] 3.5 Implement `updateUser` controller
  - [x] Validate request body and user_id
  - [x] Call usersService.updateUser
  - [x] Return 200 with updated user
  - [x] Handle not found (404)
  - [x] Handle duplicate email (400)
- [x] 3.6 Implement `deleteUser` controller
  - [x] Validate user_id parameter
  - [x] Call usersService.deleteUser
  - [x] Return 204 or 200 with success message
  - [x] Handle not found (404)
- [x] 3.7 Write unit tests for all controller methods
  - [x] Mock service calls
  - [x] Test response formats
  - [x] Test error handling

## 4. Routes

- [x] 4.1 Create `server/src/routes/users.ts`
- [x] 4.2 Import auth middleware (`isAuthenticated`, `isAdmin`)
- [x] 4.3 Define POST /api/v1/users route (requires isAdmin)
- [x] 4.4 Define GET /api/v1/users route (requires isAdmin)
- [x] 4.5 Define GET /api/v1/users/:id route (requires isAdmin)
- [x] 4.6 Define PATCH /api/v1/users/:id route (requires isAdmin)
- [x] 4.7 Define DELETE /api/v1/users/:id route (requires isAdmin)
- [x] 4.8 Register routes in `server/src/routes/index.ts`

## 5. Swagger Documentation

- [x] 5.1 Add Swagger comments for POST /api/v1/users
  - [x] Document request body schema
  - [x] Document 201 response
  - [x] Document 400 (validation/duplicate) and 403 errors
- [x] 5.2 Add Swagger comments for GET /api/v1/users
  - [x] Document query parameters (page, limit)
  - [x] Document 200 response with pagination
  - [x] Document 403 error
- [x] 5.3 Add Swagger comments for GET /api/v1/users/:id
  - [x] Document path parameter
  - [x] Document 200 response
  - [x] Document 404 and 403 errors
- [x] 5.4 Add Swagger comments for PATCH /api/v1/users/:id
  - [x] Document path parameter and request body
  - [x] Document 200 response
  - [x] Document 400, 403, 404 errors
- [x] 5.5 Add Swagger comments for DELETE /api/v1/users/:id
  - [x] Document path parameter
  - [x] Document 204/200 response
  - [x] Document 403, 404 errors

## 6. Integration Tests

- [ ] 6.1 Create `server/src/tests/integration/users.test.ts`
- [ ] 6.2 Test POST /api/v1/users
  - [ ] Successful user creation
  - [ ] Duplicate email returns 400
  - [ ] Missing required fields returns 400
  - [ ] Non-admin returns 403
  - [ ] Unauthenticated returns 401
- [ ] 6.3 Test GET /api/v1/users
  - [ ] Returns paginated users list
  - [ ] Pagination works correctly
  - [ ] No passwords in response
  - [ ] Non-admin returns 403
- [ ] 6.4 Test GET /api/v1/users/:id
  - [ ] Returns user details
  - [ ] Returns 404 for non-existent user
  - [ ] No password in response
  - [ ] Non-admin returns 403
- [ ] 6.5 Test PATCH /api/v1/users/:id
  - [ ] Updates user successfully
  - [ ] Email uniqueness validated
  - [ ] Returns 404 for non-existent user
  - [ ] Non-admin returns 403
- [ ] 6.6 Test DELETE /api/v1/users/:id
  - [ ] Soft deletes user (active=false)
  - [ ] Returns 404 for non-existent user
  - [ ] Non-admin returns 403

## 7. Post-Merge Integration (if stub was used)

- [ ] 7.1 Wait for UserRepository branch merge
- [ ] 7.2 Remove temporary `UserRepository.stub.ts` if created
- [ ] 7.3 Update imports to use actual `UserRepository`
- [ ] 7.4 Verify all repository methods work as expected
- [ ] 7.5 Re-run all tests with actual repository

## 8. Documentation & Cleanup

- [ ] 8.1 Verify all tests pass
- [ ] 8.2 Verify Swagger UI displays all endpoints correctly
- [ ] 8.3 Test all endpoints manually using Postman/curl
- [ ] 8.4 Update API documentation if needed
- [ ] 8.5 Ensure code follows project style guide
- [ ] 8.6 Run linter and fix any issues
- [ ] 8.7 Run type check and resolve any TypeScript errors
