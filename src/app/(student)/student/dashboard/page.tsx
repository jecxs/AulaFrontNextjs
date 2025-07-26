// src/app/(student)/student/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/auth/context';
import { BookOpen, Clock, Award, Calendar } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ¡Bienvenido, {user?.firstName}!
                </h1>
                <p className="text-gray-600">
                    Continúa tu aprendizaje desde donde lo dejaste
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Cursos Activos"
                    value="3"
                    icon={BookOpen}
                    color="blue"
                />
                <StatCard
                    title="Horas Completadas"
                    value="24"
                    icon={Clock}
                    color="green"
                />
                <StatCard
                    title="Certificados"
                    value="1"
                    icon={Award}
                    color="yellow"
                />
                <StatCard
                    title="Próxima Clase"
                    value="Hoy 3:00 PM"
                    icon={Calendar}
                    color="purple"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Actividad Reciente
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    Completaste la lección "Introducción a JavaScript"
                                </p>
                                <p className="text-sm text-gray-500">Hace 2 horas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
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
                            <dd className="text-lg font-medium text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}