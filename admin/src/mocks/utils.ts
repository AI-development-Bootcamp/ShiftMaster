import { ApiResponse, ApiErrorResponse } from '@abra-shift-master/shared';

export const mockResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

export const mockError = (message: string, code = 'ERROR'): ApiErrorResponse => ({
    success: false,
    error: {
        message,
        code,
    },
});
