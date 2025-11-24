// src/app/(student)/student/courses/[courseId]/quizzes/[quizId]/results/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuizResults } from '@/hooks/use-student-quizzes';
import { CheckCircle, XCircle, Trophy, Clock, Target, RotateCcw, ArrowLeft, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function QuizResultsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const quizId = params.quizId as string;

    const [userId, setUserId] = useState<string | null>(null);

    // Obtener el userId del localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserId(user.id);
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }
    }, []);

    const { data: results, isLoading, error } = useQuizResults(quizId, userId);

    if (isLoading || !userId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar resultados</h3>
                    <p className="text-gray-600 mb-4">No se pudieron cargar los resultados del quiz.</p>
                    <button
                        onClick={() => router.push(`/student/courses/${courseId}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver al curso
                    </button>
                </div>
            </div>
        );
    }

    const lastAttempt = results.lastAttempt || results.attempts[results.attempts.length - 1];
    const passed = lastAttempt?.passed || false;
    const score = lastAttempt?.score || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Resultado principal */}
            <div
                className={`rounded-lg shadow-lg border-2 p-8 ${
                    passed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
                }`}
            >
                <div className="text-center">
                    {passed ? (
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {passed ? '¡Felicitaciones!' : 'Quiz Completado'}
                    </h1>

                    <p className="text-lg text-gray-700 mb-6">
                        {passed
                            ? 'Has aprobado el quiz exitosamente'
                            : 'No alcanzaste el puntaje mínimo para aprobar'}
                    </p>

                    {/* Puntaje */}
                    <div className="inline-block bg-white rounded-lg shadow-sm px-8 py-4 mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-1">{score}%</div>
                        <div className="text-sm text-gray-600">Tu puntaje</div>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-center mb-2">
                                <Target className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-gray-600">Puntaje mínimo</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {results.quiz.passingScore}%
                            </div>
                        </div>


                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-gray-600">Mejor puntaje</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {results.bestScore || score}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historial de intentos */}
            {results.attempts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de intentos</h2>
                    <div className="space-y-3">
                        {results.attempts.map((attempt, index) => (
                            <div
                                key={attempt.id}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                    attempt.passed
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            attempt.passed
                                                ? 'bg-green-200 text-green-700'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            Intento {index + 1}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(attempt.submittedAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {attempt.score}%
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {attempt.passed ? 'Aprobado' : 'No aprobado'}
                                        </div>
                                    </div>
                                    {attempt.passed ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/student/courses/${courseId}`}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al curso
                    </Link>

                    {results.canRetake && (
                        <Link
                            href={`/student/courses/${courseId}/quizzes/${quizId}`}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reintentar quiz ({results.attemptsRemaining} {results.attemptsRemaining === 1 ? 'intento' : 'intentos'} restantes)
                        </Link>
                    )}

                    {!results.canRetake && !passed && (
                        <div className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                            <XCircle className="w-4 h-4 mr-2" />
                            No hay más intentos disponibles
                        </div>
                    )}
                </div>

                {results.canRetake && !passed && (
                    <p className="text-sm text-gray-600 text-center mt-3">
                        Tienes {results.attemptsRemaining} {results.attemptsRemaining === 1 ? 'intento' : 'intentos'} restantes para aprobar el quiz
                    </p>
                )}
            </div>

            {/* Información del quiz */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Información del quiz</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Título:</span>
                        <p className="font-medium text-gray-900">{results.quiz.title}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Preguntas:</span>
                        <p className="font-medium text-gray-900">{results.quiz.questionsCount}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Puntos totales:</span>
                        <p className="font-medium text-gray-900">{results.quiz.totalPoints}</p>
                    </div>
                    {results.quiz.timeLimit && (
                        <div>
                            <span className="text-gray-600">Tiempo límite:</span>
                            <p className="font-medium text-gray-900">{results.quiz.timeLimit} minutos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}