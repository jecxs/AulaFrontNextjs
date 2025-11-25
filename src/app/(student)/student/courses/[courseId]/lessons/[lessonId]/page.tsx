// src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import { quizzesApi } from '@/lib/api/quizzes';
import { useMarkLessonComplete } from '@/hooks/use-student-courses';

import { BookOpen, FileText, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import VideoPlayer from '@/components/course/VideoPlayer';
import LessonHeader from '@/components/course/LessonHeader';
import LessonSidebar from '@/components/course/LessonSidebar';
import LessonResources from '@/components/course/LessonResources';
import CompleteButton from '@/components/course/CompleteButton';
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

            // Cargar información de intentos de todos los quizzes del curso
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
                        courseProgress.quizAttempts[quiz.id] = {
                            passed: false,
                            bestScore: 0,
                            totalAttempts: 0
                        };
                    }
                })
            );

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
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#00B4D8]/20 rounded-full blur-2xl" />
                        <LoadingSpinner size="lg" />
                    </div>
                    <p className="mt-6 text-white/70 font-medium">Cargando lección...</p>
                </div>
            </div>
        );
    }

    if (error || !lessonData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                        No se pudo cargar la lección
                    </h3>
                    <p className="text-white/60 mb-8">{error}</p>
                    <button
                        onClick={loadLessonData}
                        className="px-8 py-3.5 bg-[#00B4D8] text-white font-semibold rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-300 shadow-lg shadow-[#00B4D8]/20"
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
            <LessonHeader
                courseId={courseId}
                moduleTitle={currentModule?.title || 'Módulo'}
                lessonTitle={lesson.title}
                isCompleted={progress.isCompleted}
            />

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
                                    }}
                                    onEnded={() => {
                                        toast.success('¡Video completado! 🎉');
                                    }}
                                    className="w-full rounded-2xl overflow-hidden shadow-2xl"
                                />
                            )}

                            {/* RECURSOS */}
                            <LessonResources resources={resources} lessonType={lesson.type} />

                            {/* CONTENIDO MARKDOWN */}
                            {lesson.type === 'TEXT' && lesson.markdownContent && !lesson.videoUrl && (
                                <div className="bg-white rounded-2xl p-8 shadow-xl">
                                    <div className="prose prose-lg max-w-none text-gray-900">
                                        <div dangerouslySetInnerHTML={{ __html: lesson.markdownContent }} />
                                    </div>
                                </div>
                            )}

                            {/* MENSAJE SI NO HAY CONTENIDO */}
                            {lesson.type === 'TEXT' && !lesson.videoUrl && resources.length === 0 && !lesson.markdownContent && (
                                <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/10">
                                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" strokeWidth={1.5} />
                                    <h3 className="text-lg font-semibold text-white/80 mb-2">
                                        Sin contenido disponible
                                    </h3>
                                    <p className="text-white/50">
                                        Esta lección no tiene contenido cargado aún
                                    </p>
                                </div>
                            )}

                            {/* BOTÓN COMPLETAR Y CONTINUAR */}
                            <CompleteButton
                                isCompleted={progress.isCompleted}
                                isPending={markLessonCompleteMutation.isPending}
                                hasNextItem={!!navigation.nextItem}
                                nextItemType={navigation.nextItem?.type}
                                onComplete={handleCompleteAndContinue}
                            />

                            {/* DESCRIPCIÓN DE LA LECCIÓN */}
                            {lesson.description && (
                                <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                                        <span>Descripción</span>
                                    </h2>
                                    <p className="text-white/70 leading-relaxed">{lesson.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar de navegación - Fixed width en desktop */}
                <div className="hidden lg:block w-96 border-l border-white/5 flex-shrink-0 overflow-hidden">
                    <LessonSidebar
                        courseId={courseId}
                        courseTitle={course.title}
                        currentLessonId={lessonId}
                        modules={modules}
                        progress={courseProgress}
                    />
                </div>
            </div>
        </div>
    );
}