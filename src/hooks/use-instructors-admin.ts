// src/hooks/use-instructors-admin.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { getErrorMessage } from '@/types/api';
import { instructorsApi } from '@/lib/api/instructors';
import {
    Instructor,
    InstructorWithCourses,
    CreateInstructorDto,
    UpdateInstructorDto,
    QueryInstructorsDto,
    InstructorsResponse,
    InstructorStats,
} from '@/types/instructor';

/**
 * Hook personalizado para operaciones de ADMIN en instructores
 */
export function useInstructorsAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crear instructor
    const createInstructor = useCallback(async (
        data: CreateInstructorDto
    ): Promise<Instructor> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear instructor');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener todos los instructores con filtros
    const getInstructors = useCallback(async (
        params?: QueryInstructorsDto
    ): Promise<InstructorsResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getAll(params);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar instructores');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener instructor por ID
    const getInstructorById = useCallback(async (
        id: string
    ): Promise<InstructorWithCourses> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar instructor');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Actualizar instructor
    const updateInstructor = useCallback(async (
        id: string,
        data: UpdateInstructorDto
    ): Promise<Instructor> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al actualizar instructor');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Eliminar instructor
    const deleteInstructor = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await instructorsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar instructor');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener estadísticas
    const getInstructorStats = useCallback(async (): Promise<InstructorStats> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getStats();
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

    // Obtener instructores sin cursos
    const getInstructorsWithoutCourses = useCallback(async (): Promise<Instructor[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getWithoutCourses();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar instructores sin cursos'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener top instructores
    const getTopInstructors = useCallback(async (
        limit?: number
    ): Promise<InstructorWithCourses[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getTop(limit);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar top instructores'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener cursos de un instructor
    const getInstructorCourses = useCallback(async (
        instructorId: string
    ): Promise<any[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await instructorsApi.getCourses(instructorId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar cursos del instructor'
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
            createInstructor,
            getInstructors,
            getInstructorById,
            updateInstructor,
            deleteInstructor,
            getInstructorStats,
            getInstructorsWithoutCourses,
            getTopInstructors,
            getInstructorCourses,
        }),
        [
            isLoading,
            error,
            createInstructor,
            getInstructors,
            getInstructorById,
            updateInstructor,
            deleteInstructor,
            getInstructorStats,
            getInstructorsWithoutCourses,
            getTopInstructors,
            getInstructorCourses,
        ]
    );
}