// src/lib/api/course-categories.ts
import { apiClient } from './client';
import {
    CourseCategory,
    CourseCategoryWithCourses,
    CourseCategoryList,
    CreateCourseCategoryDto,
    UpdateCourseCategoryDto,
    QueryCourseCategoriesDto,
    CourseCategoriesResponse,
    CategoryStats,
} from '@/types/course-category';

export const courseCategoriesApi = {
    /**
     * POST /course-categories - Crear categoría (Solo ADMIN)
     */
    create: async (data: CreateCourseCategoryDto): Promise<CourseCategory> => {
        return apiClient.post<CourseCategory>('/course-categories', data);
    },

    /**
     * GET /course-categories - Listar categorías con filtros
     * Admin ve todas, usuarios solo activas
     */
    getAll: async (query?: QueryCourseCategoriesDto): Promise<CourseCategoriesResponse> => {
        return apiClient.get<CourseCategoriesResponse>('/course-categories', query);
    },

    /**
     * GET /course-categories/active - Categorías activas (público)
     * Este es el método que necesitas para el modal de crear curso
     */
    getActive: async (): Promise<CourseCategory[]> => {
        return apiClient.get<CourseCategory[]>('/course-categories/active');
    },

    /**
     * GET /course-categories/popular - Categorías más populares (público)
     */
    getPopular: async (limit?: number): Promise<CourseCategoryWithCourses[]> => {
        return apiClient.get<CourseCategoryWithCourses[]>(
            '/course-categories/popular',
            limit ? { limit } : undefined
        );
    },

    /**
     * GET /course-categories/stats - Estadísticas (Solo ADMIN)
     */
    getStats: async (): Promise<CategoryStats> => {
        return apiClient.get<CategoryStats>('/course-categories/stats');
    },

    /**
     * GET /course-categories/without-courses - Categorías sin cursos (Solo ADMIN)
     */
    getWithoutCourses: async (): Promise<CourseCategory[]> => {
        return apiClient.get<CourseCategory[]>('/course-categories/without-courses');
    },

    /**
     * GET /course-categories/slug/:slug - Obtener categoría por slug (público)
     */
    getBySlug: async (slug: string): Promise<CourseCategoryWithCourses> => {
        return apiClient.get<CourseCategoryWithCourses>(`/course-categories/slug/${slug}`);
    },

    /**
     * GET /course-categories/:id - Obtener categoría por ID
     */
    getById: async (id: string): Promise<CourseCategoryWithCourses> => {
        return apiClient.get<CourseCategoryWithCourses>(`/course-categories/${id}`);
    },

    /**
     * PATCH /course-categories/:id - Actualizar categoría (Solo ADMIN)
     */
    update: async (id: string, data: UpdateCourseCategoryDto): Promise<CourseCategory> => {
        return apiClient.patch<CourseCategory>(`/course-categories/${id}`, data);
    },

    /**
     * PATCH /course-categories/:id/toggle-status - Activar/Desactivar (Solo ADMIN)
     */
    toggleStatus: async (id: string): Promise<CourseCategory> => {
        return apiClient.patch<CourseCategory>(`/course-categories/${id}/toggle-status`);
    },

    /**
     * DELETE /course-categories/:id - Eliminar categoría (Solo ADMIN)
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/course-categories/${id}`);
    },
};