# Change: Setup Initial Monorepo Structure

## Why

The project currently has no code structure. We need to establish the foundational monorepo architecture with proper directory organization, build configurations, and development tooling to enable parallel development of the mobile client, web admin, and backend server.

## What Changes

- Create npm workspace-based monorepo with flat directory structure
- Scaffold React + Vite + TypeScript applications for client (mobile PWA) and admin (web)
- Scaffold Express + TypeScript backend server
- Create shared package for utilities and API client code
- Configure TypeScript, Vite, ESLint, and Prettier across all workspaces
- Set up Vitest testing framework
- Create environment variable templates and development scripts
- Configure Redux stores for both frontend applications (separate stores)

## Impact

- Affected specs:
  - `monorepo-structure` (new)
  - `frontend-client` (new)
  - `frontend-admin` (new)
  - `backend-server` (new)
  - `shared-utilities` (new)
  - `development-environment` (new)
- Affected code: Root directory and all new workspaces
- Breaking changes: None (initial setup)
