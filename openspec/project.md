# Project Context

## Purpose
AbraShiftMaster is a shift management application for Abra Bootcamp. It provides a mobile-first client interface for employees and a web-based admin interface for managers.

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

**Authentication:**
- JWT (users receive a password without needing to change it)

**Testing:**
- Vitest
- API Endpoints: Swagger

**Deployment:**
- Vercel

**Version Control:**
- GitHub

**CI/CD:**
- GitHub Actions (to be set up later)

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
- JWT-based authentication
- Layered server architecture: Routes → Controllers → Services → Models → Database

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
  package.json
  vite.config.ts
  tsconfig.json

/server/               # Express API
  /src/
    /routes/
    /controllers/
    /services/        # Business logic layer
    /middleware/
    /models/
    /db/              # Database access and Supabase client
    /utils/
  package.json
  tsconfig.json

/shared/               # Shared code
  /src/
    /api/             # API client code
    /utils/           # Utility functions
    /types/           # Shared TypeScript types
  package.json
  tsconfig.json
```

### Testing Strategy
- Vitest for unit and integration tests
- Test files colocated with source: `*.test.ts`, `*.test.tsx`
- Minimum test coverage requirements to be defined
- API documentation via Swagger

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/description`
- Commit message format: Conventional Commits
- Pull requests required for all changes

### Environment Variables
- `VITE_API_URL` - Backend API URL for frontends
- `JWT_SECRET` - Secret key for JWT signing
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## Domain Context
Shift management system with the following core concepts:
- Users (employees, managers, admins)
- Shifts (scheduling, assignments)
- Availability and shift requests
- Departments/locations

## Important Constraints
- Client app must be mobile-first (responsive design)
- Admin and client apps have completely separate UIs
- No Docker for local development (run services directly)
- Authentication uses JWT (users receive passwords, no password change required initially)

## External Dependencies
- Supabase for PostgreSQL database and authentication
- Vercel for deployment
- GitHub for version control and CI/CD
