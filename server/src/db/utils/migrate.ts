import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { logDbOperation, logDbError } from './logger.js';

// Load environment variables if not already loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

interface MigrationResult {
    filename: string;
    status: 'success' | 'error' | 'skipped';
    error?: unknown;
}

export async function runMigrations(): Promise<MigrationResult[]> {
    const connectionString = process.env.SUPABASE_URL;

    if (!connectionString) {
        throw new Error('SUPABASE_URL environment variable is not set');
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false // Supabase connections require SSL but often with self-signed certs in dev
        }
    });

    const results: MigrationResult[] = [];

    try {
        logDbOperation('Starting migrations...');
        await client.connect();

        // Create migrations table if it doesn't exist
        await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

        // Get list of migration files
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensure files are processed in order (YYYYMMDD...)

        // Get applied migrations
        const { rows: appliedRows } = await client.query<{ filename: string }>('SELECT filename FROM _migrations');
        const appliedMigrations = new Set(appliedRows.map((r: { filename: string }) => r.filename));

        for (const file of files) {
            if (appliedMigrations.has(file)) {
                results.push({ filename: file, status: 'skipped' });
                continue;
            }

            logDbOperation(`Applying migration: ${file}`);
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');

                results.push({ filename: file, status: 'success' });
                logDbOperation(`Successfully applied: ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                logDbError(`Failed to apply migration: ${file}`, err);
                results.push({ filename: file, status: 'error', error: err });
                // Stop processing on first error
                break;
            }
        }

        logDbOperation('Migration process completed');
    } catch (err) {
        logDbError('Migration process failed', err);
        throw err;
    } finally {
        await client.end();
    }

    return results;
}

// Allow direct execution if run via node
// Check if this file is the main module being executed
const currentFilePath = fileURLToPath(import.meta.url);
const executedFilePath = process.argv[1];

// Robust comparison that handles symlinks and different path formats
const isMainModule = currentFilePath === executedFilePath ||
    currentFilePath === fs.realpathSync(executedFilePath);

if (isMainModule) {
    runMigrations()
        .then(results => {
            const errors = results.filter(r => r.status === 'error');
            if (errors.length > 0) {
                console.error('Migrations failed:', errors);
                process.exit(1);
            } else {
                const applied = results.filter(r => r.status === 'success');
                console.log(`Applied ${applied.length} migrations.`);
                process.exit(0);
            }
        })
        .catch(err => {
            console.error('Migration script crashed:', err);
            process.exit(1);
        });
}
