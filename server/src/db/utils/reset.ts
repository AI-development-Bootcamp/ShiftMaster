import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logDbOperation, logDbError } from './logger.js';

// Compute __dirname from import.meta.url for CWD-independent path resolution
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from monorepo root (server/src/db/utils -> ../../.env = server/.env -> ../.env = root/.env)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function resetDatabase() {
    const connectionString = process.env.SUPABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        logDbError('Database reset failed', new Error('SUPABASE_URL or DATABASE_URL is not defined'));
        process.exit(1);
    }

    // Safety check: Require explicit consent to reset
    if (process.env.ALLOW_SCHEMA_RESET !== 'true') {
        logDbError('Database reset aborted', new Error('ALLOW_SCHEMA_RESET environment variable must be set to "true"'));
        process.exit(1);
    }

    // Safety check: Prevent accidental reset in production unless explicitly overridden
    if (process.env.NODE_ENV === 'production' && process.env.FORCE_RESET_PROD !== 'true') {
        logDbError('Database reset aborted', new Error('Cannot reset database in production without FORCE_RESET_PROD="true"'));
        process.exit(1);
    }

    const isSupabase = connectionString.includes('supabase');
    const pool = new Pool({
        connectionString,
        ssl: isSupabase ? { rejectUnauthorized: false } : false, // Only use SSL for Supabase/remote connections
    });

    try {
        logDbOperation('Resetting database...');

        // Drop public schema and recreate it
        // This wipes EVERYTHING: tables, functions, types, data.
        await pool.query('DROP SCHEMA public CASCADE;');
        await pool.query('CREATE SCHEMA public;');

        // Restore default grants
        await pool.query('GRANT ALL ON SCHEMA public TO postgres;');
        await pool.query('GRANT ALL ON SCHEMA public TO public;');

        // Supabase specific grants for the roles: anon, authenticated, service_role
        // Crucial for RLS and client access
        await pool.query('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
        await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;');
        await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;');
        await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;');

        logDbOperation('Database reset successful. Public schema is empty.');
    } catch (error) {
        logDbError('Database reset failed', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}



const currentFilePath = fileURLToPath(import.meta.url);
const executedFilePath = process.argv[1];

// Safely resolve the real path; fall back to undefined if fs.realpathSync throws
let resolvedExecutedPath: string | undefined;
try {
    resolvedExecutedPath = fs.realpathSync(executedFilePath);
} catch {
    // Path doesn't exist or is unresolvable; leave as undefined
    resolvedExecutedPath = undefined;
}

const isMainModule = currentFilePath === executedFilePath ||
    currentFilePath === resolvedExecutedPath;

if (isMainModule) {
    resetDatabase();
}
