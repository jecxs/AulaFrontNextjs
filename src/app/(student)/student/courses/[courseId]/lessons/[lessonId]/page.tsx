// src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    BookOpen,
    Clock,
    FileText,
    PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

interface LessonData {
    lesson: any;
    course: any;
    module: any;
    navigation: {
        previousLesson: any | null;
        nextLesson: any | null;
    };
    progress: {
        isCompleted: boolean;
        completedAt?: string;
    };
}

export default function LessonPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const [lessonData, setLessonData] = useState<LessonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (courseId && lessonId) {
            loadLessonData();
        }
    }, [courseId, lessonId]);

    const loadLessonData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cargar datos de la lección
            const [lesson, course] = await Promise.all([
                coursesApi.getLesson(lessonId),
                coursesApi.getCourse(courseId)
            ]);

            // Cargar progreso de la lección
            let progress = { isCompleted: false };
            try {
                progress = await progressApi.checkLessonProgress(lessonId);
            } catch (error) {
                console.warn('Could not load lesson progress:', error);
            }

            // Cargar módulos para navegación
            const modules = await coursesApi.getCourseModules(courseId);
            const navigation = await buildNavigation(modules, lessonId);

            setLessonData({
                lesson,
                course,
                module: modules.find(m => m.id === lesson.moduleId),
                navigation,
                progress
            });

        } catch (err: any) {
            console.error('Error loading lesson data:', err);
            setError('Error al cargar la lección');
            toast.error('Error al cargar la lección');
        } finally {
            setIsLoading(false);
        }
    };

    const buildNavigation = async (modules: any[], currentLessonId: string) => {
        const allLessons = [];

        // Obtener todas las lecciones ordenadas
        for (const module of modules) {
            try {
                const lessons = await coursesApi.getModuleLessons(module.id);
                allLessons.push(...lessons.map(lesson => ({ ...lesson, moduleId: module.id })));
            } catch (error) {
                console.error(`Error loading lessons for module ${module.id}:`, error);
            }
        }

        // Encontrar la lección actual y sus vecinas
        const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);

        return {
            previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
        };
    };

    // ✅ NUEVA FUNCIÓN SIMPLIFICADA - Completar y continuar
    const handleCompleteAndContinue = async () => {
        if (!lessonData || lessonData.progress.isCompleted) return;

        setIsCompleting(true);
        try {
            // Marcar como completada
            const result = await progressApi.markLessonComplete(lessonId);

            // Actualizar estado local
            setLessonData(prev => prev ? {
                ...prev,
                progress: { isCompleted: true, completedAt: new Date().toISOString() }
            } : null);

            toast.success('¡Lección completada!');

            // Mostrar progreso del curso
            if (result.courseProgress) {
                toast.success(
                    `Progreso del curso: ${result.courseProgress.progressPercentage}%`,
                    { duration: 3000 }
                );
            }

            // Navegar a la siguiente lección automáticamente después de 1 segundo
            setTimeout(() => {
                if (lessonData.navigation.nextLesson) {
                    router.push(
                        `${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lessonData.navigation.nextLesson.id}`
                    );
                } else {
                    // Si no hay siguiente lección, volver al curso
                    router.push(`${ROUTES.STUDENT.COURSES}/${courseId}`);
                    toast.success('¡Curso completado! 🎉');
                }
            }, 1000);

        } catch (error: any) {
            console.error('Error completing lesson:', error);
            toast.error('Error al completar la lección');
        } finally {
            setIsCompleting(false);
        }
    };

    const navigateToLesson = (targetLessonId: string) => {
        router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${targetLessonId}`);
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !lessonData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Error al cargar la lección
                    </h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={loadLessonData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    const { lesson, course, module, navigation, progress } = lessonData;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`${ROUTES.STUDENT.COURSES}/${courseId}`}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <p className="text-xs text-gray-400">{module?.title}</p>
                                <h1 className="text-lg font-semibold">{lesson.title}</h1>
                            </div>
                        </div>

                        {/* Indicador de completado */}
                        {progress.isCompleted && (
                            <div className="flex items-center space-x-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Completada</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Área de contenido de la lección */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contenedor del video o PDF */}
                        <div className="bg-black rounded-lg overflow-hidden">
                            {lesson.type === 'VIDEO' && lesson.videoUrl && (
                                <video
                                    src={lesson.videoUrl}
                                    controls
                                    className="w-full aspect-video"
                                    controlsList="nodownload"
                                >
                                    Tu navegador no soporta el elemento de video.
                                </video>
                            )}

                            {lesson.type === 'TEXT' && lesson.pdfUrl && (
                                <iframe
                                    src={lesson.pdfUrl}
                                    className="w-full h-[600px]"
                                    title={lesson.title}
                                />
                            )}

                            {lesson.type === 'TEXT' && lesson.markdownContent && !lesson.pdfUrl && (
                                <div className="bg-white text-gray-900 p-8">
                                    <div className="prose max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: lesson.markdownContent }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ✅ BOTÓN PRINCIPAL: "Completar y Continuar" */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            {!progress.isCompleted ? (
                                <button
                                    onClick={handleCompleteAndContinue}
                                    disabled={isCompleting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                                             text-white font-semibold py-4 px-6 rounded-lg
                                             transition-colors flex items-center justify-center space-x-2"
                                >
                                    {isCompleting ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span>Completando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Completar y Continuar</span>
                                            {navigation.nextLesson && (
                                                <ChevronRight className="w-5 h-5" />
                                            )}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center">
                                    <div className="inline-flex items-center space-x-2 text-green-400 mb-4">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-semibold">Lección completada</span>
                                    </div>
                                    {navigation.nextLesson && (
                                        <button
                                            onClick={() => navigateToLesson(navigation.nextLesson.id)}
                                            className="w-full bg-gray-700 hover:bg-gray-600 text-white
                                                     font-medium py-3 px-6 rounded-lg transition-colors
                                                     flex items-center justify-center space-x-2"
                                        >
                                            <span>Siguiente lección</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Descripción de la lección */}
                        {lesson.description && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Descripción</h2>
                                <p className="text-gray-300 leading-relaxed">{lesson.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Barra lateral */}
                    <div className="space-y-6">
                        {/* Información de la lección */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Información</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center space-x-3 text-gray-300">
                                    {lesson.type === 'VIDEO' ? (
                                        <PlayCircle className="w-5 h-5" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                    <span className="capitalize">{lesson.type.toLowerCase()}</span>
                                </div>
                                {lesson.durationSec && (
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <Clock className="w-5 h-5" />
                                        <span>{formatDuration(lesson.durationSec)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navegación */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Navegación</h3>
                            <div className="space-y-3">
                                {navigation.previousLesson ? (
                                    <button
                                        onClick={() => navigateToLesson(navigation.previousLesson.id)}
                                        className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600
                                                 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wide">
                                                    Anterior
                                                </p>
                                                <p className="text-white text-sm font-medium">
                                                    {navigation.previousLesson.title}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="p-3 bg-gray-700/50 rounded-lg">
                                        <p className="text-gray-500 text-sm">Primera lección del curso</p>
                                    </div>
                                )}

                                {navigation.nextLesson ? (
                                    <button
                                        onClick={() => navigateToLesson(navigation.nextLesson.id)}
                                        className="w-full text-left p-3 bg-blue-600 hover:bg-blue-700
                                                 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-200 text-xs uppercase tracking-wide">
                                                    Siguiente
                                                </p>
                                                <p className="text-white text-sm font-medium">
                                                    {navigation.nextLesson.title}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-blue-200 group-hover:text-white" />
                                        </div>
                                    </button>
                                ) : (
                                    <div className="p-3 bg-gray-700/50 rounded-lg">
                                        <p className="text-gray-500 text-sm">Última lección del curso</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}