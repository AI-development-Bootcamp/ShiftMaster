/**
 * Configured API client for admin app
 */
import { ApiClient } from '@shared/api';
import { env } from '../config/env';

// Create and export a configured API client instance with the admin's API URL
export const apiClient = new ApiClient(env.apiUrl);
