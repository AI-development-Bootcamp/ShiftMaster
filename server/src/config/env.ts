/**
 * Environment configuration for server
 */

const isTest = process.env.NODE_ENV === 'test';

/**
 * Extract Supabase API URL from SUPABASE_URL
 * Handles both formats:
 * - If already https:// URL, returns as-is
 * - If postgresql:// connection string, extracts the project ref and constructs the HTTPS URL
 *   Supports standard db.project.supabase.co and pooler strings (postgres.project.pooler...)
 */
function extractSupabaseUrl(urlOrConnectionString: string): string {
  // If it's already an https URL, return as-is
  if (urlOrConnectionString.startsWith('https://')) {
    return urlOrConnectionString;
  }

  try {
    // Try to parse as URL (works for postgresql://...)
    // If it's just a host string it might fail, so we catch
    const url = new URL(urlOrConnectionString);
    const host = url.hostname; // e.g., db.ref.supabase.co or aws-0-region.pooler.supabase.com

    // 1. Try standard pattern: db.<ref>.supabase.co
    const dbMatch = host.match(/^db\.([^.]+)\.supabase\.co$/);
    if (dbMatch) {
      return `https://${dbMatch[1]}.supabase.co`;
    }

    // 2. Try pooler pattern where ref is in the hostname sometimes, but more reliably
    // we might need to extract from multiple potential formats.
    // However, for poolers, the ref is often NOT in the hostname in a simple way 
    // (e.g., aws-0-eu-central-1.pooler.supabase.com).
    // But commonly it IS like: postgres.<ref>.pooler.supabase.com
    const poolerMatch = host.match(/^postgres\.([^.]+)\.pooler\.supabase\.com$/);
    if (poolerMatch) {
      return `https://${poolerMatch[1]}.supabase.co`;
    }

    // Fallback: If we can't parse the host easily, try a regex on the full string
    // looking for the project ref pattern which is 20 chars usually
  } catch (e) {
    // ignore invalid URL errors and fall through to regex
  }

  // Fallback regex for various connection string formats
  // Matches: db.REF.supabase.co or postgres.REF.pooler.supabase
  const refMatch = urlOrConnectionString.match(/(?:db|postgres)\.([a-z0-9]{20})\.(?:supabase\.co|pooler\.supabase\.com)/);
  if (refMatch) {
    return `https://${refMatch[1]}.supabase.co`;
  }

  // If we really can't find it, return empty string (validation will catch it)
  return '';
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
  renderDeployUrlServer: process.env.VITE_RENDER_DEPLOY_URL_SERVER || '',
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

