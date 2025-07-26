// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/auth/context';
import { Users, BookOpen, UserCheck, TrendingUp } from 'lucide-react';
import Link from "next/link";
import {cn} from "@/lib/utils/cn";

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Panel de Administración
                </h1>
                <p className="text-gray-600">
                    Bienvenido, {user?.firstName}. Gestiona tu plataforma educativa
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard
                    title="Total Estudiantes"
                    value="156"
                    icon={Users}
                    color="blue"
                    change="+12%"
                />
                <AdminStatCard
                    title="Cursos Activos"
                    value="24"
                    icon={BookOpen}
                    color="green"
                    change="+3"
                />
                <AdminStatCard
                    title="Inscripciones"
                    value="342"
                    icon={UserCheck}
                    color="purple"
                    change="+28%"
                />
                <AdminStatCard
                    title="Ingresos"
                    value="$12,450"
                    icon={TrendingUp}
                    color="yellow"
                    change="+15%"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Acciones Rápidas
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <QuickActionCard
                            title="Crear Nuevo Curso"
                            description="Añade un nuevo curso a la plataforma"
                            href="/admin/courses/create"
                        />
                        <QuickActionCard
                            title="Gestionar Usuarios"
                            description="Ver y administrar estudiantes"
                            href="/admin/users"
                        />
                        <QuickActionCard
                            title="Ver Inscripciones"
                            description="Revisar inscripciones recientes"
                            href="/admin/enrollments"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface AdminStatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    change: string;
}

function AdminStatCard({ title, value, icon: Icon, color, change }: AdminStatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', colorClasses[color])}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="flex items-baseline">
                                <div className="text-lg font-medium text-gray-900">{value}</div>
                                <div className="ml-2 text-sm font-medium text-green-600">{change}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface QuickActionCardProps {
    title: string;
    description: string;
    href: string;
}

function QuickActionCard({ title, description, href }: QuickActionCardProps) {
    return (
        <Link
            href={href}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </Link>
    );
}