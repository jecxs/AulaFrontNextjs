// src/components/student/QuizCard.tsx
'use client';

import { QuizForStudent } from '@/types/quiz';
import { ClipboardList, Lock, Trophy, Clock, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface QuizCardProps {
    quiz: QuizForStudent;
    courseId: string;
    isModuleCompleted: boolean;
}

export default function QuizCard({ quiz, courseId, isModuleCompleted }: QuizCardProps) {
    const isLocked = !isModuleCompleted;

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                isLocked
                    ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'bg-purple-50 hover:bg-purple-100 cursor-pointer group'
            }`}
        >
            <div className="flex items-center space-x-3 flex-1">
                {/* Icono */}
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isLocked
                            ? 'bg-gray-200'
                            : 'bg-purple-200 group-hover:bg-purple-300 transition-colors'
                    }`}
                >
                    {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ClipboardList className="w-4 h-4 text-purple-700" />
                    )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <h4
                        className={`font-medium truncate ${
                            isLocked ? 'text-gray-500' : 'text-purple-900 group-hover:text-purple-700'
                        }`}
                    >
                        {quiz.title}
                    </h4>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs mt-1">
                        {/* Número de preguntas */}
                        <span
                            className={`flex items-center ${
                                isLocked ? 'text-gray-400' : 'text-purple-600'
                            }`}
                        >
                            <ClipboardList className="w-3 h-3 mr-1" />
                            {quiz.questionsCount} {quiz.questionsCount === 1 ? 'pregunta' : 'preguntas'}
                        </span>

                        {/* Puntaje mínimo */}
                        <span
                            className={`flex items-center ${
                                isLocked ? 'text-gray-400' : 'text-purple-600'
                            }`}
                        >
                            <Target className="w-3 h-3 mr-1" />
                            {quiz.passingScore}% para aprobar
                        </span>

                        {/* Límite de tiempo */}
                        {quiz.timeLimit && (
                            <span
                                className={`flex items-center ${
                                    isLocked ? 'text-gray-400' : 'text-purple-600'
                                }`}
                            >
                                <Clock className="w-3 h-3 mr-1" />
                                {quiz.timeLimit} min
                            </span>
                        )}

                        {/* Total de puntos */}
                        <span
                            className={`flex items-center ${
                                isLocked ? 'text-gray-400' : 'text-purple-600'
                            }`}
                        >
                            <Trophy className="w-3 h-3 mr-1" />
                            {quiz.totalPoints} pts
                        </span>
                    </div>

                    {/* Mensaje de bloqueo */}
                    {isLocked && (
                        <p className="text-xs text-gray-500 mt-1">
                            Completa todas las lecciones del módulo para desbloquear
                        </p>
                    )}
                </div>
            </div>

            {/* Botón o indicador */}
            {isLocked ? (
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            ) : (
                <Link
                    href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                    className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors flex-shrink-0 ml-2"
                >
                    <span className="text-sm font-medium mr-1">Tomar quiz</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
    );
}
