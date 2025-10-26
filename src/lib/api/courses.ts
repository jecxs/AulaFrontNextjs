// src/lib/api/courses.ts -
import { apiClient } from './client';
import {Course, Module, Lesson, CourseProgress, CoursesResponse, QueryCoursesDto} from '@/types/course';
import { MyEnrollmentsResponse } from '@/types/enrollment';



export const coursesApi = {

    // Obtener todos los cursos (con filtros) - Para Admin
    getAll: async (query?: QueryCoursesDto): Promise<CoursesResponse> => {
        return apiClient.get<CoursesResponse>('/courses', { params: query });
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
};