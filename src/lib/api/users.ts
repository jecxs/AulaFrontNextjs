// src/lib/api/users.ts - ACTUALIZACIÓN COMPLETA
import { apiClient } from './client';
import { CreateUserDto, UpdateUserDto, UserStats } from "@/types/user";
import { User } from "@/types";

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export const usersApi = {
    // Crear nuevo usuario
    create: async (data: CreateUserDto): Promise<{ user: User; generatedPassword?: string }> => {
        return apiClient.post<{ user: User; generatedPassword?: string }>('/users', data);
    },

    // Obtener todos los usuarios
    getAll: async (): Promise<User[]> => {
        return apiClient.get<User[]>('/users');
    },

    // Obtener usuario por ID
    getById: async (id: string): Promise<User> => {
        return apiClient.get<User>(`/users/${id}`);
    },

    // Actualizar usuario
    update: async (id: string, data: UpdateUserDto): Promise<User> => {
        return apiClient.patch<User>(`/users/${id}`, data);
    },

    // Cambiar contraseña (usuario actual)
    changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
        return apiClient.patch<{ message: string }>('/users/change-password', data);
    },

    // Resetear contraseña (solo admin)
    resetPassword: async (userId: string, password?: string): Promise<{ user: User; newPassword: string }> => {
        return apiClient.patch<{ user: User; newPassword: string }>(`/users/${userId}/reset-password`, { password });
    },

    // Suspender usuario
    suspend: async (id: string): Promise<User> => {
        return apiClient.patch<User>(`/users/${id}/suspend`);
    },

    // Activar usuario
    activate: async (id: string): Promise<User> => {
        return apiClient.patch<User>(`/users/${id}/activate`);
    },

    // Eliminar usuario
    delete: async (id: string): Promise<User> => {
        return apiClient.delete<User>(`/users/${id}`);
    },

    // Obtener estadísticas de usuarios
    getStats: async (): Promise<UserStats> => {
        return apiClient.get<UserStats>('/users/stats');
    },
};