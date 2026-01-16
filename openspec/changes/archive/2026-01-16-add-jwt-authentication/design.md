# Design: JWT Authentication System

## Context

AbraShiftMaster requires secure authentication for both regular users and administrators. The system must support:

- User login with email/password credentials
- JWT-based session management (stateless)
- Role-based access control (admin vs regular users)
- Password security with bcrypt hashing

Constraints:

- Users receive passwords without needing to change them initially (per project.md)
- JWT tokens are stateless; no session storage on the server
- Both client (mobile PWA) and admin (web) apps will use the same authentication API

## Goals / Non-Goals

**Goals:**

- Secure password storage using bcrypt with appropriate salt rounds
- JWT tokens with expiration (24 hours default)
- Middleware for authentication (`isAuthenticated`) and authorization (`isAdmin`)
- Proper HTTP status codes (401 Unauthorized, 403 Forbidden)
- Comprehensive error handling and validation
- Unit and integration test coverage

**Non-Goals:**

- OAuth or social login (future enhancement)
- Refresh tokens (stateless JWT only for now)
- Password reset functionality (future enhancement)
- Multi-factor authentication (future enhancement)
- Session invalidation/logout tracking (stateless design)

## Decisions

### Decision 1: JWT over Sessions

**Choice:** Use stateless JWT tokens instead of server-side sessions.

**Rationale:**

- Simpler to scale horizontally (no session storage required)
- Works well with Vercel's serverless deployment model
- Frontend apps can easily store and send tokens
- Aligns with modern API design patterns

**Alternatives considered:**

- Express sessions with PostgreSQL: Requires session management, more complex deployment
- Supabase Auth: Would lock us into Supabase ecosystem; we want control over auth flow

### Decision 2: bcrypt for Password Hashing

**Choice:** Use bcrypt with 10 salt rounds for password hashing.

**Rationale:**

- Industry-standard password hashing algorithm
- Configurable work factor for future security needs
- Well-tested Node.js implementation available
- Better than plain SHA-256 or MD5 (no salting, fast = vulnerable to brute force)

**Alternatives considered:**

- Argon2: More modern but less mature ecosystem in Node.js
- scrypt: Native Node.js crypto but less configurable than bcrypt

### Decision 3: Middleware-Based Authorization

**Choice:** Implement role checking as composable middleware (`isAuthenticated`, `isAdmin`).

**Rationale:**

- Clean separation of concerns
- Reusable across multiple routes
- Easy to test in isolation
- Follows Express.js best practices

**Alternatives considered:**

- Route-level role checking: Duplicates logic, harder to maintain
- Decorator pattern: Not idiomatic in Express/TypeScript

### Decision 4: JWT Payload Structure

**JWT Payload:**

```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Rationale:**

- Minimal payload to reduce token size
- Role included for authorization decisions without DB lookup
- Standard JWT claims (iat, exp) for expiry management

### Decision 5: Error Response Format

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Admin access required",
    "code": "FORBIDDEN"
  }
}
```

**Rationale:**

- Consistent with existing error handling middleware
- Clear distinction between authentication (401) and authorization (403) failures
- Aligns with REST API best practices

## Risks / Trade-offs

### Risk 1: JWT Expiry vs User Experience

**Risk:** 24-hour expiry may log users out unexpectedly.

**Mitigation:**

- Start with 24-hour expiry as specified in project.md
- Monitor user feedback; implement refresh tokens if needed
- Document expiry behavior clearly in API docs

### Risk 2: No Token Revocation

**Risk:** Stateless JWTs cannot be revoked before expiry (e.g., if user is deactivated).

**Mitigation:**

- Short expiry time (24 hours) limits exposure window
- Check user `active` flag in database when loading user data
- Future: Add token blacklist if needed (trade-off with stateless design)

### Risk 3: JWT_SECRET Management

**Risk:** Leaked JWT_SECRET allows attackers to forge tokens.

**Mitigation:**

- Validate JWT_SECRET is set at server startup (throw error if missing)
- Use strong, random secrets (at least 256 bits)
- Document secret rotation procedure (requires invalidating all tokens)
- Store secrets in environment variables, not in code

## Implementation Details

### File Structure

```
server/src/
├── utils/
│   ├── jwt.ts           # generateToken, verifyToken
│   └── password.ts      # hashPassword, comparePassword
├── middleware/
│   └── auth.ts          # isAuthenticated, isAdmin
├── services/
│   └── authService.ts   # authenticateUser logic
├── controllers/
│   └── authController.ts # login handler
├── routes/
│   └── auth.ts          # POST /login route
└── tests/
    ├── utils/
    │   ├── jwt.test.ts
    │   └── password.test.ts
    ├── middleware/
    │   └── auth.test.ts
    └── routes/
        └── auth.test.ts
```

### Dependencies to Add

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6"
  }
}
```

### Environment Variables

```
JWT_SECRET=<256-bit-random-string>
JWT_EXPIRY=24h
```

## Migration Plan

**Steps:**

1. Install dependencies (bcrypt, jsonwebtoken)
2. Create utilities (jwt, password) with tests
3. Create middleware (auth) with tests
4. Create service layer (authService)
5. Create controller and routes
6. Add JWT_SECRET validation to env.ts
7. Run full test suite
8. Update .env.example with JWT_SECRET
9. Deploy to staging for testing

**Rollback:**

- If issues arise, remove auth routes from route registration
- No database changes required (password hashing is backward-compatible)

## Open Questions

- **Q:** Should we implement rate limiting on /login endpoint to prevent brute force attacks?
  - **A:** Not in this change; address in future security enhancement

- **Q:** Should we log failed login attempts?
  - **A:** Yes, add logging in authService.authenticateUser for security auditing

- **Q:** What is the password policy (min length, complexity)?
  - **A:** Enforce in user creation endpoint, not in authentication (users receive passwords from admin)
