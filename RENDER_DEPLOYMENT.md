# Render Deployment Guide

This guide walks you through deploying the AbraShiftMaster application on Render.

## Prerequisites

- Render account (sign up at https://render.com)
- GitHub repository connected to Render
- Docker image builds successfully locally
- Supabase credentials ready

## Part 1: Backend Web Service Deployment

### Task 2.1: Create Render Web Service for Backend

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com
   - Sign in with your GitHub account (recommended for automatic deployments)

2. **Create New Web Service**
   - Click **"New +"** button in the top right
   - Select **"Web Service"**

3. **Connect Repository**
   - Click **"Connect account"** if not already connected
   - Select your GitHub account
   - Choose the repository: `Project-time-report/ShiftMaster` (or your repo name)
   - Click **"Connect"**

4. **Configure Service**
   - **Name**: `shiftmaster-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch**: `production` (or `main` if that's your production branch)
   - **Root Directory**: Leave empty (repository root)
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `server/Dockerfile`
   - **Docker Build Context**: Leave empty (uses root directory)

5. **Plan Selection**
   - Start with **Free** plan for testing
   - Upgrade to **Starter** ($7/month) or higher for production

6. **Click "Create Web Service"**

### Task 2.2: Configure Dockerfile Path and Build Settings

After creating the service, verify these settings in the service settings:

1. **Go to Service Settings**
   - Click on your service name
   - Navigate to **"Settings"** tab

2. **Verify Build Settings**
   - **Build Command**: Leave empty (Docker handles this)
   - **Start Command**: Leave empty (defined in Dockerfile CMD)
   - **Dockerfile Path**: Should be `server/Dockerfile`
   - **Docker Build Context**: Should be empty (defaults to root)

3. **Advanced Settings** (optional)
   - **Auto-Deploy**: `Yes` (deploys on every push to production branch)
   - **Pull Request Previews**: `Yes` (optional, for testing PRs)

4. **Save Settings**

## Part 2: Environment Variables Configuration

### Task 2.3: Set Up Environment Variables

1. **Navigate to Environment Tab**
   - In your service settings, go to **"Environment"** tab

2. **Add Required Variables**

   Click **"Add Environment Variable"** for each:

   | Key                 | Value                                                              | Notes                                                           |
   | ------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
   | `JWT_SECRET`        | `[Generate with: openssl rand -base64 32]`                         | **Required** - Must be 32+ characters                           |
   | `SUPABASE_URL`      | `https://your-project.supabase.co`                                 | **Required** - Your Supabase project URL                        |
   | `SUPABASE_ANON_KEY` | `your-supabase-anon-key`                                           | **Required** - From Supabase dashboard                          |
   | `NODE_ENV`          | `production`                                                       | **Required** - Set to production                                |
   | `PORT`              | `[Leave empty]`                                                    | Render sets this automatically                                  |
   | `CORS_ORIGINS`      | `https://your-client.onrender.com,https://your-admin.onrender.com` | **Required** - Frontend URLs (update after deploying frontends) |
   | `DATABASE_URL`      | `[Optional]`                                                       | Only if using direct PostgreSQL connection                      |
   | `JWT_EXPIRY`        | `24h`                                                              | Optional - Default is 24h                                       |

3. **Generate JWT_SECRET**

   ```bash
   openssl rand -base64 32
   ```

   Copy the output and paste as the value for `JWT_SECRET`

4. **Save Environment Variables**
   - Click **"Save Changes"** after adding all variables

### Task 2.4: Configure Health Check Endpoint

1. **Go to Settings Tab**
   - Navigate to **"Settings"** in your service

2. **Health Check Path**
   - Find **"Health Check Path"** section
   - Enter: `/api/health`
   - This tells Render to check `https://your-service.onrender.com/api/health`

3. **Health Check Settings**
   - **Initial Delay**: `10` seconds (gives server time to start)
   - **Interval**: `30` seconds (how often to check)
   - **Timeout**: `5` seconds (max time to wait for response)
   - **Max Failures**: `3` (restart after 3 failed checks)

4. **Save Settings**

## Part 3: Deploy and Verify

### Task 2.5: Test Backend Deployment on Render

1. **Trigger Manual Deploy**
   - Go to **"Manual Deploy"** tab
   - Click **"Deploy latest commit"**
   - Or push to your production branch to trigger auto-deploy

2. **Monitor Build Logs**
   - Watch the build process in real-time
   - Look for:
     - ✅ Docker build completing successfully
     - ✅ Container starting
     - ✅ Health check passing

3. **Check Deployment Status**
   - Wait for status to change to **"Live"**
   - Green indicator means service is running

### Task 2.6: Verify Backend API is Accessible

1. **Get Service URL**
   - Your service URL will be: `https://shiftmaster-backend.onrender.com`
   - (or your custom domain if configured)

2. **Test Health Endpoint**

   ```bash
   curl https://shiftmaster-backend.onrender.com/api/health
   ```

   Expected response:

   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "uptime": 5
   }
   ```

3. **Test API Documentation**
   - Open in browser: `https://shiftmaster-backend.onrender.com/api-docs`
   - Should show Swagger UI

4. **Test API Endpoints**
   ```bash
   # Test login endpoint (if you have test credentials)
   curl -X POST https://shiftmaster-backend.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword"}'
   ```

## Troubleshooting

### Build Fails

**Issue**: Docker build fails

- **Check**: Build logs for specific error
- **Common causes**:
  - Missing files in repository
  - Dockerfile path incorrect
  - Build context wrong

**Solution**:

- Verify Dockerfile exists at `server/Dockerfile`
- Check that all source files are committed to git
- Review build logs for specific error messages

### Service Won't Start

**Issue**: Service shows "Failed" status

- **Check**: Runtime logs
- **Common causes**:
  - Missing environment variables
  - Invalid environment variable values
  - Port binding issues

**Solution**:

- Verify all required environment variables are set
- Check logs for validation errors
- Ensure JWT_SECRET is 32+ characters

### Health Check Fails

**Issue**: Health check endpoint not responding

- **Check**: Health check path is `/api/health`
- **Common causes**:
  - Wrong health check path
  - Server not listening on correct port
  - CORS issues

**Solution**:

- Verify health check path in settings
- Check server logs for startup errors
- Ensure server is listening on PORT environment variable

### Environment Variables Not Loading

**Issue**: Server can't read environment variables

- **Check**: Environment tab shows all variables
- **Solution**:
  - Verify variable names match exactly (case-sensitive)
  - Check for typos
  - Ensure variables are saved (not just added)

## Next Steps

After backend is deployed:

1. **Note the Backend URL** - You'll need this for frontend deployments
2. **Update CORS_ORIGINS** - Add frontend URLs once they're deployed
3. **Configure Custom Domain** (optional) - In Render settings
4. **Set up Monitoring** - Enable logs and alerts in Render dashboard

## Reference

- [Render Documentation](https://render.com/docs)
- [Render Docker Guide](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)
