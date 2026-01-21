## ADDED Requirements

### Requirement: Redux Auth State
The application SHALL implement a Redux slice for managing authentication state in frontend applications.

#### Scenario: Initial State
- **Given** the application starts
- **Then** the auth state should match `{ user: null, token: null, isAuthenticated: false, loading: false, error: null }`.

#### Scenario: Login Pending
- **Given** the `loginUser` thunk is dispatched
- **Then** `loading` should be true and `error` should be null.

#### Scenario: Login Success
- **Given** the `loginUser` thunk fulfills successfully
- **Then** `isAuthenticated` should be true, `user` and `token` should be populated, and `loading` should be false.

#### Scenario: Login Failure
- **Given** the `loginUser` thunk rejects
- **Then** `isAuthenticated` should be false, `error` should be populated, and `loading` should be false.

### Requirement: State Persistence
The application SHALL persist the authentication token and user data to survive page reloads.

#### Scenario: Token Storage
- **Given** a successful login
- **Then** the JWT token and user data should be saved to `localStorage`.

#### Scenario: State Rehydration
- **Given** the application is reloaded
- **When** the app initializes
- **Then** the auth state should be automatically populated from `localStorage` if valid data exists.

