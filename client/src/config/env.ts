/**
 * Simple environment configuration for client
 */

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  renderDeployUrlClient: import.meta.env.VITE_RENDER_DEPLOY_URL_CLIENT || '',
};
