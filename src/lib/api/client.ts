// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// Tipos para mejor type safety
interface ErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

interface ApiErrorResponse {
    response?: {
        status?: number;
        data?: ErrorResponse;
    };
    message: string;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos
        });

        // Interceptor para agregar token automáticamente
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para manejar respuestas y errores
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response.data; // Retornar solo la data
            },
            (error: AxiosError) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    }

    private handleError(error: AxiosError): void {
        const apiError = error as ApiErrorResponse;
        const status = apiError.response?.status;
        const data = apiError.response?.data;
        const message = data?.message || apiError.message || 'Ha ocurrido un error';

        switch (status) {
            case 401:
                // Token expirado o inválido
                this.clearAuth();
                toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                break;
            case 403:
                toast.error('No tienes permisos para realizar esta acción.');
                break;
            case 404:
                toast.error('Recurso no encontrado.');
                break;
            case 422:
                // Errores de validación
                if (data?.errors) {
                    Object.values(data.errors).forEach((errorArray: string[]) => {
                        errorArray.forEach((errorMessage: string) => {
                            toast.error(errorMessage ?? 'Error de validación');
                        });
                    });
                } else {
                    toast.error(message ?? 'Error de validación');
                }
                break;
            case 500:
                toast.error('Error del servidor. Intenta nuevamente más tarde.');
                break;
            default:
                if (message) {
                    toast.error(message);
                } else {
                    toast.error('Ha ocurrido un error inesperado.');
                }
                break;
        }
    }

    // Métodos HTTP con tipos genéricos correctos
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response as T;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response as T;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response as T;
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response as T;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response as T;
    }
}

// Exportar instancia única
export const apiClient = new ApiClient();