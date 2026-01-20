## ADDED Requirements

### Requirement: User Management Endpoints

The system SHALL provide RESTful API endpoints for admin users to manage user accounts through the UserRepository, including creating, reading, updating, and soft-deleting users.

#### Scenario: Create user endpoint

- **WHEN** an admin sends POST /api/v1/users with valid user data (full_name, email, password, role)
- **THEN** the service uses UserRepository.findByEmail() to verify email uniqueness
- **AND** the service hashes the password using hashPassword()
- **AND** the service uses UserRepository.create() to insert the user
- **AND** returns 201 status with user details (excluding password)
- **AND** sets active=true by default
- **AND** includes created_at timestamp

#### Scenario: Duplicate email rejected

- **WHEN** an admin attempts to create a user with an existing email
- **THEN** UserRepository.findByEmail() returns an existing user
- **AND** the system returns 400 status with error code 'DUPLICATE_EMAIL'
- **AND** no user is created

#### Scenario: List users endpoint

- **WHEN** an admin sends GET /api/v1/users with optional pagination parameters (page, limit)
- **THEN** the service uses UserRepository.findAll() to retrieve users
- **AND** implements pagination by slicing results
- **AND** returns 200 status with paginated user list
- **AND** excludes password_hash from all user objects
- **AND** includes pagination metadata (total, page, limit)
- **AND** defaults to page=1, limit=20 if not specified

#### Scenario: Get single user endpoint

- **WHEN** an admin sends GET /api/v1/users/:id with a valid user_id
- **THEN** the service uses UserRepository.findById() to retrieve the user
- **AND** returns 200 status with user details
- **AND** excludes password_hash from response
- **AND** returns 404 if UserRepository.findById() returns null

#### Scenario: Update user endpoint

- **WHEN** an admin sends PATCH /api/v1/users/:id with updated fields
- **THEN** the service uses UserRepository.findById() to verify user exists
- **AND** uses UserRepository.findByEmail() if email is being updated
- **AND** hashes password with hashPassword() if password field is updated
- **AND** uses UserRepository.update() to update only provided fields
- **AND** returns 200 status with updated user details
- **AND** returns 404 if UserRepository.findById() returns null
- **AND** returns 400 if email is duplicate

#### Scenario: Soft delete user endpoint

- **WHEN** an admin sends DELETE /api/v1/users/:id
- **THEN** the service uses UserRepository.delete() which sets active=false
- **AND** returns 204 or 200 status with success message
- **AND** returns 404 if user does not exist
- **AND** preserves user data in database (soft delete via repository)

#### Scenario: Non-admin authorization

- **WHEN** a non-admin user attempts to access any user management endpoint
- **THEN** the system returns 403 status with error code 'FORBIDDEN'
- **AND** does not execute the requested operation

#### Scenario: Unauthenticated access

- **WHEN** an unauthenticated request is made to any user management endpoint
- **THEN** the system returns 401 status with error code 'UNAUTHORIZED'
- **AND** does not execute the requested operation

### Requirement: User Data Validation

The system SHALL validate all user data according to schema requirements before processing.

#### Scenario: Required fields validation

- **WHEN** creating a user without required fields (full_name, email, password, role)
- **THEN** the system returns 400 status with validation errors
- **AND** specifies which fields are missing

#### Scenario: Email format validation

- **WHEN** creating or updating a user with invalid email format
- **THEN** the system returns 400 status with error message 'Invalid email format'
- **AND** does not create or update the user

#### Scenario: Password strength validation

- **WHEN** creating or updating a user with password shorter than 8 characters
- **THEN** the system returns 400 status with error message about password requirements
- **AND** does not create or update the user

#### Scenario: Role validation

- **WHEN** creating or updating a user with invalid role value
- **THEN** the system returns 400 status with error message
- **AND** accepts only 'admin' or 'regular' as valid roles

### Requirement: Password Security

The system SHALL hash all passwords before storing them in the database and never expose password hashes in API responses.

#### Scenario: Password hashing on creation

- **WHEN** a new user is created with a password
- **THEN** the system hashes the password using bcrypt
- **AND** stores only the hashed password in password_hash field
- **AND** never stores plain text passwords

#### Scenario: Password hashing on update

- **WHEN** a user's password is updated
- **THEN** the system hashes the new password using bcrypt
- **AND** replaces the old password_hash with the new hash

#### Scenario: Password exclusion from responses

- **WHEN** any endpoint returns user data
- **THEN** the response excludes password_hash field
- **AND** only includes non-sensitive user information (user_id, full_name, email, role, job_title, active, created_at)

### Requirement: User Management API Documentation

The system SHALL provide comprehensive Swagger/OpenAPI documentation for all user management endpoints.

#### Scenario: Swagger documentation completeness

- **WHEN** accessing Swagger UI at /api-docs
- **THEN** all user management endpoints are documented
- **AND** each endpoint shows request/response schemas
- **AND** all possible status codes are documented (200, 201, 400, 401, 403, 404)
- **AND** authentication requirements are clearly indicated

#### Scenario: Request schema documentation

- **WHEN** viewing endpoint documentation in Swagger UI
- **THEN** request body schemas show required and optional fields
- **AND** field types and formats are specified
- **AND** example values are provided

#### Scenario: Response schema documentation

- **WHEN** viewing endpoint documentation in Swagger UI
- **THEN** response schemas for success and error cases are shown
- **AND** pagination metadata is documented for list endpoints

### Requirement: User Management Test Coverage

The system SHALL have comprehensive automated tests for all user management functionality.

#### Scenario: Unit test coverage

- **WHEN** running unit tests for user management
- **THEN** all service methods are tested
- **AND** all controller methods are tested
- **AND** all validation schemas are tested
- **AND** both success and error cases are covered

#### Scenario: Integration test coverage

- **WHEN** running integration tests for user endpoints
- **THEN** all HTTP endpoints are tested
- **AND** authentication and authorization are verified
- **AND** database interactions are tested
- **AND** error responses are validated
- **AND** edge cases (duplicate email, not found, etc.) are covered

#### Scenario: Test execution success

- **WHEN** running the full test suite
- **THEN** all user management tests pass
- **AND** test coverage meets or exceeds project standards
- **AND** no tests are skipped or pending
