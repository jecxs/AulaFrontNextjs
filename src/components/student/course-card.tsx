// src/components/student/course-card.tsx
'use client';

import Link from 'next/link';
import {
    BookOpen,
    Clock,
    Users,
    ChevronRight,
    Play,
    CheckCircle,
    Award,
    TrendingUp,
    Target
} from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';

interface CourseCardProps {
    enrollment: any;
}

export default function CourseCard({ enrollment }: CourseCardProps) {
    const progressPercentage = enrollment.progress?.completionPercentage || 0;

    // Determinar el color del progreso basado en el porcentaje
    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return {
            bg: 'bg-emerald-500',
            text: 'text-emerald-600',
            gradient: 'from-emerald-500 to-emerald-600',
            ring: 'ring-emerald-500/20'
        };
        if (percentage >= 50) return {
            bg: 'bg-[#00B4D8]',
            text: 'text-[#00B4D8]',
            gradient: 'from-[#00B4D8] to-[#0096C7]',
            ring: 'ring-[#00B4D8]/20'
        };
        if (percentage >= 25) return {
            bg: 'bg-amber-500',
            text: 'text-amber-600',
            gradient: 'from-amber-500 to-amber-600',
            ring: 'ring-amber-500/20'
        };
        return {
            bg: 'bg-rose-500',
            text: 'text-rose-600',
            gradient: 'from-rose-500 to-rose-600',
            ring: 'ring-rose-500/20'
        };
    };

    const progressColors = getProgressColor(progressPercentage);

    // Determinar badge de estado
    const getStatusBadge = (status: string) => {
        const badges = {
            ACTIVE: {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-700',
                border: 'border-emerald-500/20',
                label: 'Activo'
            },
            COMPLETED: {
                bg: 'bg-blue-500/10',
                text: 'text-blue-700',
                border: 'border-blue-500/20',
                label: 'Completado'
            },
            SUSPENDED: {
                bg: 'bg-red-500/10',
                text: 'text-red-700',
                border: 'border-red-500/20',
                label: 'Suspendido'
            },
            EXPIRED: {
                bg: 'bg-gray-500/10',
                text: 'text-gray-700',
                border: 'border-gray-500/20',
                label: 'Expirado'
            }
        };

        const badge = badges[status as keyof typeof badges] || badges.ACTIVE;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${badge.bg} ${badge.text} ${badge.border}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {badge.label}
            </span>
        );
    };

    // Determinar el estado del curso
    const getCourseStatus = () => {
        if (progressPercentage === 100) {
            return {
                icon: CheckCircle,
                text: 'Curso completado',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                iconBg: 'bg-emerald-100'
            };
        }
        if (progressPercentage > 0) {
            return {
                icon: Play,
                text: 'En progreso',
                color: 'text-[#00B4D8]',
                bg: 'bg-[#00B4D8]/5',
                iconBg: 'bg-[#00B4D8]/10'
            };
        }
        return {
            icon: BookOpen,
            text: 'Sin iniciar',
            color: 'text-[#001F3F]/40',
            bg: 'bg-gray-50',
            iconBg: 'bg-gray-100'
        };
    };

    const courseStatus = getCourseStatus();
    const StatusIcon = courseStatus.icon;

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#00B4D8]/20 transition-all duration-500 hover:shadow-xl hover:shadow-[#00B4D8]/5 hover:-translate-y-1">
            {/* Imagen del curso con overlay mejorado */}
            <div className="relative aspect-video bg-gradient-to-br from-[#001F3F] to-[#00364D] overflow-hidden">
                {enrollment.course.thumbnailUrl ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={enrollment.course.thumbnailUrl}
                            alt={enrollment.course.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                                // Fallback si la imagen falla al cargar
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-white/10" />
                    </div>
                )}

                {/* Badge de estado - Top Left */}
                <div className="absolute top-4 left-4 z-10">
                    {getStatusBadge(enrollment.status)}
                </div>

                {/* Badge de nivel - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-xs font-semibold text-[#001F3F] rounded-full shadow-lg">
                        <Target className="w-3 h-3" />
                        {enrollment.course.level || 'BEGINNER'}
                    </span>
                </div>

                {/* Barra de progreso compacta y elegante - Bottom */}
                {progressPercentage > 0 && (
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="bg-white/95 backdrop-blur-md rounded-lg p-3 shadow-lg border border-white/20">
                            {/* Header compacto del progreso */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${progressColors.bg}`}></div>
                                    <span className="text-[10px] font-semibold text-[#001F3F]">
                                        Progreso
                                    </span>
                                </div>
                                <span className={`text-xs font-bold ${progressColors.text}`}>
                                    {progressPercentage}%
                                </span>
                            </div>

                            {/* Barra de progreso delgada */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${progressColors.gradient} transition-all duration-1000 ease-out relative overflow-hidden`}
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido del curso */}
            <div className="p-6">
                {/* Título con efecto hover */}
                <h3 className="font-bold text-lg text-[#001F3F] mb-3 line-clamp-2 group-hover:text-[#00B4D8] transition-colors duration-300 leading-snug">
                    {enrollment.course.title}
                </h3>

                {/* Descripción */}
                {enrollment.course.description && (
                    <p className="text-sm text-[#001F3F]/60 mb-4 line-clamp-2 leading-relaxed">
                        {enrollment.course.description}
                    </p>
                )}

                {/* Instructor */}
                {enrollment.course.instructor && (
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#00B4D8]/10 to-[#00B4D8]/5 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-[#00B4D8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#001F3F]/50 mb-0.5">Instructor</p>
                            <p className="text-sm font-semibold text-[#001F3F] truncate">
                                {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                            </p>
                        </div>
                    </div>
                )}

                {/* Estadísticas del curso */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Módulos */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <BookOpen className="w-4 h-4 text-[#001F3F]/60" />
                        </div>
                        <div>
                            <p className="text-xs text-[#001F3F]/50 font-medium">Módulos</p>
                            <p className="text-sm font-bold text-[#001F3F]">
                                {enrollment.course._count?.modules || 0}
                            </p>
                        </div>
                    </div>

                    {/* Horas estimadas */}
                    {enrollment.course.estimatedHours && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Clock className="w-4 h-4 text-[#001F3F]/60" />
                            </div>
                            <div>
                                <p className="text-xs text-[#001F3F]/50 font-medium">Duración</p>
                                <p className="text-sm font-bold text-[#001F3F]">
                                    {enrollment.course.estimatedHours}h
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fecha de inscripción */}
                <div className="flex items-center gap-2 text-xs text-[#001F3F]/40 mb-5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="font-medium">
                        Inscrito el {formatDate(enrollment.enrolledAt)}
                    </span>
                </div>

                {/* Estado del curso */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 ${courseStatus.bg}`}>
                    <div className={`w-8 h-8 ${courseStatus.iconBg} rounded-lg flex items-center justify-center`}>
                        <StatusIcon className={`w-4 h-4 ${courseStatus.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${courseStatus.color}`}>
                        {courseStatus.text}
                    </span>
                </div>

                {/* Botón de acción mejorado */}
                <Link
                    href={`${ROUTES.STUDENT.COURSES}/${enrollment.course.id}`}
                    className="group/btn relative w-full overflow-hidden bg-gradient-to-r from-[#001F3F] to-[#00364D] hover:from-[#00B4D8] hover:to-[#0096C7] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-[#00B4D8]/20"
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>

                    <span className="relative">
                        {progressPercentage === 100
                            ? 'Revisar curso'
                            : progressPercentage > 0
                                ? 'Continuar aprendiendo'
                                : 'Comenzar curso'
                        }
                    </span>
                    <ChevronRight className="relative w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
            </div>
        </div>
    );
}