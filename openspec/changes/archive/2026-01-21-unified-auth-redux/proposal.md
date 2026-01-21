# Unified Authentication and Redux Integration

## Summary
Implement a unified authentication system where both Admin and Client applications use the same login route. The backend will identify the source application and enforce role-based access control (RBAC) to prevent unauthorized access (e.g., standard users logging into Admin). Additionally, integrate Redux Toolkit for state management of authentication in both frontend applications.

## Motivation
- **Security**: Centralized authentication logic reduces the risk of inconsistencies and vulnerabilities.
- **Maintainability**: Unified logic makes it easier to maintain and update authentication flows.
- **User Experience**: Prevents users from accidentally logging into the wrong application context and provides consistent state management.

## Proposed Solution
1.  **Backend**:
    - Update `POST /auth/login` to accept an `appId` or `source` parameter ('admin' | 'client').
    - Validate that users logging into 'admin' source have the 'admin' role.
    - Return a 403 Forbidden error if a regular user attempts to log into the Admin app.

2.  **Frontend (Admin & Client)**:
    - Implement `authSlice` using Redux Toolkit to manage:
        - `user`: User profile information.
        - `token`: JWT token.
        - `isAuthenticated`: Boolean status.
        - `loading`: Loading state for async actions.
        - `error`: Error messages.
    - Create `login` async thunk that calls the updated API with the correct `source` parameter.
    - Persist auth state (optional, but good practice for UX).
