# Monorepo Structure

## ADDED Requirements

### Requirement: Workspace Organization
The project SHALL use npm workspaces to organize code into four independent packages: client, admin, server, and shared.

#### Scenario: Workspace discovery
- **WHEN** npm install is run at the project root
- **THEN** all workspace packages are installed and linked correctly

#### Scenario: Cross-workspace dependencies
- **WHEN** client or admin imports from shared package
- **THEN** TypeScript resolves the import without errors

### Requirement: Flat Directory Structure
The monorepo SHALL use a flat structure without an apps/ directory, with workspaces at the root level.

#### Scenario: Directory layout
- **WHEN** viewing the project root
- **THEN** /client, /admin, /server, and /shared directories exist at the top level

### Requirement: Shared TypeScript Configuration
The project SHALL provide a base TypeScript configuration that all workspaces extend.

#### Scenario: Base config inheritance
- **WHEN** any workspace compiles TypeScript
- **THEN** it uses settings from tsconfig.base.json

#### Scenario: Strict mode enabled
- **WHEN** TypeScript compilation runs
- **THEN** strict mode is enabled for all workspaces

### Requirement: Shared Linting and Formatting
The project SHALL provide shared ESLint and Prettier configurations used by all workspaces.

#### Scenario: Consistent formatting
- **WHEN** prettier is run on any workspace
- **THEN** it applies 2-space indentation and single quotes

#### Scenario: Linting rules
- **WHEN** eslint is run on any workspace
- **THEN** it enforces the same rules across all code

### Requirement: Root Package Scripts
The root package.json SHALL provide scripts to run, build, and test all workspaces.

#### Scenario: Development mode
- **WHEN** running npm run dev from root
- **THEN** all three applications start in development mode

#### Scenario: Build all workspaces
- **WHEN** running npm run build from root
- **THEN** client, admin, and server are built successfully

#### Scenario: Test all workspaces
- **WHEN** running npm test from root
- **THEN** tests run for all workspaces
