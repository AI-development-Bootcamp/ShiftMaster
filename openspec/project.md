# Project Context

## Purpose

AbraShiftMaster is a shift management application for Abra Bootcamp. It provides a mobile-first client interface for employees and a web-based admin interface for managers

## Tech Stack

**Monorepo:**

- npm workspaces
- Flat structure (no apps/ directory)

**Frontend - Client (Mobile PWA):**

- React + Vite + TypeScript
- State Management: Redux
- Styling: Plain CSS (mobile-first responsive)
- Port: 5173

**Frontend - Admin (Web):**

- React + Vite + TypeScript
- State Management: Redux (separate from client)
- Styling: Plain CSS
- Port: 5174

**Backend:**

- Node.js + Express + TypeScript
- Port: 3000

**Database:**

- PostgreSQL via Supabase

**Caching & Session Storage:**

- Redis (via Docker Compose for local development)
- ioredis client library
- Refresh token session management
- 30-day session TTL

**Authentication:**

- JWT access tokens (15-minute expiry)
- JWT refresh tokens (stored in Redis with 30-day expiry)
- HttpOnly cookies for refresh tokens
- Token rotation on refresh
- Session revocation support
- Users receive a password without needing to change it

**Testing:**

- Vitest (unit and integration tests)
- Testing Library (React component tests)
- Supertest (API endpoint tests)
- API Documentation: Swagger UI at `/api-docs`

**Development Tools:**

- Docker Compose (Redis container)
- Nodemon (server auto-restart)
- Vite HMR (frontend hot module reload)
- tsx (TypeScript execution for scripts)

**Deployment:**

- Render (server production deployment with Redis)
- Vercel (frontend deployment)

**Version Control:**

- GitHub

**CI/CD:**

- GitHub Actions
  - Staging workflow (main branch): Tests and linting only
  - Production workflow (production branch): Tests, linting, and deployment

## Project Conventions

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required

### Architecture Patterns

- Monorepo structure with workspaces:
  - `/client` - Mobile-first React PWA for employees
  - `/admin` - Web-based React app for managers
  - `/server` - Express API server
  - `/shared` - Shared utilities and API client code
- Separate Redux stores for client and admin (no shared state)
- RESTful API design
- JWT-based authentication with refresh token rotation
- Redis-based session management for refresh tokens
- Layered server architecture: Routes → Controllers → Services → Repositories → Database
- Repository pattern with BaseRepository for data access layer
- Dependency injection for services
- In-memory token storage on frontend (no localStorage for access tokens)

### Directory Structure

```
/client/               # Mobile PWA
  /src/
    /components/
    /pages/
    /store/           # Redux store
    /hooks/           # Custom React hooks
    /assets/          # Static assets (images, icons, fonts)
    /constants/       # App constants
    /styles/
    /utils/
    /tests/
  package.json
  vite.config.ts
  tsconfig.json

/admin/                # Web admin
  /src/
    /components/
    /pages/
    /store/           # Redux store
    /hooks/           # Custom React hooks
    /assets/          # Static assets (images, icons, fonts)
    /constants/       # App constants
    /styles/
    /utils/
    /tests/
  package.json
  vite.config.ts
  tsconfig.json

/server/               # Express API
  /src/
    /routes/          # API route definitions
    /controllers/     # Request/response handling
    /services/        # Business logic layer
    /middleware/      # Auth, error handling, etc.
    /validations/     # Zod validation schemas
    /db/              # Database layer
      /repositories/  # Data access layer (Repository pattern)
      /types/         # Database type definitions
      /utils/         # DB utilities (migrate, reset, health, logger)
      redis.ts        # Redis client and session management
      supabase.ts     # Supabase client initialization
    /utils/           # General utilities (JWT, password, error codes)
    /tests/           # Test files
      /controllers/   # Controller tests
      /services/      # Service tests
      /routes/        # Route integration tests
      /middleware/    # Middleware tests
      /db/            # Database tests
      /utils/         # Utility tests
      /validations/   # Validation tests
      /integration/   # Integration tests
      setup.ts        # Test setup and mocks
  package.json
  tsconfig.json
  vitest.config.ts

/shared/               # Shared code
  /src/
    /api/             # Axios-based API client with interceptors
    /utils/           # Utility functions (date, validation)
    /types/           # Shared TypeScript types (models, enums, API types)
    /tests/           # Shared package tests
  package.json
  tsconfig.json
  vitest.config.ts

/openspec/             # OpenSpec proposals and project docs
  project.md          # This file - comprehensive project documentation
  AGENTS.md           # OpenSpec agent instructions

/.github/
  /workflows/
    staging.yml       # CI workflow for dev branch
    production.yml    # CI/CD workflow for production branch

/docker-compose.yml   # Redis container for local development
/.env.example         # Environment variable template
/package.json         # Root workspace configuration
/tsconfig.base.json   # Shared TypeScript configuration
/.eslintrc.json       # ESLint configuration
/.prettierrc          # Prettier code formatting rules
/CLAUDE.md            # AI assistant project instructions
/DBschema.md          # Database schema documentation
/README.md            # Main project README
```

### Testing Strategy

**Testing Framework:**

- Vitest for all workspaces (unit and integration tests)
- Testing Library for React component tests
- Supertest for API endpoint testing
- Axios Mock Adapter for API client testing

**Test Organization:**

- Test files colocated with source: `*.test.ts`, `*.test.tsx`
- Dedicated `/tests/` directories for each workspace
- Test setup files: `setup.ts` in each workspace

**Server Test Coverage** (`server/src/tests/`):

- **Controllers** (6 test files):
  - authController.test.ts
  - usersController.test.ts
  - clientsController.test.ts
  - projectsController.test.ts
  - tasksController.test.ts
  - monthLocksController.test.ts

- **Services** (4 test files):
  - authService.test.ts
  - usersService.test.ts
  - clientsService.test.ts
  - monthLocksService.test.ts

- **Routes** (2 test files):
  - auth.test.ts
  - users.test.ts

- **Database**:
  - redis.test.ts (Redis client and session operations)

- **Middleware**:
  - auth.test.ts (JWT authentication middleware)

- **Utils**:
  - jwt.test.ts (JWT token generation/verification)
  - password.test.ts (Password hashing)

- **Validations**:
  - userValidation.test.ts (Zod schema validation)

- **Integration**:
  - protectedRoutes.test.ts (End-to-end route testing)

- **Other**:
  - health.test.ts (Health check endpoints)
  - logger.test.ts (Logging utilities)

**Frontend Test Coverage:**

- Component tests colocated with components
- API client tests in shared package
- Redux store slice tests

**Shared Package Tests** (`shared/src/tests/`):

- api-client.test.ts (API client with interceptors)
- health.test.ts (Health check utilities)

**Vitest Configuration:**

- **Server**: Node environment, test env vars for Supabase
- **Client/Admin**: jsdom environment, Testing Library setup
- **Shared**: Node environment, Axios mocks

**API Documentation:**

- Swagger UI available at `/api-docs` endpoint
- Generated with swagger-jsdoc and swagger-ui-express
- OpenAPI 3.0 specification

### Git Workflow

- dev branch: `dev` (used as staging)
- Production branch: `production`
- Feature branches: `feature/description`
- Fix branches: `hotfix/description`
- Commit message format: Conventional Commits
- Pull requests required for all changes

### CI/CD Pipeline

**GitHub Actions Workflows:**

#### Staging Workflow (`.github/workflows/staging.yml`)

**Triggers:**

- Push to `dev` branch
- Pull requests to `dev` branch

**Jobs:**

- **Server** - Runs linting, type checking, and tests
- **Client** - Runs linting, type checking, and tests
- **Admin** - Runs linting, type checking, and tests
- **Shared** - Runs linting, type checking, and tests

**Steps per job:**

1. Checkout code
2. Setup Node.js (version 20) with npm cache
3. Install dependencies (`npm ci`)
4. Run linter (`npm run lint`)
5. Run type check (`npm run type-check` or `tsc --noEmit`)
6. Run tests (`npm test`)

**No deployment** - Staging workflow only validates code quality.

---

#### Production Workflow (`.github/workflows/production.yml`)

**Triggers:**

- Push to `production` branch

**Jobs:**

- **Server** - Runs linting, type checking, tests, build, and deployment
- **Client** - Runs linting, type checking, tests, build, and deployment
- **Admin** - Runs linting, type checking, tests, build, and deployment

**Steps per job:**

1. Checkout code
2. Setup Node.js (version 20) with npm cache
3. Install dependencies (`npm ci`)
4. Run linter (`npm run lint`)
5. Run type check (`npm run type-check` or `tsc --noEmit`)
6. Run tests (`npm test`)
7. Build (`npm run build`)
8. Deploy (placeholder - to be configured)

**Deployment:**

- Deployment steps are currently placeholders
- To be configured with Vercel CLI or other deployment infrastructure
- Each project (server, client, admin) deploys independently

**Workflow Structure:**

- All jobs run in parallel for faster CI/CD execution
- Each job uses its own working directory (`./server`, `./client`, `./admin`)
- Node.js dependencies are cached for faster builds
- Environment variable `NODE_ENV=test` is set for test execution

### Environment Variables

**Server** (`server/.env`):

- `NODE_ENV` - Environment mode (development, production, test)
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT access token signing (≥32 chars in production)
- `JWT_REFRESH_SECRET` - Secret key for JWT refresh token signing
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SECRET_KEY` - Supabase service role key (for admin operations)
- `SUPABASE_DB_URL` - PostgreSQL connection string (for migrations)
- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379`, production: `rediss://...` with TLS)

**Client** (`client/.env`):

- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:3000/api/v1`)

**Admin** (`admin/.env`):

- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:3000/api/v1`)

**Configuration Files:**

- `.env.example` files provided in root and each workspace
- Environment validation in `server/src/config/env.ts`
- Validated on server startup (except in test mode)

### npm Scripts

**Root workspace commands:**

```bash
# Development
npm run dev              # Start all workspaces in dev mode (concurrent)
npm run dev:server       # Start server only
npm run dev:client       # Start client only
npm run dev:admin        # Start admin only

# Redis management
npm run redis:start      # Start Redis container (docker-compose up -d redis)
npm run redis:stop       # Stop Redis container (docker-compose down)
npm run redis:logs       # View Redis logs (docker-compose logs -f redis)

# Database
npm run db:migrate       # Run database migrations (server)
npm run db:reset         # Reset database (development only)
npm run seed:dev         # Seed test data

# Testing
npm test                 # Run tests in all workspaces
npm run test:server      # Run server tests
npm run test:client      # Run client tests
npm run test:admin       # Run admin tests
npm run test:shared      # Run shared tests

# Linting & Formatting
npm run lint             # Lint all workspaces
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # Type check all workspaces

# Building
npm run build            # Build all workspaces
npm run build:server     # Build server
npm run build:client     # Build client
npm run build:admin      # Build admin
```

**Individual workspace scripts:**

Each workspace (server, client, admin, shared) has its own scripts:

```bash
# In any workspace directory
npm run dev              # Start development server
npm test                 # Run tests
npm run build            # Build for production
npm run lint             # Run linting
npm run type-check       # Type check (or tsc --noEmit)
```

### Key Dependencies

**Server** (`server/package.json`):

- **Core**: express@4.18.2, TypeScript@5.3.3
- **Database**: @supabase/supabase-js@2.39.3, pg@8.17.1
- **Caching**: ioredis@5.9.2
- **Authentication**: jsonwebtoken@9.0.3, bcrypt@6.0.0
- **Validation**: zod@3.22.4
- **Security**: helmet@7.1.0, cors@2.8.5
- **Documentation**: swagger-jsdoc@6.2.8, swagger-ui-express@5.0.0
- **Utilities**: uuid@13.0.0, morgan@1.10.0, dotenv@16.3.1
- **Dev/Testing**: vitest@3.2.4, supertest@6.3.4, nodemon@3.0.3, tsx@4.7.0

**Client** (`client/package.json`):

- **Core**: react@18.2.0, react-dom@18.2.0, TypeScript@5.3.3
- **Build**: vite@7.3.1, @vitejs/plugin-react@4.2.1
- **State**: @reduxjs/toolkit@2.0.1, react-redux@9.0.4
- **Routing**: react-router-dom@6.21.3
- **i18n**: i18next@25.7.4, react-i18next@16.5.3
- **Testing**: vitest@3.2.4, @testing-library/react@14.1.2
- **HTTP**: axios@1.6.5

**Admin** (`admin/package.json`):

- Same as client, plus:
  - date-fns@4.1.0 (date utilities)
  - react-datepicker@9.1.0 (date picker component)

**Shared** (`shared/package.json`):

- **HTTP**: axios@1.6.5
- **Testing**: vitest@3.2.4, axios-mock-adapter@1.22.0

**Root** (`package.json`):

- **Dev Tools**: ESLint, Prettier, TypeScript, Concurrently@8.2.2
- **Workspaces**: client, admin, server, shared

## Redis Infrastructure

### Overview

ShiftMaster uses Redis for managing refresh token sessions, providing:

- Persistent session storage with automatic expiration
- Fast session lookup and validation
- Multi-session support per user
- Session revocation capabilities
- Token rotation tracking

### Docker Compose Setup

**File**: `docker-compose.yml` (root directory)

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: shiftmaster-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --loglevel debug
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

**Management Commands**:

```bash
npm run redis:start      # Start Redis container
npm run redis:stop       # Stop Redis container
npm run redis:logs       # View Redis logs
```

### Redis Client Configuration

**File**: `server/src/db/redis.ts`

**Connection Setup**:

- Library: ioredis@5.9.2 (TypeScript-native)
- Singleton pattern (one connection per server process)
- Connection URL: `REDIS_URL` env var (default: `redis://localhost:6379`)
- Production: `rediss://...` with TLS support

**Connection Features**:

- Immediate connection (lazy connect disabled)
- Retry strategy with exponential backoff (max 2000ms)
- Max 3 retries per request
- Offline queue enabled during reconnection
- Event listeners: connect, ready, error, close, reconnecting

### Session Data Model

**Refresh Token Sessions**:

```
Key Format: refresh:{sessionId}
Value: JSON-serialized RefreshSession object
TTL: 30 days (2,592,000 seconds)
```

**RefreshSession Structure**:

```typescript
{
  userId: string              // User ID
  refreshTokenHash: string    // SHA-256 hash of refresh token
  createdAt: string           // ISO timestamp
  lastRotatedAt?: string      // Last rotation timestamp
  userAgent?: string          // Client user agent
  ipAddress?: string          // Client IP address
}
```

**User Session Index**:

```
Key Format: user_sessions:{userId}
Type: Set
Values: Set of session IDs for the user
TTL: 30 days (synchronized with session TTL)
```

### Redis Operations

**Helper Functions** (in `server/src/db/redis.ts`):

1. **`getRedisClient()`**
   - Returns singleton Redis client instance
   - Creates connection on first call

2. **`isRedisHealthy()`**
   - Performs PING health check
   - Returns true if Redis is responsive

3. **`disconnectRedis()`**
   - Gracefully closes Redis connection
   - Called during server shutdown

4. **`setRefreshSession(sessionId, data, ttl)`**
   - Store refresh session data
   - Add session ID to user's session set
   - Set TTL on both keys

5. **`getRefreshSession(sessionId)`**
   - Retrieve session data by ID
   - Returns parsed RefreshSession object or null

6. **`deleteRefreshSession(sessionId)`**
   - Delete session data
   - Remove session ID from user's session set
   - Used for logout

7. **`updateRefreshSession(sessionId, updates)`**
   - Update existing session (for token rotation)
   - Preserves TTL

8. **`revokeAllUserSessions(userId)`**
   - Delete all sessions for a user
   - Used for "logout all devices"

9. **`getUserSessionCount(userId)`**
   - Count active sessions for user
   - Returns number of concurrent sessions

10. **`getUserSessionIds(userId)`**
    - List all session IDs for user
    - Returns array of session IDs

### Authentication Flow with Redis

**Login Flow**:

1. User provides credentials
2. Server validates credentials
3. Generate access token (15-minute JWT)
4. Generate refresh token (30-day JWT)
5. Create session ID (UUID)
6. Hash refresh token (SHA-256)
7. Store session in Redis: `setRefreshSession(sessionId, { userId, refreshTokenHash, ... }, 30 days)`
8. Set HttpOnly cookie with refresh token
9. Return access token to client

**Token Refresh Flow**:

1. Client sends refresh token (from HttpOnly cookie)
2. Server extracts session ID from token
3. Retrieve session: `getRefreshSession(sessionId)`
4. Verify token hash matches stored hash
5. Generate new access token
6. Generate new refresh token (rotation)
7. Update session: `updateRefreshSession(sessionId, { refreshTokenHash: newHash, lastRotatedAt: now })`
8. Set new HttpOnly cookie with new refresh token
9. Return new access token

**Logout Flow**:

1. Client sends logout request
2. Server extracts session ID from refresh token
3. Delete session: `deleteRefreshSession(sessionId)`
4. Clear HttpOnly cookie
5. Return success

**Logout All Devices**:

1. Admin or user requests logout all
2. Server calls: `revokeAllUserSessions(userId)`
3. All Redis sessions for user are deleted
4. All refresh tokens become invalid

### Environment Configuration

**Development**:

```env
REDIS_URL=redis://localhost:6379
```

**Production (Render)**:

```env
REDIS_URL=rediss://:password@host:port
```

- Uses TLS (`rediss://`)
- Authenticated connection
- Validated in `server/src/config/env.ts`

### Error Handling

- Connection failures logged with retry attempts
- Graceful degradation if Redis unavailable (server startup fails)
- Health check endpoint includes Redis status
- Automatic reconnection with exponential backoff

## Domain Context

Time reporting system with the following core concepts:

- **Users** (employees, managers, admins) - System users with role-based access
- **Clients** - External organizations that projects belong to
- **Projects** - Work initiatives with managers, dates, and time format rules
- **Tasks** - Specific work items within projects
- **Entries** - Daily work or absence records (one per user per day)
- **Entry Assignments** - Task-level work lines within an entry
- **Admin Task Assignments** - Admin-assigned user-to-task relationships
- **Month Locks** - Admin controls to prevent editing of historical data

## Important Constraints

**Application Constraints:**

- Client app must be mobile-first (responsive design)
- Admin and client apps have completely separate UIs
- No Docker for local development (run services directly)
- Authentication uses JWT (users receive passwords, no password change required initially)

**Data Model Constraints:**

- One entry per user per calendar day (enforced by unique constraint)
- Time format is enforced at project level:
  - `start_end` projects require start_time and end_time for entry_assignments
  - `sum` projects require duration_minutes for entry_assignments
- Users can only report time on tasks they are assigned to (via admin_task_assignments)
- Absence entries (except vacation_partial) cannot have work assignments
- Vacation date ranges create multiple entry rows (one per day)
- Locked months prevent all entry and entry_assignment modifications
- Soft deletes are used for users, clients, and projects (active flag)
- Email addresses must be unique across all users

## External Dependencies

- Supabase for PostgreSQL database and authentication
- Vercel for deployment
- GitHub for version control and CI/CD

## Repository Pattern (Data Access Layer)

### Overview

The server uses the Repository Pattern to abstract database access and provide a clean separation between business logic (services) and data access (repositories).

### BaseRepository

**File**: `server/src/db/repositories/BaseRepository.ts`

Abstract base class providing common CRUD operations for all repositories:

- `findAll(filters?)` - Get all records with optional filtering
- `findById(id)` - Get single record by ID
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record (soft or hard delete depending on entity)
- `count(filters?)` - Count records with optional filtering

**Benefits**:

- DRY (Don't Repeat Yourself) - common logic in one place
- Type safety with TypeScript generics
- Consistent error handling
- Easy to mock for testing
- Database-agnostic interface

### Repository Implementations

**File**: `server/src/db/repositories/index.ts`

All repositories extend BaseRepository and add entity-specific methods:

1. **UserRepository.ts**
   - User CRUD operations
   - `findByEmail(email)` - Look up user by email
   - `updatePassword(userId, hashedPassword)` - Update password
   - Soft delete support (active flag)

2. **ClientRepository.ts**
   - Client CRUD operations
   - Soft delete support

3. **ProjectRepository.ts**
   - Project CRUD operations
   - `findByClient(clientId)` - Get projects by client
   - `findByManager(managerId)` - Get projects by manager
   - Soft delete support

4. **TaskRepository.ts**
   - Task CRUD operations
   - `findByProject(projectId)` - Get tasks by project

5. **EntryRepository.ts**
   - Entry CRUD operations (work and absence)
   - `findByUser(userId, dateRange?)` - Get entries for user
   - `findByDateRange(startDate, endDate)` - Get entries in date range
   - `checkMonthLock(workDate)` - Validate month not locked

6. **EntryAssignmentRepository.ts**
   - Entry assignment CRUD operations
   - `findByEntry(entryId)` - Get assignments for entry
   - `findByTask(taskId)` - Get assignments for task

7. **AdminTaskAssignmentRepository.ts**
   - Admin task assignment operations
   - `findByUser(userId)` - Get assignments for user
   - `findByTask(taskId)` - Get assignments for task
   - `assignUserToTask(userId, taskId, assignedBy)` - Create assignment
   - `revokeAssignment(userId, taskId)` - Revoke assignment
   - Unique constraint enforcement (user_id, task_id)

8. **MonthLockRepository.ts**
   - Month lock operations
   - `findByYearMonth(year, month)` - Get lock for specific month
   - `isMonthLocked(year, month)` - Check if month is locked
   - `lockMonth(year, month, lockedBy)` - Create lock
   - `unlockMonth(lockId)` - Set unlocked_at timestamp

### Database Types

**File**: `server/src/db/types/database.types.ts`

- Generated Supabase types
- Matches PostgreSQL schema exactly
- Auto-generated from database schema

**File**: `server/src/db/types/entities.ts`

- Domain entity interfaces
- TypeScript interfaces for business logic
- Clean separation from database types

**File**: `server/src/db/types/repositories.ts`

- Repository interface definitions
- Contract for all repository implementations
- Used for dependency injection and testing

### Usage in Services

Services depend on repositories for data access:

```typescript
// Example: usersService.ts
import { UserRepository } from '../db/repositories';

export class UsersService {
  constructor(private userRepo: UserRepository) {}

  async getUserById(id: number) {
    return this.userRepo.findById(id);
  }

  async createUser(data) {
    // Business logic validation
    // ...
    return this.userRepo.create(data);
  }
}
```

**Benefits**:

- Services focus on business logic, not SQL
- Easy to test with mock repositories
- Centralized database access
- Type-safe operations

## Database Schema

### Data Types and Enums

**user_role:**

- `admin` - Administrator with full system access
- `regular` - Regular employee user

**project_time_format_type:**

- `sum` - Time reported as total duration in minutes
- `start_end` - Time reported with start and end times

**entry_kind:**

- `work` - Work entry with task assignments
- `absence` - Absence entry (sick leave, vacation, etc.)

**absence_type:**

- `sick` - Sick leave
- `vacation` - Full day vacation
- `vacation_partial` - Partial day vacation (may include work assignments)
- `reserve` - Reserve duty
- `other` - Other absence type

**work_location:**

- `Office` - Work performed at office
- `Client` - Work performed at client location
- `Home` - Work performed from home

### Database Tables

#### users

Employees and administrators.

| Field         | Type        | Constraints      |
| ------------- | ----------- | ---------------- |
| user_id       | BIGINT      | Primary Key      |
| full_name     | TEXT        | Required         |
| email         | TEXT        | Required, Unique |
| password_hash | TEXT        | Required         |
| role          | user_role   | Required         |
| job_title     | TEXT        |                  |
| active        | BOOLEAN     | Soft delete flag |
| created_at    | TIMESTAMPTZ |                  |

**Relations:**

- One user has many entries
- One user (as manager) has many projects
- One admin user has many month_locks
- One admin user has many admin_task_assignments

---

#### clients

External organizations.

| Field        | Type        | Constraints      |
| ------------ | ----------- | ---------------- |
| client_id    | BIGINT      | Primary Key      |
| name         | TEXT        | Required         |
| contact_info | TEXT        | Optional         |
| active       | BOOLEAN     | Soft delete flag |
| created_at   | TIMESTAMPTZ |                  |

**Relations:**

- One client has many projects

---

#### projects

Work initiatives with managers and time format rules.

| Field            | Type                     | Constraints                     |
| ---------------- | ------------------------ | ------------------------------- |
| project_id       | BIGINT                   | Primary Key                     |
| client_id        | BIGINT                   | Foreign Key → clients, Required |
| manager_user_id  | BIGINT                   | Foreign Key → users, Required   |
| name             | TEXT                     | Required                        |
| description      | TEXT                     | Optional                        |
| start_date       | DATE                     | Required                        |
| end_date         | DATE                     | Optional, must be ≥ start_date  |
| time_format_type | project_time_format_type | Required                        |
| active           | BOOLEAN                  | Soft delete flag                |
| created_at       | TIMESTAMPTZ              |                                 |

**Relations:**

- Many projects belong to one client
- Many projects belong to one user (manager)
- One project has many tasks

---

#### tasks

Specific work items within projects.

| Field       | Type        | Constraints                      |
| ----------- | ----------- | -------------------------------- |
| task_id     | BIGINT      | Primary Key                      |
| project_id  | BIGINT      | Foreign Key → projects, Required |
| name        | TEXT        | Required                         |
| description | TEXT        | Optional                         |
| start_date  | DATE        | Optional                         |
| end_date    | DATE        | Optional, must be ≥ start_date   |
| created_at  | TIMESTAMPTZ |                                  |

**Relations:**

- Many tasks belong to one project
- One task has many entry_assignments
- One task has many admin_task_assignments

---

#### admin_task_assignments

Admin-assigned user-to-task relationships.

| Field                    | Type        | Constraints                        |
| ------------------------ | ----------- | ---------------------------------- |
| admin_task_assignment_id | BIGINT      | Primary Key                        |
| user_id                  | BIGINT      | Foreign Key → users, Required      |
| task_id                  | BIGINT      | Foreign Key → tasks, Required      |
| assigned_by              | BIGINT      | Foreign Key → users, Must be admin |
| assigned_at              | TIMESTAMPTZ |                                    |
| active                   | BOOLEAN     | Default: true                      |
| revoked_at               | TIMESTAMPTZ | Optional                           |

**Relations:**

- Many assignments belong to one user
- Many assignments belong to one task
- Many assignments created by one admin user

**Constraints:**

- UNIQUE (user_id, task_id) - Prevents duplicate assignments
- Only admin users may create/update these records

---

#### entries

Unified table for work and absence entries (one row = one calendar day).

| Field            | Type         | Constraints                    |
| ---------------- | ------------ | ------------------------------ |
| entry_id         | BIGINT       | Primary Key                    |
| user_id          | BIGINT       | Foreign Key → users, Required  |
| entry_kind       | entry_kind   | Required (work/absence)        |
| work_date        | DATE         | Required (single day only)     |
| start_time       | TIME         | Optional                       |
| end_time         | TIME         | Optional                       |
| description      | TEXT         | Optional                       |
| absence_type     | absence_type | Required if entry_kind=absence |
| attachment_path  | TEXT         | Optional                       |
| created_at       | TIMESTAMPTZ  |                                |
| updated_at       | TIMESTAMPTZ  |                                |
| last_modified_by | BIGINT       | Foreign Key → users, Optional  |
| last_modified_at | TIMESTAMPTZ  |                                |

**Relations:**

- Many entries belong to one user
- One entry has many entry_assignments

**Important Business Rules:**

- **One entry per user per day** - Recommended unique constraint: (user_id, work_date)
- **Vacation ranges** - When a date range is selected, backend creates multiple entries (one per day)
- **vacation_partial** entries may have work assignments
- Other absence types must not have work assignments
- If month is locked → entry is read-only

---

#### entry_assignments

Task-level work lines within an entry.

| Field               | Type          | Constraints                     |
| ------------------- | ------------- | ------------------------------- |
| entry_assignment_id | BIGINT        | Primary Key                     |
| entry_id            | BIGINT        | Foreign Key → entries, Required |
| task_id             | BIGINT        | Foreign Key → tasks, Required   |
| location            | work_location | Required                        |
| start_time          | TIME          | For start_end format            |
| end_time            | TIME          | For start_end format            |
| duration_minutes    | INT           | For sum format                  |
| created_at          | TIMESTAMPTZ   |                                 |
| updated_at          | TIMESTAMPTZ   |                                 |

**Relations:**

- Many assignments belong to one entry
- Many assignments belong to one task

**Constraints:**

- Entry's user must have an **active admin_task_assignment** for the task
- Time fields enforced by project.time_format_type:
  - If project uses `start_end`: start_time and end_time required, duration_minutes null
  - If project uses `sum`: duration_minutes required, start_time and end_time null
- Not allowed if entry is absence (except vacation_partial)
- Not allowed if month is locked

---

#### month_locks

Admin controls to prevent editing of historical data.

| Field       | Type        | Constraints                        |
| ----------- | ----------- | ---------------------------------- |
| lock_id     | BIGINT      | Primary Key                        |
| year        | INT         | Required                           |
| month       | INT         | Required (1-12)                    |
| locked_at   | TIMESTAMPTZ |                                    |
| locked_by   | BIGINT      | Foreign Key → users, Must be admin |
| unlocked_at | TIMESTAMPTZ | Optional                           |

**Relations:**

- Many locks created by one admin user

**Constraints:**

- UNIQUE (year, month) - Same year+month cannot exist twice
- If `unlocked_at` is null → month is locked
- Locked month → entries & entry_assignments are read-only

---

### Database Design Guarantees

- ✅ Admin-only task assignment with no duplicates
- ✅ One DB row per user per calendar day
- ✅ Partial vacation supports mixed work + absence
- ✅ Strong month locking by unique (year, month)
- ✅ Clean, predictable reporting model
- ✅ Time format enforcement at project level
- ✅ Soft deletes for users, clients, and projects

## API Documentation

### Base URL

All API endpoints are prefixed with `/api/v1`

### Authentication

- JWT tokens are required for authenticated endpoints
- Include token in `Authorization` header: `Bearer <token>`
- Public endpoints do not require authentication

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### Auth

#### POST /api/v1/auth/login — Public

Authenticate user and receive JWT access token and refresh token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "user@example.com",
      "role": "regular"
    }
  }
}
```

**Response Headers:**

```
Set-Cookie: refreshToken=<jwt_refresh_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS",
    "details": {}
  }
}
```

**Notes:**

- Access token expires in 15 minutes
- Refresh token stored in HttpOnly cookie (30-day expiry)
- Session created in Redis with session ID
- User agent and IP address tracked for security

---

#### POST /api/v1/auth/refresh — Authenticated

Refresh access token using refresh token (from HttpOnly cookie).

**Request Headers:**

```
Cookie: refreshToken=<jwt_refresh_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "user@example.com",
      "role": "regular"
    }
  }
}
```

**Response Headers:**

```
Set-Cookie: refreshToken=<new_jwt_refresh_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired refresh token",
    "code": "INVALID_REFRESH_TOKEN",
    "details": {}
  }
}
```

**Notes:**

- Refresh token is automatically rotated on each refresh
- New refresh token is set as HttpOnly cookie
- Old refresh token becomes invalid after rotation
- Session stored in Redis with 30-day TTL
- Token reuse detection prevents replay attacks

---

#### POST /api/v1/auth/logout — Authenticated

Invalidate current session token.

**Request Headers:**

```
Authorization: Bearer <token>
Cookie: refreshToken=<jwt_refresh_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Response Headers:**

```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "details": {}
  }
}
```

**Notes:**

- Deletes session from Redis
- Clears refresh token cookie
- Access token remains valid until expiry (15 minutes)

---

### Me (Worker data)

#### GET /api/v1/me — User

Get current authenticated user's profile information.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "regular",
    "active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "details": {}
  }
}
```

---

#### GET /api/v1/me/task-tree — User

Get hierarchical task structure (projects → tasks) available to the current user.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `includeInactive` (boolean, optional) - Include inactive projects/tasks (default: false)
- `projectId` (number, optional) - Filter by specific project ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "project_id": 1,
        "client_id": 1,
        "client_name": "Acme Corp",
        "manager_user_id": 2,
        "manager_name": "Jane Manager",
        "name": "Website Redesign",
        "description": "Complete website overhaul",
        "start_date": "2024-01-01",
        "end_date": "2024-06-30",
        "time_format_type": "start_end",
        "active": true,
        "tasks": [
          {
            "task_id": 1,
            "name": "Frontend Development",
            "description": "React components",
            "start_date": "2024-01-15",
            "end_date": "2024-03-31"
          }
        ]
      }
    ]
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "details": {}
  }
}
```

---

### Users (Admin)

#### GET /api/v1/users — Admin

Get list of all users.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `role` (string, optional) - Filter by role: `admin` or `regular`
- `active` (boolean, optional) - Filter by active status (default: true)
- `search` (string, optional) - Search by name or email
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": "regular",
        "active": true,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/users — Admin

Create a new user.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "regular"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user_id": 2,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": "regular",
    "active": true,
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "EMAIL_EXISTS",
    "details": {
      "field": "email"
    }
  }
}
```

---

#### GET /api/v1/users/:id — Admin

Get user by ID.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - User ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "regular",
    "active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "details": {
      "user_id": 1
    }
  }
}
```

---

#### PATCH /api/v1/users/:id — Admin

Update user information.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - User ID

**Request Body (all fields optional):**

```json
{
  "full_name": "John Updated",
  "email": "john.updated@example.com",
  "role": "admin",
  "active": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "full_name": "John Updated",
    "email": "john.updated@example.com",
    "role": "admin",
    "active": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "EMAIL_EXISTS",
    "details": {
      "field": "email"
    }
  }
}
```

---

#### DELETE /api/v1/users/:id — Admin

Soft delete a user (set active to false).

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - User ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "details": {
      "user_id": 1
    }
  }
}
```

---

### Clients (Admin)

#### GET /api/v1/clients — Admin

Get list of all clients.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `active` (boolean, optional) - Filter by active status (default: true)
- `search` (string, optional) - Search by name
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "client_id": 1,
        "name": "Acme Corp",
        "contact_info": "contact@acme.com",
        "active": true,
        "created_at": "2024-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/clients — Admin

Create a new client.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Acme Corp",
  "contact_info": "contact@acme.com"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "name": "Acme Corp",
    "contact_info": "contact@acme.com",
    "active": true,
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Client name is required",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name"
    }
  }
}
```

---

#### GET /api/v1/clients/:id — Admin

Get client by ID.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Client ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "name": "Acme Corp",
    "contact_info": "contact@acme.com",
    "active": true,
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Client not found",
    "code": "CLIENT_NOT_FOUND",
    "details": {
      "client_id": 1
    }
  }
}
```

---

#### PATCH /api/v1/clients/:id — Admin

Update client information.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Client ID

**Request Body (all fields optional):**

```json
{
  "name": "Acme Corporation",
  "contact_info": "newcontact@acme.com",
  "active": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "name": "Acme Corporation",
    "contact_info": "newcontact@acme.com",
    "active": false,
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Client not found",
    "code": "CLIENT_NOT_FOUND",
    "details": {
      "client_id": 1
    }
  }
}
```

---

#### DELETE /api/v1/clients/:id — Admin

Soft delete a client (set active to false).

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Client ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Client deleted successfully"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Client not found",
    "code": "CLIENT_NOT_FOUND",
    "details": {
      "client_id": 1
    }
  }
}
```

---

### Projects (Admin)

#### GET /api/v1/projects — Admin

Get list of all projects.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `clientId` (number, optional) - Filter by client ID
- `managerId` (number, optional) - Filter by manager user ID
- `active` (boolean, optional) - Filter by active status (default: true)
- `search` (string, optional) - Search by name
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "project_id": 1,
        "client_id": 1,
        "client_name": "Acme Corp",
        "manager_user_id": 2,
        "manager_name": "Jane Manager",
        "name": "Website Redesign",
        "description": "Complete website overhaul",
        "start_date": "2024-01-01",
        "end_date": "2024-06-30",
        "time_format_type": "start_end",
        "active": true,
        "created_at": "2024-01-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/projects — Admin

Create a new project.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "client_id": 1,
  "manager_user_id": 2,
  "name": "Website Redesign",
  "description": "Complete website overhaul",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "time_format_type": "start_end"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "project_id": 1,
    "client_id": 1,
    "client_name": "Acme Corp",
    "manager_user_id": 2,
    "manager_name": "Jane Manager",
    "name": "Website Redesign",
    "description": "Complete website overhaul",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "time_format_type": "start_end",
    "active": true,
    "created_at": "2024-01-05T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "End date must be after start date",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "end_date"
    }
  }
}
```

---

#### GET /api/v1/projects/:id — Admin

Get project by ID.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Project ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "project_id": 1,
    "client_id": 1,
    "client_name": "Acme Corp",
    "manager_user_id": 2,
    "manager_name": "Jane Manager",
    "name": "Website Redesign",
    "description": "Complete website overhaul",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "time_format_type": "start_end",
    "active": true,
    "created_at": "2024-01-05T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "code": "PROJECT_NOT_FOUND",
    "details": {
      "project_id": 1
    }
  }
}
```

---

#### PATCH /api/v1/projects/:id — Admin

Update project information.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Project ID

**Request Body (all fields optional):**

```json
{
  "name": "Website Redesign v2",
  "description": "Updated description",
  "end_date": "2024-12-31",
  "active": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "project_id": 1,
    "client_id": 1,
    "client_name": "Acme Corp",
    "manager_user_id": 2,
    "manager_name": "Jane Manager",
    "name": "Website Redesign v2",
    "description": "Updated description",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "time_format_type": "start_end",
    "active": false,
    "created_at": "2024-01-05T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "End date must be after start date",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "end_date"
    }
  }
}
```

---

#### DELETE /api/v1/projects/:id — Admin

Soft delete a project (set active to false).

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Project ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "code": "PROJECT_NOT_FOUND",
    "details": {
      "project_id": 1
    }
  }
}
```

---

### Tasks (Admin)

#### GET /api/v1/tasks — Admin

Get list of all tasks.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `projectId` (number, optional) - Filter by project ID
- `search` (string, optional) - Search by name
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": 1,
        "project_id": 1,
        "project_name": "Website Redesign",
        "name": "Frontend Development",
        "description": "React components",
        "start_date": "2024-01-15",
        "end_date": "2024-03-31",
        "created_at": "2024-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/tasks — Admin

Create a new task.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "project_id": 1,
  "name": "Frontend Development",
  "description": "React components",
  "start_date": "2024-01-15",
  "end_date": "2024-03-31"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "project_id": 1,
    "project_name": "Website Redesign",
    "name": "Frontend Development",
    "description": "React components",
    "start_date": "2024-01-15",
    "end_date": "2024-03-31",
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Task name is required",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name"
    }
  }
}
```

---

#### GET /api/v1/tasks/:id — Admin

Get task by ID.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Task ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "project_id": 1,
    "project_name": "Website Redesign",
    "name": "Frontend Development",
    "description": "React components",
    "start_date": "2024-01-15",
    "end_date": "2024-03-31",
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND",
    "details": {
      "task_id": 1
    }
  }
}
```

---

#### PATCH /api/v1/tasks/:id — Admin

Update task information.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Task ID

**Request Body (all fields optional):**

```json
{
  "name": "Frontend Development Updated",
  "description": "Updated React components",
  "end_date": "2024-04-30"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "project_id": 1,
    "project_name": "Website Redesign",
    "name": "Frontend Development Updated",
    "description": "Updated React components",
    "start_date": "2024-01-15",
    "end_date": "2024-04-30",
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "End date must be after start date",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "end_date"
    }
  }
}
```

---

#### DELETE /api/v1/tasks/:id — Admin

Delete a task.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Task ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND",
    "details": {
      "task_id": 1
    }
  }
}
```

---

### Assignments (Admin)

#### GET /api/v1/assignments — Admin

Get list of all task assignments (admin_task_assignments).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `userId` (number, optional) - Filter by user ID
- `taskId` (number, optional) - Filter by task ID
- `active` (boolean, optional) - Filter by active status (default: true)
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "admin_task_assignment_id": 1,
        "user_id": 1,
        "user_name": "John Doe",
        "task_id": 1,
        "task_name": "Frontend Development",
        "assigned_by": 2,
        "assigned_by_name": "Admin User",
        "assigned_at": "2024-01-15T10:00:00Z",
        "active": true,
        "revoked_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/assignments — Admin

Create a new task assignment (assign user to task).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "user_id": 1,
  "task_id": 1
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "admin_task_assignment_id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "task_id": 1,
    "task_name": "Frontend Development",
    "assigned_by": 2,
    "assigned_by_name": "Admin User",
    "assigned_at": "2024-01-15T10:00:00Z",
    "active": true,
    "revoked_at": null
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "User is already assigned to this task",
    "code": "DUPLICATE_ASSIGNMENT",
    "details": {
      "user_id": 1,
      "task_id": 1
    }
  }
}
```

---

#### DELETE /api/v1/assignments — Admin

Revoke task assignment(s).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `userId` (number, required) - User ID
- `taskId` (number, required) - Task ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Assignment revoked successfully"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Assignment not found",
    "code": "ASSIGNMENT_NOT_FOUND",
    "details": {
      "user_id": 1,
      "task_id": 1
    }
  }
}
```

---

#### PUT /api/v1/tasks/:taskId/assignees — Admin

Replace all assignees for a task (bulk update).

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `taskId` (number) - Task ID

**Request Body:**

```json
{
  "user_ids": [1, 2, 3]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "assignments": [
      {
        "admin_task_assignment_id": 1,
        "user_id": 1,
        "user_name": "John Doe",
        "assigned_at": "2024-01-15T10:00:00Z",
        "active": true
      },
      {
        "admin_task_assignment_id": 2,
        "user_id": 2,
        "user_name": "Jane Smith",
        "assigned_at": "2024-01-15T10:00:00Z",
        "active": true
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid user IDs provided",
    "code": "VALIDATION_ERROR",
    "details": {
      "invalid_user_ids": [99, 100]
    }
  }
}
```

---

### Time Entries

#### GET /api/v1/time-entries — User / Admin

Get list of time entries (work entries).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `userId` (number, optional) - Filter by user ID (Admin only, Users see only their own)
- `startDate` (string, optional) - Filter entries from date (YYYY-MM-DD)
- `endDate` (string, optional) - Filter entries to date (YYYY-MM-DD)
- `projectId` (number, optional) - Filter by project ID
- `taskId` (number, optional) - Filter by task ID
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "entry_id": 1,
        "user_id": 1,
        "user_name": "John Doe",
        "entry_kind": "work",
        "work_date": "2024-01-15",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "description": "Worked on frontend",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T18:00:00Z",
        "assignments": [
          {
            "entry_assignment_id": 1,
            "task_id": 1,
            "task_name": "Frontend Development",
            "location": "Office",
            "start_time": "09:00:00",
            "end_time": "12:00:00",
            "duration_minutes": null
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "details": {}
  }
}
```

---

#### POST /api/v1/time-entries — User / Admin

Create a new time entry (work entry).

**Validation Rules:**

- User must have an active admin_task_assignment for each task in assignments
- Time format must match project's time_format_type:
  - For `start_end` projects: start_time and end_time required, duration_minutes ignored
  - For `sum` projects: duration_minutes required, start_time and end_time ignored
- Only one entry per user per day (duplicate work_date will update existing entry)
- Month must not be locked for the entry's work_date

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "work_date": "2024-01-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "description": "Worked on frontend",
  "assignments": [
    {
      "task_id": 1,
      "location": "Office",
      "start_time": "09:00:00",
      "end_time": "12:00:00"
    },
    {
      "task_id": 2,
      "location": "Home",
      "duration_minutes": 300
    }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "entry_id": 1,
    "user_id": 1,
    "entry_kind": "work",
    "work_date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "description": "Worked on frontend",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "assignments": [
      {
        "entry_assignment_id": 1,
        "task_id": 1,
        "task_name": "Frontend Development",
        "location": "Office",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "duration_minutes": null
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot create entry",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

**Additional Error Responses:**

```json
{
  "success": false,
  "error": {
    "message": "User is not assigned to task",
    "code": "TASK_NOT_ASSIGNED",
    "details": {
      "task_id": 1
    }
  }
}
```

```json
{
  "success": false,
  "error": {
    "message": "Time format mismatch: project requires start_end format",
    "code": "TIME_FORMAT_MISMATCH",
    "details": {
      "project_id": 1,
      "required_format": "start_end"
    }
  }
}
```

---

#### GET /api/v1/time-entries/:id — User / Admin

Get time entry by ID.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Entry ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "entry_id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "entry_kind": "work",
    "work_date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "description": "Worked on frontend",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T18:00:00Z",
    "assignments": [
      {
        "entry_assignment_id": 1,
        "task_id": 1,
        "task_name": "Frontend Development",
        "location": "Office",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "duration_minutes": null
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Time entry not found",
    "code": "ENTRY_NOT_FOUND",
    "details": {
      "entry_id": 1
    }
  }
}
```

---

#### PATCH /api/v1/time-entries/:id — User / Admin

Update time entry.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Entry ID

**Request Body (all fields optional):**

```json
{
  "start_time": "10:00:00",
  "end_time": "18:00:00",
  "description": "Updated description",
  "assignments": [
    {
      "entry_assignment_id": 1,
      "task_id": 1,
      "location": "Office",
      "start_time": "10:00:00",
      "end_time": "14:00:00"
    }
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "entry_id": 1,
    "user_id": 1,
    "entry_kind": "work",
    "work_date": "2024-01-15",
    "start_time": "10:00:00",
    "end_time": "18:00:00",
    "description": "Updated description",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-16T10:00:00Z",
    "last_modified_by": 1,
    "last_modified_at": "2024-01-16T10:00:00Z",
    "assignments": [
      {
        "entry_assignment_id": 1,
        "task_id": 1,
        "task_name": "Frontend Development",
        "location": "Office",
        "start_time": "10:00:00",
        "end_time": "14:00:00",
        "duration_minutes": null
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot update entry",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

#### DELETE /api/v1/time-entries/:id — User / Admin

Delete a time entry.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Entry ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Time entry deleted successfully"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot delete entry",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

### Absences

#### GET /api/v1/absences — User / Admin

Get list of absence entries.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `userId` (number, optional) - Filter by user ID (Admin only, Users see only their own)
- `startDate` (string, optional) - Filter entries from date (YYYY-MM-DD)
- `endDate` (string, optional) - Filter entries to date (YYYY-MM-DD)
- `absenceType` (string, optional) - Filter by type: `sick`, `vacation`, `vacation_partial`, `reserve`, `other`
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "absences": [
      {
        "entry_id": 2,
        "user_id": 1,
        "user_name": "John Doe",
        "entry_kind": "absence",
        "work_date": "2024-01-20",
        "absence_type": "vacation",
        "description": "Annual leave",
        "attachment_path": null,
        "created_at": "2024-01-18T10:00:00Z",
        "updated_at": "2024-01-18T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "details": {}
  }
}
```

---

#### POST /api/v1/absences — User / Admin

Create absence entry(ies). For date ranges, creates multiple entries (one per day).

**Validation Rules:**

- Date ranges create multiple entry rows (one per calendar day)
- Only one entry per user per day (duplicate dates will update existing entries)
- Month must not be locked for any date in the range
- `vacation_partial` entries may include work assignments
- Other absence types cannot have work assignments

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body (single day):**

```json
{
  "work_date": "2024-01-20",
  "absence_type": "sick",
  "description": "Sick leave"
}
```

**Request Body (date range):**

```json
{
  "start_date": "2024-01-20",
  "end_date": "2024-01-25",
  "absence_type": "vacation",
  "description": "Annual leave"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "entry_id": 2,
        "user_id": 1,
        "entry_kind": "absence",
        "work_date": "2024-01-20",
        "absence_type": "vacation",
        "description": "Annual leave",
        "attachment_path": null,
        "created_at": "2024-01-18T10:00:00Z",
        "updated_at": "2024-01-18T10:00:00Z"
      },
      {
        "entry_id": 3,
        "user_id": 1,
        "entry_kind": "absence",
        "work_date": "2024-01-21",
        "absence_type": "vacation",
        "description": "Annual leave",
        "attachment_path": null,
        "created_at": "2024-01-18T10:00:00Z",
        "updated_at": "2024-01-18T10:00:00Z"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot create absence",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

#### PATCH /api/v1/absences/:id — User / Admin

Update absence entry.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Entry ID

**Request Body (all fields optional):**

```json
{
  "absence_type": "vacation_partial",
  "description": "Updated description",
  "start_time": "09:00:00",
  "end_time": "13:00:00"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "entry_id": 2,
    "user_id": 1,
    "entry_kind": "absence",
    "work_date": "2024-01-20",
    "start_time": "09:00:00",
    "end_time": "13:00:00",
    "absence_type": "vacation_partial",
    "description": "Updated description",
    "attachment_path": null,
    "created_at": "2024-01-18T10:00:00Z",
    "updated_at": "2024-01-19T10:00:00Z",
    "last_modified_by": 1,
    "last_modified_at": "2024-01-19T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot update absence",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

#### DELETE /api/v1/absences/:id — User / Admin

Delete an absence entry.

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Entry ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Absence deleted successfully"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is locked, cannot delete absence",
    "code": "MONTH_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

#### POST /api/v1/absences/:id/attachment — User / Admin

Upload attachment for an absence entry (e.g., medical certificate).

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**URL Parameters:**

- `id` (number) - Entry ID

**Request Body:**

```
FormData with file field
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "entry_id": 2,
    "attachment_path": "/uploads/absences/2/certificate.pdf",
    "updated_at": "2024-01-19T10:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid file type or file too large",
    "code": "FILE_UPLOAD_ERROR",
    "details": {
      "max_size": "5MB",
      "allowed_types": ["pdf", "jpg", "png"]
    }
  }
}
```

---

### Month Locks (Admin)

#### GET /api/v1/month-locks — Admin

Get list of month locks.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `year` (number, optional) - Filter by year
- `month` (number, optional) - Filter by month (1-12)
- `locked` (boolean, optional) - Filter by lock status (default: true, shows only locked months)
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "locks": [
      {
        "lock_id": 1,
        "year": 2024,
        "month": 1,
        "locked_at": "2024-02-01T10:00:00Z",
        "locked_by": 2,
        "locked_by_name": "Admin User",
        "unlocked_at": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN",
    "details": {}
  }
}
```

---

#### POST /api/v1/month-locks — Admin

Lock a month (prevent editing of entries).

**Request Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "year": 2024,
  "month": 1
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "lock_id": 1,
    "year": 2024,
    "month": 1,
    "locked_at": "2024-02-01T10:00:00Z",
    "locked_by": 2,
    "locked_by_name": "Admin User",
    "unlocked_at": null
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Month is already locked",
    "code": "MONTH_ALREADY_LOCKED",
    "details": {
      "year": 2024,
      "month": 1
    }
  }
}
```

---

#### DELETE /api/v1/month-locks/:id — Admin

Unlock a month (set unlocked_at timestamp).

**Request Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (number) - Lock ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "lock_id": 1,
    "year": 2024,
    "month": 1,
    "locked_at": "2024-02-01T10:00:00Z",
    "locked_by": 2,
    "unlocked_at": "2024-02-15T10:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "message": "Month lock not found",
    "code": "LOCK_NOT_FOUND",
    "details": {
      "lock_id": 1
    }
  }
}
```

---

### Reports

#### GET /api/v1/reports/monthly — User / Admin

Get monthly time report.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `year` (number, required) - Report year
- `month` (number, required) - Report month (1-12)
- `userId` (number, optional) - Filter by user ID (Admin only, Users see only their own)
- `projectId` (number, optional) - Filter by project ID
- `clientId` (number, optional) - Filter by client ID
- `groupBy` (string, optional) - Group results by: `day`, `task`, `project`, `client` (default: `day`)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "summary": {
      "total_work_hours": 160,
      "total_absence_days": 2,
      "work_days": 20,
      "absence_days": 2
    },
    "entries": [
      {
        "date": "2024-01-15",
        "entry_kind": "work",
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "total_hours": 8,
        "tasks": [
          {
            "task_id": 1,
            "task_name": "Frontend Development",
            "project_name": "Website Redesign",
            "client_name": "Acme Corp",
            "location": "Office",
            "hours": 8
          }
        ]
      },
      {
        "date": "2024-01-20",
        "entry_kind": "absence",
        "absence_type": "vacation",
        "description": "Annual leave"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "message": "Year and month are required",
    "code": "VALIDATION_ERROR",
    "details": {
      "missing_fields": ["year", "month"]
    }
  }
}
```
