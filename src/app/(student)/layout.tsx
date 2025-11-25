// src/app/(student)/student/layout.tsx
'use client';

import { StudentGuard } from '@/lib/auth/guards';
import { useAuth } from '@/lib/auth/context';
import { LogOut, User, BookOpen, Calendar, Home, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';
import NotificationsDropdown from '@/components/notifications/notifications-dropdown';
import Image from 'next/image';

const studentNavigation = [
    { name: 'Dashboard', href: ROUTES.STUDENT.DASHBOARD, icon: Home },
    { name: 'Mis Cursos', href: ROUTES.STUDENT.COURSES, icon: BookOpen },
    { name: 'Sesiones en Vivo', href: '/student/live-sessions', icon: Calendar },
    { name: 'Perfil', href: ROUTES.STUDENT.PROFILE, icon: User },
];

export default function StudentLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // ✅ Detectar si estamos en una ruta de lecciones
    const isLessonView = pathname.includes('/lessons/');

    return (
        <StudentGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                {/* ✅ Ocultar navbar en vista de lecciones */}
                {!isLessonView && <StudentNavbar />}

                <div className="flex">
                    {/* ✅ Ocultar sidebar en vista de lecciones */}
                    {!isLessonView && <StudentSidebar />}

                    {/* ✅ No aplicar margen ni padding en lecciones */}
                    <main className={cn(
                        "flex-1",
                        !isLessonView && "lg:ml-64 pt-16"
                    )}>
                        {/* ✅ No aplicar padding interno en lecciones */}
                        <div className={!isLessonView ? "py-6 px-4 sm:px-6 lg:px-8" : ""}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </StudentGuard>
    );
}

function StudentNavbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 fixed w-full top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            href={ROUTES.STUDENT.DASHBOARD}
                            className="flex items-center space-x-3 group"
                        >
                            {/*
                                LOGO DE LA EMPRESA
                                Coloca tu logo en: /public/logo-palomino.png
                                Tamaño recomendado: 200x200px o mayor (se ajustará automáticamente)
                                Formato: PNG con fondo transparente preferiblemente
                            */}
                            <div className="relative w-17 h-17 transition-transform duration-300 group-hover:scale-105">
                                <Image
                                    src="/logo-palomino.png"
                                    alt="Palomino Learning Center"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {/* Texto del logo con efecto gradiente */}
                            <div className="flex flex-col">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-[#001F3F] to-[#00364D] bg-clip-text text-transparent">
                                    {APP_NAME}
                                </h1>
                                <span className="text-[10px] font-medium text-[#00B4D8] tracking-wide">
                                    Aula Virtual
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Acciones de usuario */}
                    <div className="flex items-center space-x-3">
                        {/* ✅ Componente de notificaciones mejorado */}
                        <div className="relative">
                            <NotificationsDropdown />
                        </div>

                        {/* Divisor sutil */}
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

                        {/* Información del usuario */}
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Nombre de usuario */}
                            <div className="text-right">
                                <p className="text-sm font-semibold text-[#001F3F]">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-[#001F3F]/50">
                                    Estudiante
                                </p>
                            </div>

                            {/* Avatar del usuario mejorado */}
                            <div className="relative group/avatar">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00B4D8] to-[#0096C7] rounded-full blur-md opacity-0 group-hover/avatar:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-[#00B4D8] to-[#0096C7] rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                                    <span className="text-sm font-bold text-white">
                                        {user?.firstName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de logout mejorado */}
                        <button
                            onClick={logout}
                            className="group/btn p-2.5 rounded-xl text-[#001F3F]/60 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function StudentSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 pt-16 pb-4 overflow-y-auto fixed h-full">
                {/* Header del sidebar con info del usuario */}
                <div className="px-4 py-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#001F3F]/95 to-[#00364D] rounded-2xl p-4">
                        {/* Patrón decorativo de fondo */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                        </div>

                        <div className="relative flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00B4D8] to-[#0096C7] rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-lg font-bold text-white">
                                    {user?.firstName?.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-white/70 mt-0.5">
                                    Estudiante Activo
                                </p>
                            </div>
                        </div>

                        {/* Badge decorativo */}
                        <div className="relative mt-3 flex items-center gap-2">
                            <div className="flex-1 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
                            <span className="text-[10px] font-semibold text-white/50 tracking-widest">
                                PLATAFORMA
                            </span>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 space-y-1">
                    {studentNavigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== ROUTES.STUDENT.DASHBOARD && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                                    isActive
                                        ? 'bg-gradient-to-r from-[#00B4D8]/10 to-[#00B4D8]/5 text-[#00B4D8] shadow-sm'
                                        : 'text-[#001F3F]/60 hover:bg-gray-50 hover:text-[#001F3F]'
                                )}
                            >
                                {/* Indicador activo */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#00B4D8] to-[#0096C7] rounded-r-full"></div>
                                )}

                                {/* Icono con efecto */}
                                <div className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-300',
                                    isActive
                                        ? 'bg-gradient-to-br from-[#00B4D8] to-[#0096C7] shadow-md shadow-[#00B4D8]/20'
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                )}>
                                    <item.icon
                                        className={cn(
                                            'h-4 w-4 transition-colors',
                                            isActive ? 'text-white' : 'text-[#001F3F]/40 group-hover:text-[#001F3F]/60'
                                        )}
                                    />
                                </div>

                                {/* Texto */}
                                <span className="flex-1">
                                    {item.name}
                                </span>

                                {/* Efecto hover - flecha */}
                                {!isActive && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer del sidebar mejorado */}
                <div className="px-4 py-4">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 border border-gray-200/50">
                        {/* Logo pequeño */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                    src="/logo-palomino.png"
                                    alt="Palomino Learning Center"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#001F3F] truncate">
                                    Palomino Learning
                                </p>
                                <p className="text-[10px] text-[#001F3F]/50">
                                    Centro de Aprendizaje
                                </p>
                            </div>
                        </div>

                        {/* Versión y detalles */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-[10px] font-medium text-[#001F3F]/40">
                                Versión 1.0.0
                            </span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-medium text-emerald-600">
                                    En línea
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}