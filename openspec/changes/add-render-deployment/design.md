# Design: Render Deployment Architecture

## Context

The application needs to be deployed on Render, replacing the current Vercel deployment plan. Render supports:

- Web Services (containerized applications) for the backend
- Static Sites for frontend applications
- Environment variable management
- Automatic deployments from GitHub

## Goals / Non-Goals

**Goals:**

- Deploy backend as a containerized Web Service on Render
- Deploy client and admin frontends as Static Sites on Render
- Integrate Render deployment into existing CI/CD pipeline
- Maintain environment variable security and configuration
- Ensure zero-downtime deployments where possible

**Non-Goals:**

- Changing application architecture or code structure
- Adding new features or functionality
- Modifying local development workflow (Docker not required for local dev)
- Implementing custom deployment scripts beyond Render's standard process

## Decisions

### Decision: Backend Containerization with Docker

**What:** Use Docker to containerize the Express backend server.

**Why:**

- Render Web Services require containerized applications
- Docker provides consistent runtime environment across development and production
- Enables easy scaling and deployment management
- Standard approach for Node.js applications on Render

**Alternatives considered:**

- Native Node.js deployment: Not supported by Render Web Services
- Buildpacks: Less control over build process, Docker provides more flexibility

### Decision: Frontend as Static Sites

**What:** Deploy client and admin React apps as Render Static Sites.

**Why:**

- Render Static Sites are optimized for frontend applications
- Automatic CDN distribution and caching
- Simple configuration and deployment
- Cost-effective for static content

**Alternatives considered:**

- Deploying as Web Services: Unnecessary overhead for static content
- Using separate hosting: Adds complexity, Render provides unified platform

### Decision: Render CLI for CI/CD Integration

**What:** Use Render CLI in GitHub Actions for automated deployments.

**Why:**

- Official Render tooling for CI/CD integration
- Supports automated deployments from GitHub
- Can be configured with API keys for secure access
- Works seamlessly with Render's platform

**Alternatives considered:**

- Manual deployments: Not scalable, error-prone
- Render GitHub integration: Requires repository access, CLI provides more control

### Decision: Environment Variables in Render Dashboard

**What:** Configure environment variables directly in Render dashboard.

**Why:**

- Render provides secure environment variable management
- Easy to update without code changes
- Supports different values per environment
- Integrates with Render's deployment system

**Alternatives considered:**

- Environment files in repository: Security risk, not recommended
- External secret management: Overkill for current needs, Render's solution is sufficient

## Risks / Trade-offs

**Risk: Docker build complexity**

- **Mitigation**: Use multi-stage builds, optimize Dockerfile layers, test builds locally

**Risk: Environment variable synchronization**

- **Mitigation**: Document all required variables, create environment variable checklist, validate on deployment

**Risk: Frontend API URL configuration**

- **Mitigation**: Use Render environment variables for API URL, configure at build time via Vite

**Risk: Deployment failures**

- **Mitigation**: Test deployments in staging environment first, implement health checks, monitor deployment logs

**Trade-off: Docker for local development**

- **Decision**: Docker is optional for local development, developers can still run `npm run dev` directly
- **Rationale**: Keeps local development simple while enabling production containerization

## Migration Plan

1. **Phase 1: Backend Containerization**
   - Create Dockerfile for backend
   - Test Docker build locally
   - Configure Render Web Service
   - Deploy backend to Render

2. **Phase 2: Frontend Deployment**
   - Configure Render Static Sites for client and admin
   - Set up build commands and output directories
   - Configure environment variables (API URLs)
   - Deploy frontends to Render

3. **Phase 3: CI/CD Integration**
   - Update GitHub Actions workflow
   - Configure Render API keys as GitHub secrets
   - Test automated deployment
   - Update documentation

4. **Phase 4: Validation**
   - Verify all services are accessible
   - Test end-to-end functionality
   - Validate environment variables
   - Monitor deployment logs

## Open Questions

- Should we use Render's PostgreSQL service or continue with Supabase? (Assumption: Continue with Supabase as external service)
- Do we need separate staging and production environments on Render? (Assumption: Start with production, add staging later if needed)
- What is the expected traffic volume? (Assumption: Standard Render plan is sufficient initially)
