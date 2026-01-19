## ADDED Requirements

### Requirement: Docker Containerization

The backend server SHALL be containerized using Docker for production deployment.

#### Scenario: Dockerfile exists

- **WHEN** examining the server directory
- **THEN** a Dockerfile exists in the server/ directory

#### Scenario: Multi-stage Docker build

- **WHEN** building the Docker image
- **THEN** it uses a multi-stage build (build stage for TypeScript compilation, production stage for runtime)
- **AND** the final image contains only production dependencies

#### Scenario: Docker build succeeds

- **WHEN** running `docker build` in the server directory
- **THEN** the build completes successfully without errors
- **AND** produces a Docker image containing the compiled server

#### Scenario: Docker image runs server

- **WHEN** running the Docker container with required environment variables
- **THEN** the Express server starts and listens on the configured port
- **AND** the health check endpoint responds successfully

#### Scenario: Environment variables in container

- **WHEN** the Docker container starts
- **THEN** it accepts environment variables (JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
- **AND** the server uses these variables for configuration

### Requirement: Render Web Service Deployment

The backend server SHALL be deployed as a Web Service on Render.

#### Scenario: Render Web Service configured

- **WHEN** examining Render dashboard
- **THEN** a Web Service exists for the backend
- **AND** it is configured to use the Dockerfile from the server directory

#### Scenario: Render deployment succeeds

- **WHEN** code is pushed to the production branch
- **THEN** Render builds the Docker image
- **AND** deploys the containerized server
- **AND** the service becomes accessible at the Render-provided URL

#### Scenario: Health check configured

- **WHEN** Render monitors the service
- **THEN** it uses the `/api/health` endpoint for health checks
- **AND** failed health checks trigger service restart

#### Scenario: Environment variables in Render

- **WHEN** the Render service runs
- **THEN** all required environment variables are configured in Render dashboard
- **AND** the server uses Render-provided PORT environment variable

#### Scenario: CORS configured for Render URLs

- **WHEN** frontend applications make requests to the backend
- **THEN** CORS_ORIGINS includes the Render URLs for client and admin applications
- **AND** requests from frontend applications are allowed
