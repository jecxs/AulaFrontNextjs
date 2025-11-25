// src/lib/api/courses.ts
import { apiClient } from './client';
import {
    Course,
    Module,
    Lesson,
    Resource,
    CourseProgress,
    CourseListResponse, // Cambiar a CourseListResponse si no existe
    ModulesResponse,
    LessonsResponse,
    QueryCoursesDto,
    CreateCourseDto,
    UpdateCourseDto,
    CourseStats,
    CreateModuleDto,
    UpdateModuleDto,
    ReorderModulesDto,
    CreateLessonDto,
    UpdateLessonDto,
    ReorderLessonsDto,
    CreateResourceDto,
    UpdateResourceDto, CourseStatistics,
} from '@/types/course';
import { MyEnrollmentsResponse } from '@/types/enrollment';

// ========== COURSES API ==========
export const coursesApi = {
    // ==========================================
    // MÉTODOS EXISTENTES (para estudiantes)
    // ==========================================

    // Obtener todos los cursos (con filtros) - Para Admin
    getAll: async (query?: QueryCoursesDto): Promise<CourseListResponse> => {
        return apiClient.get<CourseListResponse>('/courses', { params: query });
    },

    // Obtener mis cursos enrollados
    getMyEnrollments: async (): Promise<MyEnrollmentsResponse> => {
        return apiClient.get('/enrollments/my-courses');
    },

    // Obtener curso por ID
    getCourse: async (courseId: string): Promise<Course> => {
        return apiClient.get(`/courses/${courseId}`);
    },

    // Obtener módulos de un curso
    getCourseModules: async (courseId: string): Promise<Module[]> => {
        return apiClient.get(`/modules/course/${courseId}`);
    },

    // Obtener lessons de un módulo
    getModuleLessons: async (moduleId: string): Promise<Lesson[]> => {
        return apiClient.get(`/lessons/module/${moduleId}`);
    },

    // Obtener lesson por ID
    getLesson: async (lessonId: string): Promise<Lesson> => {
        return apiClient.get(`/lessons/${lessonId}`);
    },

    // Obtener mi progreso en un curso
    getMyCourseProgress: async (courseId: string): Promise<CourseProgress> => {
        return apiClient.get(`/progress/my-course/${courseId}`);
    },

    // ==========================================
    // NUEVOS MÉTODOS (para admin)
    // ==========================================

    // Crear curso (Admin)
    create: async (data: CreateCourseDto): Promise<Course> => {
        return apiClient.post<Course>('/courses', data);
    },

    // Obtener curso por slug
    getBySlug: async (slug: string): Promise<Course> => {
        return apiClient.get<Course>(`/courses/slug/${slug}`);
    },

    // Actualizar curso (Admin)
    update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
        return apiClient.patch<Course>(`/courses/${id}`, data);
    },

    // Publicar curso (Admin)
    publish: async (id: string): Promise<Course> => {
        return apiClient.patch<Course>(`/courses/${id}/publish`);
    },

    // Archivar curso (Admin)
    archive: async (id: string): Promise<Course> => {
        return apiClient.patch<Course>(`/courses/${id}/archive`);
    },

    // Eliminar curso (Admin)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/courses/${id}`);
    },

    // Obtener estadísticas de cursos (Admin)
    getStats: async (): Promise<CourseStats> => {
        return apiClient.get<CourseStats>('/courses/stats');
    },
    // Obtener estadísticas de un curso específico (Admin)
    getCourseStatistics: async (courseId: string): Promise<CourseStatistics> => {
        return apiClient.get<CourseStatistics>(`/courses/${courseId}/statistics`);
    },

    // Obtener cursos por instructor (Admin)
    getByInstructor: async (
        instructorId: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
        }
    ): Promise<CourseListResponse> => {
        return apiClient.get<CourseListResponse>(
            `/courses/instructor/${instructorId}`,
            { params }
        );
    },

    // Obtener cursos por categoría
    getByCategory: async (
        categoryId: string,
        params?: {
            page?: number;
            limit?: number;
        }
    ): Promise<CourseListResponse> => {
        return apiClient.get<CourseListResponse>(
            `/courses/category/${categoryId}`,
            { params }
        );
    },
};

// ========== MODULES API ==========
export const modulesApi = {
    // Crear módulo (Admin)
    create: async (data: CreateModuleDto): Promise<Module> => {
        return apiClient.post<Module>('/modules', data);
    },

    // Obtener todos los módulos con filtros (Admin)
    getAll: async (params?: {
        page?: number;
        limit?: number;
        courseId?: string;
        isRequired?: boolean;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<ModulesResponse> => {
        return apiClient.get('/modules', { params });
    },

    // Obtener módulos de un curso (reutilizando coursesApi)
    getByCourse: async (courseId: string): Promise<Module[]> => {
        return coursesApi.getCourseModules(courseId);
    },

    // Obtener módulo por ID (Admin)
    getById: async (id: string): Promise<Module> => {
        return apiClient.get<Module>(`/modules/${id}`);
    },

    // Actualizar módulo (Admin)
    update: async (id: string, data: UpdateModuleDto): Promise<Module> => {
        return apiClient.patch<Module>(`/modules/${id}`, data);
    },

    // Reordenar módulos (Admin)
    reorder: async (courseId: string, data: ReorderModulesDto): Promise<Module[]> => {
        return apiClient.patch<Module[]>(`/modules/course/${courseId}/reorder`, data);
    },

    // Duplicar módulo (Admin)
    duplicate: async (id: string): Promise<Module> => {
        return apiClient.post<Module>(`/modules/${id}/duplicate`);
    },

    // Eliminar módulo (Admin)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/modules/${id}`);
    },

    // Obtener siguiente orden disponible
    getNextOrder: async (courseId: string): Promise<number> => {
        const modules = await modulesApi.getByCourse(courseId);
        return modules.length > 0
            ? Math.max(...modules.map((m) => m.order)) + 1
            : 1;
    },
};

// ========== LESSONS API ==========
export const lessonsApi = {
    // Crear lección (Admin)
    create: async (data: CreateLessonDto): Promise<Lesson> => {
        return apiClient.post<Lesson>('/lessons', data);
    },

    // Crear lección con video (Admin) - Endpoint con upload de archivo
    createVideoLesson: async (
        title: string,
        moduleId: string,
        order: number,
        videoFile: File,
        durationSec?: number
    ): Promise<Lesson> => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('moduleId', moduleId);
        formData.append('order', String(order));
        formData.append('video', videoFile);
        if (durationSec) {
            formData.append('durationSec', String(durationSec));
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        const response = await fetch(`${apiBase}/lessons/upload-video`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = `Error: ${response.status}`;
            try {
                const errorJson = JSON.parse(text);
                errorMsg = errorJson.message || errorJson.error || errorMsg;
            } catch {
                errorMsg = text || errorMsg;
            }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    // Obtener todas las lecciones con filtros (Admin)
    getAll: async (params?: {
        page?: number;
        limit?: number;
        moduleId?: string;
        type?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<LessonsResponse> => {
        return apiClient.get('/lessons', { params });
    },

    // Obtener lecciones de un módulo (reutilizando coursesApi)
    getByModule: async (moduleId: string): Promise<Lesson[]> => {
        return coursesApi.getModuleLessons(moduleId);
    },

    // Obtener lección por ID (reutilizando coursesApi)
    getById: async (id: string): Promise<Lesson> => {
        return coursesApi.getLesson(id);
    },

    // Obtener lección con sus recursos (incluye PDF y otros archivos adjuntos)
    getWithResources: async (id: string): Promise<Lesson> => {
        return apiClient.get<Lesson>(`/lessons/${id}/with-resources`);
    },

    // Actualizar lección (Admin)
    update: async (id: string, data: UpdateLessonDto): Promise<Lesson> => {
        return apiClient.patch<Lesson>(`/lessons/${id}`, data);
    },

    // Reordenar lecciones (Admin)
    reorder: async (moduleId: string, data: ReorderLessonsDto): Promise<Lesson[]> => {
        return apiClient.patch<Lesson[]>(`/lessons/module/${moduleId}/reorder`, data);
    },

    // Duplicar lección (Admin)
    duplicate: async (id: string): Promise<Lesson> => {
        return apiClient.post<Lesson>(`/lessons/${id}/duplicate`);
    },

    // Eliminar lección (Admin)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/lessons/${id}`);
    },

    // Obtener siguiente orden disponible
    getNextOrder: async (moduleId: string): Promise<number> => {
        const lessons = await lessonsApi.getByModule(moduleId);
        return lessons.length > 0
            ? Math.max(...lessons.map((l) => l.order)) + 1
            : 1;
    },
};

// ========== RESOURCES API ==========
export const resourcesApi = {
    // Crear recurso (Admin)
    create: async (data: CreateResourceDto): Promise<Resource> => {
        return apiClient.post<Resource>('/resources', data);
    },

    // Obtener recursos de una lección (Admin)
    getByLesson: async (lessonId: string): Promise<Resource[]> => {
        return apiClient.get<Resource[]>(`/resources/lesson/${lessonId}`);
    },

    // Obtener recurso por ID (Admin)
    getById: async (id: string): Promise<Resource> => {
        return apiClient.get<Resource>(`/resources/${id}`);
    },

    // Actualizar recurso (Admin)
    update: async (id: string, data: UpdateResourceDto): Promise<Resource> => {
        return apiClient.patch<Resource>(`/resources/${id}`, data);
    },

    // Eliminar recurso (Admin)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/resources/${id}`);
    },
};