## ADDED Requirements

### Requirement: Database Schema Migrations

The server SHALL provide SQL migration files for creating and modifying the database schema.

#### Scenario: Migration file structure

- **WHEN** viewing the db/migrations directory
- **THEN** migration files exist for all tables (users, clients, projects, tasks, admin_task_assignments, entries, entry_assignments, month_locks)

#### Scenario: Migration execution

- **WHEN** migrations are applied to a new database
- **THEN** all tables, enums, constraints, and indexes are created successfully

#### Scenario: Migration tracking

- **WHEN** checking migration status via Supabase
- **THEN** the system tracks which migrations have been applied

### Requirement: Repository Pattern

The server SHALL implement a repository pattern for database access, providing a consistent interface for CRUD operations on each table.

#### Scenario: Repository instantiation

- **WHEN** a service needs to access user data
- **THEN** it uses the UserRepository class

#### Scenario: Type-safe queries

- **WHEN** a repository method is called
- **THEN** TypeScript enforces correct types for parameters and return values

#### Scenario: Consistent CRUD interface

- **WHEN** using any repository
- **THEN** it provides standard methods: findById, findAll, create, update, delete

#### Scenario: Repository for each table

- **WHEN** viewing the repositories directory
- **THEN** a repository exists for each database table (UserRepository, ClientRepository, ProjectRepository, TaskRepository, AdminTaskAssignmentRepository, EntryRepository, EntryAssignmentRepository, MonthLockRepository)

### Requirement: Database Query Logging

The server SHALL log all database queries for debugging and performance monitoring.

#### Scenario: Query execution logging

- **WHEN** a database query is executed
- **THEN** the query, parameters, and execution time are logged

#### Scenario: Configurable log level

- **WHEN** the environment is set to production
- **THEN** query logging can be disabled or set to errors-only

#### Scenario: Query performance tracking

- **WHEN** a query takes longer than a threshold
- **THEN** a warning is logged with the slow query details

### Requirement: Database Health Check

The server SHALL provide a health check function to verify database connectivity and readiness.

#### Scenario: Successful health check

- **WHEN** the database is reachable and operational
- **THEN** the health check returns true with connection details

#### Scenario: Failed health check

- **WHEN** the database is unreachable or misconfigured
- **THEN** the health check returns false with error details

#### Scenario: Health check endpoint integration

- **WHEN** the /health endpoint is called
- **THEN** it includes database health status in the response

### Requirement: Database Type Definitions

The server SHALL provide TypeScript type definitions for all database entities and repository interfaces.

#### Scenario: Entity types from schema

- **WHEN** TypeScript types are generated from the database schema
- **THEN** they match the table structures defined in DBschema.md

#### Scenario: Type-safe entity usage

- **WHEN** working with database entities in code
- **THEN** TypeScript enforces correct property names and types

#### Scenario: Repository interface types

- **WHEN** implementing or using a repository
- **THEN** TypeScript enforces the repository interface contract

### Requirement: Development Seed Data

The server SHALL provide seed data scripts for populating the development database with test data.

#### Scenario: Seed data execution

- **WHEN** running the seed data script
- **THEN** the development database is populated with sample users, clients, projects, and tasks

#### Scenario: Idempotent seeding

- **WHEN** seed data is run multiple times
- **THEN** it does not create duplicate records

#### Scenario: Admin user creation

- **WHEN** seed data is executed
- **THEN** at least one admin user is created for testing

#### Scenario: Sample data relationships

- **WHEN** seed data is created
- **THEN** all foreign key relationships are correctly established (clients → projects → tasks → assignments)

### Requirement: Dual Database Environment Support

The server SHALL support separate database configurations for development and production environments.

#### Scenario: Development database configuration

- **WHEN** the server runs in development mode
- **THEN** it connects to the development Supabase project

#### Scenario: Production database configuration

- **WHEN** the server runs in production mode
- **THEN** it connects to the production Supabase project

#### Scenario: Environment variable separation

- **WHEN** configuring database connections
- **THEN** separate environment variables exist for dev and prod (SUPABASE_URL, SUPABASE_ANON_KEY)

### Requirement: Database Schema Constraints

The server migrations SHALL enforce all constraints defined in DBschema.md, including foreign keys, unique constraints, and check constraints.

#### Scenario: Foreign key constraints

- **WHEN** migrations are applied
- **THEN** all foreign key relationships are enforced (e.g., projects → clients, tasks → projects)

#### Scenario: Unique constraints

- **WHEN** migrations create tables
- **THEN** unique constraints are applied (e.g., users.email, admin_task_assignments(user_id, task_id), month_locks(year, month))

#### Scenario: Soft delete constraints

- **WHEN** migrations create tables with soft deletes
- **THEN** the active boolean column is included (users, clients, projects)

#### Scenario: Enum constraints

- **WHEN** migrations create enum types
- **THEN** all enum values match DBschema.md (user_role, project_time_format_type, entry_kind, absence_type, work_location)

### Requirement: Base Repository Class

The server SHALL provide a base repository class with common database operations that specific repositories can extend.

#### Scenario: Common CRUD methods

- **WHEN** a specific repository extends BaseRepository
- **THEN** it inherits standard methods: findById, findAll, create, update, delete

#### Scenario: Supabase client injection

- **WHEN** a repository is instantiated
- **THEN** it receives the Supabase client for database access

#### Scenario: Error handling

- **WHEN** a repository method encounters a database error
- **THEN** it throws a consistent, typed error with details
