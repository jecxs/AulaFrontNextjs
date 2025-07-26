// src/lib/api/notifications.ts
import { apiClient } from './client';
import { Notification } from '@/types/course';

export const notificationsApi = {
    // Obtener mis notificaciones
    getMyNotifications: async (unreadOnly = false): Promise<Notification[]> => {
        const params = unreadOnly ? { unreadOnly: 'true' } : {};
        return apiClient.get('/notifications', { params });
    },

    // Obtener contador de no leídas
    getUnreadCount: async (): Promise<{ unreadCount: number }> => {
        return apiClient.get('/notifications/unread-count');
    },

    // Marcar notificaciones como leídas
    markAsRead: async (notificationIds: string[]): Promise<void> => {
        return apiClient.patch('/notifications/mark-as-read', {
            notificationIds
        });
    },

    // Marcar todas como leídas
    markAllAsRead: async (): Promise<void> => {
        return apiClient.patch('/notifications/mark-all-read');
    },

    // Eliminar notificación
    deleteNotification: async (notificationId: string): Promise<void> => {
        return apiClient.delete(`/notifications/${notificationId}`);
    },
};