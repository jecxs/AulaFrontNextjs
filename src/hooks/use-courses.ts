// src/hooks/use-courses.ts
'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/types/api';
import {
    coursesApi,
    modulesApi,
    lessonsApi,
    resourcesApi,
} from '@/lib/api/courses';
import {
    Course,
    CreateCourseDto,
    UpdateCourseDto,
    CourseListResponse,
    CourseStats,
    Module,
    CreateModuleDto,
    UpdateModuleDto,
    ReorderModulesDto,
    Lesson,
    CreateLessonDto,
    UpdateLessonDto,
    ReorderLessonsDto,
    Resource,
    CreateResourceDto,
    UpdateResourceDto,
} from '@/types/course';

export function useCourses() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== COURSES ==========
    const createCourse = async (data: CreateCourseDto): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getCourses = async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        level?: string;
        categoryId?: string;
        instructorId?: string;
        visibility?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<CourseListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.getAll(params);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar cursos');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getCourseById = async (id: string): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCourse = async (
        id: string,
        data: UpdateCourseDto
    ): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const publishCourse = async (id: string): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.publish(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al publicar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const archiveCourse = async (id: string): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.archive(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al archivar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCourse = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await coursesApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getCourseStats = async (): Promise<CourseStats> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.getStats();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar estadísticas'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // ========== MODULES ==========
    const createModule = async (data: CreateModuleDto): Promise<Module> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear módulo');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getModulesByCourse = async (courseId: string): Promise<Module[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.getByCourse(courseId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar módulos');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getModuleById = async (id: string): Promise<Module> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar módulo');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateModule = async (
        id: string,
        data: UpdateModuleDto
    ): Promise<Module> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar módulo');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const reorderModules = async (
        courseId: string,
        data: ReorderModulesDto
    ): Promise<Module[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.reorder(courseId, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al reordenar módulos'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const duplicateModule = async (id: string): Promise<Module> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.duplicate(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al duplicar módulo');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteModule = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await modulesApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar módulo');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // ========== LESSONS ==========
    const createLesson = async (data: CreateLessonDto): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getLessonsByModule = async (moduleId: string): Promise<Lesson[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.getByModule(moduleId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar lecciones');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getLessonById = async (id: string): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateLesson = async (
        id: string,
        data: UpdateLessonDto
    ): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const reorderLessons = async (
        moduleId: string,
        data: ReorderLessonsDto
    ): Promise<Lesson[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.reorder(moduleId, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al reordenar lecciones'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const duplicateLesson = async (id: string): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.duplicate(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al duplicar lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteLesson = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await lessonsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getLessonNextOrder = async (moduleId: string): Promise<number> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.getNextOrder(moduleId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al obtener siguiente orden'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // ========== RESOURCES ==========
    const createResource = async (data: CreateResourceDto): Promise<Resource> => {
        setIsLoading(true);
        setError(null);
        try {
            return await resourcesApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear recurso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getResourcesByLesson = async (lessonId: string): Promise<Resource[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await resourcesApi.getByLesson(lessonId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar recursos');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateResource = async (
        id: string,
        data: UpdateResourceDto
    ): Promise<Resource> => {
        setIsLoading(true);
        setError(null);
        try {
            return await resourcesApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar recurso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteResource = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await resourcesApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar recurso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,

        // Courses
        createCourse,
        getCourses,
        getCourseById,
        updateCourse,
        publishCourse,
        archiveCourse,
        deleteCourse,
        getCourseStats,

        // Modules
        createModule,
        getModulesByCourse,
        getModuleById,
        updateModule,
        reorderModules,
        duplicateModule,
        deleteModule,

        // Lessons
        createLesson,
        getLessonsByModule,
        getLessonById,
        updateLesson,
        reorderLessons,
        duplicateLesson,
        deleteLesson,
        getLessonNextOrder,

        // Resources
        createResource,
        getResourcesByLesson,
        updateResource,
        deleteResource,
    };
}