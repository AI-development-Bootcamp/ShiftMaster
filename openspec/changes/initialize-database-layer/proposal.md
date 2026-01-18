# Change: Initialize Database Layer and Infrastructure

## Why

The application requires a complete database infrastructure to support the time reporting system. Currently, only a basic Supabase client exists. We need:

- Database schema initialization (tables, enums, constraints)
- Repository pattern for data access
- Type-safe database operations
- Development and production database separation
- Seed data for initial testing and development

This change establishes the foundation for all database operations across the application.

## What Changes

- **Create SQL migrations** for all tables and enums defined in DBschema.md
- **Apply migrations** to development database via Supabase MCP
- **Implement Repository pattern** for each table (UserRepository, ClientRepository, etc.)
- **Add database utilities**: query logging, health checks
- **Create seed data** for development environment (admin user, sample clients, projects)
- **Set up two Supabase projects**: one for development, one for production
- **Add TypeScript types** generated from database schema

## Impact

- **Affected specs**: backend-server
- **Affected code**:
  - `server/src/db/` - Major expansion with repositories, migrations, utilities
  - `server/src/config/env.ts` - May need updates for dual database configuration
  - `shared/src/types/` - Database entity types
- **New files**:
  - Migration SQL files in `server/src/db/migrations/`
  - Repository classes in `server/src/db/repositories/`
  - Utility functions in `server/src/db/utils/`
  - Seed data scripts in `server/src/db/seeds/`
  - Type definitions in `server/src/db/types/`
- **Breaking changes**: None (this is net-new infrastructure)
