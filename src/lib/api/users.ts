// src/lib/api/users.ts
import { apiClient } from './client';
import {CreateUserDto, UpdateUserDto, UserStats} from "@/types/user";
import {User} from "@/types";

export const usersApi = {
    // Crear nuevo usuario
    create: async (data: CreateUserDto): Promise<User> => {
        return apiClient.post<User>('/users', data);
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