/**
 * Simple environment configuration for shared
 * Note: This is used as a fallback. Client/Admin apps should provide their own apiUrl
 */

// Detect environment-specific API URL
// - In Vite/browser: use import.meta.env.VITE_API_URL (statically analyzed by Vite)
// - In Node: use process.env.API_URL
// - Fallback: hardcoded default

// For Vite environments - direct property access for static analysis
// Vite will replace import.meta.env.VITE_API_URL at build time
const viteApiUrl = import.meta.env.VITE_API_URL;

// For Node environments
const nodeApiUrl = (typeof process !== 'undefined' && process.env?.API_URL) || undefined;

// Export with fallback priority
export const env = {
  apiUrl: viteApiUrl || nodeApiUrl || 'http://localhost:3000/api/v1',
};
