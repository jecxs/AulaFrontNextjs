// src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { useMarkLessonComplete } from '@/hooks/use-student-courses';

import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    BookOpen,
    Clock,
    FileText,
    PlayCircle,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import VideoPlayer from '@/components/course/VideoPlayer';
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
    const [error, setError] = useState<string | null>(null);

    // Hook para marcar como completada
    const markLessonCompleteMutation = useMarkLessonComplete();

    useEffect(() => {
        if (courseId && lessonId) {
            loadLessonData();
        }
    }, [courseId, lessonId]);

    const loadLessonData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // ✅ USAR APICLIENT - Mantiene el token automáticamente
            const lesson = await coursesApi.getLesson(lessonId);
            console.log('📚 Lesson data:', lesson); // Debug

            const course = await coursesApi.getCourse(courseId);

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
        const allLessons: any[] = [];

        for (const module of modules) {
            try {
                const lessons = await coursesApi.getModuleLessons(module.id);
                allLessons.push(...lessons.map(lesson => ({ ...lesson, moduleId: module.id })));
            } catch (error) {
                console.error(`Error loading lessons for module ${module.id}:`, error);
            }
        }

        const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);

        return {
            previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
        };
    };

    // ✅ Función para completar y continuar
    const handleCompleteAndContinue = async () => {
        if (!lessonData) return;

        // Si ya está completada, solo navegar
        if (lessonData.progress.isCompleted) {
            navigateToNextOrCourse();
            return;
        }

        try {
            await markLessonCompleteMutation.mutateAsync({
                lessonId,
                score: undefined
            });

            // Actualizar estado local
            setLessonData(prev => prev ? {
                ...prev,
                progress: { isCompleted: true, completedAt: new Date().toISOString() }
            } : null);

            // Navegar después de un momento
            setTimeout(() => {
                navigateToNextOrCourse();
            }, 800);

        } catch (error: any) {
            console.error('Error completing lesson:', error);
            toast.error('Error al completar la lección');
        }
    };

    const navigateToNextOrCourse = () => {
        if (lessonData?.navigation.nextLesson) {
            router.push(
                `${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${lessonData.navigation.nextLesson.id}`
            );
        } else {
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}`);
            toast.success('¡Curso completado! 🎉', { duration: 4000 });
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

    // ✅ Obtener el primer PDF de los recursos
    const getPdfResource = () => {
        if (!lessonData?.lesson.resources) return null;
        return lessonData.lesson.resources.find((r: any) =>
            r.fileType === 'application/pdf' || r.isPdf
        );
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
    const pdfResource = getPdfResource();

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
                                <span className="text-sm font-medium">Lección completada</span>
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
                        {/* ✅ REPRODUCTOR DE VIDEO */}
                        {lesson.type === 'VIDEO' && lesson.videoUrl && (
                            <VideoPlayer
                                src={lesson.videoUrl}
                                onTimeUpdate={(time) => {
                                    // Opcional: Guardar progreso del video
                                    console.log('Video progress:', time);
                                }}
                                onEnded={() => {
                                    // Opcional: Marcar como completada cuando termine el video
                                    console.log('Video ended');
                                    toast.success('¡Video completado! 🎉');
                                }}
                                className="w-full"
                            />
                        )}

                        {/* ✅ VISOR DE PDF CON DESCARGA */}
                        {lesson.type === 'TEXT' && pdfResource && (
                            <div className="bg-white rounded-lg overflow-hidden">
                                {/* Header con botón de descarga */}
                                <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">{pdfResource.fileName}</span>
                                    </div>
                                    <a
                                        href={pdfResource.fileUrl}
                                        download={pdfResource.fileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Descargar PDF</span>
                                    </a>
                                </div>

                                {/* Visor de PDF */}
                                <iframe
                                    src={`${pdfResource.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                    className="w-full h-[700px]"
                                    title={lesson.title}
                                />
                            </div>
                        )}

                        {/* ✅ CONTENIDO MARKDOWN */}
                        {lesson.type === 'TEXT' && lesson.markdownContent && !pdfResource && (
                            <div className="bg-white rounded-lg p-8">
                                <div className="prose prose-lg max-w-none text-gray-900">
                                    <div dangerouslySetInnerHTML={{ __html: lesson.markdownContent }} />
                                </div>
                            </div>
                        )}

                        {/* ✅ MENSAJE SI NO HAY CONTENIDO */}
                        {lesson.type === 'TEXT' && !pdfResource && !lesson.markdownContent && (
                            <div className="bg-gray-800 rounded-lg p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                    Esta lección incluye un PDF
                                </h3>
                                <p className="text-gray-500">
                                    El contenido está siendo cargado
                                </p>
                            </div>
                        )}

                        {/* ✅ BOTÓN QUE CAMBIA SEGÚN EL ESTADO */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <button
                                onClick={handleCompleteAndContinue}
                                disabled={markLessonCompleteMutation.isPending}
                                className={`w-full font-semibold py-4 px-6 rounded-lg 
                                         transition-colors flex items-center justify-center space-x-2
                                         disabled:cursor-not-allowed ${
                                    progress.isCompleted
                                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                                        : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                                } text-white`}
                            >
                                {markLessonCompleteMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Completando...</span>
                                    </>
                                ) : progress.isCompleted ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Continuar</span>
                                        {navigation.nextLesson && (
                                            <ChevronRight className="w-5 h-5" />
                                        )}
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

                            {/* Mensaje adicional si está completada */}
                            {progress.isCompleted && (
                                <p className="text-center text-sm text-gray-400 mt-3">
                                    ✓ Lección marcada como completada
                                    {progress.completedAt && (
                                        <span className="block mt-1">
                                            {new Date(progress.completedAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </p>
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
                                        <PlayCircle className="w-5 h-5 text-blue-400" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-green-400" />
                                    )}
                                    <span className="capitalize">
                                        {lesson.type === 'VIDEO' ? 'Video' : 'Texto'}
                                    </span>
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
                                                <p className="text-white text-sm font-medium line-clamp-1">
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
                                                <p className="text-white text-sm font-medium line-clamp-1">
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