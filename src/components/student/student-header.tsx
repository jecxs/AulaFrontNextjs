// src/components/student/student-header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { notificationsApi } from '@/lib/api/notifications';
import { cn } from '@/lib/utils/cn';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';
import {
    Bell,
    User,
    BookOpen,
    Home,
    Settings,
    LogOut,
    Check,
    X
} from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function StudentHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Estados para notificaciones
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    // Cargar contador de notificaciones no leídas
    useEffect(() => {
        loadUnreadCount();
    }, []);

    const loadUnreadCount = async () => {
        try {
            const response = await notificationsApi.getUnreadCount();
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const loadNotifications = async () => {
        if (isLoadingNotifications) return;

        setIsLoadingNotifications(true);
        try {
            const response = await notificationsApi.getMyNotifications();
            setNotifications(response);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleNotificationClick = async () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            await loadNotifications();
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead([notificationId]);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationsApi.deleteNotification(notificationId);
            setNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
            );
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    const formatNotificationTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Hace unos minutos';
        } else if (diffInHours < 24) {
            return `Hace ${Math.floor(diffInHours)} horas`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'COURSE_UPDATE':
                return '📚';
            case 'QUIZ_RESULT':
                return '🎯';
            case 'MODULE_COMPLETED':
                return '✅';
            case 'ASSIGNMENT_DUE':
                return '⏰';
            default:
                return '📋';
        }
    };

    // Navegación items
    const navItems = [
        {
            label: 'Dashboard',
            href: ROUTES.STUDENT.DASHBOARD,
            icon: Home,
            active: pathname === ROUTES.STUDENT.DASHBOARD,
        },
        {
            label: 'Mis Cursos',
            href: ROUTES.STUDENT.COURSES,
            icon: BookOpen,
            active: pathname.startsWith(ROUTES.STUDENT.COURSES),
        },
    ];

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.notification-dropdown') && !target.closest('.notification-btn')) {
                setShowNotifications(false);
            }
            if (!target.closest('.user-dropdown') && !target.closest('.user-btn')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href={ROUTES.STUDENT.DASHBOARD} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
                        </Link>
                    </div>

                    {/* Navegación central */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    item.active
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Acciones del usuario */}
                    <div className="flex items-center space-x-4">
                        {/* Notificaciones */}
                        <div className="relative">
                            <button
                                onClick={handleNotificationClick}
                                className="notification-btn relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown de notificaciones */}
                            {showNotifications && (
                                <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Notificaciones
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                Marcar todas como leídas
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {isLoadingNotifications ? (
                                            <div className="px-4 py-8 text-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">Cargando...</p>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    No tienes notificaciones
                                                </p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={cn(
                                                        'px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0',
                                                        !notification.isRead && 'bg-blue-50 border-l-4 border-l-blue-500'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-start space-x-2">
                                                                <span className="text-lg">
                                                                    {getNotificationIcon(notification.type)}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-medium text-gray-900">
                                                                        {notification.title}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {notification.content}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {formatNotificationTime(notification.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-2">
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="p-1 text-blue-600 hover:text-blue-700 rounded"
                                                                    title="Marcar como leída"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                title="Eliminar"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Menú de usuario */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="user-btn flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user?.firstName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="hidden md:block text-sm font-medium">
                                    {user?.firstName}
                                </span>
                            </button>

                            {/* Dropdown de usuario */}
                            {showUserMenu && (
                                <div className="user-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>

                                    <Link
                                        href={ROUTES.STUDENT.PROFILE}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Mi Perfil</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación móvil */}
            <div className="md:hidden border-t border-gray-200 px-4 py-2">
                <nav className="flex space-x-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                item.active
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}