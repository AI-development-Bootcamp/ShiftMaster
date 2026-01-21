import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiErrorResponse, ApiResponse } from '../types';
import { env } from '../config/env.js';

/**
 * Token management hooks for ApiClient
 * Allows client/admin to provide their own token storage implementation
 */
export interface TokenHooks {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

/**
 * ApiClient configuration options
 */
export interface ApiClientConfig {
  baseURL?: string;
  tokenHooks?: TokenHooks;
  onUnauthorized?: () => void; // Callback for when refresh fails (e.g., redirect to login)
}

export class ApiClient {
  private client: AxiosInstance;
  private tokenHooks?: TokenHooks;
  private onUnauthorized?: () => void;
  private refreshPromise: Promise<string> | null = null; // Prevents refresh storms

  constructor(config: ApiClientConfig | string = {}) {
    // Support legacy string constructor for backwards compatibility
    const clientConfig: ApiClientConfig =
      typeof config === 'string' ? { baseURL: config } : config;

    // Use baseURL parameter, or fall back to default
    // In browser environments, baseURL should be passed from the app's env config
    this.client = axios.create({
      baseURL: clientConfig.baseURL || env.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      withCredentials: true, // Include cookies for refresh token
    });

    this.tokenHooks = clientConfig.tokenHooks;
    this.onUnauthorized = clientConfig.onUnauthorized;

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 with refresh retry
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't retry refresh endpoint itself
          if (originalRequest.url?.includes('/auth/refresh')) {
            this.handleRefreshFailure();
            return Promise.reject(error);
          }

          // Don't retry login endpoint
          if (originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
          }

          // Mark request as retried to prevent infinite loops
          originalRequest._retry = true;

          try {
            // Attempt to refresh the token (with storm prevention)
            const newAccessToken = await this.refreshAccessToken();

            // Update token in store
            this.setAuthToken(newAccessToken);

            // Update the failed request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and reject
            this.handleRefreshFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh access token using refresh token cookie
   * Implements refresh storm prevention - only one refresh request at a time
   */
  private async refreshAccessToken(): Promise<string> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = (async () => {
      try {
        const response = await this.client.post<
          ApiResponse<{ accessToken: string }>
        >('/auth/refresh', null, {
          withCredentials: true, // Include refresh token cookie
        });

        return response.data.data.accessToken;
      } finally {
        // Clear refresh promise when done (success or failure)
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Handle refresh token failure - clear tokens and trigger unauthorized callback
   */
  private handleRefreshFailure(): void {
    this.clearAuthToken();
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  private getAuthToken(): string | null {
    if (this.tokenHooks) {
      return this.tokenHooks.getAccessToken();
    }
    // Fallback to localStorage for backwards compatibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (this.tokenHooks) {
      this.tokenHooks.clearAccessToken();
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    if (this.tokenHooks) {
      this.tokenHooks.setAccessToken(token);
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }
}

// Export default singleton instance
// NOTE: In client/admin apps, use the locally configured apiClient from @/api instead
// This default instance uses the shared env.apiUrl fallback
export const apiClient = new ApiClient();
