/**
 * Environment configuration for server
 */

const isTest = process.env.NODE_ENV === 'test';

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl:
    process.env.SUPABASE_URL || (isTest ? 'https://test.supabase.co' : ''),
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY || (isTest ? 'test-anon-key' : ''),
  jwtSecret:
    process.env.JWT_SECRET ||
    (isTest ? 'test-jwt-secret-do-not-use-in-production' : ''),
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
  renderDeployUrlServer: process.env.RENDER_DEPLOY_URL_SERVER || '',
};

/**
 * Validates that all required environment variables are set for production use.
 * Should be called during server bootstrap/startup.
 *
 * @throws {Error} If required environment variables are missing in non-test environments
 */
export function validateEnv(): void {
  if (isTest) {
    // Skip validation in test environment - tests use mock/stub values
    return;
  }

  const requiredVars = [
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
    { name: 'SUPABASE_URL', value: process.env.SUPABASE_URL },
    { name: 'SUPABASE_ANON_KEY', value: process.env.SUPABASE_ANON_KEY },
  ];

  const missing = requiredVars.filter(({ value }) => !value);

  if (missing.length > 0) {
    const missingNames = missing.map(({ name }) => name).join(', ');
    throw new Error(
      `Missing required environment variables: ${missingNames}. ` +
        'Please check your .env file or environment configuration.'
    );
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && env.jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for production use'
    );
  }
}
