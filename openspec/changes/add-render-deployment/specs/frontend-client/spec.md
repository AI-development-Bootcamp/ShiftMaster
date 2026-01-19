## ADDED Requirements

### Requirement: Render Static Site Deployment

The client application SHALL be deployed as a Static Site on Render.

#### Scenario: Render Static Site configured

- **WHEN** examining Render dashboard
- **THEN** a Static Site exists for the client application
- **AND** it is configured to build from the repository root

#### Scenario: Build command configured

- **WHEN** Render builds the client application
- **THEN** it runs `npm ci && npm run build -w client`
- **AND** the build completes successfully

#### Scenario: Publish directory configured

- **WHEN** Render deploys the client application
- **THEN** it publishes files from `client/dist` directory
- **AND** the static site is accessible at the Render-provided URL

#### Scenario: Environment variables in Render

- **WHEN** Render builds the client application
- **THEN** VITE_API_URL environment variable is configured in Render dashboard
- **AND** the build process uses this variable to set the API URL

#### Scenario: Production API URL

- **WHEN** the client application runs in production
- **THEN** it connects to the backend API using the Render backend URL
- **AND** API requests are successful

#### Scenario: Render deployment succeeds

- **WHEN** code is pushed to the production branch
- **THEN** Render builds and deploys the client application
- **AND** the static site becomes accessible
- **AND** the application loads without errors
