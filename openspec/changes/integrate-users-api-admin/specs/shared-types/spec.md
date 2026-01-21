# Spec Delta: Shared Types - User API Types

## Capability

Define shared TypeScript types for User API request/response formats to ensure type safety between Admin frontend and backend.

## ADDED Requirements

### Requirement: User API Response Types

Shared types SHALL define the structure of API responses for user operations.

#### Scenario: User list response structure
- GIVEN backend returns paginated user list
- WHEN Admin app receives response
- THEN response SHALL match structure:
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

#### Scenario: Single user response structure
- GIVEN backend returns single user (create, update, get by ID)
- WHEN Admin app receives response
- THEN response SHALL match structure:
  ```typescript
  {
    success: true,
    data: {
      user: User
    }
  }
  ```

#### Scenario: Delete user response structure
- GIVEN backend soft deletes user
- WHEN Admin app receives response
- THEN response SHALL match structure:
  ```typescript
  {
    success: true,
    data: {
      success: boolean,
      message: string
    }
  }
  ```

---

### Requirement: User API Request Types

Shared types SHALL define the structure of API request payloads for user operations.

#### Scenario: Create user request structure
- GIVEN Admin creates new user
- WHEN sending POST `/api/v1/users`
- THEN request body SHALL match structure:
  ```typescript
  {
    full_name: string,
    email: string,
    password: string,
    role: 'admin' | 'regular',
    job_title?: string
  }
  ```
- AND all fields except `job_title` SHALL be required
- AND `password` SHALL be minimum 8 characters

#### Scenario: Update user request structure
- GIVEN Admin updates existing user
- WHEN sending PATCH `/api/v1/users/:id`
- THEN request body SHALL match structure:
  ```typescript
  {
    full_name?: string,
    email?: string,
    password?: string, // optional, omit to keep existing
    role?: 'admin' | 'regular',
    job_title?: string,
    active?: boolean
  }
  ```
- AND all fields SHALL be optional
- AND omitted `password` SHALL preserve existing password

---

### Requirement: User API Error Types

Shared types SHALL define the structure of API error responses.

#### Scenario: Error response structure
- GIVEN API operation fails
- WHEN Admin app receives error response
- THEN response SHALL match structure:
  ```typescript
  {
    success: false,
    error: {
      message: string,
      code: string,
      details?: Record<string, any>
    }
  }
  ```

#### Scenario: Error codes enumeration
- GIVEN API can return specific error codes
- WHEN defining shared types
- THEN error codes SHALL include:
  - `EMAIL_EXISTS` - email already in use
  - `USER_NOT_FOUND` - user ID not found
  - `VALIDATION_ERROR` - input validation failed
  - `FORBIDDEN` - insufficient permissions
  - `UNAUTHORIZED` - authentication required/expired
  - `DUPLICATE_EMAIL` - duplicate email (alias for EMAIL_EXISTS)

---

### Requirement: User API Query Parameters

Shared types SHALL define the structure of query parameters for user list endpoint.

#### Scenario: User list query parameters
- GIVEN Admin fetches user list
- WHEN sending GET `/api/v1/users`
- THEN query parameters SHALL match structure:
  ```typescript
  {
    page?: number,        // default: 1
    limit?: number,       // default: 20, max: 100
    active?: boolean,     // default: true
    search?: string,      // search by name or email
    role?: 'admin' | 'regular'  // filter by role
  }
  ```

---

## MODIFIED Requirements

None. This is net-new type definitions for API integration.

---

## REMOVED Requirements

None.

---

## Cross-References

- **Related Capability:** `admin-frontend` (consumes these types)
- **Related Capability:** `backend-server` (produces these types)
- **Depends On:** Existing `User` and `UserRole` types in `@shared/types`

---

## Implementation Notes

### File Structure
```typescript
// shared/src/types/api/users.ts

import { User, UserRole } from '../models';

// Request types
export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  job_title?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  job_title?: string;
  active?: boolean;
}

export interface UserListQueryParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
  role?: UserRole;
}

// Response types
export interface UserListResponse {
  success: true;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleUserResponse {
  success: true;
  data: {
    user: User;
  };
}

export interface DeleteUserResponse {
  success: true;
  data: {
    success: boolean;
    message: string;
  };
}

// Error types
export interface ApiError {
  success: false;
  error: {
    message: string;
    code: UserApiErrorCode;
    details?: Record<string, any>;
  };
}

export enum UserApiErrorCode {
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
}
```

### Usage in Admin App
```typescript
// admin/src/pages/EmployeesManagementPage/EmployeesManagementPage.tsx

import {
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserApiErrorCode,
} from '@shared/types/api/users';

// Example usage
const createUser = async (formData: FormValues) => {
  const request: CreateUserRequest = {
    full_name: formData.full_name,
    email: formData.email,
    password: formData.password,
    role: formData.role as UserRole,
    job_title: formData.jobTitle || undefined,
  };

  const response = await apiClient.post<SingleUserResponse>('/api/v1/users', request);
  // TypeScript ensures response.data.user matches User type
};
```

---

## Validation Rules

### Email Validation
- Must be valid email format
- Must be unique across all users
- Case-insensitive uniqueness check

### Password Validation (Create)
- Minimum 8 characters
- Required on user creation
- Never returned in API responses (always excluded)

### Password Validation (Update)
- Optional on user update
- If omitted, existing password preserved
- If provided, same rules as create apply

### Role Validation
- Must be one of: `'admin'` | `'regular'`
- Matches `UserRole` enum from `@shared/types`

### Active Flag
- Boolean value
- Default: `true` on user creation
- Can be set to `false` via PATCH (soft delete)
- Can be set to `true` via PATCH (reactivate)

---

## Backward Compatibility

These are new types with no breaking changes to existing shared types. Existing `User` and `UserRole` types remain unchanged.

---

## Testing Considerations

1. **Type Safety:** Compile-time checks ensure request/response structures match
2. **Runtime Validation:** Consider adding Zod or similar for runtime validation
3. **Error Handling:** Ensure all error codes are handled in Admin app
4. **Edge Cases:** Test with missing optional fields, invalid enum values

---

## Migration Path

1. Add types to `shared/src/types/api/users.ts`
2. Export from `shared/src/types/index.ts`
3. Update Admin app to import and use types
4. Optionally add runtime validation with Zod schemas
