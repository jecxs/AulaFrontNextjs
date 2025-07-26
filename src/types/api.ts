// src/types/api.ts
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}