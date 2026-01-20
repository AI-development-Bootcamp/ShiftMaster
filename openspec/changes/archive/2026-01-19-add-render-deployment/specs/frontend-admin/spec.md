## ADDED Requirements

### Requirement: Render Static Site Deployment

The admin application SHALL be deployed as a Static Site on Render.

#### Scenario: Render Static Site configured

- **WHEN** examining Render dashboard
- **THEN** a Static Site exists for the admin application
- **AND** it is configured to build from the repository root

#### Scenario: Build command configured

- **WHEN** Render builds the admin application
- **THEN** it runs `npm ci && npm run build -w admin`
- **AND** the build completes successfully

#### Scenario: Publish directory configured

- **WHEN** Render deploys the admin application
- **THEN** it publishes files from `admin/dist` directory
- **AND** the static site is accessible at the Render-provided URL

#### Scenario: Environment variables in Render

- **WHEN** Render builds the admin application
- **THEN** VITE_API_URL environment variable is configured in Render dashboard
- **AND** the build process uses this variable to set the API URL

#### Scenario: Production API URL

- **WHEN** the admin application runs in production
- **THEN** it connects to the backend API using the Render backend URL
- **AND** API requests are successful

#### Scenario: Render deployment succeeds

- **WHEN** code is pushed to the production branch
- **THEN** Render builds and deploys the admin application
- **AND** the static site becomes accessible
- **AND** the application loads without errors
