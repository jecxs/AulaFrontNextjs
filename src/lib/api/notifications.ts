// src/lib/api/notifications.ts
import { apiClient } from './client';
import type {
    Notification,
    NotificationSummary,
    UnreadCountResponse,
    MarkAsReadResponse,
    MarkAsReadDto,
    QueryNotificationsDto,
} from '@/types/notification';

// ========== NOTIFICATIONS API ==========
export const notificationsApi = {
    /**
     * GET /notifications
     * Obtener mis notificaciones (con opción de filtrar solo no leídas)
     */
    getMyNotifications: async (unreadOnly?: boolean): Promise<NotificationSummary> => {
        const params = unreadOnly ? { unreadOnly: 'true' } : {};
        return apiClient.get('/notifications', { params });
    },

    /**
     * GET /notifications/unread-count
     * Obtener el contador de notificaciones no leídas
     */
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        return apiClient.get('/notifications/unread-count');
    },

    /**
     * PATCH /notifications/mark-as-read
     * Marcar notificaciones específicas como leídas
     */
    markAsRead: async (notificationIds: string[]): Promise<MarkAsReadResponse> => {
        return apiClient.patch('/notifications/mark-as-read', {
            notificationIds,
        });
    },

    /**
     * PATCH /notifications/mark-all-read
     * Marcar todas las notificaciones como leídas
     */
    markAllAsRead: async (): Promise<MarkAsReadResponse> => {
        return apiClient.patch('/notifications/mark-all-read', {});
    },

    /**
     * DELETE /notifications/:id
     * Eliminar una notificación específica
     */
    deleteNotification: async (id: string): Promise<void> => {
        return apiClient.delete(`/notifications/${id}`);
    },
};