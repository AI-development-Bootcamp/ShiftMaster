# AbraShiftMaster

A shift management application for Abra Bootcamp, built as a monorepo with separate client, admin, and server applications.

## 📁 Project Structure

```
abra-shift-master/
├── client/          # Mobile-first PWA client (React + Vite)
├── admin/           # Web admin dashboard (React + Vite)
├── server/          # Backend API (Express + TypeScript)
├── shared/          # Shared utilities, types, and API client
└── openspec/        # Project specifications and changes
```

## 🚀 Tech Stack

### Frontend

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Styling:** CSS with RTL (Right-to-Left) support for Hebrew
- **Testing:** Vitest + Testing Library

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express with TypeScript
- **Database:** PostgreSQL via Supabase
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Vitest + Supertest

### Development Tools

- **Package Manager:** npm workspaces
- **Linting:** ESLint
- **Formatting:** Prettier
- **Development:** Nodemon for server, Vite HMR for frontends

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AbraShiftMaster
```

2. Install dependencies for all workspaces:

```bash
npm install
```

## 🏃 Development

### Start all applications concurrently:

```bash
npm run dev
```

This will start:

- Client app on http://localhost:5173
- Admin app on http://localhost:5174
- Server API on http://localhost:3000

### Start individual applications:

```bash
# Client only
npm run dev:client

# Admin only
npm run dev:admin

# Server only
npm run dev:server
```

## 🏗️ Building

### Build all workspaces:

```bash
npm run build
```

### Build individual workspaces:

```bash
npm run build:client
npm run build:admin
npm run build:server
```

## 🧪 Testing

### Run all tests:

```bash
npm test
```

### Run tests for specific workspace:

```bash
npm run test:client
npm run test:admin
npm run test:server
```

## 🔍 Code Quality

### Type checking:

```bash
# Check all workspaces
npm run type-check

# Check specific workspace
npm run type-check:client
npm run type-check:admin
npm run type-check:server
```

### Linting:

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## 📚 API Documentation

When the server is running, API documentation is available at:
http://localhost:3000/api-docs

## 🌍 Environment Variables

### Server

Create a `.env` file in the `server` directory. See `server/ENV_SETUP.md` for details:

```env
# Backend API URL (for frontend apps)
VITE_API_URL=http://localhost:3000/api/v1

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SECRET_KEY=your-service-role-key-here

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Required Environment Variables

| Variable | Description | Required | Usage |
|----------|-------------|----------|-------|
| `SUPABASE_URL` | Supabase API URL (https://...) | ✅ Yes | Supabase client initialization |
| `SUPABASE_DB_URL` | PostgreSQL connection string | ✅ Yes | Database tooling (Knex, TypeORM, etc.) |
| `SUPABASE_ANON_KEY` | Public API key for client-side operations | ✅ Yes | Frontend & regular backend operations |
| `SUPABASE_SECRET_KEY` | Service role key for admin operations | ✅ Yes | Migrations, seed data, admin operations (server-only) |
| `JWT_SECRET` | Secret key for JWT token signing/verification | ✅ Yes | Authentication |
| `PORT` | Server port number | No (default: 3000) | Server configuration |
| `NODE_ENV` | Environment mode | No (default: development) | Server behavior |
| `VITE_API_URL` | Backend API URL for frontends | ✅ Yes (frontends) | Frontend API calls |
| `CORS_ORIGINS` | Comma-separated allowed CORS origins | No (default: localhost:5173,5174) | CORS configuration |

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the following values:
   - **Project URL** → `SUPABASE_URL` (format: `https://[PROJECT-REF].supabase.co`)
   - **Connection String (URI)** → `SUPABASE_DB_URL` (format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SECRET_KEY` (⚠️ Keep this secret! Server-only)

### Security Notes

- ⚠️ **NEVER** commit `.env` files to version control
- ⚠️ **NEVER** expose `SUPABASE_SECRET_KEY` in frontend code
- ✅ `SUPABASE_ANON_KEY` is safe to use in frontend (protected by RLS policies)
- ✅ Use different credentials for development and production databases

## 📦 Workspaces

### Client (`@abra-shift-master/client`)

Mobile-first Progressive Web App for end users.

- Port: 5173
- Routes: Configured with React Router
- State: Redux store

### Admin (`@abra-shift-master/admin`)

Web-based admin dashboard for system management.

- Port: 5174
- Routes: Configured with React Router
- State: Separate Redux store from client

### Server (`@abra-shift-master/server`)

RESTful API backend with Express and TypeScript.

- Port: 3000
- Database: Supabase (PostgreSQL)
- Authentication: JWT
- Documentation: Swagger UI

### Shared (`@abra-shift-master/shared`)

Common utilities, types, and API client used across workspaces.

- API client wrapper (Axios)
- TypeScript type definitions
- Utility functions
- Validation helpers

## 🔧 Troubleshooting

### Port already in use

If you encounter port conflicts, you can change the ports in:

- Client: `client/vite.config.ts`
- Admin: `admin/vite.config.ts`
- Server: `.env` file (PORT variable)

### TypeScript errors

Run type-check to identify issues:

```bash
npm run type-check
```

### Dependency issues

Clear all node_modules and reinstall:

```bash
npm run clean
npm install
```

## 📝 License

This project is part of the Abra Bootcamp program.
