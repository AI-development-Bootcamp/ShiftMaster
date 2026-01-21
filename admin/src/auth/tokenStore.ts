/**
 * In-memory token store for access tokens
 * Tokens are stored in memory to reduce persistence exposure.
 * Cleared on page reload, triggering the refresh flow automatically.
 */

let accessToken: string | null = null;

export const tokenStore = {
  /**
   * Get the current access token
   */
  getAccessToken: (): string | null => {
    return accessToken;
  },

  /**
   * Set a new access token
   */
  setAccessToken: (token: string | null): void => {
    accessToken = token;
  },

  /**
   * Clear the access token
   */
  clearAccessToken: (): void => {
    accessToken = null;
  },
};
