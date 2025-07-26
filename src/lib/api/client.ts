// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
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
                return response;
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

    private handleError(error: AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data as any;
        const message = data?.message || error.message;

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
                    Object.values(data.errors).forEach((error: any) => {
                        toast.error(error);
                    });
                } else {
                    toast.error(message);
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
        }
    }

    private clearAuth() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    }

    // Métodos HTTP públicos
    public async get<T>(url: string, params?: any): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    public async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    public async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    public async patch<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.patch<T>(url, data);
        return response.data;
    }

    public async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }

    // Método para upload de archivos
    public async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });

        return response.data;
    }
}

// Instancia singleton
export const apiClient = new ApiClient();