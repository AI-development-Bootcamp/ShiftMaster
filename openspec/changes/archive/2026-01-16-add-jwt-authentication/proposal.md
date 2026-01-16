# Change: Add JWT-Based Authentication System

## Why

The application currently lacks authentication infrastructure. Users need to securely log in and access protected routes based on their roles (admin vs regular user). This is a foundational security requirement before implementing user-facing features.

## What Changes

- Create JWT token generation and verification utilities
- Create password hashing utilities with bcrypt
- Add POST /api/auth/login endpoint for user authentication
- Add authentication middleware (isAuthenticated) to verify JWT tokens
- Add authorization middleware (isAdmin) for role-based access control
- Configure JWT_SECRET environment variable
- Return proper HTTP status codes (401 Unauthorized, 403 Forbidden)
- Add comprehensive unit tests for all authentication components

## Impact

- **Affected specs**: backend-server
- **Affected code**:
  - New: /server/src/utils/jwt.ts
  - New: /server/src/utils/password.ts
  - New: /server/src/middleware/auth.ts
  - New: /server/src/routes/auth.ts
  - New: /server/src/controllers/authController.ts
  - New: /server/src/services/authService.ts
  - Modified: /server/src/routes/index.ts (register auth routes)
  - Modified: /server/src/config/env.ts (validation for JWT_SECRET)
  - New: /server/src/tests/utils/jwt.test.ts
  - New: /server/src/tests/utils/password.test.ts
  - New: /server/src/tests/middleware/auth.test.ts
  - New: /server/src/tests/routes/auth.test.ts
