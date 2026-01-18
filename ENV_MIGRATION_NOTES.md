# Environment Variable Migration Notes

## Summary of Changes

This document describes the changes made to environment variable handling across the project to ensure compliance with Vite's requirements and dotenv-linter standards.

## Changes Made

### 1. TypeScript Declarations

#### `admin/src/vite-env.d.ts`
- Added `VITE_RENDER_DEPLOY_URL_ADMIN?: string` to the `ImportMetaEnv` interface

#### `client/src/vite-env.d.ts`
- Added `VITE_RENDER_DEPLOY_URL_CLIENT?: string` to the `ImportMetaEnv` interface

### 2. Environment Configuration Files

#### `admin/src/config/env.ts`
- Added environment variable validation that throws `[ENV_MISSING]` error when required variables are missing in production
- Validation is skipped in test and development modes
- Added development fallback for `apiUrl` (http://localhost:3000)
- Improved documentation

#### `client/src/config/env.ts`
- **BREAKING CHANGE:** Renamed `RENDER_DEPLOY_URL_CLIENT` to `VITE_RENDER_DEPLOY_URL_CLIENT` to comply with Vite's requirement that all environment variables must be prefixed with `VITE_`
- Added environment variable validation that throws `[ENV_MISSING]` error when required variables are missing in production
- Validation is skipped in test and development modes
- Added development fallback for `apiUrl` (http://localhost:3000)
- Improved documentation

### 3. Documentation

#### Created `admin/ENV_SETUP.md`
- Complete documentation for admin environment variables
- Example .env.development and .env.production files
- Important notes about VITE_ prefix requirement
- Lexicographic ordering of keys
- Trailing newline requirement

#### Created `client/ENV_SETUP.md`
- Complete documentation for client environment variables
- Example .env.development and .env.production files
- Important notes about VITE_ prefix requirement
- Documents the variable name change from `RENDER_DEPLOY_URL_CLIENT` to `VITE_RENDER_DEPLOY_URL_CLIENT`
- Lexicographic ordering of keys
- Trailing newline requirement

#### Updated `README.md`
- Added comprehensive environment variable section
- Separate subsections for server, client, and admin
- Links to detailed ENV_SETUP.md files
- Important notes about VITE_ prefix, alphabetical ordering, and trailing newlines

## Migration Steps for Existing Environments

### For Client Application

If you have existing `.env` files for the client application, you need to rename the variable:

**Old:**
```env
RENDER_DEPLOY_URL_CLIENT=your-deploy-url
```

**New:**
```env
VITE_RENDER_DEPLOY_URL_CLIENT=your-deploy-url
```

### For Admin Application

The admin application variable names are already correct if using `VITE_RENDER_DEPLOY_URL_ADMIN`. No changes needed.

### GitHub Actions Secrets

The GitHub Actions workflows (`.github/workflows/feature.yml`) already use the correct variable names:
- `VITE_RENDER_DEPLOY_URL_SERVER`
- `VITE_RENDER_DEPLOY_URL_CLIENT`
- `VITE_RENDER_DEPLOY_URL_ADMIN`

No changes needed to workflow files or GitHub secrets configuration.

## Environment Variable Standards

### 1. VITE_ Prefix Requirement

**Why:** Vite only exposes environment variables prefixed with `VITE_` to client-side code. Variables without this prefix are not accessible via `import.meta.env`.

**Rule:** All frontend environment variables must start with `VITE_`

### 2. Alphabetical Ordering

**Why:** dotenv-linter enforces alphabetical ordering of environment variables for consistency and maintainability.

**Rule:** Keys in .env files should be sorted lexicographically (A-Z)

**Example:**
```env
VITE_API_URL=http://localhost:3000
VITE_RENDER_DEPLOY_URL_ADMIN=
```

### 3. Trailing Newline

**Why:** POSIX standard requires text files to end with a newline character. Many linters enforce this.

**Rule:** All .env files must end with a newline character

### 4. Validation and Fail-Fast

**Why:** Missing environment variables should be caught early rather than causing runtime failures.

**Implementation:** Both client and admin now validate required variables at module load time and throw descriptive errors with `[ENV_MISSING]` error code.

**Behavior:**
- **Production:** Throws error if `VITE_API_URL` is missing
- **Development:** Uses fallback values (http://localhost:3000 for API URL)
- **Test:** Skips validation entirely

## Error Codes

### `[ENV_MISSING]`

Thrown when required environment variables are missing in production mode.

**Example:**
```
[ENV_MISSING] Missing required environment variables: VITE_API_URL.
Please check your .env file or environment configuration.
```

## Testing

Environment validation is automatically skipped when:
- `import.meta.env.MODE === 'test'`
- `import.meta.env.DEV === true`

This ensures tests run without requiring environment variable setup.

## Deployment Checklist

When deploying to production:

1. ✅ Ensure all `.env.production` files exist in client and admin directories
2. ✅ Verify `VITE_API_URL` is set to production API URL
3. ✅ Verify environment variables are in alphabetical order
4. ✅ Ensure files end with a trailing newline
5. ✅ All variables use `VITE_` prefix (for frontend apps)
6. ✅ Update deployment platform environment variables (Render, Vercel, etc.)
7. ✅ GitHub Actions secrets are configured with correct names

## Files Modified

- `admin/src/vite-env.d.ts`
- `admin/src/config/env.ts`
- `client/src/vite-env.d.ts`
- `client/src/config/env.ts`
- `README.md`

## Files Created

- `admin/ENV_SETUP.md`
- `client/ENV_SETUP.md`
- `ENV_MIGRATION_NOTES.md` (this file)

## No Changes Required

- `.github/workflows/feature.yml` (already using correct variable names)
- `.github/workflows/staging.yml` (no deployment variables used)
- `server/` directory (server environment variables don't need VITE_ prefix)
