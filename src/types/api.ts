// src/types/api.ts
import { AxiosError } from 'axios';

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

// Tipo para errores de Axios con nuestra estructura de error
export type ApiAxiosError = AxiosError<ApiError>;

// Type guard mejorado para verificar si un error es ApiAxiosError
export function isApiAxiosError(error: unknown): error is ApiAxiosError {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    const axiosError = error as AxiosError;

    return (
        'isAxiosError' in axiosError &&
        axiosError.isAxiosError === true &&
        axiosError.response !== undefined &&
        typeof axiosError.response.data === 'object' &&
        axiosError.response.data !== null &&
        'message' in axiosError.response.data
    );
}

// Helper para extraer el mensaje de error de forma segura
export function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (isApiAxiosError(error)) {
        return error.response?.data?.message || defaultMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return defaultMessage;
}