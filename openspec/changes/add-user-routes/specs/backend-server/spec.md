# backend-server Specification Deltas

## ADDED Requirements

### Requirement: User Profile Routes

The server SHALL provide endpoints for authenticated users to manage their own profile.

#### Scenario: Get current user profile

- **WHEN** GET /api/v1/users/me is called with a valid JWT token
- **THEN** a 200 response is returned with the authenticated user's data (user_id, full_name, email, role, active, created_at)

#### Scenario: Get current user profile - unauthorized

- **WHEN** GET /api/v1/users/me is called without a valid JWT token
- **THEN** a 401 Unauthorized response is returned with error code "UNAUTHORIZED"

#### Scenario: Update current user profile

- **WHEN** PUT /api/v1/users/me is called with valid JWT token and valid update data (full_name, email)
- **THEN** a 200 response is returned with updated user data

#### Scenario: Update current user profile - validation error

- **WHEN** PUT /api/v1/users/me is called with invalid data (e.g., invalid email format)
- **THEN** a 400 Bad Request response is returned with validation error details

#### Scenario: Update current user profile - email conflict

- **WHEN** PUT /api/v1/users/me is called with an email that already exists for another user
- **THEN** a 409 Conflict response is returned with error code "EMAIL_ALREADY_EXISTS"

#### Scenario: Change current user password

- **WHEN** PATCH /api/v1/users/me/password is called with valid JWT token, correct current password, and valid new password
- **THEN** a 200 response is returned indicating password was changed successfully

#### Scenario: Change password - incorrect current password

- **WHEN** PATCH /api/v1/users/me/password is called with wrong current password
- **THEN** a 400 Bad Request response is returned with error code "INVALID_CURRENT_PASSWORD"

#### Scenario: Change password - weak new password

- **WHEN** PATCH /api/v1/users/me/password is called with a new password that doesn't meet strength requirements
- **THEN** a 400 Bad Request response is returned with validation error details

### Requirement: Admin User Management Routes

The server SHALL provide endpoints for admin users to manage all users in the system.

#### Scenario: List users with pagination

- **WHEN** GET /api/v1/users is called by an admin user with pagination parameters (page, limit)
- **THEN** a 200 response is returned with paginated user list and pagination metadata (page, limit, total, totalPages)

#### Scenario: List users - unauthorized

- **WHEN** GET /api/v1/users is called without authentication
- **THEN** a 401 Unauthorized response is returned

#### Scenario: List users - forbidden

- **WHEN** GET /api/v1/users is called by a regular user
- **THEN** a 403 Forbidden response is returned with error code "FORBIDDEN"

#### Scenario: List users with search filter

- **WHEN** GET /api/v1/users is called with search query parameter
- **THEN** users matching the search term in name or email are returned

#### Scenario: List users with role filter

- **WHEN** GET /api/v1/users is called with role query parameter ('admin' or 'regular')
- **THEN** only users with the specified role are returned

#### Scenario: List users with active status filter

- **WHEN** GET /api/v1/users is called with active query parameter (true or false)
- **THEN** only users with the specified active status are returned

#### Scenario: List users with sorting

- **WHEN** GET /api/v1/users is called with sort and order query parameters
- **THEN** users are returned sorted by the specified field in the specified order

#### Scenario: Get user by ID

- **WHEN** GET /api/v1/users/:id is called by an admin user with valid user ID
- **THEN** a 200 response is returned with the user data

#### Scenario: Get user by ID - not found

- **WHEN** GET /api/v1/users/:id is called with non-existent user ID
- **THEN** a 404 Not Found response is returned with error code "USER_NOT_FOUND"

#### Scenario: Create user

- **WHEN** POST /api/v1/users is called by an admin user with valid user data (full_name, email, password, role)
- **THEN** a 201 Created response is returned with the created user data (without password_hash)

#### Scenario: Create user - duplicate email

- **WHEN** POST /api/v1/users is called with an email that already exists
- **THEN** a 409 Conflict response is returned with error code "EMAIL_ALREADY_EXISTS"

#### Scenario: Create user - validation error

- **WHEN** POST /api/v1/users is called with invalid data (e.g., missing required fields, invalid email format, weak password)
- **THEN** a 400 Bad Request response is returned with validation error details

#### Scenario: Update user

- **WHEN** PUT /api/v1/users/:id is called by an admin user with valid update data
- **THEN** a 200 response is returned with updated user data

#### Scenario: Update user - not found

- **WHEN** PUT /api/v1/users/:id is called with non-existent user ID
- **THEN** a 404 Not Found response is returned with error code "USER_NOT_FOUND"

#### Scenario: Activate user

- **WHEN** PATCH /api/v1/users/:id/activate is called by an admin user
- **THEN** a 200 response is returned and the user's active status is set to true

#### Scenario: Deactivate user

- **WHEN** PATCH /api/v1/users/:id/deactivate is called by an admin user
- **THEN** a 200 response is returned and the user's active status is set to false

#### Scenario: Soft delete user

- **WHEN** DELETE /api/v1/users/:id is called by an admin user
- **THEN** a 200 response is returned and the user's active status is set to false (soft delete)

#### Scenario: Bulk deactivate users

- **WHEN** POST /api/v1/users/bulk-deactivate is called by an admin user with array of user IDs
- **THEN** a 200 response is returned indicating how many users were deactivated

### Requirement: User Service Layer

The server SHALL provide a userService with methods for user management operations.

#### Scenario: Get user by ID

- **WHEN** userService.getUserById is called with valid user ID
- **THEN** the user data is returned or null if not found

#### Scenario: Get user by email

- **WHEN** userService.getUserByEmail is called with valid email
- **THEN** the user data is returned or null if not found

#### Scenario: Create user with password hashing

- **WHEN** userService.createUser is called with user data including password
- **THEN** the password is hashed using bcrypt before storage, and user data is returned without password_hash

#### Scenario: Email uniqueness validation

- **WHEN** userService.createUser or userService.updateUser is called with an email that already exists
- **THEN** an error is thrown indicating email already exists

#### Scenario: Password strength validation

- **WHEN** userService.createUser or userService.changePassword is called with a weak password
- **THEN** an error is thrown indicating password doesn't meet strength requirements (minimum 8 characters, at least one letter and one number)

#### Scenario: List users with pagination

- **WHEN** userService.listUsers is called with pagination parameters
- **THEN** users are returned with pagination metadata

#### Scenario: List users with search

- **WHEN** userService.listUsers is called with search parameter
- **THEN** users matching the search term in name or email are returned

#### Scenario: List users with filters

- **WHEN** userService.listUsers is called with role and/or active filters
- **THEN** only users matching the filters are returned

### Requirement: Input Validation

The server SHALL validate all user input using Zod schemas.

#### Scenario: Email format validation

- **WHEN** user data includes an email field
- **THEN** the email must match valid email format, otherwise validation error is returned

#### Scenario: Password strength validation

- **WHEN** user data includes a password field
- **THEN** the password must be at least 8 characters with at least one letter and one number, otherwise validation error is returned

#### Scenario: Role validation

- **WHEN** user data includes a role field
- **THEN** the role must be 'admin' or 'regular', otherwise validation error is returned

#### Scenario: Full name validation

- **WHEN** user data includes a full_name field
- **THEN** the full_name must be 1-100 characters (trimmed), otherwise validation error is returned

#### Scenario: Pagination parameter validation

- **WHEN** list users endpoint is called with pagination parameters
- **THEN** page must be positive integer, limit must be 1-100, otherwise validation error is returned

### Requirement: Authorization for User Routes

The server SHALL enforce role-based access control for user management routes.

#### Scenario: Regular user accessing own profile

- **WHEN** a regular user accesses GET /api/v1/users/me
- **THEN** access is granted and their own data is returned

#### Scenario: Regular user accessing other user's data

- **WHEN** a regular user attempts to access GET /api/v1/users/:id with another user's ID
- **THEN** a 403 Forbidden response is returned with error code "FORBIDDEN"

#### Scenario: Regular user attempting admin operations

- **WHEN** a regular user attempts to access any admin-only route (POST /api/v1/users, GET /api/v1/users, etc.)
- **THEN** a 403 Forbidden response is returned with error code "FORBIDDEN"

#### Scenario: Admin accessing any user data

- **WHEN** an admin user accesses any user management route
- **THEN** access is granted regardless of which user's data is being accessed

### Requirement: User Routes Swagger Documentation

The server SHALL provide Swagger/OpenAPI documentation for all user management endpoints.

#### Scenario: Swagger documentation for profile routes

- **WHEN** viewing Swagger UI
- **THEN** GET /api/v1/users/me, PUT /api/v1/users/me, and PATCH /api/v1/users/me/password endpoints are documented with request/response schemas

#### Scenario: Swagger documentation for admin routes

- **WHEN** viewing Swagger UI
- **THEN** all admin user management endpoints are documented with request/response schemas, query parameters, and authorization requirements

### Requirement: User Routes Unit Tests

The server SHALL have comprehensive unit tests for all user management components.

#### Scenario: User service test coverage

- **WHEN** running tests for userService
- **THEN** tests cover all service methods including success cases, error cases, validation, and edge cases

#### Scenario: User controller test coverage

- **WHEN** running tests for userController
- **THEN** tests cover all controller methods including success cases, validation errors, authorization checks, and error responses

#### Scenario: User routes test coverage

- **WHEN** running tests for user routes
- **THEN** tests cover all endpoints including success cases, authentication failures, authorization failures, and error responses

#### Scenario: Validation schema test coverage

- **WHEN** running tests for user validation schemas
- **THEN** tests cover all validation rules including valid inputs, invalid inputs, and edge cases
