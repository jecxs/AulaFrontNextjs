// src/lib/api/auth.ts
import { apiClient } from './client';
import { AuthResponse, LoginCredentials, User } from '@/types/auth';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse>('/auth/login', credentials);
    },

    getProfile: async (): Promise<User> => {
        return apiClient.get<User>('/auth/profile');
    },

    logout: async (): Promise<void> => {
        return apiClient.post<void>('/auth/logout');
    },
};