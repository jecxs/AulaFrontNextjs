// src/components/student/QuizCard.tsx
'use client';

import { QuizForStudent } from '@/types/quiz';
import { ClipboardList, Lock, Trophy, Clock, Target, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { quizzesApi } from '@/lib/api/quizzes';

interface QuizCardProps {
    quiz: QuizForStudent;
    courseId: string;
    isModuleCompleted: boolean;
}

interface QuizAttemptSummary {
    totalAttempts: number;
    bestPercentage: number;
    passed: boolean;
    lastAttemptId?: string;
}

export default function QuizCard({ quiz, courseId, isModuleCompleted }: QuizCardProps) {
    const isLocked = !isModuleCompleted;
    const [attemptSummary, setAttemptSummary] = useState<QuizAttemptSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar información de intentos del quiz
    useEffect(() => {
        if (!isLocked && quiz.id) {
            loadQuizAttempts();
        }
    }, [quiz.id, isLocked]);

    const loadQuizAttempts = async () => {
        try {
            setIsLoading(true);
            const history = await quizzesApi.getMyAttempts(quiz.id);

            if (history.totalAttempts > 0) {
                setAttemptSummary({
                    totalAttempts: history.totalAttempts,
                    bestPercentage: history.bestPercentage,
                    passed: history.passed,
                    lastAttemptId: history.attempts[0]?.id,
                });
            }
        } catch (error) {
            console.error('Error loading quiz attempts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Determinar la URL a la que debe navegar
    const getQuizUrl = () => {
        // Si ya tiene intentos, ir directo a resultados
        if (attemptSummary && attemptSummary.totalAttempts > 0) {
            return `/student/courses/${courseId}/quizzes/${quiz.id}/results`;
        }
        // Si no tiene intentos, ir a tomar el quiz
        return `/student/courses/${courseId}/quizzes/${quiz.id}`;
    };

    // Determinar el texto del botón
    const getButtonText = () => {
        if (attemptSummary && attemptSummary.totalAttempts > 0) {
            return attemptSummary.passed ? 'Ver resultados' : 'Reintentar quiz';
        }
        return 'Tomar quiz';
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                isLocked
                    ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                    : attemptSummary?.passed
                        ? 'bg-green-50 hover:bg-green-100 cursor-pointer group border-2 border-green-200'
                        : attemptSummary?.totalAttempts
                            ? 'bg-orange-50 hover:bg-orange-100 cursor-pointer group border-2 border-orange-200'
                            : 'bg-purple-50 hover:bg-purple-100 cursor-pointer group'
            }`}
        >
            <div className="flex items-center space-x-4 flex-1">
                {/* Icono */}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isLocked
                            ? 'bg-gray-200'
                            : attemptSummary?.passed
                                ? 'bg-green-200 group-hover:bg-green-300'
                                : attemptSummary?.totalAttempts
                                    ? 'bg-orange-200 group-hover:bg-orange-300'
                                    : 'bg-purple-200 group-hover:bg-purple-300'
                    } transition-colors`}
                >
                    {isLocked ? (
                        <Lock className="w-5 h-5 text-gray-500" />
                    ) : attemptSummary?.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-700" />
                    ) : attemptSummary?.totalAttempts ? (
                        <AlertCircle className="w-5 h-5 text-orange-700" />
                    ) : (
                        <ClipboardList className="w-5 h-5 text-purple-700" />
                    )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                        <h4
                            className={`font-medium truncate ${
                                isLocked
                                    ? 'text-gray-500'
                                    : attemptSummary?.passed
                                        ? 'text-green-900 group-hover:text-green-700'
                                        : attemptSummary?.totalAttempts
                                            ? 'text-orange-900 group-hover:text-orange-700'
                                            : 'text-purple-900 group-hover:text-purple-700'
                            }`}
                        >
                            {quiz.title}
                        </h4>

                        {/* Badge de estado */}
                        {!isLocked && attemptSummary && attemptSummary.totalAttempts > 0 && (
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    attemptSummary.passed
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-orange-100 text-orange-800 border border-orange-300'
                                }`}
                            >
                                {attemptSummary.passed ? (
                                    <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Aprobado
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Intentado
                                    </>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Información del quiz */}
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
                        {/* Número de preguntas */}
                        <span
                            className={`flex items-center ${
                                isLocked
                                    ? 'text-gray-400'
                                    : attemptSummary?.passed
                                        ? 'text-green-600'
                                        : attemptSummary?.totalAttempts
                                            ? 'text-orange-600'
                                            : 'text-purple-600'
                            }`}
                        >
                            <ClipboardList className="w-3 h-3 mr-1" />
                            {quiz.questionsCount} {quiz.questionsCount === 1 ? 'pregunta' : 'preguntas'}
                        </span>

                        {/* Puntaje mínimo */}
                        <span
                            className={`flex items-center ${
                                isLocked
                                    ? 'text-gray-400'
                                    : attemptSummary?.passed
                                        ? 'text-green-600'
                                        : attemptSummary?.totalAttempts
                                            ? 'text-orange-600'
                                            : 'text-purple-600'
                            }`}
                        >
                            <Target className="w-3 h-3 mr-1" />
                            {quiz.passingScore}% para aprobar
                        </span>

                        {/* Total de puntos */}
                        <span
                            className={`flex items-center ${
                                isLocked
                                    ? 'text-gray-400'
                                    : attemptSummary?.passed
                                        ? 'text-green-600'
                                        : attemptSummary?.totalAttempts
                                            ? 'text-orange-600'
                                            : 'text-purple-600'
                            }`}
                        >
                            <Trophy className="w-3 h-3 mr-1" />
                            {quiz.totalPoints} pts
                        </span>

                        {/* Mostrar mejor puntaje si existe */}
                        {!isLocked && attemptSummary && attemptSummary.totalAttempts > 0 && (
                            <span
                                className={`flex items-center font-semibold ${
                                    attemptSummary.passed
                                        ? 'text-green-700'
                                        : 'text-orange-700'
                                }`}
                            >
                                <Trophy className="w-3.5 h-3.5 mr-1" />
                                Mejor: {attemptSummary.bestPercentage}%
                            </span>
                        )}

                        {/* Número de intentos */}
                        {!isLocked && attemptSummary && attemptSummary.totalAttempts > 0 && (
                            <span
                                className={`text-xs ${
                                    attemptSummary.passed
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                }`}
                            >
                                ({attemptSummary.totalAttempts} {attemptSummary.totalAttempts === 1 ? 'intento' : 'intentos'})
                            </span>
                        )}
                    </div>

                    {/* Mensaje de bloqueo */}
                    {isLocked && (
                        <p className="text-xs text-gray-500 mt-2">
                            Completa todas las lecciones del módulo para desbloquear
                        </p>
                    )}
                </div>
            </div>

            {/* Botón o indicador */}
            {isLocked ? (
                <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
            ) : (
                <Link
                    href={getQuizUrl()}
                    className={`flex items-center text-sm font-medium transition-colors flex-shrink-0 ml-4 px-4 py-2 rounded-lg ${
                        attemptSummary?.passed
                            ? 'text-green-700 bg-green-100 hover:bg-green-200 border border-green-300'
                            : attemptSummary?.totalAttempts
                                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200 border border-orange-300'
                                : 'text-purple-600 group-hover:text-purple-700'
                    }`}
                >
                    <span>{isLoading ? 'Cargando...' : getButtonText()}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
    );
}