// src/lib/api/progress.ts
import { apiClient } from './client';
import {Lesson, Progress} from '@/types/course';

export const progressApi = {
    // Marcar lesson como completada
    markLessonComplete: async (lessonId: string): Promise<Progress> => {
        return apiClient.post(`/progress/complete-lesson/${lessonId}`);
    },

    // Verificar si lesson está completada
    checkLessonProgress: async (lessonId: string): Promise<{ isCompleted: boolean }> => {
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
};
