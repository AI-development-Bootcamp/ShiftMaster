/**
 * Simple environment configuration for shared
 * Note: This is used as a fallback. Client/Admin apps should provide their own apiUrl
 */

// Detect environment-specific API URL
// - In Vite/browser: use import.meta.env.VITE_API_URL
// - In Node: use process.env.API_URL
// - Fallback: hardcoded default
function getApiUrl(): string {
  // Check if running in Vite/browser environment
  // Safely access import.meta.env without type errors
  try {
    const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } };
    if (meta.env?.VITE_API_URL) {
      return meta.env.VITE_API_URL;
    }
  } catch {
    // import.meta might not exist in Node environments
  }

  // Check if running in Node environment
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL;
  }

  // Default fallback
  return 'http://localhost:3000/api/v1';
}

export const env = {
  apiUrl: getApiUrl(),
};
