// src/lib/api/progress.ts
import { apiClient } from './client';
import { Lesson, Progress } from '@/types/course';

export const progressApi = {
    // Marcar lesson como completada
    markLessonComplete: async (lessonId: string, score?: number): Promise<Progress> => {
        return apiClient.post(`/progress/complete-lesson/${lessonId}`, {
            score
        });
    },

    // Verificar si lesson está completada
    checkLessonProgress: async (lessonId: string): Promise<{ isCompleted: boolean; completedAt?: string }> => {
        return apiClient.get(`/progress/check/${lessonId}`);
    },

    // Obtener siguiente lesson por completar
    getNextLesson: async (courseId: string): Promise<Lesson | null> => {
        return apiClient.get(`/progress/next-lesson/${courseId}`);
    },

    // Auto-completar lesson de video (cuando se termina el video)
    autoCompleteVideoLesson: async (lessonId: string): Promise<Progress> => {
        return apiClient.post(`/progress/auto-complete-video/${lessonId}`);
    },

    // Iniciar sesión de lesson (tracking)
    startLessonSession: async (lessonId: string): Promise<any> => {
        return apiClient.post(`/progress/start-lesson/${lessonId}`);
    },

    // Manejar checkpoint de video (para auto-completado)
    handleVideoCheckpoint: async (lessonId: string, progressPercentage: number): Promise<any> => {
        return apiClient.post(`/progress/video-checkpoint`, {
            lessonId,
            progressPercentage
        });
    },

    // Manejar salida de lección (para lecciones de texto)
    handleLessonExit: async (lessonId: string, timeSpentSeconds: number): Promise<any> => {
        return apiClient.post(`/progress/lesson-exit`, {
            lessonId,
            timeSpentSeconds
        });
    },

    // Manejar navegación entre lecciones
    handleLessonNavigation: async (fromLessonId: string, toLessonId: string): Promise<any> => {
        return apiClient.post(`/progress/lesson-navigation`, {
            fromLessonId,
            toLessonId
        });
    },

    // Obtener progreso detallado de un curso
    getCourseDetailedProgress: async (courseId: string): Promise<any> => {
        return apiClient.get(`/progress/course/${courseId}/detailed`);
    }
};