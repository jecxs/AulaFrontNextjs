// src/lib/api/progress.ts - SIMPLIFICADO
import { apiClient } from './client';
import { Lesson, Progress } from '@/types/course';

export const progressApi = {

    // MÉTODO PRINCIPAL - Marcar lesson como completada
    markLessonComplete: async (lessonId: string, score?: number): Promise<any> => {
        return apiClient.post(`/progress/mark-complete`, {
            lessonId,
            score
        });
    },

    //
    checkLessonProgress: async (lessonId: string): Promise<{ isCompleted: boolean; completedAt?: string }> => {
        return apiClient.get(`/progress/check/${lessonId}`);
    },

    //
    getNextLesson: async (courseId: string): Promise<Lesson | null> => {
        return apiClient.get(`/progress/next-lesson/${courseId}`);
    },

    //
    getCourseProgress: async (courseId: string): Promise<any> => {
        return apiClient.get(`/progress/my-course/${courseId}`);
    },

};