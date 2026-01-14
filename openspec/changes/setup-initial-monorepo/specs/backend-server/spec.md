# Backend Server

## ADDED Requirements

### Requirement: Express Server with TypeScript
The server SHALL be built with Express and TypeScript.

#### Scenario: Server initialization
- **WHEN** the server starts
- **THEN** Express listens on port 3000 without errors

#### Scenario: TypeScript compilation
- **WHEN** building the server
- **THEN** TypeScript compiles to JavaScript for Node.js

### Requirement: Directory Structure
The server SHALL organize code into routes, controllers, middleware, models, and utils directories.

#### Scenario: Standard structure
- **WHEN** viewing /server/src
- **THEN** routes/, controllers/, middleware/, models/, and utils/ directories exist

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
The server SHALL load environment variables including JWT_SECRET, DATABASE_URL, SUPABASE_URL, and SUPABASE_ANON_KEY.

#### Scenario: JWT configuration
- **WHEN** the server needs to sign or verify JWTs
- **THEN** it uses the JWT_SECRET environment variable

#### Scenario: Database connection
- **WHEN** the server connects to the database
- **THEN** it uses the DATABASE_URL environment variable
