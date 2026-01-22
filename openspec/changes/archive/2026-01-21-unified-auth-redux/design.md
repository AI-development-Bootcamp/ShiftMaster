# Architecture Design: Unified Authentication

## Context
Currently, the system uses a standard JWT-based authentication. The goal is to unify the login route while distinguishing between the two frontend applications (Admin and Client) to enforce stricter access controls at the entry point.

## Design Decisions

### 1. Source Identification in Login Request
We will add a required field `source` to the login request body.
- **Type**: `'admin' | 'client'`
- **Validation**: Strict validation using Zod in the backend.

### 2. Role Enforcement Logic
The `login` controller will perform an additional check after successful credential verification:
- If `source === 'admin'` AND `user.role !== 'admin'`:
    - Throw `AuthorizationError` (or return 403).
    - Message: "Access denied. Admin privileges required."
- If `source === 'client'`:
    - Allow access (Standard users and Admins can log in, or we can restrict Admins if desired, but usually Admins can act as users).

### 3. Redux State Management
Both applications are React-based. We will use Redux Toolkit (RTK) which is already installed.
- **Store Structure**:
    ```typescript
    interface AuthState {
        user: User | null;
        token: string | null;
        isAuthenticated: boolean;
        loading: boolean;
        error: string | null;
    }
    ```
- **Async Thunks**: `loginUser` will handle the API call and state updates found in `authSlice`.
- **Persistence**:
    - On successful login, save `token` and `user` object to `localStorage`.
    - On application startup, initialize the state from `localStorage` to check if a valid session exists.
    - On logout or 401 Unauthorized error (from interceptor), clear `localStorage`.
- **Selectors**: `selectAuth`, `selectUser`, `selectIsAuthenticated`.

## Alternative Considered
- **Separate Login Routes**: `/auth/login/admin` and `/auth/login/client`.
    - **Pros**: Clearer separation at the API level.
    - **Cons**: Duplicates authentication logic (password check, token generation).
    - **Decision**: Rejected in favor of unified route to keep AuthN logic centralized, as requested by the user.
