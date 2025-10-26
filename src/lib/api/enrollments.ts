// src/lib/api/enrollments.ts
import { apiClient } from './client';



// ========== INTERFACES Y TIPOS ==========

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    SUSPENDED = 'SUSPENDED',
    COMPLETED = 'COMPLETED',
}


export interface CreateEnrollmentDto {
    userId: string;
    courseId: string;
    enrolledById: string;
    expiresAt?: string;
    paymentConfirmed?: boolean;
}

export interface UpdateEnrollmentDto {
    status?: EnrollmentStatus;
    expiresAt?: string;
    paymentConfirmed?: boolean;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledById: string;
    status: EnrollmentStatus;
    paymentConfirmed: boolean;
    enrolledAt: string;
    expiresAt?: string;
}

export interface EnrollmentProgress {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
}

export interface EnrollmentWithProgress extends Enrollment {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
    };
    course: {
        id: string;
        title: string;
        slug: string;
        price: number | null;
        level: string;
        category: {
            name: string;
        };
    };
    enrolledBy: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    progress: EnrollmentProgress;
}

export interface EnrollmentListResponse {
    data: EnrollmentWithProgress[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface EnrollmentStats {
    total: number;
    byStatus: {
        active: number;
        suspended: number;
        completed: number;
        expired: number;
    };
    byPayment: {
        pending: number;
        confirmed: number;
    };
    recent: {
        last30Days: number;
    };
}

export interface CourseEnrollmentStats extends EnrollmentStats {
    course: {
        id: string;
        title: string;
    };
}

// ========== API FUNCTIONS ==========

export const enrollmentsApi = {
    /**
     * Crear enrollment
     */
    create: async (data: CreateEnrollmentDto): Promise<EnrollmentWithProgress> => {
        return apiClient.post<EnrollmentWithProgress>('/enrollments', data);
    },

    /**
     * Obtener todos los enrollments con filtros y paginación
     */
    getAll: async (params?: {
        page?: number;
        limit?: number;
        userId?: string;
        courseId?: string;
        status?: string;
        paymentConfirmed?: boolean;
        search?: string;
        expired?: boolean;
    }): Promise<EnrollmentListResponse> => {
        return apiClient.get<EnrollmentListResponse>('/enrollments', { params });
    },

    /**
     * Obtener enrollments de un usuario
     */
    getUserEnrollments: async (
        userId: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
        }
    ): Promise<EnrollmentListResponse> => {
        return apiClient.get<EnrollmentListResponse>(
            `/enrollments/user/${userId}`,
            { params }
        );
    },

    /**
     * Obtener enrollments de un curso
     */
    getCourseEnrollments: async (
        courseId: string,
        params?: {
            page?: number;
            limit?: number;
            status?: string;
        }
    ): Promise<EnrollmentListResponse> => {
        return apiClient.get<EnrollmentListResponse>(
            `/enrollments/course/${courseId}`,
            { params }
        );
    },

    /**
     * Obtener enrollment por ID
     */
    getById: async (id: string): Promise<EnrollmentWithProgress> => {
        return apiClient.get<EnrollmentWithProgress>(`/enrollments/${id}`);
    },

    /**
     * Actualizar enrollment
     */
    update: async (
        id: string,
        data: UpdateEnrollmentDto
    ): Promise<EnrollmentWithProgress> => {
        return apiClient.patch<EnrollmentWithProgress>(`/enrollments/${id}`, data);
    },

    /**
     * Activar enrollment
     */
    activate: async (id: string): Promise<EnrollmentWithProgress> => {
        return apiClient.patch<EnrollmentWithProgress>(
            `/enrollments/${id}/activate`
        );
    },

    /**
     * Suspender enrollment
     */
    suspend: async (id: string): Promise<EnrollmentWithProgress> => {
        return apiClient.patch<EnrollmentWithProgress>(
            `/enrollments/${id}/suspend`
        );
    },

    /**
     * Marcar como completado
     */
    complete: async (id: string): Promise<EnrollmentWithProgress> => {
        return apiClient.patch<EnrollmentWithProgress>(
            `/enrollments/${id}/complete`
        );
    },

    /**
     * Confirmar pago
     */
    confirmPayment: async (id: string): Promise<EnrollmentWithProgress> => {
        return apiClient.patch<EnrollmentWithProgress>(
            `/enrollments/${id}/confirm-payment`
        );
    },

    /**
     * Eliminar enrollment
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/enrollments/${id}`);
    },

    /**
     * Obtener estadísticas generales de enrollments
     */
    getStats: async (): Promise<EnrollmentStats> => {
        return apiClient.get<EnrollmentStats>('/enrollments/stats');
    },

    /**
     * Obtener estadísticas de enrollments de un curso
     */
    getCourseStats: async (courseId: string): Promise<CourseEnrollmentStats> => {
        return apiClient.get<CourseEnrollmentStats>(
            `/enrollments/course/${courseId}/stats`
        );
    },

    /**
     * Obtener enrollments que expiran pronto
     */
    getExpiringSoon: async (days: number = 7): Promise<EnrollmentWithProgress[]> => {
        return apiClient.get<EnrollmentWithProgress[]>(
            `/enrollments/expiring-soon?days=${days}`
        );
    },

    /**
     * Obtener enrollments pendientes de pago
     */
    getPendingPayment: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<EnrollmentListResponse> => {
        return apiClient.get<EnrollmentListResponse>(
            '/enrollments/pending-payment',
            { params }
        );
    },

    /**
     * Obtener enrollments expirados
     */
    getExpired: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<EnrollmentListResponse> => {
        return apiClient.get<EnrollmentListResponse>('/enrollments/expired', {
            params,
        });
    },

    /**
     * Obtener progreso de un enrollment
     */
    getProgress: async (enrollmentId: string): Promise<EnrollmentProgress> => {
        return apiClient.get<EnrollmentProgress>(
            `/enrollments/${enrollmentId}/progress`
        );
    },

    /**
     * Verificar acceso de usuario a un curso
     */
    checkAccess: async (
        courseId: string,
        userId: string
    ): Promise<{
        hasAccess: boolean;
        reason: string;
        enrollment: EnrollmentWithProgress | null;
    }> => {
        return apiClient.get(
            `/enrollments/check-access/${courseId}/${userId}`
        );
    },

    /**
     * Verificar acceso de usuario a una lección específica
     */
    checkLessonAccess: async (
        courseId: string,
        lessonId: string,
        userId: string
    ): Promise<{
        hasAccess: boolean;
        reason: string;
        enrollment: EnrollmentWithProgress | null;
        lesson?: any;
    }> => {
        return apiClient.get(
            `/enrollments/check-access/${courseId}/${lessonId}/${userId}`
        );
    },
};