// src/lib/api/students.ts
import { apiClient } from './client';
import { StudentProfile, StudentStats } from '@/types/student';

export const studentsApi = {
    /**
     * GET /students/profile - Obtener perfil completo del estudiante actual
     */
    getProfile: async (): Promise<StudentProfile> => {
        return apiClient.get<StudentProfile>('/students/profile');
    },

    /**
     * GET /students/stats - Obtener solo estadísticas del estudiante
     */
    getStats: async (): Promise<StudentStats> => {
        return apiClient.get<StudentStats>('/students/stats');
    },
};