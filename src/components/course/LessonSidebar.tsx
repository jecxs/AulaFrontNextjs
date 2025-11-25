// src/components/course/LessonSidebar.tsx (FIXED - Con soporte para Quizzes)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    Circle,
    PlayCircle,
    FileText,
    ChevronDown,
    ChevronRight,
    Award
} from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';

interface LessonSidebarProps {
    courseId: string;
    currentLessonId: string;
    modules: Array<{
        id: string;
        title: string;
        order: number;
        lessons: Array<{
            id: string;
            title: string;
            type: 'VIDEO' | 'TEXT';
            order: number;
            durationSec?: number;
        }>;
        quizzes?: Array<{
            id: string;
            title: string;
            passingScore?: number;
        }>;
    }>;
    progress: {
        completedLessons: string[]; // Array de IDs de lecciones completadas
        completedQuizzes: string[]; // Array de IDs de quizzes completados (con al menos un intento aprobado)
        quizAttempts?: Record<string, {
            passed: boolean;
            bestScore: number;
            totalAttempts: number;
        }>; // Información detallada de intentos por quizId
    };
}

export default function LessonSidebar({
                                          courseId,
                                          currentLessonId,
                                          modules,
                                          progress
                                      }: LessonSidebarProps) {
    const router = useRouter();
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const currentLessonRef = useRef<HTMLDivElement>(null);

    // Auto-expandir el módulo actual al cargar
    useEffect(() => {
        const currentModule = modules.find(m =>
            m.lessons.some(l => l.id === currentLessonId)
        );
        if (currentModule) {
            setExpandedModules(new Set([currentModule.id]));
        }
    }, [currentLessonId, modules]);

    // Auto-scroll hacia la lección actual
    useEffect(() => {
        if (currentLessonRef.current) {
            currentLessonRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentLessonId]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    const navigateToLesson = (lessonId: string) => {
        router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lessonId}`);
    };

    const navigateToQuiz = (quizId: string) => {
        // Si el quiz ya fue completado (tiene al menos un intento aprobado), ir a resultados
        const quizAttempt = progress.quizAttempts?.[quizId];

        if (quizAttempt && quizAttempt.passed) {
            // Ya tiene un intento aprobado, ir a resultados
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/quizzes/${quizId}/results`);
        } else {
            // No ha aprobado o no tiene intentos, ir a realizar el quiz
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/quizzes/${quizId}`);
        }
    };

    const isLessonCompleted = (lessonId: string) => {
        return progress.completedLessons.includes(lessonId);
    };

    const isQuizCompleted = (quizId: string) => {
        // Un quiz está completado si tiene al menos un intento aprobado
        return progress.completedQuizzes?.includes(quizId) || false;
    };

    const getQuizStatus = (quizId: string) => {
        const quizAttempt = progress.quizAttempts?.[quizId];

        if (!quizAttempt || quizAttempt.totalAttempts === 0) {
            return { status: 'pending', text: 'Sin intentos' };
        }

        if (quizAttempt.passed) {
            return {
                status: 'passed',
                text: `Aprobado (${quizAttempt.bestScore}%)`
            };
        }

        return {
            status: 'failed',
            text: `${quizAttempt.totalAttempts} ${quizAttempt.totalAttempts === 1 ? 'intento' : 'intentos'}`
        };
    };

    const getModuleProgress = (module: any) => {
        const totalItems = module.lessons.length + (module.quizzes?.length || 0);
        const completedLessons = module.lessons.filter((l: any) =>
            isLessonCompleted(l.id)
        ).length;
        const completedQuizzes = module.quizzes?.filter((q: any) =>
            isQuizCompleted(q.id)
        ).length || 0;
        const completed = completedLessons + completedQuizzes;
        return { completed, total: totalItems, percentage: Math.round((completed / totalItems) * 100) };
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white mb-1">Contenido del curso</h3>
                <p className="text-xs text-gray-400">
                    {progress.completedLessons.length} de{' '}
                    {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lecciones completadas
                </p>
                {progress.completedQuizzes && progress.completedQuizzes.length > 0 && (
                    <p className="text-xs text-gray-400">
                        {progress.completedQuizzes.length} de{' '}
                        {modules.reduce((acc, m) => acc + (m.quizzes?.length || 0), 0)} evaluaciones aprobadas
                    </p>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-2">
                    {modules.map((module, moduleIndex) => {
                        const isExpanded = expandedModules.has(module.id);
                        const moduleProgress = getModuleProgress(module);
                        const isModuleComplete = moduleProgress.percentage === 100;

                        return (
                            <div key={module.id} className="space-y-1">
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-medium text-gray-400">
                                                    Módulo {moduleIndex + 1}
                                                </span>
                                                {isModuleComplete && (
                                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-white truncate">
                                                {module.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        <span className="text-xs text-gray-400">
                                            {moduleProgress.completed}/{moduleProgress.total}
                                        </span>
                                    </div>
                                </button>

                                {/* Module Progress Bar */}
                                {isExpanded && (
                                    <div className="px-3 pb-2">
                                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${moduleProgress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Lessons & Quizzes */}
                                {isExpanded && (
                                    <div className="ml-6 space-y-1 relative">
                                        {/* Vertical Progress Line */}
                                        <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gray-700" />

                                        {/* Lessons */}
                                        {module.lessons.map((lesson, lessonIndex) => {
                                            const isCompleted = isLessonCompleted(lesson.id);
                                            const isCurrent = lesson.id === currentLessonId;

                                            return (
                                                <div
                                                    key={lesson.id}
                                                    ref={isCurrent ? currentLessonRef : null}
                                                    className="relative"
                                                >
                                                    {/* Progress Dot */}
                                                    <div className="absolute left-0 top-3 -translate-x-[5px] z-10">
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400 bg-gray-800 rounded-full" />
                                                        ) : isCurrent ? (
                                                            <Circle className="w-5 h-5 text-blue-400 bg-gray-800 rounded-full fill-blue-400" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-600 bg-gray-800 rounded-full" />
                                                        )}
                                                    </div>

                                                    {/* Lesson Button */}
                                                    <button
                                                        onClick={() => navigateToLesson(lesson.id)}
                                                        className={`w-full text-left pl-6 pr-3 py-2.5 rounded-lg transition-all ${
                                                            isCurrent
                                                                ? 'bg-blue-600/20 border border-blue-500/50'
                                                                : isCompleted
                                                                    ? 'hover:bg-gray-700/50'
                                                                    : 'hover:bg-gray-700/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    {lesson.type === 'VIDEO' ? (
                                                                        <PlayCircle className={`w-4 h-4 flex-shrink-0 ${
                                                                            isCurrent ? 'text-blue-400' : 'text-gray-400'
                                                                        }`} />
                                                                    ) : (
                                                                        <FileText className={`w-4 h-4 flex-shrink-0 ${
                                                                            isCurrent ? 'text-blue-400' : 'text-gray-400'
                                                                        }`} />
                                                                    )}
                                                                    <span className={`text-xs font-medium ${
                                                                        isCurrent ? 'text-blue-400' : 'text-gray-500'
                                                                    }`}>
                                                                        Lección {lessonIndex + 1}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-sm ${
                                                                    isCurrent
                                                                        ? 'text-white font-medium'
                                                                        : isCompleted
                                                                            ? 'text-gray-300'
                                                                            : 'text-gray-400'
                                                                }`}>
                                                                    {lesson.title}
                                                                </p>
                                                                {lesson.durationSec && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {formatDuration(lesson.durationSec)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isCompleted && !isCurrent && (
                                                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />
                                                            )}
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Quizzes */}
                                        {module.quizzes && module.quizzes.length > 0 && module.quizzes.map((quiz) => {
                                            const isCompleted = isQuizCompleted(quiz.id);
                                            const quizStatus = getQuizStatus(quiz.id);

                                            return (
                                                <div key={quiz.id} className="relative">
                                                    {/* Progress Dot */}
                                                    <div className="absolute left-0 top-3 -translate-x-[5px] z-10">
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400 bg-gray-800 rounded-full" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-purple-400 bg-gray-800 rounded-full" />
                                                        )}
                                                    </div>

                                                    {/* Quiz Button */}
                                                    <button
                                                        onClick={() => navigateToQuiz(quiz.id)}
                                                        className={`w-full text-left pl-6 pr-3 py-2.5 rounded-lg transition-all ${
                                                            isCompleted
                                                                ? 'bg-green-900/20 border border-green-500/30 hover:bg-green-900/30'
                                                                : quizStatus.status === 'failed'
                                                                    ? 'bg-orange-900/20 border border-orange-500/30 hover:bg-orange-900/30'
                                                                    : 'bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Award className={`w-4 h-4 flex-shrink-0 ${
                                                                        isCompleted
                                                                            ? 'text-green-400'
                                                                            : quizStatus.status === 'failed'
                                                                                ? 'text-orange-400'
                                                                                : 'text-purple-400'
                                                                    }`} />
                                                                    <span className={`text-xs font-medium ${
                                                                        isCompleted
                                                                            ? 'text-green-400'
                                                                            : quizStatus.status === 'failed'
                                                                                ? 'text-orange-400'
                                                                                : 'text-purple-400'
                                                                    }`}>
                                                                        Evaluación
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-300 mb-1">
                                                                    {quiz.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {quizStatus.text}
                                                                </p>
                                                            </div>
                                                            {isCompleted && (
                                                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />
                                                            )}
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
            `}</style>
        </div>
    );
}