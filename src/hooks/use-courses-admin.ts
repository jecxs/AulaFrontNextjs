// src/hooks/use-courses-admin.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
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
    CourseListResponse, // O CourseListResponse según tu types/course.ts
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
    QueryCoursesDto,
} from '@/types/course';
import {cleanUpdateLessonDto} from "@/lib/utils/dto-cleaner";

/**
 * Hook personalizado para operaciones de ADMIN en cursos
 * Separado del consumo de cursos del estudiante para mayor claridad
 */
export function useCoursesAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== COURSES ==========
    const createCourse = useCallback(async (data: CreateCourseDto): Promise<Course> => {
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
    }, []);

    const getCourses = useCallback(async (params?: QueryCoursesDto): Promise<CourseListResponse> => {
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
    }, []);

    const getCourseById = useCallback(async (id: string): Promise<Course> => {
        setIsLoading(true);
        setError(null);
        try {
            return await coursesApi.getCourse(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCourse = useCallback(async (
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
    }, []);

    const publishCourse = useCallback(async (id: string): Promise<Course> => {
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
    }, []);

    const archiveCourse = useCallback(async (id: string): Promise<Course> => {
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
    }, []);

    const deleteCourse = useCallback(async (id: string): Promise<void> => {
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
    }, []);

    const getCourseStats = useCallback(async (): Promise<CourseStats> => {
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
    }, []);

    // ========== MODULES ==========
    const createModule = useCallback(async (data: CreateModuleDto): Promise<Module> => {
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
    }, []);

    const getModulesByCourse = useCallback(async (courseId: string): Promise<Module[]> => {
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
    }, []);

    const getModuleById = useCallback(async (id: string): Promise<Module> => {
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
    }, []);

    const updateModule = useCallback(async (
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
    }, []);

    const reorderModules = useCallback(async (
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
    }, []);

    const duplicateModule = useCallback(async (id: string): Promise<Module> => {
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
    }, []);

    const deleteModule = useCallback(async (id: string): Promise<void> => {
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
    }, []);

    const getModuleNextOrder = useCallback(async (courseId: string): Promise<number> => {
        setIsLoading(true);
        setError(null);
        try {
            return await modulesApi.getNextOrder(courseId);
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
    }, []);

    // ========== LESSONS ==========
    const createLesson = useCallback(async (data: CreateLessonDto): Promise<Lesson> => {
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
    }, []);

    const createVideoLesson = useCallback(async (
        title: string,
        moduleId: string,
        order: number,
        videoFile: File,
        durationSec?: number
    ): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.createVideoLesson(title, moduleId, order, videoFile, durationSec);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear lección de video');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getLessonsByModule = useCallback(async (moduleId: string): Promise<Lesson[]> => {
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
    }, []);

    const getLessonById = useCallback(async (id: string): Promise<Lesson> => {
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
    }, []);

    const getLessonWithResources = useCallback(async (id: string): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            return await lessonsApi.getWithResources(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar lección con recursos');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLesson = useCallback(async (
        id: string,
        data: UpdateLessonDto
    ): Promise<Lesson> => {
        setIsLoading(true);
        setError(null);
        try {
            const cleanedData = cleanUpdateLessonDto(data);
            return await lessonsApi.update(id, cleanedData as UpdateLessonDto);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reorderLessons = useCallback(async (
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
    }, []);

    const duplicateLesson = useCallback(async (id: string): Promise<Lesson> => {
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
    }, []);

    const deleteLesson = useCallback(async (id: string): Promise<void> => {
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
    }, []);

    const getLessonNextOrder = useCallback(async (moduleId: string): Promise<number> => {
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
    }, []);

    // ========== RESOURCES ==========
    const createResource = useCallback(async (data: CreateResourceDto): Promise<Resource> => {
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
    }, []);

    const getResourcesByLesson = useCallback(async (lessonId: string): Promise<Resource[]> => {
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
    }, []);

    const updateResource = useCallback(async (
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
    }, []);

    const deleteResource = useCallback(async (id: string): Promise<void> => {
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
    }, []);

    return useMemo(() => ({
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
        getModuleNextOrder,

        // Lessons
        createLesson,
        createVideoLesson,
        getLessonsByModule,
        getLessonById,
        getLessonWithResources,
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
    }), [
        isLoading,
        error,
        createCourse,
        getCourses,
        getCourseById,
        updateCourse,
        publishCourse,
        archiveCourse,
        deleteCourse,
        getCourseStats,
        createModule,
        getModulesByCourse,
        getModuleById,
        updateModule,
        reorderModules,
        duplicateModule,
        deleteModule,
        getModuleNextOrder,
        createLesson,
        createVideoLesson,
        getLessonsByModule,
        getLessonById,
        getLessonWithResources,
        updateLesson,
        reorderLessons,
        duplicateLesson,
        deleteLesson,
        getLessonNextOrder,
        createResource,
        getResourcesByLesson,
        updateResource,
        deleteResource,
    ]);
 }
