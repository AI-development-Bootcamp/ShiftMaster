# Implementation Tasks

## 1. Utilities

- [x] 1.1 Create /server/src/utils/jwt.ts with generateToken and verifyToken functions
- [x] 1.2 Create /server/src/utils/password.ts with hashPassword and comparePassword functions (bcrypt)
- [x] 1.3 Write unit tests for jwt.ts (token generation, verification, expiry, invalid tokens)
- [x] 1.4 Write unit tests for password.ts (hashing, comparison, salt rounds)

## 2. Middleware

- [ ] 2.1 Create /server/src/middleware/auth.ts with isAuthenticated middleware
- [ ] 2.2 Add isAdmin middleware to auth.ts for role-based access control
- [ ] 2.3 Implement proper error responses (401 for missing/invalid token, 403 for insufficient permissions)
- [ ] 2.4 Write unit tests for isAuthenticated middleware (valid token, missing token, expired token, invalid token)
- [ ] 2.5 Write unit tests for isAdmin middleware (admin user, regular user, no user)

## 3. Service Layer

- [ ] 3.1 Create /server/src/services/authService.ts with login logic
- [ ] 3.2 Implement authenticateUser method (find user by email, verify password, return user data)
- [ ] 3.3 Add proper error handling (user not found, invalid credentials, inactive user)

## 4. Controller Layer

- [ ] 4.1 Create /server/src/controllers/authController.ts with login handler
- [ ] 4.2 Implement POST /login controller (validate input, call service, generate JWT, return token + user)
- [ ] 4.3 Add input validation using zod (email format, password required)

## 5. Routes

- [ ] 5.1 Create /server/src/routes/auth.ts with POST /login route
- [ ] 5.2 Register auth routes in /server/src/routes/index.ts at /api/auth prefix
- [ ] 5.3 Add Swagger/JSDoc documentation for login endpoint

## 6. Configuration

- [ ] 6.1 Update /server/src/config/env.ts to validate JWT_SECRET is present
- [ ] 6.2 Add JWT expiry configuration (default 24h)
- [ ] 6.3 Document JWT_SECRET in .env.example

## 7. Integration Testing

- [ ] 7.1 Write integration tests for POST /api/auth/login (success, invalid credentials, missing fields)
- [ ] 7.2 Write integration tests for protected routes using auth middleware
- [ ] 7.3 Test role-based access with isAdmin middleware

## 8. Dependencies

- [ ] 8.1 Install bcrypt (or bcryptjs for Node.js compatibility)
- [ ] 8.2 Install jsonwebtoken
- [ ] 8.3 Install @types/bcrypt and @types/jsonwebtoken as dev dependencies
