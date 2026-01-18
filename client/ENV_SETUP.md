# Client Environment Configuration

## Required Environment Variables

### Development (.env.development)

Create a `.env.development` file with the following content (keys are in lexicographic order):

```bash
# Client Development Environment Variables

# API URL for backend server
VITE_API_URL=http://localhost:3000

# Render deployment hook URL (optional, used for CI/CD)
VITE_RENDER_DEPLOY_URL_CLIENT=
```

### Production (.env.production)

Create a `.env.production` file with the following content (keys are in lexicographic order):

```bash
# Client Production Environment Variables

# API URL for backend server
VITE_API_URL=https://your-api-url.onrender.com

# Render deployment hook URL (optional, used for CI/CD)
VITE_RENDER_DEPLOY_URL_CLIENT=
```

## Important Notes

1. **All variables must have the `VITE_` prefix** - Vite only exposes environment variables prefixed with `VITE_` to the client-side code
2. **Variable name changed** - The variable was renamed from `RENDER_DEPLOY_URL_CLIENT` to `VITE_RENDER_DEPLOY_URL_CLIENT` to comply with Vite's requirements
3. **Keys are sorted alphabetically** - This satisfies dotenv-linter requirements
4. **Files must end with a newline** - Ensure there's a trailing newline at the end of each .env file
5. **Never commit .env files** - Only .env.example files should be committed to the repository

## Validation

The client application will validate required environment variables at startup. If `VITE_API_URL` is missing in production, the app will throw an error:

```
[ENV_MISSING] Missing required environment variables: VITE_API_URL.
Please check your .env file or environment configuration.
```

## TypeScript Support

Environment variables are typed in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RENDER_DEPLOY_URL_CLIENT?: string;
}
```
