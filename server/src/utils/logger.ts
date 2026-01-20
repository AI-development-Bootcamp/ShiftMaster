/**
 * Logger utility for standardized error logging
 */

export const logDbError = (context: string, error: any) => {
    console.error(`[DB Error][${context}]`, JSON.stringify(error, null, 2));
};

export const logError = (context: string, error: any) => {
    console.error(`[Error][${context}]`, error);
};

export const logInfo = (context: string, message: string) => {
    console.log(`[Info][${context}] ${message}`);
};
