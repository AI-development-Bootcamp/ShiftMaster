# Docker Build Instructions

This document provides instructions for building and testing the Docker container for the backend server.

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for local testing, not required for Docker build)

## Building the Docker Image

The Dockerfile is located in `server/Dockerfile` but must be built from the repository root to handle workspace dependencies correctly.

### Build Command

```bash
# From repository root
docker build --file server/Dockerfile -t shiftmaster-server .
```

### Build Process

1. **Build Stage**:
   - Copies workspace configuration and source files
   - Installs all dependencies (including workspace dependencies)
   - Builds shared workspace first
   - Builds server workspace

2. **Production Stage**:
   - Creates minimal production image
   - Installs only production dependencies
   - Copies built artifacts from build stage
   - Sets up health check
   - Configures startup command

## Testing the Docker Image

### 1. Build the image

```bash
docker build --file server/Dockerfile -t shiftmaster-server .
```

### 2. Run the container with environment variables

```bash
docker run -p 3000:3000 \
  -e JWT_SECRET="your-test-jwt-secret-at-least-32-characters-long" \
  -e SUPABASE_URL="https://your-project.supabase.co" \
  -e SUPABASE_ANON_KEY="your-supabase-anon-key" \
  -e NODE_ENV="production" \
  -e PORT="3000" \
  -e CORS_ORIGINS="http://localhost:5173,http://localhost:5174" \
  shiftmaster-server
```

### 3. Verify the server is running

- Check logs: The container should output server startup messages
- Health check: `curl http://localhost:3000/api/health`
- API docs: `http://localhost:3000/api-docs`

### 4. Test with different port

```bash
docker run -p 8080:8080 \
  -e PORT="8080" \
  -e JWT_SECRET="your-test-jwt-secret-at-least-32-characters-long" \
  -e SUPABASE_URL="https://your-project.supabase.co" \
  -e SUPABASE_ANON_KEY="your-supabase-anon-key" \
  -e NODE_ENV="production" \
  shiftmaster-server
```

## Troubleshooting

### Build fails with workspace dependency errors

- Ensure you're building from the repository root, not from `server/` directory
- Verify `package-lock.json` exists at the root
- Check that all workspace packages are present

### Container fails to start

- Check environment variables are set correctly
- Verify JWT_SECRET is at least 32 characters
- Check logs: `docker logs <container-id>`

### Health check fails

- Verify the server is listening on the correct port
- Check that `/api/health` endpoint is accessible
- Review server logs for errors

## For Render Deployment

When deploying to Render:

1. Set **Root Directory** to repository root (`.`)
2. Set **Dockerfile Path** to `server/Dockerfile`
3. Configure all required environment variables in Render dashboard
4. Render will automatically build and deploy on git push

## Environment Variables Required

- `JWT_SECRET` (required, min 32 chars)
- `SUPABASE_URL` (required)
- `SUPABASE_ANON_KEY` (required)
- `PORT` (optional, Render sets this automatically)
- `NODE_ENV` (optional, defaults to development)
- `CORS_ORIGINS` (optional, comma-separated list)
- `DATABASE_URL` (optional)
- `JWT_EXPIRY` (optional, defaults to 24h)
