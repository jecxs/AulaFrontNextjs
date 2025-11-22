// src/lib/api/instructors.ts
import { apiClient } from './client';
import {
    Instructor,
    InstructorWithCourses,
    InstructorList,
    CreateInstructorDto,
    UpdateInstructorDto,
    QueryInstructorsDto,
    InstructorsResponse,
    InstructorStats,
} from '@/types/instructor';

export const instructorsApi = {
    /**
     * POST /instructors - Crear instructor (Solo ADMIN)
     */
    create: async (data: CreateInstructorDto): Promise<Instructor> => {
        return apiClient.post<Instructor>('/instructors', data);
    },

    /**
     * GET /instructors - Listar instructores con filtros (Solo ADMIN)
     * Este es el método que necesitas para el modal de crear curso
     */
    getAll: async (query?: QueryInstructorsDto): Promise<InstructorsResponse> => {
        return apiClient.get<InstructorsResponse>('/instructors', query);
    },

    /**
     * GET /instructors/public - Lista básica de instructores (sin autenticación)
     */
    getPublic: async (query?: QueryInstructorsDto): Promise<InstructorsResponse> => {
        return apiClient.get<InstructorsResponse>('/instructors/public', query);
    },

    /**
     * GET /instructors/stats - Estadísticas (Solo ADMIN)
     */
    getStats: async (): Promise<InstructorStats> => {
        return apiClient.get<InstructorStats>('/instructors/stats');
    },

    /**
     * GET /instructors/without-courses - Instructores sin cursos (Solo ADMIN)
     */
    getWithoutCourses: async (): Promise<Instructor[]> => {
        return apiClient.get<Instructor[]>('/instructors/without-courses');
    },

    /**
     * GET /instructors/top - Top instructores por número de cursos (Solo ADMIN)
     */
    getTop: async (limit?: number): Promise<InstructorWithCourses[]> => {
        return apiClient.get<InstructorWithCourses[]>(
            '/instructors/top',
            limit ? { limit } : undefined
        );
    },

    /**
     * GET /instructors/specialization/:specialization - Por especialización
     */
    getBySpecialization: async (specialization: string): Promise<Instructor[]> => {
        return apiClient.get<Instructor[]>(`/instructors/specialization/${specialization}`);
    },

    /**
     * GET /instructors/:id - Obtener instructor por ID
     */
    getById: async (id: string): Promise<InstructorWithCourses> => {
        return apiClient.get<InstructorWithCourses>(`/instructors/${id}`);
    },

    /**
     * GET /instructors/:id/courses - Cursos de un instructor
     */
    getCourses: async (id: string): Promise<any[]> => {
        return apiClient.get<any[]>(`/instructors/${id}/courses`);
    },

    /**
     * PATCH /instructors/:id - Actualizar instructor (Solo ADMIN)
     */
    update: async (id: string, data: UpdateInstructorDto): Promise<Instructor> => {
        return apiClient.patch<Instructor>(`/instructors/${id}`, data);
    },

    /**
     * DELETE /instructors/:id - Eliminar instructor (Solo ADMIN)
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/instructors/${id}`);
    },
};