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
            // Throw for any client or server error status
            if (status >= 400) {
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
