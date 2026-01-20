## MODIFIED Requirements

### Requirement: Production CI/CD Workflow

The system SHALL run automated quality checks, build, and deploy code pushed to the production branch using Render.

#### Scenario: Production workflow triggers on push to production

- **WHEN** code is pushed to the production branch
- **THEN** the production CI/CD workflow runs automatically
- **AND** all jobs (server, client, admin) execute in parallel

#### Scenario: Server job runs full pipeline

- **WHEN** the server job executes in production workflow
- **THEN** it installs dependencies using npm ci
- **AND** runs linting (npm run lint)
- **AND** runs type checking (npm run type-check or tsc --noEmit)
- **AND** runs tests (npm test)
- **AND** builds the project (npm run build)
- **AND** deploys to Render using Render CLI or GitHub integration
- **AND** uses working directory ./server

#### Scenario: Client job runs full pipeline

- **WHEN** the client job executes in production workflow
- **THEN** it installs dependencies using npm ci
- **AND** runs linting (npm run lint)
- **AND** runs type checking (npm run type-check or tsc --noEmit)
- **AND** runs tests (npm test)
- **AND** builds the project (npm run build)
- **AND** triggers Render deployment (via Render CLI or automatic GitHub integration)
- **AND** uses working directory ./client

#### Scenario: Admin job runs full pipeline

- **WHEN** the admin job executes in production workflow
- **THEN** it installs dependencies using npm ci
- **AND** runs linting (npm run lint)
- **AND** runs type checking (npm run type-check or tsc --noEmit)
- **AND** runs tests (npm test)
- **AND** builds the project (npm run build)
- **AND** triggers Render deployment (via Render CLI or automatic GitHub integration)
- **AND** uses working directory ./admin

#### Scenario: Render deployment configuration

- **WHEN** deployment steps execute
- **THEN** Render API key is configured as GitHub secret
- **AND** Render CLI is installed (if used)
- **AND** deployment commands target Render services

#### Scenario: Node.js caching optimizes builds

- **WHEN** any workflow job executes
- **THEN** Node.js dependencies are cached using npm cache
- **AND** cache is based on package-lock.json files
- **AND** cache path matches the working directory (server/package-lock.json, client/package-lock.json, etc.)

#### Scenario: Test environment is configured

- **WHEN** tests run in any workflow job
- **THEN** the NODE_ENV environment variable is set to "test"
- **AND** tests execute with test environment configuration

#### Scenario: Jobs run in parallel

- **WHEN** a workflow is triggered
- **THEN** all jobs execute in parallel
- **AND** workflow completion time is minimized

### Requirement: CI/CD Documentation

The system SHALL document CI/CD pipeline configuration and usage in project documentation.

#### Scenario: CI/CD section exists in project.md

- **WHEN** reviewing project documentation
- **THEN** a CI/CD Pipeline section exists in openspec/project.md
- **AND** it documents staging workflow triggers and steps
- **AND** it documents production workflow triggers and steps
- **AND** it includes Render deployment configuration notes
