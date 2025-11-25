// src/components/notifications/notifications-dropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/use-notifications';
import { ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';
import {
    Bell,
    Check,
    CheckCheck,
    BookOpen,
    Award,
    Calendar,
    Sparkles,
    Trophy,
    XCircle,
    ChevronRight,
} from 'lucide-react';
import type { Notification } from '@/types/notification';

export default function NotificationsDropdown() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        isMarkingAsRead,
    } = useNotifications();

    // Mostrar solo las últimas 5 notificaciones en el dropdown
    const recentNotifications = notifications.slice(0, 5);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead([notificationId]);
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead();
        setIsOpen(false);
    };

    const handleNotificationClick = (notification: Notification) => {
        // Marcar como leída si no lo está
        if (!notification.readAt) {
            markAsRead([notification.id]);
        }

        // Cerrar dropdown
        setIsOpen(false);

        // Redirigir según el tipo de notificación
        const link = getNotificationLink(notification);
        if (link) {
            router.push(link);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        router.push('/student/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de notificaciones */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-blue-600" />
                            Notificaciones
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center disabled:opacity-50 transition-colors"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Marcar todas
                            </button>
                        )}
                    </div>

                    {/* Lista de notificaciones */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {isLoading ? (
                            <div className="px-4 py-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-3 text-sm text-gray-500">Cargando...</p>
                            </div>
                        ) : recentNotifications.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    No tienes notificaciones nuevas
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    Te avisaremos cuando haya algo nuevo
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onClick={() => handleNotificationClick(notification)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer con link a ver todas */}
                    <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                        <button
                            onClick={handleViewAll}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 flex items-center justify-center group transition-colors"
                        >
                            Ver todas las notificaciones
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========== COMPONENTE DE ITEM DE NOTIFICACIÓN ==========
interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string, e: React.MouseEvent) => void;
    onClick: () => void;
}

function NotificationItem({
                              notification,
                              onMarkAsRead,
                              onClick,
                          }: NotificationItemProps) {
    const isUnread = !notification.readAt;
    const { icon, color, title, description } = getNotificationContent(notification);

    return (
        <div
            onClick={onClick}
            className={cn(
                'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative group',
                isUnread && 'bg-blue-50/50 border-l-4 border-l-blue-500'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icono */}
                <div className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                    color
                )}>
                    {icon}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0 pr-8">
                    <p className={cn(
                        'text-sm text-gray-900 mb-1 line-clamp-1',
                        isUnread && 'font-semibold'
                    )}>
                        {title}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.sentAt)}
                    </p>
                </div>

                {/* Acción de marcar como leída */}
                {isUnread && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => onMarkAsRead(notification.id, e)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Marcar como leída"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
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
                icon: <Trophy className="w-5 h-5 text-green-600" />,
                color: 'bg-green-100',
                title: '¡Módulo completado!',
                description: payload
                    ? `Has completado "${payload.moduleTitle}" en ${payload.courseName}`
                    : 'Has completado un módulo',
            };

        case 'QUIZ_PASSED':
            return {
                icon: <Award className="w-5 h-5 text-blue-600" />,
                color: 'bg-blue-100',
                title: '¡Quiz aprobado! 🎉',
                description: payload
                    ? `Has aprobado "${payload.quizTitle}" con ${payload.percentage}%`
                    : 'Has aprobado un quiz',
            };

        case 'QUIZ_FAILED':
            return {
                icon: <XCircle className="w-5 h-5 text-orange-600" />,
                color: 'bg-orange-100',
                title: 'Resultado del quiz',
                description: payload
                    ? `Obtuviste ${payload.percentage}% en "${payload.quizTitle}". Puedes volver a intentarlo.`
                    : 'Puedes volver a intentar el quiz',
            };

        case 'COURSE_COMPLETED':
            return {
                icon: <Trophy className="w-5 h-5 text-yellow-600" />,
                color: 'bg-yellow-100',
                title: '¡Curso completado! 🏆',
                description: payload
                    ? `¡Felicitaciones! Has completado "${payload.courseTitle}"`
                    : '¡Felicitaciones! Has completado un curso',
            };

        case 'LIVE_SESSION_REMINDER':
            return {
                icon: <Calendar className="w-5 h-5 text-purple-600" />,
                color: 'bg-purple-100',
                title: 'Sesión en vivo próxima',
                description: payload
                    ? `"${payload.sessionTopic}" comienza en ${payload.minutesUntilStart} minutos`
                    : 'Tienes una sesión en vivo próxima',
            };

        case 'ENROLLMENT_CREATED':
            return {
                icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
                color: 'bg-indigo-100',
                title: '¡Nueva matriculación!',
                description: payload
                    ? `Te has inscrito en "${payload.courseTitle}"`
                    : 'Te has inscrito en un nuevo curso',
            };

        case 'NEW_CONTENT':
            return {
                icon: <Sparkles className="w-5 h-5 text-pink-600" />,
                color: 'bg-pink-100',
                title: 'Nuevo contenido disponible',
                description: payload?.description || 'Hay nuevo contenido disponible para ti',
            };

        default:
            return {
                icon: <Bell className="w-5 h-5 text-gray-600" />,
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
            month: 'short',
        });
    }
}