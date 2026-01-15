# Testing Agent

## Purpose
Specialized guidance for writing and maintaining tests across the ShiftMaster project.

## Plugin Integration

### When User Requests Test Validation
After writing or updating tests, use **code-review command** to validate:
- Test coverage adequacy
- Missing edge cases
- Test pattern adherence
- Brittle or flaky test detection
- Proper mocking and isolation

### When User Requests Test Implementation
Use **code-reviewer agent** from feature-dev for deeper test analysis when:
- User wants comprehensive test suite review
- Need to identify gaps in test coverage
- Reviewing test quality and maintainability

### When to Use Each
- **code-review command**: Quick validation after writing tests, before PR submission
- **code-reviewer agent**: Comprehensive test suite analysis and quality assessment

## Testing Stack

### Frontend (Client & Admin)
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vi (Vitest mocking utilities)

### Backend (Server)
- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Mocking**: Vi for services and database

### Test File Convention
- Colocate tests with source files
- Use `.test.ts` or `.test.tsx` extension
- Example: `UserService.ts` → `UserService.test.ts`

## Test Types

### Unit Tests
- Test individual functions/components in isolation
- Mock external dependencies
- Fast execution
- High coverage

### Integration Tests
- Test multiple components working together
- Test API endpoints end-to-end
- Use test database or mocked responses
- Verify real workflows

### E2E Tests (Future)
- Full user workflows
- Browser automation
- Test critical paths

## Frontend Testing

### Component Testing

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Redux Testing

```typescript
// store.test.ts
import { configureStore } from '@reduxjs/toolkit';
import reducer, { actionName } from './slice';

describe('Redux slice', () => {
  it('handles action correctly', () => {
    const store = configureStore({ reducer });

    store.dispatch(actionName(payload));

    const state = store.getState();
    expect(state.value).toBe(expected);
  });
});
```

### Testing with Context

```typescript
// Wrapper for Redux Provider
const renderWithProviders = (
  ui: React.ReactElement,
  { preloadedState = {}, ...renderOptions } = {}
) => {
  const store = configureStore({
    reducer: { /* your reducers */ },
    preloadedState,
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
```

### API Call Testing

```typescript
// Mock API client
vi.mock('@/shared/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

it('fetches data on mount', async () => {
  const mockData = { users: [{ id: 1, name: 'John' }] };
  apiClient.get.mockResolvedValue(mockData);

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

## Backend Testing

### Service Testing

```typescript
// userService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from './userService';
import * as db from '../db/supabase';

vi.mock('../db/supabase');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates user successfully', async () => {
    const mockUser = { user_id: 1, full_name: 'John Doe' };
    vi.mocked(db.insertUser).mockResolvedValue(mockUser);

    const result = await createUser({
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'regular',
    });

    expect(result).toEqual(mockUser);
    expect(db.insertUser).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'John Doe',
      email: 'john@example.com',
    }));
  });

  it('throws error for duplicate email', async () => {
    vi.mocked(db.insertUser).mockRejectedValue(
      new Error('Email already exists')
    );

    await expect(createUser({
      full_name: 'John Doe',
      email: 'existing@example.com',
      password: 'password123',
      role: 'regular',
    })).rejects.toThrow('Email already exists');
  });
});
```

### Controller/Endpoint Testing

```typescript
// userController.test.ts
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '../app';
import * as userService from '../services/userService';

vi.mock('../services/userService');

describe('POST /api/v1/users', () => {
  it('creates user successfully', async () => {
    const mockUser = { user_id: 1, full_name: 'John Doe' };
    vi.mocked(userService.createUser).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'regular',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: mockUser,
    });
  });

  it('returns 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({ full_name: 'John Doe' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({ full_name: '' }); // Missing required fields

    expect(response.status).toBe(400);
  });
});
```

### Middleware Testing

```typescript
// authMiddleware.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './authMiddleware';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('calls next() with valid token', () => {
    req.headers!.authorization = 'Bearer valid-token';
    vi.mocked(jwt.verify).mockReturnValue({ user_id: 1, role: 'admin' });

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ user_id: 1, role: 'admin' });
  });

  it('returns 401 without token', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });
});
```

## Test Data

### Factories/Builders

```typescript
// testUtils/factories.ts
export const createMockUser = (overrides = {}) => ({
  user_id: 1,
  full_name: 'Test User',
  email: 'test@example.com',
  role: 'regular',
  active: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  project_id: 1,
  client_id: 1,
  manager_user_id: 2,
  name: 'Test Project',
  time_format_type: 'start_end',
  active: true,
  ...overrides,
});
```

### Test Database
- Use separate test database
- Reset between tests
- Seed with known data
- Clean up after tests

## Common Testing Patterns

### Testing Async Operations

```typescript
it('handles async operation', async () => {
  const promise = asyncOperation();

  await expect(promise).resolves.toBe(expectedValue);
  // or
  await expect(promise).rejects.toThrow(ExpectedError);
});
```

### Testing Error Handling

```typescript
it('handles error gracefully', async () => {
  vi.mocked(service.method).mockRejectedValue(new Error('Failed'));

  const { getByText } = render(<Component />);

  await waitFor(() => {
    expect(getByText('Error message')).toBeInTheDocument();
  });
});
```

### Testing Loading States

```typescript
it('shows loading state', () => {
  vi.mocked(apiClient.get).mockImplementation(
    () => new Promise(() => {}) // Never resolves
  );

  render(<Component />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### Testing Authentication

```typescript
it('redirects to login when unauthorized', async () => {
  vi.mocked(apiClient.get).mockRejectedValue({ status: 401 });

  render(<ProtectedComponent />);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
```

## Coverage

### Target Coverage
- Unit tests: 80%+ coverage
- Critical paths: 100% coverage
- Integration tests: Key workflows

### Running Coverage

```bash
# Frontend
npm run test:coverage -w client
npm run test:coverage -w admin

# Backend
npm run test:coverage -w server
```

### Coverage Reports
- HTML report in `coverage/` directory
- Focus on uncovered critical code
- Don't obsess over 100% - test what matters

## Testing Business Rules

### Month Lock Validation
```typescript
it('prevents entry modification when month is locked', async () => {
  vi.mocked(getMonthLock).mockResolvedValue({
    lock_id: 1,
    year: 2024,
    month: 1,
    unlocked_at: null,
  });

  await expect(
    updateEntry(entryId, { description: 'Updated' })
  ).rejects.toThrow('Month is locked');
});
```

### Task Assignment Validation
```typescript
it('prevents time entry without task assignment', async () => {
  vi.mocked(getActiveAssignment).mockResolvedValue(null);

  await expect(
    createEntry({
      user_id: 1,
      work_date: '2024-01-15',
      assignments: [{ task_id: 1, location: 'Office' }],
    })
  ).rejects.toThrow('User is not assigned to task');
});
```

### Time Format Validation
```typescript
it('enforces project time format', async () => {
  vi.mocked(getProjectByTaskId).mockResolvedValue({
    time_format_type: 'start_end',
  });

  await expect(
    createEntryAssignment({
      task_id: 1,
      duration_minutes: 480, // Wrong format
    })
  ).rejects.toThrow('Time format mismatch');
});
```

## Test Organization

### File Structure
```
/src/
  /components/
    Button.tsx
    Button.test.tsx
  /services/
    userService.ts
    userService.test.ts
  /utils/
    validation.ts
    validation.test.ts
```

### Test Suites
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('creates user successfully', () => {});
    it('validates email format', () => {});
    it('throws on duplicate email', () => {});
  });

  describe('updateUser', () => {
    it('updates user data', () => {});
    it('prevents email change to existing', () => {});
  });
});
```

## Checklist for Testing

- [ ] Write tests alongside code
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Mock external dependencies
- [ ] Use meaningful test names
- [ ] Arrange-Act-Assert pattern
- [ ] Clean up after tests
- [ ] Run tests before committing
- [ ] Maintain test coverage
- [ ] Update tests when requirements change
