// src/hooks/use-enrollments.ts
'use client';

import {getErrorMessage} from '@/types/api';
import {useState} from 'react';
import {
    CheckAccessResponse, CheckLessonAccessResponse,
    CourseEnrollmentStats,
    CreateEnrollmentDto,
    EnrollmentListResponse,
    EnrollmentProgress,
    enrollmentsApi,
    EnrollmentStats,
    EnrollmentWithProgress,
    UpdateEnrollmentDto,
} from '@/lib/api/enrollments';

export function useEnrollments() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Crear un nuevo enrollment
     */
    const createEnrollment = async (
        data: CreateEnrollmentDto
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener todos los enrollments con filtros
     */
    const getEnrollments = async (params?: {
        page?: number;
        limit?: number;
        userId?: string;
        courseId?: string;
        status?: string;
        paymentConfirmed?: boolean;
        search?: string;
        expired?: boolean;
    }): Promise<EnrollmentListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await enrollmentsApi.getAll(params);
            // Asegurar que cada enrollment tenga un progreso válido
            return {
                ...response,
                data: response.data.map(enrollment => ({
                    ...enrollment,
                    progress: enrollment.progress || {
                        totalLessons: 0,
                        completedLessons: 0,
                        completionPercentage: 0,
                    }
                }))
            };
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments');
            setError(errorMessage);
            // En lugar de lanzar el error, retornar datos vacíos
            return {
                data: [],
                pagination: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    total: 0,
                    totalPages: 0,
                }
            };
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Obtener enrollment por ID
     */
    const getEnrollmentById = async (
        id: string
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Actualizar enrollment
     */
    const updateEnrollment = async (
        id: string,
        data: UpdateEnrollmentDto
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.update(id, data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(error, 'Error al actualizar enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Suspender enrollment
     */
    const suspendEnrollment = async (
        id: string
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.suspend(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al suspender enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Activar enrollment
     */
    const activateEnrollment = async (
        id: string
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.activate(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al activar enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Marcar enrollment como completado
     */
    const completeEnrollment = async (
        id: string
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.complete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al completar enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Confirmar pago de enrollment
     */
    const confirmPayment = async (
        id: string
    ): Promise<EnrollmentWithProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.confirmPayment(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al confirmar pago');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Eliminar enrollment
     */
    const deleteEnrollment = async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await enrollmentsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar enrollment');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener enrollments de un usuario
     */
    const getUserEnrollments = async (
        userId: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
        }
    ): Promise<EnrollmentListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getUserEnrollments(
                userId,
                params
            );
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments de usuario');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener enrollments de un curso
     */
    const getCourseEnrollments = async (
        courseId: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
        }
    ): Promise<EnrollmentListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getCourseEnrollments(
                courseId,
                params
            );
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments del curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener estadísticas de enrollments
     */
    const getEnrollmentStats = async (): Promise<EnrollmentStats> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getStats();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar estadisticas de enrollments');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener estadísticas de enrollments de un curso
     */
    const getCourseEnrollmentStats = async (
        courseId: string
    ): Promise<CourseEnrollmentStats> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getCourseStats(courseId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar estadisticas de enrollments de un curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener enrollments que expiran pronto
     */
    const getExpiringSoon = async (
        days: number = 7
    ): Promise<EnrollmentWithProgress[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getExpiringSoon(days);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments por vencer');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener enrollments pendientes de pago
     */
    const getPendingPayment = async (params?: {
        page?: number;
        limit?: number;
    }): Promise<EnrollmentListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getPendingPayment(params);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments pendientes de pago');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener enrollments expirados
     */
    const getExpired = async (params?: {
        page?: number;
        limit?: number;
    }): Promise<EnrollmentListResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getExpired(params);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar enrollments expirados');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtener progreso de un enrollment
     */
    const getEnrollmentProgress = async (
        enrollmentId: string
    ): Promise<EnrollmentProgress> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.getProgress(enrollmentId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar progreso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verificar acceso de usuario a un curso
     */
    const checkUserAccess = async (courseId: string, userId: string): Promise<CheckAccessResponse>  => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.checkAccess(courseId, userId);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al Verificar acceso de usuario a un curso');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verificar acceso de usuario a una lección
     */
    const checkLessonAccess = async (
        courseId: string,
        lessonId: string,
        userId: string
    ): Promise<CheckLessonAccessResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            return await enrollmentsApi.checkLessonAccess(
                courseId,
                lessonId,
                userId
            );
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al Verificar acceso de usuario a una lección');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Estado
        isLoading,
        error,

        // CRUD básico
        createEnrollment,
        getEnrollments,
        getEnrollmentById,
        updateEnrollment,
        deleteEnrollment,

        // Acciones de estado
        suspendEnrollment,
        activateEnrollment,
        completeEnrollment,
        confirmPayment,

        // Consultas específicas
        getUserEnrollments,
        getCourseEnrollments,
        getEnrollmentProgress,

        // Estadísticas
        getEnrollmentStats,
        getCourseEnrollmentStats,

        // Filtros especiales
        getExpiringSoon,
        getPendingPayment,
        getExpired,

        // Verificación de acceso
        checkUserAccess,
        checkLessonAccess,
    };
}