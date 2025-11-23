// src/lib/api/progress.ts
import { apiClient } from './client';
import { Lesson, CourseProgress } from '@/types/course';

// ========== INTERFACES ==========
export interface LessonProgressCheck {
    isCompleted: boolean;
    completedAt?: string;
    progressId?: string;
}

export interface ProgressResponse {
    id: string;
    enrollmentId: string;
    lessonId: string;
    completedAt?: string;
    score?: number;
}

// ========== API FUNCTIONS ==========
export const progressApi = {
    /**
     * MÉTODO PRINCIPAL - Marcar lección como completada
     * El estudiante hace click en "Completar y Continuar" y llama este endpoint
     */
    markLessonComplete: async (lessonId: string, score?: number): Promise<ProgressResponse> => {
        return apiClient.post<ProgressResponse>(`/progress/mark-complete`, {
            lessonId,
            score
        });
    },

    /**
     * Verificar si una lección está completada
     */
    checkLessonProgress: async (lessonId: string): Promise<LessonProgressCheck> => {
        return apiClient.get<LessonProgressCheck>(`/progress/check/${lessonId}`);
    },

    /**
     * Obtener siguiente lección por completar en un curso
     */
    getNextLesson: async (courseId: string): Promise<Lesson | null> => {
        return apiClient.get<Lesson | null>(`/progress/next-lesson/${courseId}`);
    },

    /**
     * Obtener progreso del estudiante en un curso específico
     */
    getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
        return apiClient.get<CourseProgress>(`/progress/my-course/${courseId}`);
    },

    /**
     * Obtener resumen completo del progreso del estudiante (todos los cursos)
     */
    getMyProgress: async (): Promise<any> => {
        return apiClient.get(`/progress/my-progress`);
    },

    /**
     * Obtener progreso detallado de un módulo
     */
    getModuleProgress: async (moduleId: string): Promise<any> => {
        return apiClient.get(`/progress/module/${moduleId}`);
    },
};