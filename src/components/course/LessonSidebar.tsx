// src/components/course/LessonSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    CheckCircle,
    PlayCircle,
    FileText,
    BookOpen,
    Circle,
    Lock,
} from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';

interface LessonSidebarProps {
    courseId: string;
    courseTitle?: string;
    currentLessonId: string;
    modules: any[];
    progress: {
        completedLessons: string[];
        completedQuizzes: string[];
        quizAttempts: Record<string, any>;
    };
}

export default function LessonSidebar({
                                          courseId,
                                          courseTitle,
                                          currentLessonId,
                                          modules,
                                          progress,
                                      }: LessonSidebarProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(modules.map((m) => m.id))
    );

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    const getLessonIcon = (lesson: any) => {
        const isCompleted = progress.completedLessons.includes(lesson.id);

        if (isCompleted) {
            return <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={2} />;
        }

        switch (lesson.type) {
            case 'VIDEO':
                return <PlayCircle className="w-4 h-4 text-[#00B4D8]" strokeWidth={2} />;
            case 'TEXT':
                return <FileText className="w-4 h-4 text-gray-500" strokeWidth={2} />;
            default:
                return <BookOpen className="w-4 h-4 text-gray-500" strokeWidth={2} />;
        }
    };

    const getModuleProgress = (module: any) => {
        if (!module.lessons || module.lessons.length === 0) return 0;

        const completedCount = module.lessons.filter((lesson: any) =>
            progress.completedLessons.includes(lesson.id)
        ).length;

        return Math.round((completedCount / module.lessons.length) * 100);
    };

    return (
        <div className="h-full bg-[#001F3F] flex flex-col">
            {/* Header del sidebar */}
            <div className="p-5 border-b border-white/10">
                {courseTitle && (
                    <div className="mb-4">
                        <p className="text-xs text-white/50 font-medium mb-1 uppercase tracking-wide">
                            Curso
                        </p>
                        <h2 className="text-base font-bold text-white leading-snug">
                            {courseTitle}
                        </h2>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#00B4D8] rounded-full" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                        Contenido del curso
                    </h3>
                </div>
            </div>

            {/* Lista de módulos scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-3 space-y-2">
                    {modules.map((module, moduleIndex) => {
                        const moduleProgress = getModuleProgress(module);
                        const isExpanded = expandedModules.has(module.id);

                        return (
                            <div key={module.id} className="group/module">
                                {/* Header del módulo */}
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                    {/* Indicador de completado/número */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                moduleProgress === 100
                                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                    : 'bg-white/5 border border-white/10'
                                            }`}
                                        >
                                            {moduleProgress === 100 ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                                            ) : (
                                                <span className="text-xs font-bold text-white/80">
                                                    {moduleIndex + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Información del módulo */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-white mb-1 leading-snug group-hover/module:text-[#00B4D8] transition-colors">
                                            {module.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-white/50">
                                            <span>
                                                {module.lessons?.length || 0}{' '}
                                                {module.lessons?.length === 1 ? 'lección' : 'lecciones'}
                                            </span>
                                            {moduleProgress > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-[#00B4D8] font-medium">
                                                        {moduleProgress}%
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Icono de expansión */}
                                    <ChevronDown
                                        className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 mt-1 ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                        strokeWidth={2}
                                    />
                                </button>

                                {/* Lecciones */}
                                {isExpanded && module.lessons && module.lessons.length > 0 && (
                                    <div className="mt-1 ml-11 mr-2 space-y-0.5">
                                        {module.lessons.map((lesson: any) => {
                                            const isCompleted = progress.completedLessons.includes(lesson.id);
                                            const isCurrent = lesson.id === currentLessonId;

                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lesson.id}`}
                                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all group/lesson ${
                                                        isCurrent
                                                            ? 'bg-[#00B4D8]/15 border border-[#00B4D8]/30'
                                                            : 'hover:bg-white/5 border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        {getLessonIcon(lesson)}
                                                    </div>
                                                    <p
                                                        className={`text-sm flex-1 min-w-0 leading-snug transition-colors ${
                                                            isCurrent
                                                                ? 'text-[#00B4D8] font-medium'
                                                                : isCompleted
                                                                    ? 'text-white/60 group-hover/lesson:text-white/80'
                                                                    : 'text-white/80 group-hover/lesson:text-white'
                                                        }`}
                                                    >
                                                        {lesson.title}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Quizzes */}
                                {isExpanded && module.quizzes && module.quizzes.length > 0 && (
                                    <div className="mt-2 ml-11 mr-2 pt-2 border-t border-white/5 space-y-0.5">
                                        {module.quizzes.map((quiz: any) => {
                                            const isCompleted = progress.completedQuizzes.includes(quiz.id);
                                            const attemptInfo = progress.quizAttempts[quiz.id];

                                            return (
                                                <Link
                                                    key={quiz.id}
                                                    href={`${ROUTES.STUDENT.COURSES}/${courseId}/quizzes/${quiz.id}`}
                                                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-all group/quiz border border-transparent"
                                                >
                                                    <div className="flex-shrink-0">
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-[#00B4D8]" strokeWidth={2} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white/80 group-hover/quiz:text-white leading-snug">
                                                            {quiz.title}
                                                        </p>
                                                        {attemptInfo && attemptInfo.totalAttempts > 0 && (
                                                            <p className="text-xs text-white/40 mt-0.5">
                                                                Mejor: {attemptInfo.bestScore}%
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
            `}</style>
        </div>
    );
}