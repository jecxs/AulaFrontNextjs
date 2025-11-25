// src/components/student/CourseDetailHeader.tsx
'use client';

import { BookOpen, Users, Clock, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';

interface CourseDetailHeaderProps {
    course: any;
    modules: any[];
    progress: any;
    nextLesson: { lesson: any; module: any } | null;
    courseId: string;
}

export default function CourseDetailHeader({
                                               course,
                                               modules,
                                               progress,
                                               nextLesson,
                                               courseId,
                                           }: CourseDetailHeaderProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
                {/* Thumbnail lateral */}
                <div className="relative lg:w-96 h-64 lg:h-auto bg-gradient-to-br from-[#001F3F] to-[#003A6B] overflow-hidden group">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-24 h-24 text-[#00B4D8]/30" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    {nextLesson && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#001F3F]/20 hover:bg-[#001F3F]/30 transition-colors">
                            <Link
                                href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${nextLesson.lesson.id}`}
                                className="group/play"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#00B4D8]/20 rounded-full animate-ping" />
                                    <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-[#00B4D8] transition-all duration-300 hover:scale-110 shadow-2xl border-4 border-white/30">
                                        <Play className="w-9 h-9 text-[#001F3F] ml-1 group-hover/play:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Barra de progreso */}
                    {progress && progress.overall && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#001F3F]/60">
                            <div
                                className="h-full bg-[#00B4D8] shadow-lg shadow-[#00B4D8]/50 transition-all duration-700 ease-out"
                                style={{ width: `${progress.overall.completionPercentage}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Contenido principal */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                    <div className="space-y-5">
                        {/* Título y descripción */}
                        <div>
                            <h1 className="text-3xl font-bold text-[#001F3F] mb-3 leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-gray-700 leading-relaxed text-base">
                                {course.description}
                            </p>
                        </div>

                        {/* Metadata en grid compacto */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {course.instructor && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#001F3F] to-[#003A6B] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Instructor</div>
                                        <div className="font-semibold text-[#001F3F] text-sm">
                                            {course.instructor.firstName} {course.instructor.lastName}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    <BookOpen className="w-5 h-5 text-[#001F3F]" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Módulos</div>
                                    <div className="font-semibold text-[#001F3F] text-sm">{modules.length}</div>
                                </div>
                            </div>

                            {course.estimatedHours && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                        <Clock className="w-5 h-5 text-[#001F3F]" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Duración</div>
                                        <div className="font-semibold text-[#001F3F] text-sm">{course.estimatedHours} horas</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel de progreso y acción integrado */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            {/* Progreso compacto */}
                            {progress && progress.overall && (
                                <div className="flex-1 bg-gradient-to-br from-[#001F3F] to-[#003A6B] rounded-xl p-5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-white/80 mb-1">
                                            Progreso del curso
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-[#00B4D8]">
                                                {progress.overall.completionPercentage}%
                                            </span>
                                            <span className="text-sm text-white/70">
                                                ({progress.overall.completedLessons}/{progress.overall.totalLessons})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-20 h-20">
                                        <svg className="transform -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="8"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#00B4D8"
                                                strokeWidth="8"
                                                strokeDasharray={`${2 * Math.PI * 45}`}
                                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress.overall.completionPercentage / 100)}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-700"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Botón de acción */}
                            {nextLesson ? (
                                <Link
                                    href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${nextLesson.lesson.id}`}
                                    className="sm:w-64 bg-gradient-to-r from-[#00B4D8] to-[#00B4D8]/90 hover:from-[#00B4D8]/90 hover:to-[#00B4D8] text-[#001F3F] font-bold py-5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#00B4D8]/30 hover:shadow-xl hover:shadow-[#00B4D8]/40 group hover:scale-[1.02]"
                                >
                                    <span className="text-base">
                                        {progress?.overall?.completedLessons && progress.overall.completedLessons > 0
                                            ? 'Continuar curso'
                                            : 'Comenzar curso'}
                                    </span>
                                    <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform fill-[#001F3F]" />
                                </Link>
                            ) : (
                                <div className="sm:w-64 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold py-5 px-6 rounded-xl text-center shadow-lg flex items-center justify-center gap-2">
                                    <CheckCircle className="w-6 h-6" />
                                    <span>Curso completado</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}