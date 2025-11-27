// src/components/student/CourseModule.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    ChevronDown,
    PlayCircle,
    FileText,
    BookOpen,
    ChevronRight,
    Clock,
    Circle,
} from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import QuizCard from './QuizCard';

interface CourseModuleProps {
    module: any;
    moduleIndex: number;
    courseId: string;
    isExpanded: boolean;
    onToggle: () => void;
    isModuleCompleted: boolean;
    moduleProgress: number;
}

export default function CourseModule({
                                         module,
                                         moduleIndex,
                                         courseId,
                                         isExpanded,
                                         onToggle,
                                         isModuleCompleted,
                                         moduleProgress,
                                     }: CourseModuleProps) {
    const getLessonIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) {
            return <CheckCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600" strokeWidth={2} />;
        }

        switch (type) {
            case 'VIDEO':
                return <PlayCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#00B4D8]" strokeWidth={2} />;
            case 'TEXT':
                return <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-500" strokeWidth={2} />;
            default:
                return <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-500" strokeWidth={2} />;
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes === 0) {
            return `${remainingSeconds}s`;
        }

        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="group/module overflow-hidden">
            {/* ✅ Header del módulo optimizado para móviles */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-all duration-200 min-w-0"
            >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* ✅ Indicador con tamaño ajustado */}
                    <div className="flex-shrink-0">
                        <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                moduleProgress === 100
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
                                    : 'bg-white border-2 border-gray-200'
                            }`}
                        >
                            {moduleProgress === 100 ? (
                                <CheckCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" strokeWidth={2.5} />
                            ) : (
                                <span className="text-sm font-bold text-[#001F3F]">
                                    {moduleIndex + 1}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ✅ Información del módulo con texto truncado */}
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                        <h3 className="font-semibold text-[#001F3F] text-base sm:text-lg mb-1 sm:mb-1.5 group-hover/module:text-[#00B4D8] transition-colors truncate">
                            {module.title}
                        </h3>

                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap max-w-full">
                            <span className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                                <span className="hidden sm:inline">
                                    {module.lessons.length}{' '}
                                    {module.lessons.length === 1 ? 'lección' : 'lecciones'}
                                </span>
                                <span className="sm:hidden">
                                    {module.lessons.length}
                                </span>
                            </span>

                            {module.quizzes && module.quizzes.length > 0 && (
                                <span className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                                    <span className="hidden sm:inline">
                                        {module.quizzes.length}{' '}
                                        {module.quizzes.length === 1 ? 'evaluación' : 'evaluaciones'}
                                    </span>
                                    <span className="sm:hidden">
                                        {module.quizzes.length} eval.
                                    </span>
                                </span>
                            )}

                            {/* ✅ Indicador de progreso compacto en móvil */}
                            {moduleProgress > 0 && moduleProgress < 100 && (
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 max-w-[120px]">
                                    <div className="w-8 sm:w-10 bg-gray-200 rounded-full h-1 overflow-hidden flex-shrink-0">
                                        <div
                                            className="bg-[#00B4D8] h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${moduleProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-semibold text-[#00B4D8]">
                                        {moduleProgress}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Icono de expansión */}
                <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 sm:ml-4 ${
                        isExpanded ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                />
            </button>

            {/* ✅ Contenido expandido con mejor espaciado en móviles */}
            {isExpanded && (
                <div className="mt-1 ml-8 sm:ml-16 mr-2 sm:mr-6 mb-4 sm:mb-5 space-y-1 overflow-hidden">
                    {/* Lecciones */}
                    {module.lessons.map((lesson: any, index: number) => (
                        <Link
                            key={lesson.id}
                            href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-gradient-to-r hover:from-[#00B4D8]/5 hover:to-transparent rounded-xl transition-all duration-200 group/lesson border border-transparent hover:border-[#00B4D8]/20"
                        >
                            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                                {/* Icono de estado */}
                                <div className="flex-shrink-0">
                                    {getLessonIcon(lesson.type, lesson.isCompleted)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm sm:text-base font-medium group-hover/lesson:text-[#00B4D8] transition-colors truncate ${
                                        lesson.isCompleted ? 'text-gray-600' : 'text-gray-900'
                                    }`}>
                                        {lesson.title}
                                    </h4>

                                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 flex-wrap">
                                        <span className="capitalize bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-md font-medium">
                                            {lesson.type.toLowerCase()}
                                        </span>
                                        {lesson.durationSec && (
                                            <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2} />
                                                {formatDuration(lesson.durationSec)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ChevronRight
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover/lesson:text-[#00B4D8] group-hover/lesson:translate-x-1 transition-all flex-shrink-0"
                                strokeWidth={2}
                            />
                        </Link>
                    ))}

                    {/* Quizzes */}
                    {module.quizzes && module.quizzes.length > 0 && (
                        <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100">
                            <div className="mb-2 sm:mb-2.5 flex items-center gap-2 px-2 sm:px-3">
                                <div className="w-1 h-3 sm:h-4 bg-[#00B4D8] rounded-full" />
                                <span className="text-[10px] sm:text-xs font-semibold text-[#001F3F] uppercase tracking-wide">
                                    Evaluaciones
                                </span>
                            </div>
                            <div className="space-y-1">
                                {module.quizzes.map((quiz: any) => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        courseId={courseId}
                                        isModuleCompleted={isModuleCompleted}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}