// src/app/(student)/layout.tsx
'use client';

import { StudentGuard } from '@/lib/auth/guards';
import { useAuth } from '@/lib/auth/context';
import { LogOut, User, BookOpen, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

const studentNavigation = [
    { name: 'Dashboard', href: ROUTES.STUDENT.DASHBOARD, icon: BookOpen },
    { name: 'Mis Cursos', href: ROUTES.STUDENT.COURSES, icon: BookOpen },
    { name: 'Sesiones en Vivo', href: '/student/live-sessions', icon: Calendar },
    { name: 'Perfil', href: ROUTES.STUDENT.PROFILE, icon: User },
];

export default function StudentLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <StudentGuard>
            <div className="min-h-screen bg-gray-50">
                <StudentNavbar />
                <div className="flex">
                    <StudentSidebar />
                    <main className="flex-1 lg:ml-64">
                        <div className="py-6 px-4 sm:px-6 lg:px-8">
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
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function StudentSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white border-r border-gray-200 pt-16 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {studentNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                    isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5',
                                        isActive ? 'text-blue-500' : 'text-gray-400'
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
