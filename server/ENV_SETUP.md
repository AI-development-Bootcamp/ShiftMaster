# Environment Configuration Setup

## Overview

The server uses a safe environment configuration approach that:
1. Provides automatic test fallbacks for CI/CD
2. Validates required variables at server startup (not module load)
3. Prevents import crashes in test environments

## Configuration Files

### `src/config/env.ts`
Exports the `env` object with all environment variables and a `validateEnv()` function.

**Key Features:**
- ✅ Automatic test fallbacks when `NODE_ENV=test`
- ✅ Safe to import in any environment
- ✅ No immediate throws on module load

### `src/index.ts`
Server entry point that validates environment before starting.

**Startup Flow:**
1. Load `.env` file via dotenv
2. Call `validateEnv()` to check required variables
3. Exit with error if validation fails
4. Start server if all checks pass

## Environment Variables

### Required (Production)
- `JWT_SECRET` - Must be at least 32 characters in production
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional
- `JWT_EXPIRY` - Token expiration time (default: `24h`)
- `PORT` - Server port (default: `3000`)
- `CORS_ORIGINS` - Comma-separated allowed origins
- `DATABASE_URL` - Database connection string (if not using Supabase)

## Test Environment

### Automatic Fallbacks
When `NODE_ENV=test`, the following values are used automatically:

```typescript
{
  jwtSecret: 'test-jwt-secret-do-not-use-in-production',
  jwtExpiry: '24h',
  supabaseUrl: 'https://test.supabase.co',
  supabaseAnonKey: 'test-anon-key',
}
```

### Why This Works
- ✅ Tests can import modules without crashes
- ✅ No need to mock `env` in every test file
- ✅ CI/CD runs without setting up secrets
- ✅ Consistent test behavior across environments

## Validation

### `validateEnv()`
Called at server startup to ensure all required variables are set.

**Behavior:**
- **Test environment** (`NODE_ENV=test`): Skips validation, uses fallbacks
- **Development/Production**: Throws error if required variables are missing
- **Production only**: Enforces JWT_SECRET minimum length (32 characters)

### Error Messages
Clear, actionable error messages when validation fails:

```
Missing required environment variables: JWT_SECRET, SUPABASE_URL.
Please check your .env file or environment configuration.
```

## CI/CD Integration

### GitHub Actions
No special environment setup needed for tests:

```yaml
- name: Run tests
  run: npm run test -w server
  env:
    NODE_ENV: test  # Automatic fallbacks activate
```

### Feature Branch Workflow
The `.github/workflows/feature.yml` includes explicit env vars for clarity:

```yaml
env:
  NODE_ENV: test
  JWT_SECRET: test-jwt-secret-for-ci-testing-only
  # ... other test values
```

This is optional but makes the config more explicit.

## Migration from Old Approach

### Before
```typescript
// ❌ Threw immediately on module load
if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

// ❌ Tests required complex mocking
vi.mock('../config/env.js', () => ({
  env: { jwtSecret: 'test', jwtExpiry: '24h', ... }
}));
```

### After
```typescript
// ✅ Safe to import, provides test fallbacks
export const env = {
  jwtSecret: process.env.JWT_SECRET || 
    (isTest ? 'test-jwt-secret-do-not-use-in-production' : ''),
};

// ✅ Validation happens at startup
validateEnv(); // in src/index.ts

// ✅ Tests just work, no mocking needed
import { env } from '../config/env.js'; // Safe!
```

## Best Practices

### Development
1. Copy `.env.example` to `.env`
2. Fill in real values for local development
3. Never commit `.env` file

### Testing
1. Let `NODE_ENV=test` provide fallbacks
2. Only mock external services (DB, APIs)
3. Don't mock `env` unless testing specific config behavior

### Production
1. Set all required environment variables
2. Use strong JWT_SECRET (32+ characters)
3. Use secrets management (AWS Secrets Manager, etc.)

## Troubleshooting

### "Missing required environment variables" on startup
- Check your `.env` file exists
- Verify all required variables are set
- Ensure `.env` is in the project root

### Tests failing with environment errors
- Verify `NODE_ENV` is set to `test`
- Check `vitest.config.ts` doesn't override env behavior
- Confirm `validateEnv()` isn't called in test files

### Production deployment issues
- Verify JWT_SECRET is at least 32 characters
- Check deployment platform environment variables
- Ensure `.env` isn't in `.gitignore` (it should be!)

## Security Notes

⚠️ **Never use test fallback values in production!**

The `validateEnv()` function ensures test values can't be used in production:
- Fails if required variables are missing
- Enforces minimum JWT_SECRET length
- Runs before server accepts connections

This approach provides safety in tests while maintaining security in production.
