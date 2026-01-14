# Development Environment

## ADDED Requirements

### Requirement: Environment Variable Templates
The project SHALL provide a .env.example file documenting all required environment variables.

#### Scenario: Environment variable documentation
- **WHEN** a developer sets up the project
- **THEN** .env.example lists all required variables with descriptions

#### Scenario: Required variables listed
- **WHEN** viewing .env.example
- **THEN** VITE_API_URL and JWT_SECRET are documented

### Requirement: Root Development Scripts
The root package.json SHALL provide scripts to manage all workspaces.

#### Scenario: Start all applications
- **WHEN** running npm run dev from root
- **THEN** client (port 5173), admin (port 5174), and server (port 3000) start concurrently

#### Scenario: Build all applications
- **WHEN** running npm run build from root
- **THEN** all workspaces are built in the correct order

#### Scenario: Run all tests
- **WHEN** running npm test from root
- **THEN** tests execute across all workspaces

#### Scenario: Lint all code
- **WHEN** running npm run lint from root
- **THEN** ESLint checks all workspaces

#### Scenario: Format all code
- **WHEN** running npm run format from root
- **THEN** Prettier formats all workspaces

### Requirement: Git Ignore Configuration
The .gitignore file SHALL exclude node_modules, build outputs, and environment files.

#### Scenario: Dependency exclusion
- **WHEN** running git status after npm install
- **THEN** node_modules directories are ignored

#### Scenario: Build output exclusion
- **WHEN** building any workspace
- **THEN** dist/ and build/ directories are ignored

#### Scenario: Environment file exclusion
- **WHEN** creating a .env file
- **THEN** it is not tracked by git

### Requirement: TypeScript Path Mapping
The TypeScript configuration SHALL support clean imports from the shared package.

#### Scenario: Clean import syntax
- **WHEN** importing from shared in client or admin
- **THEN** the import uses a clean path like 'shared/utils'

### Requirement: Code Quality Tools
ESLint and Prettier SHALL be configured with consistent rules for TypeScript and React.

#### Scenario: TypeScript linting
- **WHEN** ESLint runs on TypeScript files
- **THEN** it applies TypeScript-specific rules

#### Scenario: React linting
- **WHEN** ESLint runs on React components
- **THEN** it applies React hooks and JSX rules

#### Scenario: Auto-formatting on save
- **WHEN** Prettier is integrated with the editor
- **THEN** files are formatted according to .prettierrc on save
