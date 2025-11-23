// src/app/(student)/student/courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import {
    BookOpen,
    Clock,
    Users,
    Play,
    CheckCircle,
    Lock,
    ChevronRight,
    ChevronDown,
    PlayCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

interface CourseData {
    course: any;
    modules: any[];
    progress: any;
    enrollment: any;
}

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const queryClient = useQueryClient();

    const [courseData, setCourseData] = useState<CourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (courseId) {
            loadCourseData();
        }
    }, [courseId]);

    // Escuchar cambios en el progreso del curso para refrescar automáticamente
    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (
                event?.query?.queryKey?.[0] === 'course-progress' ||
                event?.query?.queryKey?.[0] === 'student-course-progress' ||
                event?.query?.queryKey?.[0] === 'student-enrollments'
            ) {
                // Refrescar datos del curso cuando cambie el progreso
                if (courseId) {
                    loadCourseData();
                }
            }
        });

        return () => unsubscribe();
    }, [courseId, queryClient]);

    const loadCourseData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cargar datos del curso en paralelo
            const [course, modules, progress] = await Promise.all([
                coursesApi.getCourse(courseId),
                coursesApi.getCourseModules(courseId),
                coursesApi.getMyCourseProgress(courseId).catch(() => null)
            ]);

            // Crear un Set de lecciones completadas desde el progreso
            const completedLessonIds = new Set<string>();
            if (progress?.modules) {
                progress.modules.forEach((moduleProgress: any) => {
                    if (moduleProgress.lessons) {
                        moduleProgress.lessons.forEach((lessonProgress: any) => {
                            if (lessonProgress.isCompleted) {
                                // Backend devuelve "lessonId" directamente, no "lesson.id"
                                const lessonId = lessonProgress.lessonId;
                                if (lessonId) {
                                    completedLessonIds.add(lessonId);
                                }
                            }
                        });
                    }
                });
            }

            // Cargar lecciones para cada módulo y marcar como completadas
            const modulesWithLessons = await Promise.all(
                modules.map(async (module: any) => {
                    try {
                        const lessons = await coursesApi.getModuleLessons(module.id);
                        // Marcar lecciones como completadas basándose en el progreso
                        const lessonsWithProgress = lessons.map((lesson: any) => ({
                            ...lesson,
                            isCompleted: completedLessonIds.has(lesson.id)
                        }));
                        return { ...module, lessons: lessonsWithProgress };
                    } catch (error) {
                        console.error(`Error loading lessons for module ${module.id}:`, error);
                        return { ...module, lessons: [] };
                    }
                })
            );

            setCourseData({
                course,
                modules: modulesWithLessons,
                progress,
                enrollment: null // Se podría cargar si es necesario
            });

            // Expandir el primer módulo por defecto
            if (modulesWithLessons.length > 0) {
                setExpandedModules(new Set([modulesWithLessons[0].id]));
            }

        } catch (err: any) {
            console.error('Error loading course data:', err);
            setError('Error al cargar el curso');
            toast.error('Error al cargar el curso');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModuleExpansion = (moduleId: string) => {
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

    const getLessonIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) {
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        }

        switch (type) {
            case 'VIDEO':
                return <PlayCircle className="w-4 h-4 text-blue-600" />;
            case 'TEXT':
                return <FileText className="w-4 h-4 text-gray-600" />;
            default:
                return <BookOpen className="w-4 h-4 text-gray-600" />;
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

    const getNextLesson = () => {
        if (!courseData) return null;

        for (const module of courseData.modules) {
            for (const lesson of module.lessons) {
                if (!lesson.isCompleted) {
                    return { lesson, module };
                }
            }
        }
        return null;
    };

    const getModuleProgress = (module: any) => {
        if (!module.lessons.length) return 0;

        const completedLessons = module.lessons.filter((lesson: any) => lesson.isCompleted).length;
        return Math.round((completedLessons / module.lessons.length) * 100);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error al cargar el curso
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadCourseData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    const { course, modules, progress } = courseData;
    const nextLesson = getNextLesson();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header del curso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/80" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    {nextLesson && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Link
                                href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${nextLesson.lesson.id}`}
                                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors group"
                            >
                                <Play className="w-8 h-8 text-blue-600 ml-1 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                {course.title}
                            </h1>

                            <p className="text-gray-600 mb-4 leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>
                                        {course.instructor.firstName} {course.instructor.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <span>{modules.length} módulos</span>
                                </div>
                                {course.estimatedHours && (
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{course.estimatedHours} horas</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progreso y acción */}
                        <div className="lg:w-80">
                            {progress && progress.overall && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Progreso del curso
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {progress.overall.completionPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress.overall.completionPercentage}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        {progress.overall.completedLessons} de {progress.overall.totalLessons} lecciones completadas
                                    </div>
                                </div>
                            )}

                            {nextLesson ? (
                                <Link
                                    href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${nextLesson.lesson.id}`}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
                                >
                                    {progress?.overall?.completedLessons && progress.overall.completedLessons > 0 ? 'Continuar curso' : 'Comenzar curso'}
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <div className="w-full bg-green-100 text-green-800 font-medium py-3 px-4 rounded-lg text-center">
                                    <CheckCircle className="w-5 h-5 inline mr-2" />
                                    Curso completado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido del curso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Contenido del curso</h2>
                    <p className="text-gray-600 mt-1">
                        {modules.length} módulos • {modules.reduce((acc, module) => acc + module.lessons.length, 0)} lecciones
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {modules.map((module: any, moduleIndex: number) => {
                        const isExpanded = expandedModules.has(module.id);
                        const moduleProgress = getModuleProgress(module);

                        return (
                            <div key={module.id} className="p-6">
                                {/* Header del módulo */}
                                <button
                                    onClick={() => toggleModuleExpansion(module.id)}
                                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                moduleProgress === 100
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {moduleProgress === 100 ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-sm font-medium">{moduleIndex + 1}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {module.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                <span>{module.lessons.length} lecciones</span>
                                                <span>{moduleProgress}% completado</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                                        isExpanded ? 'rotate-180' : ''
                                    }`} />
                                </button>

                                {/* Lecciones del módulo */}
                                {isExpanded && (
                                    <div className="mt-4 ml-12 space-y-2">
                                        {module.lessons.map((lesson: any, lessonIndex: number) => (
                                            <Link
                                                key={lesson.id}
                                                href={`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lesson.id}`}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {getLessonIcon(lesson.type, lesson.isCompleted)}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {lesson.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                                            <span className="capitalize">{lesson.type.toLowerCase()}</span>
                                                            {lesson.durationSec && (
                                                                <span>{formatDuration(lesson.durationSec)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}