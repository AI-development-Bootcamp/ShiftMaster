# Implementation Tasks

## 1. Supabase Project Setup

- [x] 1.1 Development Supabase project created (pre-existing)
- [x] 1.2 Production Supabase project created (pre-existing)
- [x] 1.3 Update `.env` and `.env.example` with dev/prod database URLs and keys
- [x] 1.4 Document environment variable configuration in README

## 2. Database Schema Migrations

- [x] 2.1 Create migration file for enums (user_role, project_time_format_type, entry_kind, absence_type, work_location)
- [x] 2.2 Create migration file for users table
- [x] 2.3 Create migration file for clients table
- [x] 2.4 Create migration file for projects table
- [x] 2.5 Create migration file for tasks table
- [x] 2.6 Create migration file for admin_task_assignments table
- [x] 2.7 Create migration file for entries table
- [x] 2.8 Create migration file for entry_assignments table
- [x] 2.9 Create migration file for month_locks table
- [x] 2.10 Apply all migrations to development database via Supabase MCP

## 3. Database Utilities

- [x] 3.1 Create query logger utility (`db/utils/logger.ts`)
- [x] 3.2 Create database health check function (`db/utils/health.ts`)
- [x] 3.3 Export utilities from `db/utils/index.ts`
- [ ] 3.4 Create migration runner script (`db/utils/migrate.ts`)
- [ ] 3.5 Add npm script to run migrations: `npm run db:migrate`

## 4. TypeScript Types

- [x] 4.1 Generate TypeScript types from Supabase schema
- [x] 4.2 Create database entity interfaces (`db/types/entities.ts`)
- [x] 4.3 Create repository interfaces (`db/types/repositories.ts`)

## 5. Repository Pattern Implementation

- [x] 5.1 Create base repository class (`db/repositories/BaseRepository.ts`)
- [x] 5.2 Implement UserRepository (`db/repositories/UserRepository.ts`)
- [x] 5.3 Implement ClientRepository (`db/repositories/ClientRepository.ts`)
- [x] 5.4 Implement ProjectRepository (`db/repositories/ProjectRepository.ts`)
- [x] 5.5 Implement TaskRepository (`db/repositories/TaskRepository.ts`)
- [x] 5.6 Implement AdminTaskAssignmentRepository (`db/repositories/AdminTaskAssignmentRepository.ts`)
- [x] 5.7 Implement EntryRepository (`db/repositories/EntryRepository.ts`)
- [x] 5.8 Implement EntryAssignmentRepository (`db/repositories/EntryAssignmentRepository.ts`)
- [x] 5.9 Implement MonthLockRepository (`db/repositories/MonthLockRepository.ts`)
- [x] 5.10 Create repository factory/registry (`db/repositories/index.ts`)

## 6. Seed Data

- [x] 6.1 Create seed data schema and types (`db/seeds/types.ts`)
- [x] 6.2 Create admin user seed data (`db/seeds/users.seed.ts`)
- [x] 6.3 Create sample clients seed data (`db/seeds/clients.seed.ts`)
- [x] 6.4 Create sample projects seed data (`db/seeds/projects.seed.ts`)
- [x] 6.5 Create sample tasks seed data (`db/seeds/tasks.seed.ts`)
- [x] 6.6 Create seed execution script (`db/seeds/index.ts`)
- [x] 6.7 Add npm script to run seeds: `npm run seed:dev`

## 7. Testing

- [x] 7.1 Write tests for UserRepository
- [x] 7.2 Write tests for ClientRepository
- [x] 7.3 Write tests for ProjectRepository
- [x] 7.4 Write tests for database health check
- [x] 7.5 Write tests for query logger
- [x] 7.6 Ensure all repository tests pass

## 8. Documentation

- [x] 8.1 Document repository pattern in code comments (Done via JSDoc in implementation)
- [x] 8.2 Update server README with database setup instructions
- [x] 8.3 Document migration process
- [x] 8.4 Document seed data usage
- [ ] 8.5 Add database ERD to documentation (optional)
