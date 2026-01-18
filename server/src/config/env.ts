/**
 * Simple environment configuration for server
 */

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  supabaseUrl: process.env.DATABASE_URL ? extractSupabaseUrl(process.env.DATABASE_URL) : '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
};

/**
 * Extract Supabase URL from DATABASE_URL
 * Converts: postgresql://postgres:pass@db.xxxxx.supabase.co:5432/postgres
 * To: https://xxxxx.supabase.co
 */
function extractSupabaseUrl(databaseUrl: string): string {
  const match = databaseUrl.match(/db\.([^.]+)\.supabase\.co/);
  return match ? `https://${match[1]}.supabase.co` : '';
}
