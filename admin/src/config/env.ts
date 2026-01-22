/**
 * Environment configuration for admin with validation
 */

const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

// Get environment variables
const apiUrl = import.meta.env.VITE_API_URL;

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
  // In development, use relative URL to leverage Vite proxy (same-origin for cookies)
  // In production, use absolute URL from environment variable
  apiUrl: apiUrl || (isDevelopment ? '/api/v1' : ''),
};
