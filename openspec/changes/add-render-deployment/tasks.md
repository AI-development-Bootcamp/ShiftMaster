## 1. Backend Containerization

- [ ] 1.1 Create Dockerfile in server/ directory
- [ ] 1.2 Configure multi-stage build (build stage + production stage)
- [ ] 1.3 Set up .dockerignore file to exclude unnecessary files
- [ ] 1.4 Test Docker build locally (`docker build -t shiftmaster-server .`)
- [ ] 1.5 Verify Docker image runs correctly (`docker run -p 3000:3000 shiftmaster-server`)
- [ ] 1.6 Test with environment variables passed to container

## 2. Render Backend Configuration

- [ ] 2.1 Create Render Web Service for backend
- [ ] 2.2 Configure Dockerfile path and build settings
- [ ] 2.3 Set up environment variables in Render dashboard:
  - [ ] JWT_SECRET
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] DATABASE_URL (if needed)
  - [ ] PORT (Render sets this automatically)
  - [ ] NODE_ENV=production
  - [ ] CORS_ORIGINS (frontend URLs)
- [ ] 2.4 Configure health check endpoint (`/api/health`)
- [ ] 2.5 Test backend deployment on Render
- [ ] 2.6 Verify backend API is accessible and responding

## 3. Frontend Client Deployment

- [ ] 3.1 Create Render Static Site for client application
- [ ] 3.2 Configure build command: `npm ci && npm run build -w client`
- [ ] 3.3 Configure publish directory: `client/dist`
- [ ] 3.4 Set up environment variables:
  - [ ] VITE_API_URL (backend Render URL)
- [ ] 3.5 Test client build locally with production API URL
- [ ] 3.6 Deploy client to Render
- [ ] 3.7 Verify client application loads and connects to backend

## 4. Frontend Admin Deployment

- [ ] 4.1 Create Render Static Site for admin application
- [ ] 4.2 Configure build command: `npm ci && npm run build -w admin`
- [ ] 4.3 Configure publish directory: `admin/dist`
- [ ] 4.4 Set up environment variables:
  - [ ] VITE_API_URL (backend Render URL)
- [ ] 4.5 Test admin build locally with production API URL
- [ ] 4.6 Deploy admin to Render
- [ ] 4.7 Verify admin application loads and connects to backend

## 5. CI/CD Integration

- [ ] 5.1 Install Render CLI in GitHub Actions workflow
- [ ] 5.2 Add RENDER_API_KEY as GitHub secret
- [ ] 5.3 Update server deployment step to use Render CLI
- [ ] 5.4 Update client deployment step (if Render CLI supports static sites, otherwise use manual trigger)
- [ ] 5.5 Update admin deployment step (if Render CLI supports static sites, otherwise use manual trigger)
- [ ] 5.6 Test automated deployment on push to production branch
- [ ] 5.7 Verify deployment logs and success status

## 6. Documentation Updates

- [ ] 6.1 Update `openspec/project.md` deployment section (change Vercel to Render)
- [ ] 6.2 Create `DEPLOYMENT.md` with Render deployment instructions
- [ ] 6.3 Document environment variables required for Render
- [ ] 6.4 Add Render service URLs to documentation
- [ ] 6.5 Update README.md with deployment information
- [ ] 6.6 Document how to update environment variables in Render

## 7. Validation

- [ ] 7.1 Test end-to-end user flow (login, data access)
- [ ] 7.2 Verify CORS configuration allows frontend requests
- [ ] 7.3 Check that all API endpoints are accessible
- [ ] 7.4 Validate environment variables are correctly set
- [ ] 7.5 Test deployment rollback process (if needed)
- [ ] 7.6 Monitor application logs for errors
