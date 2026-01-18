/**
 * Simple logger for database operations.
 * Allows tracking of database queries and performance.
 */

export const logDbOperation = (operation: string, details?: unknown) => {
    const timestamp = new Date().toISOString();
    // In production, this might send to a logging service
    console.log(`[DB] ${timestamp} - ${operation}`, details ? JSON.stringify(details) : '');
};

export const logDbError = (operation: string, error: unknown) => {
    const timestamp = new Date().toISOString();
    console.error(`[DB Error] ${timestamp} - ${operation}`, error);
};
