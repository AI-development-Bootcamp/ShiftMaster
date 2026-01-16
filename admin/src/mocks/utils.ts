export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        message: string;
        code: string;
        details?: Record<string, unknown>;
    };
}

export const mockResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

export const mockError = (message: string, code = 'ERROR'): ApiResponse<null> => ({
    success: false,
    data: null,
    error: {
        message,
        code,
    },
});
