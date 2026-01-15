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

Authenticate user and receive JWT token.

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "user@example.com",
      "role": "regular"
    }
  }
}
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

---

#### POST /api/v1/auth/logout — Authenticated

Invalidate current session token.

**Request Headers:**

```
Authorization: Bearer <token>
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
