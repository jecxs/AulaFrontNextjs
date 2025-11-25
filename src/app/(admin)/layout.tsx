// src/app/(admin)/layout.tsx
'use client';

import { AdminGuard } from '@/lib/auth/guards';
import { useAuth } from '@/lib/auth/context';
import {LogOut, Users, BookOpen, BarChart3, Settings, UserCheck, BookIcon, Video} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

const adminNavigation = [
    { name: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: BarChart3 },
    { name: 'Cursos', href: ROUTES.ADMIN.COURSES, icon: BookOpen },
    { name: 'Categorías', href: '/admin/categories', icon: BookIcon },
    { name: 'Instructores', href: '/admin/instructors', icon: UserCheck },
    { name: 'Clases en Vivo', href: '/admin/live-sessions', icon: Video },
    { name: 'Usuarios', href: ROUTES.ADMIN.USERS, icon: Users },
    { name: 'Inscripciones', href: ROUTES.ADMIN.ENROLLMENTS, icon: UserCheck },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            {/* Contenedor principal SIN min-h-screen para evitar restricciones */}
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
                <AdminNavbar />
                <div className="flex">
                    <AdminSidebar />
                    {/* Main content SIN min-h-screen y SIN max-w para no limitar modales */}
                    <main className="flex-1 lg:ml-72 pt-16 w-full">
                        <div className="py-8 px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}

function AdminNavbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-[#001F3F] shadow-lg fixed w-full top-0 z-50 border-b border-[#00B4D8]/20">
            <div className="px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y título */}
                    <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                                src="/logo-light.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-semibold text-white tracking-tight">
                                {APP_NAME}
                            </h1>
                            <p className="text-xs text-[#00B4D8] font-medium">Panel de Administración</p>
                        </div>
                    </div>

                    {/* Usuario y acciones */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096c7] flex items-center justify-center">
                                <span className="text-xs font-semibold text-white">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-[#00B4D8]">Administrador</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="group relative p-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all duration-200"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="h-5 w-5 text-gray-300 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function AdminSidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Sidebar fijo sin overflow-y-auto problemático */}
            <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-72 bg-white shadow-xl border-r border-gray-100 z-40">
                <div className="h-full flex flex-col">
                    {/* Navegación con scroll suave */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                        {adminNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-[#001F3F] to-[#003366] text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#001F3F]'
                                    )}
                                >
                                    {/* Indicador activo */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00B4D8] rounded-r-full" />
                                    )}

                                    <div className={cn(
                                        'flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all',
                                        isActive
                                            ? 'bg-[#00B4D8]/20'
                                            : 'bg-gray-100 group-hover:bg-[#00B4D8]/10'
                                    )}>
                                        <item.icon
                                            className={cn(
                                                'h-5 w-5 transition-colors',
                                                isActive ? 'text-[#00B4D8]' : 'text-gray-500 group-hover:text-[#00B4D8]'
                                            )}
                                        />
                                    </div>

                                    <span className="flex-1">{item.name}</span>

                                    {/* Flecha sutil para item activo */}
                                    {isActive && (
                                        <svg
                                            className="h-4 w-4 text-[#00B4D8]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer del sidebar - ya no sticky */}
                    <div className="px-4 py-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-br from-[#001F3F]/5 to-[#00B4D8]/5 border border-[#00B4D8]/10">
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900">Sistema Activo</p>
                                <p className="text-xs text-gray-500 truncate">Todos los servicios operando</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}