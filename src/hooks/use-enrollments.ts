// src/hooks/use-enrollments.ts
'use client';

import { useState } from 'react';
import {
    enrollmentsApi,
    CreateEnrollmentDto,
    UpdateEnrollmentDto,
    EnrollmentWithProgress,
    EnrollmentListResponse,
    EnrollmentStats,
    CourseEnrollmentStats,
    EnrollmentProgress,
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
            const enrollment = await enrollmentsApi.create(data);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al crear enrollment';
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
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al cargar enrollments';
            setError(errorMessage);
            throw err;
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
            const enrollment = await enrollmentsApi.getById(id);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al cargar enrollment';
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
            const enrollment = await enrollmentsApi.update(id, data);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al actualizar enrollment';
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
            const enrollment = await enrollmentsApi.suspend(id);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al suspender enrollment';
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
            const enrollment = await enrollmentsApi.activate(id);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al activar enrollment';
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
            const enrollment = await enrollmentsApi.complete(id);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al completar enrollment';
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
            const enrollment = await enrollmentsApi.confirmPayment(id);
            return enrollment;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al confirmar pago';
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
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al eliminar enrollment';
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
            const response = await enrollmentsApi.getUserEnrollments(
                userId,
                params
            );
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar enrollments del usuario';
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
            const response = await enrollmentsApi.getCourseEnrollments(
                courseId,
                params
            );
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar enrollments del curso';
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
            const stats = await enrollmentsApi.getStats();
            return stats;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al cargar estadísticas';
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
            const stats = await enrollmentsApi.getCourseStats(courseId);
            return stats;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar estadísticas del curso';
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
            const enrollments = await enrollmentsApi.getExpiringSoon(days);
            return enrollments;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar enrollments próximos a expirar';
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
            const response = await enrollmentsApi.getPendingPayment(params);
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar enrollments pendientes de pago';
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
            const response = await enrollmentsApi.getExpired(params);
            return response;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al cargar enrollments expirados';
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
            const progress = await enrollmentsApi.getProgress(enrollmentId);
            return progress;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al cargar progreso';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verificar acceso de usuario a un curso
     */
    const checkUserAccess = async (courseId: string, userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await enrollmentsApi.checkAccess(courseId, userId);
            return result;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Error al verificar acceso';
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
    ) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await enrollmentsApi.checkLessonAccess(
                courseId,
                lessonId,
                userId
            );
            return result;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                'Error al verificar acceso a la lección';
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