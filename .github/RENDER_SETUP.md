# Render Deployment Setup for GitHub Actions

This guide explains how to configure GitHub Actions to deploy to Render.

## Required GitHub Secrets

Add these secrets to your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### 1. RENDER_API_KEY

1. Go to https://dashboard.render.com
2. Click on your account → **Account Settings**
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the API key
6. Add to GitHub as `RENDER_API_KEY`

### 2. RENDER_SERVICE_ID (Backend)

1. Go to your Render dashboard
2. Click on your backend Web Service
3. The Service ID is in the URL: `https://dashboard.render.com/web/[SERVICE_ID]`
   - Or go to **Settings** → **Service ID** is displayed there
4. Copy the Service ID
5. Add to GitHub as `RENDER_SERVICE_ID`

### 3. RENDER_CLIENT_SERVICE_ID (Client Frontend)

1. Go to your Render dashboard
2. Click on your client Static Site
3. The Service ID is in the URL or Settings
4. Copy the Service ID
5. Add to GitHub as `RENDER_CLIENT_SERVICE_ID`

### 4. RENDER_ADMIN_SERVICE_ID (Admin Frontend)

1. Go to your Render dashboard
2. Click on your admin Static Site
3. The Service ID is in the URL or Settings
4. Copy the Service ID
5. Add to GitHub as `RENDER_ADMIN_SERVICE_ID`

## How It Works

### Option 1: GitHub Integration (Recommended)

If you've connected your GitHub repository to Render:

1. **Automatic Deployment**: Render automatically deploys when you push to the connected branch
2. **After CI Checks**: Configure Render to wait for GitHub Actions to pass before deploying
   - In Render Dashboard → Service Settings → **Auto-Deploy**
   - Enable **"Wait for CI checks to pass"**

### Option 2: API-Triggered Deployment

The GitHub Actions workflow uses Render API to trigger deployments:

1. **After CI Passes**: Workflow runs tests, linting, and builds
2. **API Call**: Triggers Render deployment via API
3. **Fallback**: If API keys aren't configured, relies on GitHub integration

## Configuration Steps

### Step 1: Set Up Render Services

1. Create backend Web Service (Docker)
2. Create client Static Site
3. Create admin Static Site
4. Connect all services to your GitHub repository

### Step 2: Configure Render Auto-Deploy

For each service in Render:

1. Go to **Settings** → **Auto-Deploy**
2. Enable **"Wait for CI checks to pass"**
3. This ensures Render waits for GitHub Actions to complete before deploying

### Step 3: Add GitHub Secrets

Add all required secrets as described above.

### Step 4: Test Deployment

1. Push to `production` branch
2. Watch GitHub Actions workflow
3. Verify deployments trigger in Render dashboard

## Troubleshooting

### Deployments Not Triggering

- **Check**: GitHub secrets are correctly named and set
- **Check**: Service IDs are correct (found in Render dashboard URL)
- **Check**: Render API key has correct permissions
- **Fallback**: Render GitHub integration will auto-deploy if API fails

### Duplicate Deployments

- Render is smart about this - if a deploy is in progress, it won't start another
- If you see duplicates, disable either GitHub integration OR API triggers (not both)

### API Authentication Errors

- Verify `RENDER_API_KEY` is correct
- Check API key hasn't expired
- Ensure API key has deployment permissions

## Alternative: Deploy Hooks

If you prefer not to use API keys, you can use Render Deploy Hooks:

1. In Render Dashboard → Service Settings → **Deploy Hooks**
2. Create a deploy hook
3. Use the hook URL in GitHub Actions:

```yaml
- name: Deploy to Render
  run: |
    curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

This is simpler but less flexible than using the API.
