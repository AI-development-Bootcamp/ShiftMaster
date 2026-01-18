# Design: User Routes Implementation

## Goals

1. Provide complete user management API endpoints
2. Support both self-service (regular users) and admin operations
3. Implement with mock data initially, ready for DB integration later
4. Ensure security through proper validation and authorization
5. Provide excellent developer experience with comprehensive documentation

## Non-Goals

- Database schema creation (handled separately)
- Real-time user activity tracking (future enhancement)
- User invitation/onboarding flows (future enhancement)
- Password reset functionality (future enhancement)

## Architecture Decisions

### 1. Service Layer with Mock Data

**Decision**: Implement `userService` with in-memory mock data initially.

**Rationale**:

- Allows development and testing without database setup
- Enables parallel work (frontend can integrate while DB is configured)
- Makes testing easier (no DB mocking needed initially)
- Clear migration path: replace mock functions with Supabase calls later

**Implementation**:

- Use TypeScript Map/Array for in-memory storage
- Match exact Supabase query patterns in function signatures
- Return same data structures as real DB will return
- Add TODO comments marking where DB calls will go

### 2. Route Organization

**Decision**: Separate routes for profile (`/users/me`) and admin management (`/users`).

**Rationale**:

- Clear separation of concerns
- Different authorization requirements
- Easier to understand and maintain
- Follows RESTful conventions

**Structure**:

```
GET    /api/v1/users/me              - Get current user profile
PUT    /api/v1/users/me              - Update current user profile
PATCH  /api/v1/users/me/password     - Change current user password
GET    /api/v1/users                 - List users (admin only, with pagination/filtering)
GET    /api/v1/users/:id             - Get user by ID (admin only)
POST   /api/v1/users                 - Create user (admin only)
PUT    /api/v1/users/:id             - Update user (admin only)
PATCH  /api/v1/users/:id/activate    - Activate user (admin only)
PATCH  /api/v1/users/:id/deactivate  - Deactivate user (admin only)
DELETE /api/v1/users/:id             - Soft delete user (admin only)
POST   /api/v1/users/bulk-deactivate - Bulk deactivate users (admin only)
```

### 3. Validation Strategy

**Decision**: Use Zod schemas for request validation, consistent with auth routes.

**Rationale**:

- Already used in authController
- Type-safe validation
- Clear error messages
- Reusable schemas

**Validation Rules**:

- Email: Valid email format, unique (checked in service)
- Password: Minimum 8 characters, at least one letter and one number
- Full name: 1-100 characters, trimmed
- Role: Must be 'admin' or 'regular'
- User ID: Must be positive integer

### 4. Authorization Pattern

**Decision**: Use middleware composition for route protection.

**Pattern**:

- Profile routes: `isAuthenticated` only
- Admin routes: `isAuthenticated` + `isAdmin`
- Self-access check: Regular users can only access their own data

**Implementation**:

```typescript
// Profile routes
router.get('/me', isAuthenticated, getCurrentUser);
router.put('/me', isAuthenticated, updateCurrentUser);

// Admin routes
router.get('/', isAuthenticated, isAdmin, listUsers);
router.post('/', isAuthenticated, isAdmin, createUser);
```

### 5. Pagination and Filtering

**Decision**: Use query parameters for pagination and filtering.

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search term (searches name and email)
- `role`: Filter by role ('admin' | 'regular')
- `active`: Filter by active status (true | false)
- `sort`: Sort field (default: 'created_at')
- `order`: Sort order ('asc' | 'desc', default: 'desc')

**Response Format**:

```typescript
{
  success: true,
  data: {
    users: User[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

### 6. Error Handling

**Decision**: Use consistent error response format matching auth routes.

**Error Codes**:

- `VALIDATION_ERROR` - Invalid input (400)
- `UNAUTHORIZED` - Not authenticated (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - User not found (404)
- `CONFLICT` - Email already exists (409)
- `INTERNAL_SERVER_ERROR` - Server error (500)

### 7. Password Security

**Decision**: Enforce password strength requirements.

**Requirements**:

- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- Optional: special characters recommended but not required

**Implementation**:

- Validate on password change
- Hash using existing `hashPassword` utility (bcrypt, 10 rounds)
- Never return password hash in responses

### 8. Soft Delete Pattern

**Decision**: Use `active` flag for soft deletes, matching DB schema.

**Rationale**:

- Preserves data integrity
- Allows reactivation
- Matches existing schema design
- Audit trail maintained

**Behavior**:

- DELETE sets `active = false`
- Deactivated users cannot login
- Admin can reactivate via PATCH /users/:id/activate
- List endpoints can filter by active status

## Data Structures

### Mock Data Storage

```typescript
// In-memory storage
private users: Map<number, User>;
private nextUserId: number = 1;

// Initial seed data
const seedUsers = [
  {
    user_id: 1,
    full_name: 'Admin User',
    email: 'admin@example.com',
    password_hash: '<hashed>',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  // ... more seed users
];
```

### Request/Response Types

```typescript
// Create user request
interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'regular';
}

// Update user request
interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  role?: 'admin' | 'regular';
}

// Change password request
interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Pagination response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Migration Path to Database

When Supabase is configured:

1. Replace mock storage with Supabase client calls
2. Update `userService` methods to use `supabase.from('users')`
3. Keep same function signatures and return types
4. Remove mock data initialization
5. Update tests to mock Supabase instead of mock service

**Example Migration**:

```typescript
// Before (mock)
async getUserById(id: number): Promise<User | null> {
  return this.users.get(id) || null;
}

// After (Supabase)
async getUserById(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, full_name, email, role, active, created_at')
    .eq('user_id', id)
    .single();

  if (error || !data) return null;
  return data;
}
```

## Testing Strategy

### Unit Tests

- Service layer: Test business logic with mock data
- Controller layer: Test request/response handling with mocked service
- Validation: Test Zod schemas with various inputs

### Integration Tests

- Route tests: Test full request/response cycle with mocked service
- Authorization: Test middleware combinations
- Pagination: Test query parameter parsing and response formatting

### Test Coverage Goals

- Service methods: 100%
- Controller methods: 100%
- Route handlers: 100%
- Validation schemas: 100%
- Error cases: All error codes covered

## Security Considerations

1. **Input Sanitization**: All user inputs validated and sanitized
2. **SQL Injection**: Not applicable with mock data, but Supabase client handles this
3. **Authorization**: Strict role-based access control
4. **Password Security**: Never exposed in responses, always hashed
5. **Email Uniqueness**: Enforced in service layer
6. **Self-Access Control**: Regular users cannot access other users' data

## Risks and Mitigations

| Risk                                 | Impact | Mitigation                                           |
| ------------------------------------ | ------ | ---------------------------------------------------- |
| Mock data lost on restart            | Low    | Expected behavior, DB will persist                   |
| Performance with large mock dataset  | Low    | Mock data will be small, DB handles scale            |
| Migration complexity                 | Medium | Clear migration path documented, same interfaces     |
| Security gaps in mock implementation | Medium | Follow same security patterns as real implementation |

## Future Enhancements

- User activity logging
- Password reset flow
- Email verification
- User invitation system
- Bulk import/export
- Advanced search (full-text search)
- User preferences/settings
