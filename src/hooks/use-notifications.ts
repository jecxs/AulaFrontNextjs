// src/hooks/use-notifications.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { toast } from 'sonner';
import type {
    NotificationSummary,
    UnreadCountResponse,
} from '@/types/notification';

// ========== QUERY KEYS ==========
export const NOTIFICATION_KEYS = {
    all: ['notifications'] as const,
    myNotifications: (unreadOnly?: boolean) =>
        ['notifications', 'my', { unreadOnly }] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
};

// ========== QUERIES ==========

/**
 * Hook para obtener las notificaciones del usuario
 */
export function useMyNotifications(unreadOnly?: boolean) {
    return useQuery<NotificationSummary>({
        queryKey: NOTIFICATION_KEYS.myNotifications(unreadOnly),
        queryFn: () => notificationsApi.getMyNotifications(unreadOnly),
        staleTime: 1000 * 30, // 30 segundos
        refetchInterval: 1000 * 60, // Refetch cada minuto
    });
}

/**
 * Hook para obtener el contador de notificaciones no leídas
 */
export function useUnreadCount() {
    return useQuery<UnreadCountResponse>({
        queryKey: NOTIFICATION_KEYS.unreadCount(),
        queryFn: () => notificationsApi.getUnreadCount(),
        staleTime: 1000 * 30, // 30 segundos
        refetchInterval: 1000 * 60, // Refetch cada minuto
    });
}

// ========== MUTATIONS ==========

/**
 * Hook para marcar notificaciones como leídas
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationIds: string[]) =>
            notificationsApi.markAsRead(notificationIds),
        onSuccess: () => {
            // Invalidar todas las queries de notificaciones
            queryClient.invalidateQueries({
                queryKey: NOTIFICATION_KEYS.all,
            });
        },
        onError: (error: Error) => {
            console.error('Error marking notifications as read:', error);
            toast.error('Error al marcar como leída');
        },
    });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: NOTIFICATION_KEYS.all,
            });
            toast.success('Todas las notificaciones marcadas como leídas');
        },
        onError: (error: Error) => {
            console.error('Error marking all as read:', error);
            toast.error('Error al marcar todas como leídas');
        },
    });
}

/**
 * Hook para eliminar una notificación
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            notificationsApi.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: NOTIFICATION_KEYS.all,
            });
        },
        onError: (error: Error) => {
            console.error('Error deleting notification:', error);
            toast.error('Error al eliminar notificación');
        },
    });
}

/**
 * Hook auxiliar que combina múltiples funcionalidades
 */
export function useNotifications() {
    const { data: unreadData, isLoading: isLoadingCount } = useUnreadCount();
    const { data: notificationsData, isLoading: isLoadingNotifications } =
        useMyNotifications();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    return {
        // Datos
        unreadCount: unreadData?.unreadCount ?? 0,
        notifications: notificationsData?.notifications ?? [],
        total: notificationsData?.total ?? 0,

        // Estados de carga
        isLoading: isLoadingCount || isLoadingNotifications,

        // Acciones
        markAsRead: (ids: string[]) => markAsRead.mutate(ids),
        markAllAsRead: () => markAllAsRead.mutate(),
        deleteNotification: (id: string) => deleteNotification.mutate(id),

        // Estados de las mutaciones
        isMarkingAsRead: markAsRead.isPending,
        isMarkingAllAsRead: markAllAsRead.isPending,
        isDeletingNotification: deleteNotification.isPending,
    };
}