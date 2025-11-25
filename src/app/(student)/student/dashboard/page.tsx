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
    ChevronRight,
    Calendar,
    Target
} from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const { enrollments, stats, isLoading, error } = useStudentCourses();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-[#001F3F]/60">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#001F3F] mb-2">
                        Error al cargar el dashboard
                    </h3>
                    <p className="text-[#001F3F]/60">
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
        if (percentage >= 80) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-[#00B4D8]';
        if (percentage >= 25) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getProgressGradient = (percentage: number) => {
        if (percentage >= 80) return 'from-emerald-500/10 to-emerald-500/5';
        if (percentage >= 50) return 'from-[#00B4D8]/10 to-[#00B4D8]/5';
        if (percentage >= 25) return 'from-amber-500/10 to-amber-500/5';
        return 'from-rose-500/10 to-rose-500/5';
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Hero Section - Saludo Mejorado */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F] via-[#001F3F]/95 to-[#00364D] rounded-3xl" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                <div className="relative px-8 py-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                                <div className="w-2 h-2 bg-[#00B4D8] rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-white/90">
                                    Dashboard del Estudiante
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-3">
                                Hola, {user?.firstName} 👋
                            </h1>
                            <p className="text-lg text-white/70 max-w-2xl">
                                Continúa tu camino de aprendizaje. Cada paso te acerca a tus objetivos profesionales.
                            </p>
                        </div>

                        {/* Avatar mejorado */}
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#00B4D8]/20 rounded-full blur-2xl" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-[#00B4D8] to-[#0096C7] rounded-2xl flex items-center justify-center shadow-xl shadow-[#00B4D8]/20 border border-white/10">
                                    <span className="text-3xl font-bold text-white">
                                        {user?.firstName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas Cards - Diseño Mejorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Cursos Activos */}
                <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-[#00B4D8]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#00B4D8]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B4D8]/5 to-transparent rounded-full -mr-16 -mt-16" />

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00B4D8]/10 to-[#00B4D8]/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6 text-[#00B4D8]" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                Activo
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#001F3F]/50 mb-1">Cursos Activos</p>
                            <p className="text-3xl font-bold text-[#001F3F]">{stats.total}</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Completados */}
                <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-16 -mt-16" />

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Logrado
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#001F3F]/50 mb-1">Completados</p>
                            <p className="text-3xl font-bold text-[#001F3F]">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                {/* Card 3: Horas Totales */}
                <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-transparent rounded-full -mr-16 -mt-16" />

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-6 h-6 text-violet-600" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                                <Target className="w-3 h-3" />
                                Invertido
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#001F3F]/50 mb-1">Horas de Estudio</p>
                            <p className="text-3xl font-bold text-[#001F3F]">{stats.totalHours}h</p>
                        </div>
                    </div>
                </div>

                {/* Card 4: Progreso Promedio */}
                <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-16 -mt-16" />

                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                <Target className="w-3 h-3" />
                                Avance
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#001F3F]/50 mb-1">Progreso Promedio</p>
                            <p className="text-3xl font-bold text-[#001F3F]">{stats.avgProgress}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Cursos */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[#001F3F] mb-1">Mis Cursos</h2>
                        <p className="text-sm text-[#001F3F]/60">Continúa tu progreso de aprendizaje</p>
                    </div>
                    <Link
                        href={ROUTES.STUDENT.COURSES}
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] text-white font-medium text-sm rounded-xl hover:shadow-lg hover:shadow-[#00B4D8]/25 transition-all duration-300"
                    >
                        Ver todos
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {enrollments.length === 0 ? (
                    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent" />

                        <div className="relative">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#001F3F] mb-2">
                                No tienes cursos activos
                            </h3>
                            <p className="text-[#001F3F]/60 max-w-md mx-auto">
                                Contacta al administrador para inscribirte en cursos y comenzar tu camino de aprendizaje
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.slice(0, 6).map((enrollment) => (
                            <div
                                key={enrollment.course.id}
                                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#00B4D8]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#00B4D8]/5 hover:-translate-y-1"
                            >
                                {/* Imagen del curso con overlay */}
                                <div className="relative aspect-video bg-gradient-to-br from-[#001F3F] to-[#00364D] overflow-hidden">
                                    {enrollment.course.thumbnailUrl ? (
                                        <img
                                            src={enrollment.course.thumbnailUrl}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-16 h-16 text-white/20" />
                                        </div>
                                    )}

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                                    {/* Badge de nivel */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-[#001F3F] rounded-full">
                                            <Target className="w-3 h-3" />
                                            {enrollment.course.level}
                                        </span>
                                    </div>

                                    {/* Barra de progreso mejorada */}
                                    {enrollment.progress && enrollment.progress.completionPercentage > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="font-semibold text-[#001F3F]">Progreso</span>
                                                    <span className="font-bold text-[#001F3F]">
                                                        {enrollment.progress.completionPercentage}%
                                                    </span>
                                                </div>
                                                <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progress.completionPercentage)}`}
                                                        style={{ width: `${enrollment.progress.completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contenido del curso */}
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-[#001F3F] mb-3 line-clamp-2 group-hover:text-[#00B4D8] transition-colors">
                                        {enrollment.course.title}
                                    </h3>

                                    {/* Instructor */}
                                    {enrollment.course.instructor && (
                                        <div className="flex items-center gap-2 text-sm text-[#001F3F]/60 mb-4">
                                            <div className="w-7 h-7 bg-gradient-to-br from-[#00B4D8]/10 to-[#00B4D8]/5 rounded-full flex items-center justify-center">
                                                <Users className="w-3.5 h-3.5 text-[#00B4D8]" />
                                            </div>
                                            <span className="font-medium">
                                                {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Estadísticas del curso */}
                                    <div className="flex items-center gap-4 text-xs text-[#001F3F]/50 mb-6 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span className="font-medium">{enrollment.course._count?.modules || 0} módulos</span>
                                        </div>
                                        {enrollment.course.estimatedHours && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="font-medium">{enrollment.course.estimatedHours}h</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Estado y botón */}
                                    <div className="space-y-3">
                                        {/* Estado del progreso */}
                                        {enrollment.progress?.completionPercentage === 100 ? (
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3" />
                                                </div>
                                                <span>Curso completado</span>
                                            </div>
                                        ) : enrollment.progress && enrollment.progress.completionPercentage > 0 ? (
                                            <div className="flex items-center gap-2 text-[#00B4D8] text-sm font-medium">
                                                <div className="w-5 h-5 bg-[#00B4D8]/10 rounded-full flex items-center justify-center">
                                                    <Play className="w-3 h-3" />
                                                </div>
                                                <span>En progreso</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[#001F3F]/40 text-sm font-medium">
                                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <BookOpen className="w-3 h-3" />
                                                </div>
                                                <span>Sin iniciar</span>
                                            </div>
                                        )}

                                        {/* Botón de continuar mejorado */}
                                        <Link
                                            href={getContinueLink(enrollment)}
                                            className="group/btn w-full bg-gradient-to-r from-[#001F3F] to-[#00364D] hover:from-[#00B4D8] hover:to-[#0096C7] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                        >
                                            {enrollment.progress?.completionPercentage === 100
                                                ? 'Revisar curso'
                                                : enrollment.progress && enrollment.progress.completionPercentage > 0
                                                    ? 'Continuar aprendiendo'
                                                    : 'Comenzar curso'
                                            }
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mostrar enlace si hay más cursos */}
                {enrollments.length > 6 && (
                    <div className="mt-8 text-center">
                        <Link
                            href={ROUTES.STUDENT.COURSES}
                            className="group inline-flex items-center gap-3 px-6 py-3 border-2 border-[#001F3F]/10 hover:border-[#00B4D8]/30 rounded-xl text-sm font-semibold text-[#001F3F] hover:text-[#00B4D8] bg-white hover:bg-[#00B4D8]/5 transition-all duration-300"
                        >
                            Ver {enrollments.length - 6} cursos más
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}