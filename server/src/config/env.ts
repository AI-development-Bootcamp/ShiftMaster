/**
 * Environment configuration for server
 */

const isTest = process.env.NODE_ENV === 'test';

/**
 * Extract Supabase API URL from SUPABASE_URL
 * Handles both formats:
 * - If already https:// URL, returns as-is
 * - If postgresql:// connection string, extracts the API URL
 *   Converts: postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres
 *   To: https://xxxxx.supabase.co
 */
function extractSupabaseUrl(urlOrConnectionString: string): string {
  // If it's already an https URL, return as-is
  if (urlOrConnectionString.startsWith('https://')) {
    return urlOrConnectionString;
  }
  // Extract from postgresql connection string
  const match = urlOrConnectionString.match(/db\.([^.]+)\.supabase\.co/);
  return match ? `https://${match[1]}.supabase.co` : '';
}

/**
 * Get the Supabase API URL from environment
 */
function getSupabaseUrl(): string {
  const rawUrl = process.env.SUPABASE_URL;
  if (!rawUrl) {
    return isTest ? 'https://test.supabase.co' : '';
  }
  return extractSupabaseUrl(rawUrl);
}

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: getSupabaseUrl(),
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY || (isTest ? 'test-anon-key' : ''),
  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY || (isTest ? 'test-secret-key' : ''),
  jwtSecret:
    process.env.JWT_SECRET ||
    (isTest ? 'test-jwt-secret-do-not-use-in-production' : ''),
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
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

  // Validate that SUPABASE_URL was successfully parsed
  if (!env.supabaseUrl) {
    throw new Error(
      'Could not parse SUPABASE_URL. Please provide a valid Supabase URL or PostgreSQL connection string.'
    );
  }
}

