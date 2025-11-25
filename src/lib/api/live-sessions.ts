// src/lib/api/live-sessions.ts

import { apiClient } from './client';
import {
    LiveSession,
    LiveSessionWithDetails,
    LiveSessionForStudent,
    CreateLiveSessionDto,
    UpdateLiveSessionDto,
    QueryLiveSessionsDto,
    LiveSessionsResponse,
} from '@/types/live-session';

// ========== LIVE SESSIONS API ==========
export const liveSessionsApi = {
    // ==========================================
    // MÉTODOS PARA ADMIN
    // ==========================================

    // Crear sesión en vivo (Admin)
    create: async (data: CreateLiveSessionDto): Promise<LiveSession> => {
        return apiClient.post<LiveSession>('/live-sessions', data);
    },

    // Listar todas las sesiones (Admin)
    // Opcional: filtrar por courseId con ?courseId=xxx
    getAll: async (courseId?: string): Promise<LiveSessionWithDetails[]> => {
        const params = courseId ? { courseId } : undefined;
        return apiClient.get<LiveSessionWithDetails[]>('/live-sessions', { params });
    },

    // Obtener sesión por ID
    getById: async (id: string): Promise<LiveSessionWithDetails> => {
        return apiClient.get<LiveSessionWithDetails>(`/live-sessions/${id}`);
    },

    // Actualizar sesión (Admin)
    update: async (id: string, data: UpdateLiveSessionDto): Promise<LiveSession> => {
        return apiClient.patch<LiveSession>(`/live-sessions/${id}`, data);
    },

    // Eliminar sesión (Admin)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/live-sessions/${id}`);
    },

    // ==========================================
    // MÉTODOS PARA ESTUDIANTES
    // ==========================================

    // Obtener mis sesiones (todas)
    getMySessions: async (): Promise<LiveSessionForStudent[]> => {
        return apiClient.get<LiveSessionForStudent[]>('/live-sessions/my-sessions');
    },

    // Obtener mis próximas sesiones
    getMyUpcoming: async (): Promise<LiveSessionForStudent[]> => {
        return apiClient.get<LiveSessionForStudent[]>('/live-sessions/my-upcoming');
    },

    // Obtener sesiones de un curso específico
    getCourseSessions: async (courseId: string): Promise<LiveSession[]> => {
        return apiClient.get<LiveSession[]>(`/live-sessions/course/${courseId}`);
    },
};