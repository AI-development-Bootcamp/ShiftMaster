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
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRY=24h
```

### Client

Create a `.env` file in the `client` directory. See `client/ENV_SETUP.md` for details:

```env
# API URL for backend server
VITE_API_URL=http://localhost:3000

# Render deployment hook URL (optional, used for CI/CD)
VITE_RENDER_DEPLOY_URL_CLIENT=
```

### Admin

Create a `.env` file in the `admin` directory. See `admin/ENV_SETUP.md` for details:

```env
# API URL for backend server
VITE_API_URL=http://localhost:3000

# Render deployment hook URL (optional, used for CI/CD)
VITE_RENDER_DEPLOY_URL_ADMIN=
```

**Important Notes:**
- All frontend environment variables must have the `VITE_` prefix
- Environment variable keys should be in alphabetical order (for dotenv-linter compliance)
- All .env files must end with a trailing newline
- Never commit .env files to version control

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
