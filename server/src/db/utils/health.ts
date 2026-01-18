import { supabase } from '../supabase.js';
import { logDbOperation, logDbError } from './logger.js';

/**
 * Checks the database connection health.
 * Performs a lightweight query to verify connectivity.
 * @returns true if healthy, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const start = Date.now();
        // Use HEAD request to avoid data transfer, just check connectivity
        const { error, status } = await supabase
            .from('users')
            .select('user_id', { count: 'exact', head: true });

        if (error) {
            // If table is empty or other logical error, it might still connect.
            // But 4xx/5xx errors indicate issues.
            if (status >= 400 && status < 500) {
                // 406 Not Acceptable happens if we ask for head but result is empty? 
                // Actually, Supabase returns error object if something is wrong.
                throw error;
            }
        }

        const duration = Date.now() - start;
        logDbOperation('Health check passed', { duration: `${duration}ms` });
        return true;
    } catch (error) {
        logDbError('Health check failed', error);
        return false;
    }
}
