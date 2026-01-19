/**
 * Configured API client for admin app
 */
import { ApiClient } from '@shared/api';
import { env } from '../config/env';

/**
 * The initialized API client instance for the Admin application.
 * Configured with the base API URL from the environment.
 */
export const apiClient = new ApiClient(env.apiUrl);
