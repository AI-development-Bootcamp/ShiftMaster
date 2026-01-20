import { ApiResponse, ApiErrorResponse } from '@abra-shift-master/shared';

/**
 * Helper to create a successful API response.
 *
 * @template T
 * @param {T} data - The data to include in the response
 * @returns {ApiResponse<T>} A standardized success response
 */
export const mockResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

/**
 * Helper to create an error API response.
 *
 * @param {string} message - The error message
 * @param {string} [code='ERROR'] - The error code
 * @returns {ApiErrorResponse} A standardized error response
 */
export const mockError = (message: string, code = 'ERROR'): ApiErrorResponse => ({
    success: false,
    error: {
        message,
        code,
    },
});
