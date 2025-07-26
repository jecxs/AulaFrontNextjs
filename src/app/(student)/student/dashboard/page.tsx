// src/app/(student)/student/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Play,
    CheckCircle,
    Calendar,
    Users
} from 'lucide-react';

interface EnrollmentWithProgress {
    id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl?: string;
        level: string;
        estimatedHours?: number;
        instructor: {
            firstName: string;
            lastName: string;
        };
        _count: {
            modules: number;
        };
    };
    enrolledAt: string;
    progress?: {
        completionPercentage: number;
        totalLessons: number;
        completedLessons: number;
        lastActivity?: string;
    };
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        totalHours: 0,
        avgProgress: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);

            // Cargar enrollments
            const response = await coursesApi.getMyEnrollments();
            const enrollmentsData = response.data;

            // Cargar progreso para cada curso
            const enrollmentsWithProgress = await Promise.all(
                enrollmentsData.map(async (enrollment: any) => {
                    try {
                        const progress = await coursesApi.getMyCourseProgress(enrollment.course.id);
                        return {
                            ...enrollment,
                            progress,
                        };
                    } catch (error) {
                        console.error(`Error loading progress for course ${enrollment.course.id}:`, error);
                        return enrollment;
                    }
                })
            );

            setEnrollments(enrollmentsWithProgress);

            // Calcular estadísticas
            const totalCourses = enrollmentsWithProgress.length;
            const completedCourses = enrollmentsWithProgress.filter(
                e => e.progress?.completionPercentage === 100
            ).length;
            const totalHours = enrollmentsWithProgress.reduce(
                (sum, e) => sum + (e.course.estimatedHours || 0), 0
            );
            const avgProgress = totalCourses > 0
                ? enrollmentsWithProgress.reduce(
                (sum, e) => sum + (e.progress?.completionPercentage || 0), 0
            ) / totalCourses
                : 0;

            setStats({
                totalCourses,
                completedCourses,
                totalHours,
                avgProgress: Math.round(avgProgress),
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getContinueLink = (enrollment: EnrollmentWithProgress) => {
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Saludo */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    ¡Hola, {user?.firstName}! 👋
                </h1>
                <p className="mt-2 text-gray-600">
                    Continúa con tu aprendizaje donde lo dejaste
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
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
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Ver todos
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
                        {enrollments.map((enrollment) => (
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
                                            <BookOpen className="w-12 h-12 text-white opacity-80" />
                                        </div>
                                    )}

                                    {/* Badge de nivel */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-white/90 text-xs font-medium text-gray-700 rounded-full">
                                            {enrollment.course.level}
                                        </span>
                                    </div>

                                    {/* Progreso visual */}
                                    {enrollment.progress && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-3">
                                            <div className="w-full bg-white/30 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(enrollment.progress.completionPercentage)}`}
                                                    style={{ width: `${enrollment.progress.completionPercentage}%` }}
                                                />
                                            </div>
                                            <p className="text-white text-xs mt-1">
                                                {enrollment.progress.completionPercentage}% completado
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {enrollment.course.title}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>
                                            {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                                        </span>
                                    </div>

                                    {/* Estadísticas del curso */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <BookOpen className="w-4 h-4 mr-1" />
                                            <span>{enrollment.course._count.modules} módulos</span>
                                        </div>
                                        {enrollment.course.estimatedHours && (
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                <span>{enrollment.course.estimatedHours}h</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progreso detallado */}
                                    {enrollment.progress && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progreso</span>
                                                <span className="font-medium">
                                                    {enrollment.progress.completedLessons}/{enrollment.progress.totalLessons} lecciones
                                                </span>
                                            </div>
                                            {enrollment.progress.lastActivity && (
                                                <p className="text-xs text-gray-500">
                                                    Última actividad: {formatDate(enrollment.progress.lastActivity)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón de acción */}
                                    <Link
                                        href={getContinueLink(enrollment)}
                                        className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center"
                                    >
                                        {enrollment.progress?.completionPercentage === 100 ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Revisar Curso
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                {enrollment.progress?.completionPercentage === 0 ? 'Comenzar' : 'Continuar'}
                                            </>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}