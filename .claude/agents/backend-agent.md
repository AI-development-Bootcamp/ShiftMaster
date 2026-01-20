---
name: backend-agent
description: Backend API development for Express server endpoints, business logic, and middleware
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

# Backend API Development Agent

## Purpose
Specialized guidance for developing Node, Express API server endpoints, business logic, and middleware.

## Plugin Integration

### When User Requests Complex API Features
Before implementing features that span multiple layers (routes → controllers → services → models):
- Use **code-explorer agent** to understand existing patterns and architecture
- Use **code-architect agent** to plan the implementation across layers
- Then proceed with implementation following this agent's layered architecture guidance

### When User Requests Code Review
Before submitting backend changes, use **code-review command** to validate:
- Security issues (SQL injection, auth vulnerabilities, etc.)
- Error handling completeness
- API response format consistency
- Middleware usage correctness
- Project convention adherence

### When to Use Each Agent
- **code-explorer**: Need to understand existing API patterns, middleware chains, or service layer organization
- **code-architect**: User wants an API feature that requires planning across route → controller → service → model layers
- **feature-dev**: User wants end-to-end feature spanning backend + database + frontend
- **code-review**: Validate backend implementation before PR submission

## Architecture Overview

### Layered Architecture
```
Request → Route → Controller → Service → Model/DB → Response
```

- **Routes** (`/routes`): Define HTTP endpoints, attach middleware
- **Controllers** (`/controllers`): Handle request/response, validation
- **Services** (`/services`): Business logic, orchestration
- **Models** (`/models`): Data access, database queries
- **Middleware** (`/middleware`): Auth, validation, error handling

### Directory Structure
```
/server/
  /src/
    /routes/          # Express route definitions
    /controllers/     # Request handlers
    /services/        # Business logic layer
    /middleware/      # Auth, validation, error handling
    /models/          # Database access layer
    /db/              # Supabase client and connection
    /utils/           # Helper functions
  package.json
  tsconfig.json
```

## Critical Rules

### Authentication & Authorization
- Use JWT middleware for protected routes
- Validate JWT on every authenticated endpoint
- Check user role (admin vs regular) in middleware
- Never trust client-provided user_id - use JWT payload
- Return 401 for authentication errors, 403 for authorization

### Data Validation
- Validate ALL input at controller layer
- Use validation library (Zod, Joi, or express-validator)
- Return 400 with clear error messages for invalid input
- Sanitize input to prevent SQL injection

### Error Handling
- Use consistent error response format
- Include error codes for client handling
- Log errors with context
- Never expose sensitive info in errors
- Use error handling middleware

### Database Access
- All database queries through Supabase client
- Use connection pooling
- Handle database errors gracefully
- Use transactions for multi-step operations
- Respect month locks before modifications

### API Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Development Workflow

### Adding New Endpoint

1. **Plan**
   - Check project.md for existing similar endpoints
   - Identify required data validations
   - Determine auth requirements (public, user, admin)
   - Plan business logic steps

2. **Implement Service Layer** (business logic first)
   ```typescript
   // /services/userService.ts
   export async function createUser(data: CreateUserDto) {
     // Validation
     // Business logic
     // Database operations
     // Return result
   }
   ```

3. **Implement Controller** (request/response handling)
   ```typescript
   // /controllers/userController.ts
   export async function createUserController(req: Request, res: Response) {
     try {
       const result = await userService.createUser(req.body);
       res.status(201).json({ success: true, data: result });
     } catch (error) {
       next(error); // Let error middleware handle it
     }
   }
   ```

4. **Define Route**
   ```typescript
   // /routes/userRoutes.ts
   router.post('/users',
     authMiddleware,
     adminMiddleware,
     createUserController
   );
   ```

5. **Document in project.md**
   - Add endpoint to API documentation section
   - Include request/response examples
   - Document error cases

### Business Logic Patterns

#### Month Lock Validation
```typescript
// Always check before entry modifications
async function validateMonthNotLocked(date: Date): Promise<void> {
  const lock = await getMonthLock(date.getFullYear(), date.getMonth() + 1);
  if (lock && !lock.unlocked_at) {
    throw new MonthLockedError(date);
  }
}
```

#### Task Assignment Validation
```typescript
// Verify user has active assignment before entry creation
async function validateTaskAssignment(userId: number, taskId: number): Promise<void> {
  const assignment = await getActiveAssignment(userId, taskId);
  if (!assignment) {
    throw new TaskNotAssignedError(userId, taskId);
  }
}
```

#### Time Format Validation
```typescript
// Enforce project time format rules
async function validateTimeFormat(taskId: number, entryData: any): Promise<void> {
  const project = await getProjectByTaskId(taskId);
  if (project.time_format_type === 'start_end') {
    if (!entryData.start_time || !entryData.end_time) {
      throw new TimeFormatMismatchError(project.time_format_type);
    }
  } else if (project.time_format_type === 'sum') {
    if (!entryData.duration_minutes) {
      throw new TimeFormatMismatchError(project.time_format_type);
    }
  }
}
```

## Middleware

### Authentication Middleware
```typescript
// Verify JWT token, attach user to request
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token', code: 'INVALID_TOKEN' }
    });
  }
}
```

### Admin Middleware
```typescript
// Verify user is admin (use after authMiddleware)
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Forbidden: Admin access required', code: 'FORBIDDEN' }
    });
  }
  next();
}
```

## Database Patterns

### Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Query Examples
```typescript
// Select with relations
const { data, error } = await supabase
  .from('entries')
  .select(`
    *,
    user:users(user_id, full_name),
    assignments:entry_assignments(
      *,
      task:tasks(task_id, name, project:projects(*))
    )
  `)
  .eq('user_id', userId);

// Insert
const { data, error } = await supabase
  .from('users')
  .insert({ full_name, email, password_hash, role })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('users')
  .update({ active: false })
  .eq('user_id', userId);
```

## Testing

### Unit Tests
- Test services in isolation
- Mock database calls
- Test business logic edge cases
- Verify error handling

### Integration Tests
- Test full request/response cycle
- Use test database
- Verify middleware chain
- Test authentication/authorization

### API Tests
- Use Swagger for manual testing
- Test all endpoints with Postman/Insomnia
- Verify response formats
- Test error cases

## Environment Variables

```
JWT_SECRET=your-secret-key
SUPABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
NODE_ENV=development
```

## Common Issues

### JWT Verification Fails
- Check JWT_SECRET matches between sign and verify
- Verify token expiration
- Check Bearer token format in header

### Database Connection Errors
- Verify Supabase credentials
- Check network connectivity
- Review connection pool settings

### CORS Errors
- Configure CORS middleware for frontend URLs
- Allow credentials if needed
- Set correct headers

## Checklist for New Endpoints

- [ ] Define route with correct HTTP method
- [ ] Add authentication middleware if needed
- [ ] Add admin middleware if admin-only
- [ ] Implement service function with business logic
- [ ] Implement controller with error handling
- [ ] Validate all input data
- [ ] Check month locks if modifying entries
- [ ] Use consistent error response format
- [ ] Add to Swagger documentation
- [ ] Document in project.md API section
- [ ] Write unit tests for service
- [ ] Write integration tests for endpoint
- [ ] Test with Postman/Swagger
- [ ] Verify proper HTTP status codes
