/**
 * Simple environment configuration for shared
 * Note: This is used as a fallback. Client/Admin apps should provide their own apiUrl
 */

export const env = {
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000/api/v1',
};
