// src/app/(student)/student/notifications/page.tsx
'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils/cn';
import {
    Bell,
    CheckCheck,
    Trash2,
    Filter,
    Calendar,
    Trophy,
    Award,
    BookOpen,
    Sparkles,
    XCircle,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';
import type { Notification, NotificationType } from '@/types/notification';

type FilterType = 'all' | 'unread' | `${NotificationType}`;

export default function NotificationsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const {
        notifications,
        unreadCount,
        total,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isMarkingAsRead,
        isMarkingAllAsRead,
        isDeletingNotification,
    } = useNotifications();

    // Filtrar notificaciones según el filtro seleccionado
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.readAt;
        return notification.type === filter;
    });

    const handleMarkAsRead = (notificationId: string) => {
        markAsRead([notificationId]);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleDelete = (notificationId: string) => {
        deleteNotification(notificationId);
        setShowDeleteConfirm(null);
    };

    const handleNotificationClick = (notification: Notification) => {
        // Marcar como leída si no lo está
        if (!notification.readAt) {
            markAsRead([notification.id]);
        }

        // Redirigir según el tipo
        const link = getNotificationLink(notification);
        if (link) {
            router.push(link);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Bell className="w-8 h-8 mr-3 text-blue-600" />
                            Notificaciones
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Gestiona todas tus notificaciones
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAllAsRead}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Marcar todas como leídas
                            {isMarkingAllAsRead && (
                                <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center mb-3">
                    <Filter className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label="Todas"
                        count={total}
                    />
                    <FilterButton
                        active={filter === 'unread'}
                        onClick={() => setFilter('unread')}
                        label="No leídas"
                        count={unreadCount}
                    />
                    <FilterButton
                        active={filter === 'MODULE_COMPLETED'}
                        onClick={() => setFilter('MODULE_COMPLETED')}
                        label="Módulos"
                        icon={<Trophy className="w-3 h-3" />}
                    />
                    <FilterButton
                        active={filter === 'QUIZ_PASSED' || filter === 'QUIZ_FAILED'}
                        onClick={() => setFilter('QUIZ_PASSED')}
                        label="Quizzes"
                        icon={<Award className="w-3 h-3" />}
                    />
                    <FilterButton
                        active={filter === 'COURSE_COMPLETED'}
                        onClick={() => setFilter('COURSE_COMPLETED')}
                        label="Cursos"
                        icon={<BookOpen className="w-3 h-3" />}
                    />
                </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="px-4 py-16 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-gray-500">Cargando notificaciones...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="px-4 py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {filter === 'all'
                                ? 'No tienes notificaciones'
                                : filter === 'unread'
                                    ? '¡Todo al día!'
                                    : 'No hay notificaciones de este tipo'
                            }
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {filter === 'all'
                                ? 'Te avisaremos cuando haya algo nuevo'
                                : filter === 'unread'
                                    ? 'Has leído todas tus notificaciones'
                                    : 'Intenta con otro filtro'
                            }
                        </p>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Ver todas las notificaciones
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={(id) => setShowDeleteConfirm(id)}
                                onClick={() => handleNotificationClick(notification)}
                                isDeleting={isDeletingNotification && showDeleteConfirm === notification.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onCancel={() => setShowDeleteConfirm(null)}
                    isDeleting={isDeletingNotification}
                />
            )}
        </div>
    );
}

// ========== COMPONENTES AUXILIARES ==========

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count?: number;
    icon?: React.ReactNode;
}

function FilterButton({ active, onClick, label, count, icon }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
        >
            {icon}
            {label}
            {count !== undefined && (
                <span className={cn(
                    'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                    active ? 'bg-blue-700' : 'bg-gray-200'
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
    isDeleting: boolean;
}

function NotificationCard({
                              notification,
                              onMarkAsRead,
                              onDelete,
                              onClick,
                              isDeleting,
                          }: NotificationCardProps) {
    const isUnread = !notification.readAt;
    const { icon, color, title, description } = getNotificationContent(notification);

    return (
        <div
            className={cn(
                'px-6 py-4 hover:bg-gray-50 transition-colors relative group',
                isUnread && 'bg-blue-50/30 border-l-4 border-l-blue-500'
            )}
        >
            <div className="flex items-start gap-4">
                {/* Icono */}
                <div
                    className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                        color
                    )}
                >
                    {icon}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 cursor-pointer" onClick={onClick}>
                            <h3
                                className={cn(
                                    'text-base text-gray-900 mb-1',
                                    isUnread && 'font-semibold'
                                )}
                            >
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">
                            {formatNotificationTime(notification.sentAt)}
                        </p>

                        <div className="flex items-center gap-2">
                            {isUnread && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                >
                                    Marcar como leída
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DeleteConfirmModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

function DeleteConfirmModal({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    ¿Eliminar notificación?
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Esta acción no se puede deshacer. La notificación se eliminará permanentemente.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ========== UTILIDADES ==========

function getNotificationContent(notification: Notification) {
    const { type, payload } = notification;

    switch (type) {
        case 'MODULE_COMPLETED':
            return {
                icon: <Trophy className="w-6 h-6 text-green-600" />,
                color: 'bg-green-100',
                title: '¡Módulo completado!',
                description: payload
                    ? `Has completado "${payload.moduleTitle}" en ${payload.courseName}`
                    : 'Has completado un módulo',
            };

        case 'QUIZ_PASSED':
            return {
                icon: <Award className="w-6 h-6 text-blue-600" />,
                color: 'bg-blue-100',
                title: '¡Quiz aprobado! 🎉',
                description: payload
                    ? `Has aprobado "${payload.quizTitle}" con ${payload.percentage}%`
                    : 'Has aprobado un quiz',
            };

        case 'QUIZ_FAILED':
            return {
                icon: <XCircle className="w-6 h-6 text-orange-600" />,
                color: 'bg-orange-100',
                title: 'Resultado del quiz',
                description: payload
                    ? `Obtuviste ${payload.percentage}% en "${payload.quizTitle}". Puedes volver a intentarlo.`
                    : 'Puedes volver a intentar el quiz',
            };

        case 'COURSE_COMPLETED':
            return {
                icon: <Trophy className="w-6 h-6 text-yellow-600" />,
                color: 'bg-yellow-100',
                title: '¡Curso completado! 🏆',
                description: payload
                    ? `¡Felicitaciones! Has completado "${payload.courseTitle}"`
                    : '¡Felicitaciones! Has completado un curso',
            };

        case 'LIVE_SESSION_REMINDER':
            return {
                icon: <Calendar className="w-6 h-6 text-purple-600" />,
                color: 'bg-purple-100',
                title: 'Sesión en vivo próxima',
                description: payload
                    ? `"${payload.sessionTopic}" comienza en ${payload.minutesUntilStart} minutos`
                    : 'Tienes una sesión en vivo próxima',
            };

        case 'ENROLLMENT_CREATED':
            return {
                icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
                color: 'bg-indigo-100',
                title: '¡Nueva matriculación!',
                description: payload
                    ? `Te has inscrito en "${payload.courseTitle}"`
                    : 'Te has inscrito en un nuevo curso',
            };

        case 'NEW_CONTENT':
            return {
                icon: <Sparkles className="w-6 h-6 text-pink-600" />,
                color: 'bg-pink-100',
                title: 'Nuevo contenido disponible',
                description: payload?.description || 'Hay nuevo contenido disponible para ti',
            };

        default:
            return {
                icon: <Bell className="w-6 h-6 text-gray-600" />,
                color: 'bg-gray-100',
                title: 'Notificación',
                description: 'Tienes una nueva notificación',
            };
    }
}

function getNotificationLink(notification: Notification): string | null {
    const { type, payload } = notification;

    switch (type) {
        case 'MODULE_COMPLETED':
            return payload?.courseId ? `${ROUTES.STUDENT.COURSES}/${payload.courseId}` : null;

        case 'QUIZ_PASSED':
        case 'QUIZ_FAILED':
            return null;

        case 'ENROLLMENT_CREATED':
        case 'NEW_CONTENT':
            return payload?.courseId ? `${ROUTES.STUDENT.COURSES}/${payload.courseId}` : null;

        case 'COURSE_COMPLETED':
            return payload?.courseId ? `${ROUTES.STUDENT.COURSES}/${payload.courseId}` : null;

        case 'LIVE_SESSION_REMINDER':
            return '/student/live-sessions';

        default:
            return null;
    }
}

function formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
        return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `Hace ${diffInHours}h`;
    } else if (diffInDays === 1) {
        return 'Ayer';
    } else if (diffInDays < 7) {
        return `Hace ${diffInDays} días`;
    } else {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}