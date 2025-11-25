// src/app/(student)/student/profile/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useStudentProfile } from '@/hooks/use-student-profile';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
    User,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Award,
    Clock,
    Bell,
    TrendingUp,
    ExternalLink,
    CheckCircle,
    Video,
    ArrowRight,
} from 'lucide-react';

export default function StudentProfilePage() {
    const { profile, isLoading, error } = useStudentProfile();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error al cargar el perfil
                    </h3>
                    <p className="text-gray-600">
                        {error || 'Ocurrió un error inesperado'}
                    </p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
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
            {/* Header del perfil */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-4xl font-bold text-blue-600">
                                    {profile.firstName.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Info básica */}
                            <div className="text-white">
                                <h1 className="text-3xl font-bold mb-2">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="space-y-1">
                                    <div className="flex items-center text-blue-100">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span>{profile.email}</span>
                                    </div>
                                    {profile.phone && (
                                        <div className="flex items-center text-blue-100">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <span>{profile.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-blue-100">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Miembro desde {formatDate(profile.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badge de rol */}
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-white font-medium">
                                {profile.roles[0]?.name === 'STUDENT' ? 'Estudiante' : profile.roles[0]?.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Total Inscritos
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {profile.coursesStats.totalEnrolled}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Cursos Activos
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {profile.coursesStats.activeEnrollments}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                Notificaciones
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {profile.unreadNotifications}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Bell className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna principal - Cursos activos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cursos Activos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Mis Cursos Activos
                            </h2>
                            <Link
                                href={ROUTES.STUDENT.COURSES}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center group"
                            >
                                Ver todos
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {profile.activeCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No tienes cursos activos</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {profile.activeCourses.slice(0, 5).map((course) => (
                                    <div
                                        key={course.courseId}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {course.courseTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {course.instructorName} • {course.categoryName}
                                                </p>
                                                {course.nextLessonTitle && (
                                                    <p className="text-xs text-blue-600 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Próxima: {course.nextLessonTitle}
                                                    </p>
                                                )}
                                            </div>
                                            <Link
                                                href={`${ROUTES.STUDENT.COURSES}/${course.courseId}`}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                        </div>

                                        {/* Barra de progreso */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">
                                                    {course.completedLessons} de {course.totalLessons} lecciones
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                    {course.progressPercentage}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgressColor(course.progressPercentage)}`}
                                                    style={{ width: `${course.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna lateral - Sesiones y detalles */}
                <div className="space-y-6">
                    {/* Próximas Sesiones en Vivo */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Video className="w-5 h-5 mr-2 text-blue-600" />
                            Próximas Sesiones
                        </h2>

                        {profile.upcomingSessions.length === 0 ? (
                            <div className="text-center py-8">
                                <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">
                                    No hay sesiones programadas
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {profile.upcomingSessions.slice(0, 3).map((session) => (
                                    <div
                                        key={session.id}
                                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                    >
                                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                                            {session.topic}
                                        </h4>
                                        <p className="text-xs text-gray-600 mb-2">
                                            {session.courseTitle}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDateTime(session.startsAt)}
                                        </div>
                                        {session.meetingUrl && (
                                            <a
                                                href={session.meetingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                Unirse a la sesión
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Estado de la Cuenta
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Estado</span>
                                <span className="flex items-center text-sm font-medium text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    {profile.status === 'ACTIVE' ? 'Activo' : profile.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Cursos Expirados</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {profile.coursesStats.expiredEnrollments}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Miembro desde</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(profile.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}