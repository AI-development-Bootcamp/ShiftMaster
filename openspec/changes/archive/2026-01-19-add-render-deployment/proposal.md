# Change: Add Render Deployment

## Why

The application currently has deployment placeholders configured for Vercel, but we need to deploy on Render instead. Render provides containerized deployment for backend services and static site hosting for frontend applications, which aligns better with our architecture needs. This change will enable production deployment of both the containerized backend and the frontend applications on Render's platform.

## What Changes

- **Backend Deployment**: Containerize the Express backend server using Docker and deploy it as a Web Service on Render
- **Frontend Deployment**: Deploy both client and admin React applications as Static Sites on Render
- **CI/CD Integration**: Update GitHub Actions production workflow to deploy to Render instead of Vercel
- **Environment Configuration**: Configure Render environment variables for all services
- **Documentation**: Update project documentation to reflect Render deployment instead of Vercel

## Impact

- **Affected specs**:
  - `backend-server` - Add containerization requirements
  - `frontend-client` - Add Render static site deployment requirements
  - `frontend-admin` - Add Render static site deployment requirements
  - `cicd-pipeline` - Modify deployment steps to use Render
- **Affected code**:
  - `server/` - Add Dockerfile and Docker-related configuration
  - `.github/workflows/production.yml` - Update deployment steps
  - `openspec/project.md` - Update deployment section
- **Breaking changes**: None - this is a deployment infrastructure change that doesn't affect application behavior
