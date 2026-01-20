# ShiftMaster: Redis + Refresh Token Authentication Specification

**Project**: ShiftMaster Time Reporting System
**Scope**: Implement secure Access+Refresh token auth flow with Redis session storage
**Date**: 2026-01-20

---

## CONTEXT

### Current State

- **Access JWT**: Stored in localStorage, 24h expiry (configurable via JWT_EXPIRY env var)
- **Backend**: Express + TypeScript, Supabase database, JWT-based auth
- **Frontends**: Two separate applications (client PWA, admin web) with independent Redux stores
- **Auth Flow**: POST /api/v1/auth/login returns JWT, stored in localStorage
- **Issue**: localStorage vulnerable to XSS, no token rotation, no logout revocation
- **Key Mismatch**: authSlice uses 'token' key, shared ApiClient reads 'auth_token' key

### Production Environment

- **Redis**: Render Key Value (Redis) already provisioned
- **Backend**: Receives REDIS_URL environment variable from Render
- **Database**: Supabase PostgreSQL (users table with user_id, email, password_hash, role, active)

### Project Architecture

- **Monorepo**: npm workspaces (server, client, admin, shared)
- **Development**: Direct development (no Docker for app services), Docker Compose for Redis only
- **API Convention**: `/api/v1` prefix, standardized response format
- **Code Style**: TypeScript strict, 2-space indent, single quotes, semicolons
- **Testing**: Colocated `.test.ts` files with each module

---

## HIGH-LEVEL GOALS

### 1. Local Redis Setup (Docker Compose)

- Add `docker-compose.yml` in project root with Redis service (port 6379)
- Add npm scripts to start/stop Redis: `npm run redis:start`, `npm run redis:stop`
- Update `.env.example` with `REDIS_URL=redis://localhost:6379` for dev
- Document Docker setup and Redis startup in README.md
- Production uses Render's `REDIS_URL` environment variable (no code changes needed)

### 2. Secure Authentication Refactor

- **Access Token (JWT)**: 15-minute expiry, stored in-memory only (never localStorage)
- **Refresh Token**: Opaque random token (32 bytes), HttpOnly+Secure cookie
- **Token Rotation**: New refresh token issued on each refresh, old one invalidated
- **Reuse Detection**: Detect stolen tokens, revoke session immediately
- **Logout**: Revoke refresh session in Redis, clear cookies
- **Stateless APIs**: Access token validation remains stateless via JWT
- **Session Storage**: Refresh sessions in Redis with 30-day TTL

---

## BACKEND REQUIREMENTS

### A. Redis Client Module

**File**: `server/src/db/redis.ts` (new file)

```typescript
// Create singleton Redis client
// Use REDIS_URL from env (validated in server/src/config/env.ts)
// Local: redis://localhost:6379
// Prod: rediss://... (TLS enabled by Render)
// Handle connection errors gracefully at startup
// Export typed helper functions for refresh token operations
```

**Requirements**:

- Use `ioredis` package (better TypeScript support than `redis`)
- Singleton pattern (one connection per server process)
- Graceful error handling (log errors, don't crash on Redis failures)
- Export helpers: `setRefreshSession()`, `getRefreshSession()`, `deleteRefreshSession()`
- TTL: 30 days (2592000 seconds)

**Add to** `server/src/config/env.ts`:

```typescript
REDIS_URL: string; // Required in production, optional in dev
```

---

### B. Auth Endpoints Updates

**File**: `server/src/routes/auth.ts`

Update existing routes, add new ones:

#### POST /api/v1/auth/login

**Update existing endpoint**:

- Keep current validation (credentials, source: 'admin' | 'client', role checks)
- Reduce access token expiry: 15 minutes (update JWT_EXPIRY default in .env)
- Generate refresh token: 32 bytes random (crypto.randomBytes)
- Hash refresh token: SHA-256 before storing
- Store session in Redis:
  - Key: `refresh:${sessionId}` (sessionId = UUID v4)
  - Value: `{ userId, refreshTokenHash, createdAt, userAgent?, ipAddress? }`
  - TTL: 30 days
- Set HttpOnly cookies:
  - `refreshToken`: the actual refresh token (opaque string)
  - `refreshSessionId`: the session UUID
  - Options: `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'`, `path: '/api/v1/auth'`, `maxAge: 30 days`
- Response format (unchanged):
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "jwt...",
      "user": {
        "user_id": "123",
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
      }
    }
  }
  ```

#### POST /api/v1/auth/refresh (new endpoint)

**Create new endpoint**:

- Read cookies: `refreshToken`, `refreshSessionId`
- Validate both present, return 401 if missing
- Fetch session from Redis: `refresh:${refreshSessionId}`
- Validate session exists, return 401 if missing (possible theft)
- Hash provided refreshToken (SHA-256), compare to stored hash
- **Reuse Detection**: If hash mismatch → Delete session, return 401 with error code `TOKEN_REUSE_DETECTED`
- **Token Rotation**: Generate new refresh token, hash it, update Redis session
- Update cookies with new refreshToken (keep same sessionId)
- Generate new access token (JWT, 15min expiry)
- Return response:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "jwt..."
    }
  }
  ```
- Include `credentials: true` in CORS for this endpoint

#### POST /api/v1/auth/logout (new endpoint)

**Create new endpoint**:

- Read `refreshSessionId` cookie
- Delete session from Redis: `DEL refresh:${sessionSessionId}`
- Clear cookies: `refreshToken`, `refreshSessionId` (set maxAge: 0)
- Return 204 No Content

**Error Codes** (add to existing error handling):

- `TOKEN_REUSE_DETECTED`: Refresh token was already used (possible theft)
- `REFRESH_SESSION_NOT_FOUND`: Session expired or invalid
- `REFRESH_TOKEN_INVALID`: Token doesn't match session

---

### C. Auth Service Updates

**File**: `server/src/services/authService.ts`

Add new functions:

- `createRefreshSession(userId, userAgent?, ipAddress?): Promise<{ sessionId, refreshToken }>`
- `validateRefreshSession(sessionId, refreshToken): Promise<{ userId, valid }>`
- `rotateRefreshToken(sessionId): Promise<{ refreshToken }>`
- `revokeRefreshSession(sessionId): Promise<void>`

Use Redis client helpers from `server/src/db/redis.ts`.

---

### D. Security & Utilities

**Cookies** (`server/src/utils/cookies.ts` - new file):

- Helper to set/clear refresh cookies consistently
- Environment-aware Secure flag (true in prod, false in local dev)
- Domain configuration for production

**Hashing** (`server/src/utils/crypto.ts` - new file):

- SHA-256 hashing for refresh tokens
- Random token generation (crypto.randomBytes)

**JWT Updates** (`server/src/utils/jwt.ts`):

- Update default expiry to 15 minutes
- Keep payload structure: `{ userId, email, role }`

**Middleware** (`server/src/middleware/auth.ts`):

- Keep existing `isAuthenticated` and `isAdmin` middleware (unchanged)
- Add `requireRefreshCookie` middleware for refresh endpoint

---

### F. CORS Configuration

**File**: `server/src/app.ts` (or wherever CORS is configured)

Update CORS settings:

```typescript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // CRITICAL: Allow cookies
});
```

Ensure frontend URLs are whitelisted (both client and admin origins).

---

### G. Environment Variables

Update `server/.env.example`:

```bash
# Existing
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=15m  # Changed from 24h

# New
REDIS_URL=redis://localhost:6379  # Local dev
# Production: Set by Render automatically

# CORS
FRONTEND_URL=http://localhost:3000  # Comma-separated for multiple origins
```

---

## FRONTEND REQUIREMENTS

### Overview

- **Two frontends**: Client (mobile PWA) and Admin (web) - update BOTH identically
- **Remove localStorage**: Access tokens stored in-memory only
- **Fix key mismatch**: Align authSlice and shared ApiClient to use same token storage

---

### A. In-Memory Token Store

**Client**: `client/src/auth/tokenStore.ts` (new file)
**Admin**: `admin/src/auth/tokenStore.ts` (new file)

```typescript
// Simple in-memory token store
let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  clearAccessToken: () => {
    accessToken = null;
  },
};
```

**Why in-memory?**

- XSS cannot steal token from memory
- Refresh token in HttpOnly cookie protects against XSS
- Token lost on page reload → triggers refresh flow automatically

---

### B. Auth Slice Updates

**Client**: `client/src/store/slices/authSlice.ts`
**Admin**: `admin/src/store/slices/authSlice.ts`

Changes:

1. **Remove** `token` from Redux state (keep `user`, `isAuthenticated`, `loading`, `error`)
2. **Remove** localStorage.setItem/getItem for token
3. **Update** login thunk:
   - Store accessToken in tokenStore (memory)
   - Keep user in localStorage for display purposes (no sensitive data)
   - Set `isAuthenticated: true`
4. **Update** logout thunk:
   - Call POST /api/v1/auth/logout (clears refresh cookie)
   - Clear tokenStore
   - Clear localStorage user
   - Set `isAuthenticated: false`
5. **Update** initializeAuth:
   - Call POST /api/v1/auth/refresh on app start
   - If successful, store accessToken in tokenStore, set isAuthenticated: true
   - If fails (401), treat as logged out

---

### C. API Client Updates

**Shared**: `shared/src/api/client.ts`

Current issues:

- Uses localStorage.getItem('auth_token') (mismatched key)
- No refresh-on-401 logic

Changes:

1. **Import tokenStore** (needs to be passed as dependency or use separate client/admin token stores)
2. **Request Interceptor**:
   - Read token from tokenStore.getAccessToken()
   - Add Authorization: Bearer {token} header
3. **Response Interceptor** (refresh-on-401):
   - Intercept 401 responses
   - Call POST /api/v1/auth/refresh (with credentials: true)
   - If refresh succeeds: Update tokenStore, retry original request once
   - If refresh fails: Clear tokenStore, redirect to login
   - **Single-flight refresh**: Use promise cache to prevent multiple simultaneous refresh calls

**Alternative**: Create separate `client/src/api/client.ts` and `admin/src/api/client.ts` that import from shared but use their own tokenStore.

---

### D. Login Page Updates

**Client**: `client/src/pages/Login/LoginPage.tsx`
**Admin**: `admin/src/pages/LoginPage/LoginPage.tsx`

Changes:

- No changes needed (authSlice handles token storage internally)
- Ensure `credentials: 'include'` in fetch options (for cookies)

---

### E. App Initialization

**Client**: `client/src/App.tsx`
**Admin**: `admin/src/App.tsx`

Add on mount:

```typescript
useEffect(() => {
  dispatch(initializeAuth()); // Calls /auth/refresh silently
}, [dispatch]);
```

If refresh fails, user sees login page. If succeeds, user bypasses login.

---

## DELIVERABLES

### Backend Files (server/)

**New Files**:

- `src/db/redis.ts` - Redis client singleton
- `src/utils/cookies.ts` - Cookie helpers
- `src/utils/crypto.ts` - Hashing and token generation
- `src/services/authService.ts` - Add refresh session functions
- `src/routes/auth.ts` - Add /refresh and /logout endpoints

**Modified Files**:

- `src/config/env.ts` - Add REDIS_URL validation
- `src/controllers/authController.ts` - Update login, add refresh/logout
- `src/utils/jwt.ts` - Update default expiry to 15m
- `src/app.ts` - Update CORS for credentials
- `.env.example` - Add REDIS_URL, update JWT_EXPIRY

**Tests**:

- `src/services/authService.test.ts` - Test refresh session CRUD
- `src/routes/auth.test.ts` - Integration tests for refresh, logout, rotation, reuse detection

---

### Frontend Files (client/ and admin/)

**New Files** (both frontends):

- `src/auth/tokenStore.ts` - In-memory token storage
- `src/api/client.ts` - Frontend-specific API client (optional, or modify shared)

**Modified Files** (both frontends):

- `src/store/slices/authSlice.ts` - Remove token from state, use tokenStore
- `src/App.tsx` - Initialize auth on mount
- `src/pages/Login/*.tsx` - Ensure credentials: 'include'

**Shared**:

- `shared/src/api/client.ts` - Add refresh-on-401 interceptor, use tokenStore

**Tests**:

- `src/store/slices/authSlice.test.ts` - Test initializeAuth refresh flow
- `src/api/client.test.ts` - Test 401 retry with refresh

---

### Infrastructure

**New Files**:

- `docker-compose.yml` - Redis service for local development
- Root `package.json` - Add Redis npm scripts (redis:start, redis:stop, redis:logs)

### Documentation

**Update**:

- `README.md` - Add Docker Compose Redis setup instructions
- `openspec/project.md` - Document new auth endpoints (/refresh, /logout), refresh_sessions schema (if used)

---

## TESTS

### Backend Tests (Colocated)

**`server/src/services/authService.test.ts`**:

- ✓ createRefreshSession creates session in Redis with TTL
- ✓ validateRefreshSession succeeds with valid token
- ✓ validateRefreshSession fails with wrong token (reuse detection)
- ✓ rotateRefreshToken generates new token and updates Redis
- ✓ revokeRefreshSession deletes from Redis

**`server/src/routes/auth.test.ts`**:

- ✓ POST /auth/login sets refresh cookies and returns access token
- ✓ POST /auth/refresh returns new access token with valid cookies
- ✓ POST /auth/refresh rotates token (old token fails next time)
- ✓ POST /auth/refresh detects reuse and revokes session
- ✓ POST /auth/logout clears cookies and revokes session
- ✓ POST /auth/refresh fails after logout

---

### Frontend Tests (Colocated)

**`client/src/store/slices/authSlice.test.ts`**:

- ✓ initializeAuth calls /auth/refresh and sets isAuthenticated on success
- ✓ initializeAuth clears auth state on refresh failure
- ✓ logout calls /auth/logout and clears tokenStore

**`client/src/api/client.test.ts`** (or shared):

- ✓ API client retries 401 with /auth/refresh
- ✓ Single-flight refresh prevents multiple simultaneous refreshes

---

## IMPLEMENTATION NOTES

### ShiftMaster Project Conventions

1. **TypeScript Strict**: All code must pass strict type checking
2. **Code Style**: 2-space indent, single quotes, semicolons (ESLint + Prettier)
3. **Error Handling**: Use project's error code system (INVALID_CREDENTIALS, TOKEN_REUSE_DETECTED, etc.)
4. **API Format**: `/api/v1` prefix, `{ success, data, error }` response structure
5. **File Organization**: Small focused modules (<300 lines), use folders (services, utils, auth, redis)
6. **Testing**: Colocate tests with source (`.test.ts` files)
7. **Commits**: Use Conventional Commits format
8. **Documentation**: Update project.md with new endpoints and schemas

### Security Best Practices

- Never log tokens (access or refresh)
- Hash refresh tokens before storing (SHA-256)
- Use crypto.randomBytes (not Math.random) for token generation
- Set Secure cookie flag in production
- HttpOnly cookies prevent JavaScript access
- Short-lived access tokens (15min) minimize compromise window
- Token rotation limits reuse window
- Reuse detection catches stolen tokens

### Migration Strategy

1. **Phase 1**: Add Redis client and refresh endpoints (backward compatible)
2. **Phase 2**: Update frontend to use refresh flow (users can still use old flow)
3. **Phase 3**: Reduce access token expiry to 15min (forces refresh adoption)
4. **Phase 4**: Remove localStorage fallback (breaking change - document in release notes)

### Redis Setup (Docker Compose)

**Create `docker-compose.yml` in project root**:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: shiftmaster-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

**Add npm scripts to root `package.json`**:

```json
{
  "scripts": {
    "redis:start": "docker compose up -d redis",
    "redis:stop": "docker compose down",
    "redis:logs": "docker compose logs -f redis"
  }
}
```

**Usage**:

```bash
# Start Redis in background
npm run redis:start

# Verify Redis is running
docker compose ps
# Or test connection
npm run redis:logs

# Stop Redis
npm run redis:stop
```

**First-time setup**:

1. Install Docker Desktop (if not installed)
2. Run `npm run redis:start`
3. Redis will be available at `localhost:6379`
4. Data persists in Docker volume `redis_data`

---

## QUESTIONS & CONSIDERATIONS

### Q: Why not store refresh tokens in database?

A: Redis is faster and has built-in TTL. Database is optional for audit trails but adds complexity.

### Q: Why 15-minute access tokens?

A: Balance between security (short window) and UX (not too many refreshes). Adjust if needed.

### Q: What if Redis goes down?

A: New logins fail, existing access tokens work until expiry. Consider fallback to database sessions for critical systems.

### Q: How to handle multiple sessions (e.g., mobile + web)?

A: Current design: one session per login. Future: Store multiple sessions per user, add session management UI.

### Q: Should we revoke all sessions on password change?

A: Yes, good practice. Add `revokeAllUserSessions(userId)` to authService.

---

## ACCEPTANCE CRITERIA

- [x] Docker Compose Redis setup working (`npm run redis:start`)
- [x] Redis client connects successfully in local dev and production
- [x] POST /api/v1/auth/login sets HttpOnly refresh cookies
- [x] POST /api/v1/auth/refresh returns new access token with valid cookies
- [x] POST /api/v1/auth/refresh rotates refresh token (old one invalid)
- [x] POST /api/v1/auth/refresh detects reuse and revokes session
- [x] POST /api/v1/auth/logout clears cookies and revokes session
- [ ] Client and Admin frontends store access token in-memory only
- [ ] Client and Admin frontends call /refresh on app start
- [ ] API client retries 401 with /refresh, prevents refresh storms
- [ ] All tests pass (backend + frontend)
- [ ] No tokens stored in localStorage or sessionStorage
- [ ] README documents Docker Compose Redis setup
- [ ] project.md documents new endpoints and schemas
- [ ] Code follows ShiftMaster conventions (style, structure, testing)

---

**End of Specification**
