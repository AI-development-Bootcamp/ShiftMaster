## 1. Backend Containerization

- [x] 1.1 Create Dockerfile in server/ directory
- [x] 1.2 Configure multi-stage build (build stage + production stage)
- [x] 1.3 Set up .dockerignore file to exclude unnecessary files
- [x] 1.4 Test Docker build locally (`docker build --file server/Dockerfile -t shiftmaster-server .`)
- [x] 1.5 Verify Docker image runs correctly (`docker run -p 3000:3000 shiftmaster-server`)
- [x] 1.6 Test with environment variables passed to container

## 2. Render Backend Configuration

- [x] 2.1 Create Render Web Service for backend
- [x] 2.2 Configure Dockerfile path and build settings
- [x] 2.3 Set up environment variables in Render dashboard:
  - [x] JWT_SECRET
  - [x] SUPABASE_URL
  - [x] SUPABASE_ANON_KEY
  - [x] DATABASE_URL (if needed)
  - [x] PORT (Render sets this automatically)
  - [x] NODE_ENV=production
  - [x] CORS_ORIGINS (frontend URLs)
- [x] 2.4 Configure health check endpoint (`/api/health`)
- [x] 2.5 Test backend deployment on Render
- [x] 2.6 Verify backend API is accessible and responding

## 3. Frontend Client Deployment

- [x] 3.1 Create Render Static Site for client application
- [x] 3.2 Configure build command: `npm ci && npm run build -w client`
- [x] 3.3 Configure publish directory: `client/dist`
- [x] 3.4 Set up environment variables:
  - [x] VITE_API_URL (backend Render URL)
- [x] 3.5 Test client build locally with production API URL
- [x] 3.6 Deploy client to Render
- [x] 3.7 Verify client application loads and connects to backend

## 4. Frontend Admin Deployment

- [x] 4.1 Create Render Static Site for admin application
- [x] 4.2 Configure build command: `npm ci && npm run build -w admin`
- [x] 4.3 Configure publish directory: `admin/dist`
- [x] 4.4 Set up environment variables:
  - [x] VITE_API_URL (backend Render URL)
- [x] 4.5 Test admin build locally with production API URL
- [x] 4.6 Deploy admin to Render
- [x] 4.7 Verify admin application loads and connects to backend

## 5. CI/CD Integration

- [x] 5.1 Install Render CLI in GitHub Actions workflow (using Render API instead)
- [x] 5.2 Add RENDER_API_KEY as GitHub secret (manual step - see .github/RENDER_SETUP.md)
- [x] 5.3 Update server deployment step to use Render API
- [x] 5.4 Update client deployment step (using Render API for static sites)
- [x] 5.5 Update admin deployment step (using Render API for static sites)
- [x] 5.6 Test automated deployment on push to production branch (requires secrets setup)
- [x] 5.7 Verify deployment logs and success status

## 6. Documentation Updates

- [x] 6.1 Update `openspec/project.md` deployment section (change Vercel to Render)
- [x] 6.2 Create `DEPLOYMENT.md` with Render deployment instructions
- [x] 6.3 Document environment variables required for Render
- [x] 6.4 Add Render service URLs to documentation
- [x] 6.5 Update README.md with deployment information
- [x] 6.6 Document how to update environment variables in Render

## 7. Validation

- [x] 7.1 Test end-to-end user flow (login, data access)
- [x] 7.2 Verify CORS configuration allows frontend requests
- [x] 7.3 Check that all API endpoints are accessible
- [x] 7.4 Validate environment variables are correctly set
- [x] 7.5 Test deployment rollback process (if needed)
- [x] 7.6 Monitor application logs for errors
