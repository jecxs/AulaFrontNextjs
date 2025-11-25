// src/components/admin/courses/detail/CourseStatsTab.tsx
'use client';

import { CourseStatistics } from '@/types/course';
import {
    Users,
    TrendingUp,
    BookOpen,
    Calendar,
    UserPlus,
    CheckCircle,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CourseStatsTabProps {
    stats: CourseStatistics | null;
    isLoading: boolean;
}

export default function CourseStatsTab({ stats, isLoading }: CourseStatsTabProps) {
    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Estudiantes
                            </p>
                            <p className="text-3xl font-bold text-[#001F3F] mt-2">
                                {stats.totalStudents}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-[#00B4D8]/10 to-[#00B4D8]/5 rounded-xl">
                            <Users className="h-6 w-6 text-[#00B4D8]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">
                                Progreso Promedio
                            </p>
                            <p className="text-3xl font-bold text-[#001F3F] mt-2">
                                {stats.progressStats.averageCompletionRate}%
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${stats.progressStats.averageCompletionRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Contenido
                            </p>
                            <p className="text-3xl font-bold text-[#001F3F] mt-2">
                                {stats.totalModules}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                {stats.totalLessons} lecciones
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Activos (7 días)
                            </p>
                            <p className="text-3xl font-bold text-[#001F3F] mt-2">
                                {stats.activityStats.activeStudentsLast7Days}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl">
                            <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado de Matrículas */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#001F3F] mb-6">
                    Estado de Matrículas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Activos</p>
                            <p className="text-2xl font-bold text-[#001F3F]">
                                {stats.enrollmentStats.active}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Completados</p>
                            <p className="text-2xl font-bold text-[#001F3F]">
                                {stats.enrollmentStats.completed}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Suspendidos</p>
                            <p className="text-2xl font-bold text-[#001F3F]">
                                {stats.enrollmentStats.suspended}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Expirados</p>
                            <p className="text-2xl font-bold text-[#001F3F]">
                                {stats.enrollmentStats.expired}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estadísticas de Pago */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#001F3F] mb-6">
                        Estado de Pagos
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Confirmados
                                </span>
                                <span className="text-sm font-bold text-green-600">
                                    {stats.paymentStats.confirmed}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            stats.totalStudents > 0
                                                ? (stats.paymentStats.confirmed / stats.totalStudents) * 100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Pendientes
                                </span>
                                <span className="text-sm font-bold text-amber-600">
                                    {stats.paymentStats.pending}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            stats.totalStudents > 0
                                                ? (stats.paymentStats.pending / stats.totalStudents) * 100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#001F3F] mb-6">
                        Actividad Reciente
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#00B4D8]/5 to-transparent rounded-lg border border-[#00B4D8]/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#00B4D8]/10 rounded-lg">
                                    <UserPlus className="h-5 w-5 text-[#00B4D8]" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    Nuevas matrículas (30 días)
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-[#001F3F]">
                                {stats.activityStats.recentEnrollments}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg border border-green-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    Estudiantes con progreso
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-[#001F3F]">
                                {stats.progressStats.studentsWithProgress}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}