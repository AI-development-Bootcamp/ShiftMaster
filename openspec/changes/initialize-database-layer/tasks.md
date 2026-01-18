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

## 4. TypeScript Types

- [ ] 4.1 Generate TypeScript types from Supabase schema
- [ ] 4.2 Create database entity interfaces (`db/types/entities.ts`)
- [ ] 4.3 Create repository interfaces (`db/types/repositories.ts`)

## 5. Repository Pattern Implementation

- [ ] 5.1 Create base repository class (`db/repositories/BaseRepository.ts`)
- [ ] 5.2 Implement UserRepository (`db/repositories/UserRepository.ts`)
- [ ] 5.3 Implement ClientRepository (`db/repositories/ClientRepository.ts`)
- [ ] 5.4 Implement ProjectRepository (`db/repositories/ProjectRepository.ts`)
- [ ] 5.5 Implement TaskRepository (`db/repositories/TaskRepository.ts`)
- [ ] 5.6 Implement AdminTaskAssignmentRepository (`db/repositories/AdminTaskAssignmentRepository.ts`)
- [ ] 5.7 Implement EntryRepository (`db/repositories/EntryRepository.ts`)
- [ ] 5.8 Implement EntryAssignmentRepository (`db/repositories/EntryAssignmentRepository.ts`)
- [ ] 5.9 Implement MonthLockRepository (`db/repositories/MonthLockRepository.ts`)
- [ ] 5.10 Create repository factory/registry (`db/repositories/index.ts`)

## 6. Seed Data

- [ ] 6.1 Create seed data schema and types (`db/seeds/types.ts`)
- [ ] 6.2 Create admin user seed data (`db/seeds/users.seed.ts`)
- [ ] 6.3 Create sample clients seed data (`db/seeds/clients.seed.ts`)
- [ ] 6.4 Create sample projects seed data (`db/seeds/projects.seed.ts`)
- [ ] 6.5 Create sample tasks seed data (`db/seeds/tasks.seed.ts`)
- [ ] 6.6 Create seed execution script (`db/seeds/index.ts`)
- [ ] 6.7 Add npm script to run seeds: `npm run seed:dev`

## 7. Testing

- [ ] 7.1 Write tests for UserRepository
- [ ] 7.2 Write tests for ClientRepository
- [ ] 7.3 Write tests for ProjectRepository
- [ ] 7.4 Write tests for database health check
- [ ] 7.5 Write tests for query logger
- [ ] 7.6 Ensure all repository tests pass

## 8. Documentation

- [ ] 8.1 Document repository pattern in code comments
- [ ] 8.2 Update server README with database setup instructions
- [ ] 8.3 Document migration process
- [ ] 8.4 Document seed data usage
- [ ] 8.5 Add database ERD to documentation (optional)
