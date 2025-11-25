// src/hooks/use-course-categories-admin.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { getErrorMessage } from '@/types/api';
import { courseCategoriesApi } from '@/lib/api/course-categories';
import {
    CourseCategory,
    CourseCategoryWithCourses,
    CreateCourseCategoryDto,
    UpdateCourseCategoryDto,
    QueryCourseCategoriesDto,
    CourseCategoriesResponse,
    CategoryStats,
} from '@/types/course-category';

/**
 * Hook personalizado para operaciones de ADMIN en categorías de cursos
 */
export function useCourseCategoriesAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crear categoría
    const createCategory = useCallback(async (
        data: CreateCourseCategoryDto
    ): Promise<CourseCategory> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear categoría');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener todas las categorías con filtros
    const getCategories = useCallback(async (
        params?: QueryCourseCategoriesDto
    ): Promise<CourseCategoriesResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.getAll(params);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar categorías');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener categorías activas (para selects)
    const getActiveCategories = useCallback(async (): Promise<CourseCategory[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.getActive();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar categorías activas');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener categoría por ID
    const getCategoryById = useCallback(async (
        id: string
    ): Promise<CourseCategoryWithCourses> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar categoría');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Actualizar categoría
    const updateCategory = useCallback(async (
        id: string,
        data: UpdateCourseCategoryDto
    ): Promise<CourseCategory> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar categoría');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Activar/Desactivar categoría
    const toggleCategoryStatus = useCallback(async (
        id: string
    ): Promise<CourseCategory> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.toggleStatus(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cambiar estado de categoría'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Eliminar categoría
    const deleteCategory = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await courseCategoriesApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar categoría');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener estadísticas
    const getCategoryStats = useCallback(async (): Promise<CategoryStats> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.getStats();
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

    // Obtener categorías sin cursos
    const getCategoriesWithoutCourses = useCallback(async (): Promise<CourseCategory[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await courseCategoriesApi.getWithoutCourses();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar categorías sin cursos'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return useMemo(
        () => ({
            isLoading,
            error,
            createCategory,
            getCategories,
            getActiveCategories,
            getCategoryById,
            updateCategory,
            toggleCategoryStatus,
            deleteCategory,
            getCategoryStats,
            getCategoriesWithoutCourses,
        }),
        [
            isLoading,
            error,
            createCategory,
            getCategories,
            getActiveCategories,
            getCategoryById,
            updateCategory,
            toggleCategoryStatus,
            deleteCategory,
            getCategoryStats,
            getCategoriesWithoutCourses,
        ]
    );
}