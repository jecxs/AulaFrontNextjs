// src/lib/api/enrollments.ts
import { apiClient } from './client';

export interface CreateEnrollmentDto {
    userId: string;
    courseId: string;
    enrolledById: string;
    expiresAt?: string;
}

export interface UpdateEnrollmentDto {
    status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'COMPLETED';
    expiresAt?: string;
    paymentConfirmed?: boolean;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledById: string;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'COMPLETED';
    paymentConfirmed: boolean;
    enrolledAt: string;
    expiresAt?: string;
}

export const enrollmentsApi = {
    // Crear enrollment
    create: async (data: CreateEnrollmentDto): Promise<Enrollment> => {
        return apiClient.post<Enrollment>('/enrollments', data);
    },

    // Obtener enrollments de un usuario
    getUserEnrollments: async (userId: string): Promise<Enrollment[]> => {
        return apiClient.get<Enrollment[]>(`/enrollments/user/${userId}`);
    },

    // Obtener enrollments de un curso
    getCourseEnrollments: async (courseId: string): Promise<Enrollment[]> => {
        return apiClient.get<Enrollment[]>(`/enrollments/course/${courseId}`);
    },

    // Obtener enrollment por ID
    getById: async (id: string): Promise<Enrollment> => {
        return apiClient.get<Enrollment>(`/enrollments/${id}`);
    },

    // Actualizar enrollment
    update: async (id: string, data: UpdateEnrollmentDto): Promise<Enrollment> => {
        return apiClient.patch<Enrollment>(`/enrollments/${id}`, data);
    },

    // Activar enrollment
    activate: async (id: string): Promise<Enrollment> => {
        return apiClient.patch<Enrollment>(`/enrollments/${id}/activate`);
    },

    // Suspender enrollment
    suspend: async (id: string): Promise<Enrollment> => {
        return apiClient.patch<Enrollment>(`/enrollments/${id}/suspend`);
    },

    // Eliminar enrollment
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/enrollments/${id}`);
    },
};