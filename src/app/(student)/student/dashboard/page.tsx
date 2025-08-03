// src/app/(student)/student/dashboard/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useStudentCourses } from '@/hooks/use-student-courses';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Play,
    CheckCircle,
    Users,
    ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const { enrollments, stats, isLoading, error } = useStudentCourses();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error al cargar el dashboard
                    </h3>
                    <p className="text-gray-600">
                        Intenta recargar la página o contacta soporte
                    </p>
                </div>
            </div>
        );
    }

    const getContinueLink = (enrollment: any) => {
        return `${ROUTES.STUDENT.COURSES}/${enrollment.course.id}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-blue-500';
        if (percentage >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Saludo */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    ¡Hola, {user?.firstName}! 👋
                </h1>
                <p className="mt-2 text-gray-600">
                    Continúa con tu aprendizaje donde lo dejaste
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completados</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cursos */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mis Cursos</h2>
                    <Link
                        href={ROUTES.STUDENT.COURSES}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
                    >
                        Ver todos
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No tienes cursos activos
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Contacta al administrador para inscribirte en cursos
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.slice(0, 6).map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Imagen del curso */}
                                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                    {enrollment.course.thumbnailUrl ? (
                                        <img
                                            src={enrollment.course.thumbnailUrl}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-white/80" />
                                        </div>
                                    )}

                                    {/* Progreso overlay */}
                                    {enrollment.progress && enrollment.progress.completionPercentage > 0 && (
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-700">Progreso</span>
                                                    <span className="font-bold text-gray-900">
                                                        {enrollment.progress.completionPercentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress.completionPercentage)}`}
                                                        style={{ width: `${enrollment.progress.completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {enrollment.course.title}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>
                                            {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                                        </span>
                                    </div>

                                    {/* Estadísticas del curso */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <BookOpen className="w-3 h-3 mr-1" />
                                            <span>{enrollment.course._count?.modules || 0} módulos</span>
                                        </div>
                                        {enrollment.course.estimatedHours && (
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                <span>{enrollment.course.estimatedHours}h</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Estado del progreso */}
                                    <div className="mb-4">
                                        {enrollment.progress?.completionPercentage === 100 ? (
                                            <div className="flex items-center text-green-600 text-sm">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Curso completado</span>
                                            </div>
                                        ) : enrollment.progress && enrollment.progress.completionPercentage > 0 ? (
                                            <div className="flex items-center text-blue-600 text-sm">
                                                <Play className="w-4 h-4 mr-2" />
                                                <span className="font-medium">En progreso</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Sin iniciar</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón de continuar */}
                                    <Link
                                        href={getContinueLink(enrollment)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center group"
                                    >
                                        {enrollment.progress?.completionPercentage === 100
                                            ? 'Revisar curso'
                                            : enrollment.progress && enrollment.progress.completionPercentage > 0
                                                ? 'Continuar'
                                                : 'Comenzar'
                                        }
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mostrar mensaje si hay más cursos */}
                {enrollments.length > 6 && (
                    <div className="mt-6 text-center">
                        <Link
                            href={ROUTES.STUDENT.COURSES}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Ver {enrollments.length - 6} cursos más
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}