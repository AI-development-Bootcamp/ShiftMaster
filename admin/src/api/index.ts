/**
 * Configured API client for admin app
 */
import { ApiClient } from '@shared/api';
import { env } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { store } from '../store';
import { logoutUser } from '../store/slices/authSlice';

/**
 * The initialized API client instance for the Admin application.
 * Configured with the base API URL from the environment.
 */
export const apiClient = new ApiClient({
  baseURL: env.apiUrl,
  tokenHooks: {
    getAccessToken: () => tokenStore.getAccessToken(),
    setAccessToken: (token: string) => tokenStore.setAccessToken(token),
    clearAccessToken: () => tokenStore.clearAccessToken(),
  },
  onUnauthorized: () => {
    // Refresh failed - dispatch logout to clear Redux state and redirect to login
    store.dispatch(logoutUser());
  },
});
