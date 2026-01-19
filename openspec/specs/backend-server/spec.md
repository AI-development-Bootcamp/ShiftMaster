# backend-server Specification

## Purpose
TBD - created by archiving change setup-initial-monorepo. Update Purpose after archive.
## Requirements
### Requirement: Express Server with TypeScript

The server SHALL be built with Express and TypeScript.

#### Scenario: Server initialization

- **WHEN** the server starts
- **THEN** Express listens on port 3000 without errors

#### Scenario: TypeScript compilation

- **WHEN** building the server
- **THEN** TypeScript compiles to JavaScript for Node.js

### Requirement: Directory Structure

The server SHALL organize code into routes, controllers, services, middleware, models, and utils directories.

#### Scenario: Standard structure

- **WHEN** viewing /server/src
- **THEN** routes/, controllers/, services/, middleware/, models/, and utils/ directories exist

### Requirement: Service Layer Pattern

The server SHALL implement a service layer containing business logic, separating it from HTTP concerns in controllers.

#### Scenario: Business logic isolation

- **WHEN** a controller needs to perform business operations
- **THEN** it delegates to a service class

#### Scenario: Service reusability

- **WHEN** multiple controllers need the same business logic
- **THEN** they share the same service methods

### Requirement: CORS Configuration

The server SHALL configure CORS middleware to allow requests from frontend applications.

#### Scenario: Frontend requests allowed

- **WHEN** client or admin makes a request to the API
- **THEN** CORS headers permit the request

### Requirement: Error Handling Middleware

The server SHALL provide centralized error handling middleware.

#### Scenario: Error response

- **WHEN** an error occurs in any route
- **THEN** the error middleware catches it and returns a structured JSON response

### Requirement: Health Check Endpoint

The server SHALL provide a health check endpoint for monitoring.

#### Scenario: Health check response

- **WHEN** GET /health is requested
- **THEN** the server returns a 200 status with health information

### Requirement: Development Mode

The server SHALL use nodemon for automatic reloading during development.

#### Scenario: File change detection

- **WHEN** a TypeScript file is modified during development
- **THEN** nodemon restarts the server automatically

### Requirement: API Documentation

The server SHALL provide Swagger/OpenAPI documentation for all endpoints.

#### Scenario: Swagger UI access

- **WHEN** navigating to the Swagger endpoint
- **THEN** interactive API documentation is displayed

### Requirement: Testing Configuration

The server SHALL use Vitest for unit and integration testing.

#### Scenario: Test execution

- **WHEN** running npm test in /server
- **THEN** Vitest executes all test files

#### Scenario: API endpoint testing

- **WHEN** writing tests for routes
- **THEN** they can make HTTP requests to test endpoints

### Requirement: Environment Variables

The server SHALL load environment variables including JWT_SECRET, SUPABASE_URL, and SUPABASE_ANON_KEY.

#### Scenario: JWT configuration

- **WHEN** the server needs to sign or verify JWTs
- **THEN** it uses the JWT_SECRET environment variable

#### Scenario: Database connection

- **WHEN** the server connects to the database
- **THEN** it uses the SUPABASE_URL environment variable

### Requirement: JWT Token Generation and Verification

The server SHALL provide utilities to generate and verify JWT tokens for user authentication.

#### Scenario: Token generation with user payload

- **WHEN** generateToken is called with user data (userId, email, role)
- **THEN** a valid JWT token is returned with 24-hour expiry

#### Scenario: Token verification success

- **WHEN** verifyToken is called with a valid, non-expired JWT token
- **THEN** the decoded payload (userId, email, role) is returned

#### Scenario: Token verification failure - expired token

- **WHEN** verifyToken is called with an expired JWT token
- **THEN** an error is thrown with "Token expired" message

#### Scenario: Token verification failure - invalid signature

- **WHEN** verifyToken is called with a tampered JWT token
- **THEN** an error is thrown with "Invalid token" message

### Requirement: Password Hashing and Comparison

The server SHALL provide utilities to securely hash and compare passwords using bcrypt.

#### Scenario: Password hashing

- **WHEN** hashPassword is called with a plain-text password
- **THEN** a bcrypt hash is returned with 10 salt rounds

#### Scenario: Password comparison success

- **WHEN** comparePassword is called with matching plain-text password and hash
- **THEN** true is returned

#### Scenario: Password comparison failure

- **WHEN** comparePassword is called with non-matching plain-text password and hash
- **THEN** false is returned

### Requirement: Authentication Middleware

The server SHALL provide isAuthenticated middleware to verify JWT tokens on protected routes.

#### Scenario: Valid token in Authorization header

- **WHEN** a request includes "Authorization: Bearer <valid-token>"
- **THEN** the middleware attaches decoded user data to req.user and calls next()

#### Scenario: Missing Authorization header

- **WHEN** a request does not include an Authorization header
- **THEN** the middleware returns 401 Unauthorized with error code "UNAUTHORIZED"

#### Scenario: Invalid or malformed token

- **WHEN** a request includes an invalid JWT token
- **THEN** the middleware returns 401 Unauthorized with error code "UNAUTHORIZED"

#### Scenario: Expired token

- **WHEN** a request includes an expired JWT token
- **THEN** the middleware returns 401 Unauthorized with error code "UNAUTHORIZED"

### Requirement: Role-Based Authorization Middleware

The server SHALL provide isAdmin middleware to restrict routes to admin users only.

#### Scenario: Admin user access

- **WHEN** an authenticated user with role "admin" accesses a protected route
- **THEN** the middleware calls next() to allow access

#### Scenario: Regular user denied access

- **WHEN** an authenticated user with role "regular" accesses an admin-only route
- **THEN** the middleware returns 403 Forbidden with error code "FORBIDDEN"

#### Scenario: Unauthenticated user

- **WHEN** an unauthenticated request (no req.user) accesses an admin-only route
- **THEN** the middleware returns 401 Unauthorized with error code "UNAUTHORIZED"

### Requirement: Login Endpoint

The server SHALL provide POST /api/auth/login endpoint for user authentication.

#### Scenario: Successful login with valid credentials

- **WHEN** POST /api/auth/login is called with valid email and password
- **THEN** a 200 response is returned with JWT token and user data (user_id, full_name, email, role)

#### Scenario: Login failure - invalid email

- **WHEN** POST /api/auth/login is called with non-existent email
- **THEN** a 401 Unauthorized response is returned with error code "INVALID_CREDENTIALS"

#### Scenario: Login failure - incorrect password

- **WHEN** POST /api/auth/login is called with correct email but wrong password
- **THEN** a 401 Unauthorized response is returned with error code "INVALID_CREDENTIALS"

#### Scenario: Login failure - inactive user

- **WHEN** POST /api/auth/login is called with credentials for an inactive user (active=false)
- **THEN** a 401 Unauthorized response is returned with error code "INVALID_CREDENTIALS"

#### Scenario: Login failure - missing fields

- **WHEN** POST /api/auth/login is called without email or password
- **THEN** a 400 Bad Request response is returned with validation error details

### Requirement: JWT Secret Configuration

The server SHALL validate that JWT_SECRET environment variable is set at startup.

#### Scenario: Server startup with JWT_SECRET

- **WHEN** the server starts with JWT_SECRET environment variable set
- **THEN** the server initializes successfully

#### Scenario: Server startup without JWT_SECRET

- **WHEN** the server starts without JWT_SECRET environment variable
- **THEN** the server throws an error and refuses to start

### Requirement: Authentication Error Responses

The server SHALL return standardized error responses for authentication failures.

#### Scenario: 401 Unauthorized format

- **WHEN** authentication fails (invalid credentials, missing token, expired token)
- **THEN** the response has status 401 and JSON body with success=false and error object

#### Scenario: 403 Forbidden format

- **WHEN** authorization fails (user lacks required role)
- **THEN** the response has status 403 and JSON body with success=false and error object

### Requirement: Authentication Unit Tests

The server SHALL have comprehensive unit tests for all authentication components.

#### Scenario: JWT utilities test coverage

- **WHEN** running tests for jwt.ts
- **THEN** tests cover token generation, verification, expiry, and invalid signatures

#### Scenario: Password utilities test coverage

- **WHEN** running tests for password.ts
- **THEN** tests cover hashing, comparison success, and comparison failure

#### Scenario: Middleware test coverage

- **WHEN** running tests for auth middleware
- **THEN** tests cover valid tokens, missing tokens, expired tokens, invalid tokens, role checks

#### Scenario: Login endpoint test coverage

- **WHEN** running tests for POST /api/auth/login
- **THEN** tests cover successful login, invalid credentials, missing fields, and inactive users

