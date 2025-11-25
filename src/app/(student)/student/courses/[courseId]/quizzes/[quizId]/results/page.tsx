// src/app/(student)/student/courses/[courseId]/quizzes/[quizId]/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizResults } from '@/hooks/use-student-quizzes';
import { coursesApi } from '@/lib/api/courses';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, ChevronRight, Home } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ROUTES } from '@/lib/utils/constants';

interface NextItem {
    type: 'lesson' | 'module-end' | null;
    moduleId?: string;
    lessonId?: string;
    moduleTitle?: string;
}

export default function QuizResultsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const quizId = params.quizId as string;

    const [nextItem, setNextItem] = useState<NextItem>({ type: null });
    const [isLoadingNext, setIsLoadingNext] = useState(true);

    const { data: results, isLoading, error } = useQuizResults(quizId);

    // Cargar información de navegación
    useEffect(() => {
        if (results?.quiz) {
            loadNextItem();
        }
    }, [results]);

    const loadNextItem = async () => {
        try {
            setIsLoadingNext(true);

            // Obtener módulos del curso ordenados
            const modules = await coursesApi.getCourseModules(courseId);

            // Ordenar módulos por 'order' field para asegurar el orden correcto
            const sortedModules = modules.sort((a: any, b: any) => a.order - b.order);

            // Encontrar el índice del módulo actual del quiz
            const currentModuleIndex = sortedModules.findIndex((m: any) => m.id === results!.quiz.moduleId);

            console.log('📍 Current module index:', currentModuleIndex);
            console.log('📚 Total modules:', sortedModules.length);
            console.log('🎯 Current quiz module:', results!.quiz.moduleId);

            // Verificar si hay un siguiente módulo DESPUÉS del módulo actual del quiz
            if (currentModuleIndex !== -1 && currentModuleIndex < sortedModules.length - 1) {
                const nextModule = sortedModules[currentModuleIndex + 1];

                console.log('➡️ Next module found:', nextModule.title, nextModule.id);

                // Obtener la primera lección del siguiente módulo
                const nextModuleLessons = await coursesApi.getModuleLessons(nextModule.id);

                if (nextModuleLessons.length > 0) {
                    // Ordenar lecciones por 'order'
                    const sortedLessons = nextModuleLessons.sort((a: any, b: any) => a.order - b.order);

                    setNextItem({
                        type: 'lesson',
                        moduleId: nextModule.id,
                        lessonId: sortedLessons[0].id,
                        moduleTitle: nextModule.title,
                    });

                    console.log('✅ Next item set: First lesson of next module');
                } else {
                    console.log('⚠️ Next module has no lessons');
                    setNextItem({ type: 'module-end' });
                }
            } else {
                // Es el último módulo del curso
                console.log('🏁 This is the last module of the course');
                setNextItem({ type: 'module-end' });
            }
        } catch (error) {
            console.error('❌ Error loading next item:', error);
            setNextItem({ type: 'module-end' });
        } finally {
            setIsLoadingNext(false);
        }
    };

    const handleContinue = () => {
        if (nextItem.type === 'lesson' && nextItem.lessonId) {
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${nextItem.lessonId}`);
        } else {
            router.push(`${ROUTES.STUDENT.COURSES}/${courseId}`);
        }
    };

    const handleRetake = () => {
        router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/quizzes/${quizId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar resultados</h3>
                    <p className="text-gray-600 mb-6">No se pudieron cargar los resultados del quiz.</p>
                    <button
                        onClick={() => router.push(`${ROUTES.STUDENT.COURSES}/${courseId}`)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver al curso
                    </button>
                </div>
            </div>
        );
    }

    const { quiz, history } = results;
    const lastAttempt = history.attempts[0];
    const hasPassed = history.passed;
    const bestPercentage = history.bestPercentage;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header del Resultado */}
                <div className="text-center mb-8">
                    {hasPassed ? (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6">
                            <XCircle className="w-12 h-12 text-orange-600" />
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {hasPassed ? '¡Felicitaciones!' : 'Intento Completado'}
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        {hasPassed
                            ? 'Has completado exitosamente la evaluación'
                            : 'Puedes volver a intentarlo cuando quieras'}
                    </p>

                    {/* Score Principal */}
                    <div className="inline-block">
                        <div className="text-6xl font-bold text-gray-900 mb-2">
                            {lastAttempt.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                            {lastAttempt.score} de {lastAttempt.maxScore} puntos
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Estadísticas Minimalista */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {quiz.passingScore}%
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                Mínimo
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600 mb-1">
                                {bestPercentage}%
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                Tu mejor
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {history.totalAttempts}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                {history.totalAttempts === 1 ? 'Intento' : 'Intentos'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial de Intentos - Compacto */}
                {history.attempts.length > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Historial
                        </h3>
                        <div className="space-y-2">
                            {history.attempts.slice(0, 5).map((attempt, index) => (
                                <div
                                    key={attempt.id}
                                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                        index === 0
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-900">
                                            #{history.totalAttempts - index}
                                        </span>
                                        {index === 0 && (
                                            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">
                                                Actual
                                            </span>
                                        )}
                                        {attempt.percentage === bestPercentage && index !== 0 && (
                                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                                Mejor
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {attempt.percentage}%
                                        </span>
                                        {attempt.passed ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {history.attempts.length > 5 && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Mostrando los 5 intentos más recientes de {history.totalAttempts}
                            </p>
                        )}
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="space-y-3">
                    {/* Botón Principal: Continuar o Finalizar */}
                    {!isLoadingNext && (
                        <button
                            onClick={handleContinue}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            {nextItem.type === 'lesson' ? (
                                <>
                                    <span>Continuar al siguiente módulo</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    <span>Finalizar y volver al curso</span>
                                    <Home className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}

                    {isLoadingNext && (
                        <button
                            disabled
                            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gray-200 text-gray-500 font-medium rounded-xl cursor-not-allowed"
                        >
                            <LoadingSpinner size="sm" />
                            <span>Cargando...</span>
                        </button>
                    )}

                    {/* Botón Secundario: Reintentar */}
                    {!hasPassed && (
                        <button
                            onClick={handleRetake}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-300"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reintentar evaluación</span>
                        </button>
                    )}

                    {hasPassed && (
                        <button
                            onClick={handleRetake}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-300"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Practicar de nuevo</span>
                        </button>
                    )}
                </div>

                {/* Mensaje informativo */}
                <div className="mt-6 text-center">
                    {nextItem.type === 'lesson' && nextItem.moduleTitle && (
                        <p className="text-sm text-gray-600">
                            A continuación: <span className="font-medium text-gray-900">{nextItem.moduleTitle}</span>
                        </p>
                    )}
                    {nextItem.type === 'module-end' && (
                        <p className="text-sm text-gray-600">
                            {hasPassed
                                ? '🎉 ¡Has completado el curso!'
                                : 'Este es el último módulo del curso'}
                        </p>
                    )}
                </div>

                {/* Info del Quiz - Minimalista */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Evaluación:</span>
                        <span className="font-medium text-gray-900">{quiz.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-500">Preguntas:</span>
                        <span className="font-medium text-gray-900">{quiz.questionsCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}