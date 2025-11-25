// src/app/(student)/student/courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { quizzesApi } from '@/lib/api/quizzes';
import {BookOpen, AlertCircle, Sheet} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import CourseDetailHeader from '@/components/student/CourseDetailHeader';
import CourseModule from '@/components/student/CourseModule';

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
                coursesApi.getMyCourseProgress(courseId).catch(() => null),
            ]);

            // Crear un Set de lecciones completadas desde el progreso
            const completedLessonIds = new Set<string>();
            if (progress?.modules) {
                progress.modules.forEach((moduleProgress: any) => {
                    if (moduleProgress.lessons) {
                        moduleProgress.lessons.forEach((lessonProgress: any) => {
                            if (lessonProgress.isCompleted) {
                                const lessonId = lessonProgress.lessonId;
                                if (lessonId) {
                                    completedLessonIds.add(lessonId);
                                }
                            }
                        });
                    }
                });
            }

            // Cargar lecciones y quizzes para cada módulo
            const modulesWithLessons = await Promise.all(
                modules.map(async (module: any) => {
                    try {
                        // Cargar lecciones y quizzes en paralelo
                        const [lessons, quizzes] = await Promise.all([
                            coursesApi.getModuleLessons(module.id),
                            quizzesApi.getByModule(module.id).catch(() => []),
                        ]);

                        // Marcar lecciones como completadas basándose en el progreso
                        const lessonsWithProgress = lessons.map((lesson: any) => ({
                            ...lesson,
                            isCompleted: completedLessonIds.has(lesson.id),
                        }));

                        return {
                            ...module,
                            lessons: lessonsWithProgress,
                            quizzes: quizzes || [],
                        };
                    } catch (error) {
                        console.error(`Error loading lessons for module ${module.id}:`, error);
                        return { ...module, lessons: [], quizzes: [] };
                    }
                })
            );

            setCourseData({
                course,
                modules: modulesWithLessons,
                progress,
                enrollment: null,
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

        const completedLessons = module.lessons.filter((lesson: any) => lesson.isCompleted)
            .length;
        return Math.round((completedLessons / module.lessons.length) * 100);
    };

    const isModuleCompleted = (module: any) => {
        if (!module.lessons.length) return false;
        return module.lessons.every((lesson: any) => lesson.isCompleted);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#00B4D8]/20 rounded-full blur-2xl" />
                        <LoadingSpinner size="lg" />
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Cargando curso...</p>
                </div>
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                        <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#001F3F] mb-3">
                        No se pudo cargar el curso
                    </h3>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={loadCourseData}
                        className="px-8 py-3.5 bg-[#00B4D8] text-white font-semibold rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-300 shadow-lg shadow-[#00B4D8]/20"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    const { course, modules, progress } = courseData;
    const nextLesson = getNextLesson();

    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalQuizzes = modules.reduce((acc, module) => acc + (module.quizzes?.length || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header del curso */}
            <CourseDetailHeader
                course={course}
                modules={modules}
                progress={progress}
                nextLesson={nextLesson}
                courseId={courseId}
            />

            {/* Contenido del curso */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header del contenido minimalista */}
                <div className="bg-[#001F3F] px-8 py-7 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-8 bg-[#00B4D8] rounded-full" />
                        <h2 className="text-2xl font-bold text-white">Contenido del curso</h2>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap ml-5">
                        <span className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl text-sm font-medium border border-gray-200">
                            <BookOpen className="w-4 h-4 text-[#00B4D8]" strokeWidth={2} />
                            <span className="text-gray-700">{modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}</span>
                        </span>

                        <span className="text-gray-300">•</span>

                        <span className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl text-sm font-medium border border-gray-200">
                            <Sheet className="w-4 h-4 text-[#00B4D8]" strokeWidth={2} />
                            <span className="text-gray-700">{totalLessons} {totalLessons === 1 ? 'lección' : 'lecciones'}</span>
                        </span>

                        {totalQuizzes > 0 && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl text-sm font-medium border border-gray-200">
                                    <span className="text-gray-700">{totalQuizzes} {totalQuizzes === 1 ? 'evaluación' : 'evaluaciones'}</span>
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Lista de módulos */}
                <div className="divide-y divide-gray-100">
                    {modules.map((module: any, moduleIndex: number) => (
                        <CourseModule
                            key={module.id}
                            module={module}
                            moduleIndex={moduleIndex}
                            courseId={courseId}
                            isExpanded={expandedModules.has(module.id)}
                            onToggle={() => toggleModuleExpansion(module.id)}
                            isModuleCompleted={isModuleCompleted(module)}
                            moduleProgress={getModuleProgress(module)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}