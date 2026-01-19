# Multi-stage Dockerfile for AbraShiftMaster Backend Server

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration files
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy shared workspace (needed for server build)
COPY shared/package.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src/

# Copy server workspace
COPY server/package.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src ./server/src/

# Install all dependencies (including workspace dependencies)
RUN npm ci

# Build shared workspace first (server depends on it)
WORKDIR /app/shared
RUN npm run build

# Build server workspace
WORKDIR /app/server
RUN npm run build && \
    test -d dist && test "$(ls -A dist)" || (echo "ERROR: Build failed - dist directory is empty or missing!" && exit 1)

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files for production dependencies
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --workspace=server --workspace=shared

# Copy built artifacts from builder stage
# Only copy compiled JavaScript from shared (no TypeScript sources)
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

# Set working directory to server
WORKDIR /app/server

# Expose port (Render will set PORT env var, default to 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/v1/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
