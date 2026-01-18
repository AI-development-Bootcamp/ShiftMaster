import pg from 'pg';
import dotenv from 'dotenv';
import { logDbOperation, logDbError } from './logger.js';

dotenv.config({ path: '../../.env' }); // Adjust path as needed, or rely on --env-file

const { Pool } = pg;

async function resetDatabase() {
    const connectionString = process.env.SUPABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        logDbError('Database reset failed', new Error('SUPABASE_URL or DATABASE_URL is not defined'));
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, // Required for Supabase connection
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

        logDbOperation('Database reset successful. Public schema is empty.');
    } catch (error) {
        logDbError('Database reset failed', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

resetDatabase();
