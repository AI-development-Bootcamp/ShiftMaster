/**
 * Environment configuration for admin with validation
 */

const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

// Get environment variables
const apiUrl = import.meta.env.VITE_API_URL;
const renderDeployUrlAdmin = import.meta.env.VITE_RENDER_DEPLOY_URL_ADMIN;

// Validate required environment variables (skip in test mode)
if (!isTest && !isDevelopment) {
  const missing: string[] = [];
  
  if (!apiUrl) {
    missing.push('VITE_API_URL');
  }
  
  if (missing.length > 0) {
    throw new Error(
      `[ENV_MISSING] Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file or environment configuration.'
    );
  }
}

export const env = {
  apiUrl: apiUrl || (isDevelopment ? 'http://localhost:3000' : ''),
  renderDeployUrlAdmin: renderDeployUrlAdmin || '',
};
