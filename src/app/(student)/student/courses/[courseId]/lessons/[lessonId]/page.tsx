// src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { quizzesApi } from '@/lib/api/quizzes';
import { useMarkLessonComplete } from '@/hooks/use-student-courses';

import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    BookOpen,
    FileText,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import VideoPlayer from '@/components/course/VideoPlayer';
import LessonSidebar from '@/components/course/LessonSidebar';
import { toast } from 'react-hot-toast';

// ========== INTERFACES ==========
interface ModuleWithLessons {
    id: string;
    title: string;
    description?: string;
    order: number;
    isRequired: boolean;
    courseId: string;
    lessons: any[];
    quizzes: any[];
}

interface NavigationData {
    previousLesson: any | null;
    nextLesson: any | null;
    nextItem: { type: 'lesson' | 'quiz'; id: string } | null;
}

interface ProgressData {
    isCompleted: boolean;
    completedAt?: string;
}

interface QuizAttemptInfo {
    passed: boolean;
    bestScore: number;
    totalAttempts: number;
}

interface CourseProgressData {
    completedLessons: string[];
    completedQuizzes: string[];
    quizAttempts: Record<string, QuizAttemptInfo>;
}

interface LessonData {
    lesson: any;
    course: any;
    currentModule: any;
    modules: ModuleWithLessons[];
    moduleQuizzes: any[];
    navigation: NavigationData;
    progress: ProgressData;
    courseProgress: CourseProgressData;
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
            setLessonData(null);
            setIsLoading(true);
            loadLessonData();
        }
    }, [courseId, lessonId]);

    const loadLessonData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cargar datos de la lección
            const lesson = await coursesApi.getLesson(lessonId);
            console.log('📚 Lesson data:', lesson);

            const course = await coursesApi.getCourse(courseId);

            // Cargar progreso de la lección
            let progress: ProgressData = { isCompleted: false };
            try {
                progress = await progressApi.checkLessonProgress(lessonId);
            } catch (err) {
                console.warn('Could not load lesson progress:', err);
            }

            // Cargar módulos completos con lecciones y quizzes para la navegación
            const modules = await coursesApi.getCourseModules(courseId);

            // Enriquecer módulos con sus lecciones y quizzes
            const enrichedModules: ModuleWithLessons[] = await Promise.all(
                modules.map(async (mod) => {
                    try {
                        const lessons = await coursesApi.getModuleLessons(mod.id);
                        let quizzes: any[] = [];
                        try {
                            quizzes = await quizzesApi.getByModule(mod.id);
                        } catch (err) {
                            console.warn(`Could not load quizzes for module ${mod.id}:`, err);
                        }
                        return {
                            ...mod,
                            lessons,
                            quizzes
                        };
                    } catch (err) {
                        console.error(`Error loading lessons for module ${mod.id}:`, err);
                        return {
                            ...mod,
                            lessons: [],
                            quizzes: []
                        };
                    }
                })
            );

            // Cargar progreso completo del curso
            const courseProgress: CourseProgressData = {
                completedLessons: [],
                completedQuizzes: [],
                quizAttempts: {}
            };

            try {
                const fullProgress = await progressApi.getCourseProgress(courseId);
                // Extraer IDs de lecciones completadas del progreso
                courseProgress.completedLessons = fullProgress.modules
                    .flatMap((m: any) => m.lessons)
                    .filter((l: any) => l.isCompleted)
                    .map((l: any) => l.lessonId);
            } catch (err) {
                console.warn('Could not load course progress:', err);
            }

            // ✅ NUEVO: Cargar información de intentos de todos los quizzes del curso
            const allQuizzes = enrichedModules.flatMap(m => m.quizzes || []);

            await Promise.all(
                allQuizzes.map(async (quiz) => {
                    try {
                        const attempts = await quizzesApi.getMyAttempts(quiz.id);

                        // Agregar a la lista de completados si pasó
                        if (attempts.passed) {
                            courseProgress.completedQuizzes.push(quiz.id);
                        }

                        // Guardar información detallada del intento
                        courseProgress.quizAttempts[quiz.id] = {
                            passed: attempts.passed,
                            bestScore: attempts.bestPercentage,
                            totalAttempts: attempts.totalAttempts
                        };
                    } catch (err) {
                        console.warn(`Could not load attempts for quiz ${quiz.id}:`, err);
                        // Si hay error, asumir que no tiene intentos
                        courseProgress.quizAttempts[quiz.id] = {
                            passed: false,
                            bestScore: 0,
                            totalAttempts: 0
                        };
                    }
                })
            );

            console.log('📊 Course Progress:', courseProgress);

            // Cargar quizzes del módulo actual
            let moduleQuizzes: any[] = [];
            try {
                moduleQuizzes = await quizzesApi.getByModule(lesson.moduleId);
            } catch (err) {
                console.warn('Could not load module quizzes:', err);
            }

            const navigation = await buildNavigation(
                enrichedModules,
                lessonId,
                lesson.moduleId,
                moduleQuizzes
            );

            // Encontrar el módulo actual
            const currentModule = modules.find(m => m.id === lesson.moduleId);

            setLessonData({
                lesson,
                course,
                currentModule: currentModule || null,
                modules: enrichedModules,
                moduleQuizzes,
                navigation,
                progress,
                courseProgress
            });

        } catch (err: any) {
            console.error('Error loading lesson data:', err);
            setError('Error al cargar la lección');
            toast.error('Error al cargar la lección');
        } finally {
            setIsLoading(false);
        }
    };

    const buildNavigation = async (
        modules: ModuleWithLessons[],
        currentLessonId: string,
        currentModuleId: string,
        moduleQuizzes: any[]
    ): Promise<NavigationData> => {
        const allLessons: any[] = [];

        for (const mod of modules) {
            if (mod.lessons) {
                allLessons.push(...mod.lessons.map((lesson: any) => ({
                    ...lesson,
                    moduleId: mod.id
                })));
            }
        }

        const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
        const currentLesson = allLessons[currentIndex];

        // Verificar si es la última lección del módulo
        const moduleLessons = allLessons.filter(l => l.moduleId === currentModuleId);
        const isLastLessonInModule = currentLesson?.id === moduleLessons[moduleLessons.length - 1]?.id;

        // Determinar el siguiente ítem
        let nextItem: { type: 'lesson' | 'quiz'; id: string } | null = null;

        if (isLastLessonInModule && moduleQuizzes.length > 0) {
            // Si es la última lección y hay quizzes, el siguiente es el quiz
            nextItem = { type: 'quiz', id: moduleQuizzes[0].id };
        } else if (currentIndex < allLessons.length - 1) {
            // Si no, el siguiente es la siguiente lección
            nextItem = { type: 'lesson', id: allLessons[currentIndex + 1].id };
        }

        return {
            previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
            nextItem
        };
    };

    // Función para completar y continuar
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
                progress: { isCompleted: true, completedAt: new Date().toISOString() },
                courseProgress: {
                    ...prev.courseProgress,
                    completedLessons: [...prev.courseProgress.completedLessons, lessonId]
                }
            } : null);

            // Navegar después de un momento
            setTimeout(() => {
                navigateToNextOrCourse();
            }, 800);

        } catch (err: any) {
            console.error('Error completing lesson:', err);
            toast.error('Error al completar la lección');
        }
    };

    const navigateToNextOrCourse = () => {
        if (lessonData?.navigation.nextItem) {
            const { type, id } = lessonData.navigation.nextItem;

            if (type === 'quiz') {
                router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/quizzes/${id}`);
            } else {
                router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${id}`);
            }
        } else {
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}`);
            toast.success('¡Módulo completado! 🎉', { duration: 4000 });
        }
    };

    // Obtener recursos (PDFs) de la lección
    const getResources = () => {
        if (!lessonData?.lesson.resources) return [];
        return lessonData.lesson.resources.filter((r: any) =>
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

    const { lesson, course, currentModule, modules, navigation, progress, courseProgress } = lessonData;
    const resources = getResources();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <Link
                                href={`${ROUTES.STUDENT.COURSES}/${courseId}`}
                                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 truncate">
                                    {currentModule?.title || 'Módulo'}
                                </p>
                                <h1 className="text-lg font-semibold truncate">{lesson.title}</h1>
                            </div>
                        </div>

                        {/* Indicador de completado */}
                        {progress.isCompleted && (
                            <div className="flex items-center space-x-2 text-green-400 flex-shrink-0 ml-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">
                                    Lección completada
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal con sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Área de contenido principal */}
                <div className="flex-1 overflow-y-auto">
                    <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
                        <div className="max-w-5xl mx-auto space-y-6">
                            {/* REPRODUCTOR DE VIDEO */}
                            {lesson.type === 'VIDEO' && lesson.videoUrl && (
                                <VideoPlayer
                                    src={lesson.videoUrl}
                                    onTimeUpdate={(time) => {
                                        console.log('Video progress:', time);
                                    }}
                                    onEnded={() => {
                                        console.log('Video ended');
                                        toast.success('¡Video completado! 🎉');
                                    }}
                                    className="w-full"
                                />
                            )}

                            {/* SECCIÓN DE RECURSOS */}
                            {resources.length > 0 && (
                                <>
                                    {/* Si es VIDEO: mostrar solo lista compacta */}
                                    {lesson.type === 'VIDEO' && (
                                        <div className="bg-gray-800 rounded-lg p-6">
                                            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                                <FileText className="w-6 h-6 text-blue-400" />
                                                <span>Recursos de la lección</span>
                                            </h2>
                                            <div className="space-y-3">
                                                {resources.map((resource: any) => (
                                                    <div
                                                        key={resource.id}
                                                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-blue-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-white truncate">
                                                                    {resource.fileName}
                                                                </p>
                                                                {resource.sizeKb && (
                                                                    <p className="text-sm text-gray-400">
                                                                        {resource.sizeKb < 1024
                                                                            ? `${resource.sizeKb} KB`
                                                                            : `${(resource.sizeKb / 1024).toFixed(2)} MB`
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={resource.fileUrl || resource.downloadUrl}
                                                            download={resource.fileName}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>Descargar</span>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Si es TEXT: mostrar visor completo de PDF */}
                                    {lesson.type === 'TEXT' && resources.map((resource: any) => (
                                        <div key={resource.id} className="bg-white rounded-lg overflow-hidden">
                                            <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
                                                <div className="flex items-center space-x-2 text-gray-700">
                                                    <FileText className="w-5 h-5" />
                                                    <span className="font-medium">{resource.fileName}</span>
                                                </div>
                                                <a
                                                    href={resource.fileUrl || resource.downloadUrl}
                                                    download={resource.fileName}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Descargar PDF</span>
                                                </a>
                                            </div>
                                            <iframe
                                                src={`${resource.fileUrl || resource.downloadUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                                className="w-full h-[700px]"
                                                title={resource.fileName}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* CONTENIDO MARKDOWN */}
                            {lesson.type === 'TEXT' && lesson.markdownContent && !lesson.videoUrl && (
                                <div className="bg-white rounded-lg p-8">
                                    <div className="prose prose-lg max-w-none text-gray-900">
                                        <div dangerouslySetInnerHTML={{ __html: lesson.markdownContent }} />
                                    </div>
                                </div>
                            )}

                            {/* MENSAJE SI NO HAY CONTENIDO */}
                            {lesson.type === 'TEXT' && !lesson.videoUrl && resources.length === 0 && !lesson.markdownContent && (
                                <div className="bg-gray-800 rounded-lg p-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                        Sin contenido disponible
                                    </h3>
                                    <p className="text-gray-500">
                                        Esta lección no tiene contenido cargado aún
                                    </p>
                                </div>
                            )}

                            {/* BOTÓN COMPLETAR Y CONTINUAR */}
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
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Procesando...</span>
                                        </>
                                    ) : progress.isCompleted ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>
                                                {navigation.nextItem
                                                    ? navigation.nextItem.type === 'quiz'
                                                        ? 'Ir a evaluación del módulo'
                                                        : 'Ir a siguiente lección'
                                                    : 'Volver al curso'}
                                            </span>
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Marcar como completada y continuar</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Descripción de la lección */}
                            {lesson.description && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-xl font-bold mb-4">Descripción</h2>
                                    <p className="text-gray-300 leading-relaxed">{lesson.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar de navegación - Fixed width en desktop */}
                <div className="hidden lg:block w-96 border-l border-gray-700 flex-shrink-0 overflow-hidden">
                    <LessonSidebar
                        courseId={courseId}
                        currentLessonId={lessonId}
                        modules={modules}
                        progress={courseProgress}
                    />
                </div>
            </div>
        </div>
    );
}