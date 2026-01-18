# Test Structure Documentation

This directory contains all test files for the server package, organized in a centralized test structure.

## Directory Structure

```
tests/
├── setup.ts                    # Global test setup and configuration
├── health.test.ts              # Server health endpoint tests
├── controllers/                # Controller layer tests
│   └── authController.test.ts
├── services/                   # Business logic layer tests
│   └── authService.test.ts
├── middleware/                 # Middleware tests
│   └── auth.test.ts
├── routes/                     # Route integration tests
│   └── auth.test.ts
├── utils/                      # Utility function tests
│   ├── jwt.test.ts
│   └── password.test.ts
└── integration/                # End-to-end integration tests
    └── protectedRoutes.test.ts
```

## Why Centralized Tests?

### 1. Clear Separation of Concerns

- Production code (`src/`) is completely separate from test code (`src/tests/`)
- Makes it easier to exclude tests from production builds
- Reduces bundle size and deployment complexity

### 2. Predictable Structure

- Mirror structure makes it easy to find tests: `src/utils/password.ts` → `src/tests/utils/password.test.ts`
- Consistent pattern across all test types (unit, integration, e2e)
- New developers can quickly understand where to find or add tests

### 3. Test Configuration

- Vitest is configured to discover all `*.test.ts` files automatically
- See `vitest.config.ts` for test discovery patterns
- Setup file (`setup.ts`) runs before all tests for global configuration

### 4. Monorepo Benefits

- Each package (server, client, admin, shared) has its own `tests/` directory
- Clear boundaries between package test suites
- Parallel test execution per package in CI/CD

## Test Categories

### Unit Tests

Located in directories matching their implementation:

- `utils/` - Pure function tests (JWT, password hashing)
- `middleware/` - Request/response middleware tests
- `controllers/` - Controller logic tests
- `services/` - Business logic tests

### Integration Tests

Located in `integration/`:

- Test multiple components working together
- Use real implementations with mocked external dependencies
- Example: `protectedRoutes.test.ts` tests auth middleware + routes + controllers

### Route Tests

Located in `routes/`:

- Test API endpoints end-to-end
- Use supertest for HTTP requests
- Mock services but test actual routing logic

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- password.test.ts

# Run tests in a specific directory
npm test -- tests/utils
```

## Test Guidelines

1. **Naming Convention**: `*.test.ts` for all test files
2. **Imports**: Use relative paths to import implementations
3. **Mocking**: Mock external dependencies (DB, APIs) but test real logic
4. **Setup**: Use `setup.ts` for global test configuration
5. **Environment**: Tests run with `NODE_ENV=test`

## CI/CD Integration

Tests run automatically in GitHub Actions:

- **Feature branches**: `feature.yml` - Run all tests
- **Dev branch**: `staging.yml` - Run tests + deploy to staging
- **Production branch**: `production.yml` - Run tests + deploy to production

All tests must pass before merging to protected branches.
