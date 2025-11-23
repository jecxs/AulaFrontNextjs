// src/app/(student)/student/courses/[courseId]/quizzes/[quizId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizPreview, useQuizResults, useSubmitQuiz } from '@/hooks/use-student-quizzes';
import { QuizAnswer, QuestionForStudent } from '@/types/quiz';
import {
    ClipboardList,
    Clock,
    Target,
    Trophy,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Send,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export default function QuizAttemptPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const quizId = params.quizId as string;

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks
    const { data: quizPreview, isLoading, error } = useQuizPreview(quizId);
    const submitQuizMutation = useSubmitQuiz();

    // Inicializar temporizador
    useEffect(() => {
        if (quizPreview?.timeLimit) {
            setTimeRemaining(quizPreview.timeLimit * 60); // Convertir minutos a segundos
        }
    }, [quizPreview]);

    // Contador de tiempo
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1) {
                    // Tiempo agotado, enviar automáticamente
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleAnswerChange = (questionId: string, answerOptionId: string, isMultipleChoice: boolean) => {
        setAnswers((prev) => {
            const newAnswers = new Map(prev);
            const existing = newAnswers.get(questionId);

            if (isMultipleChoice) {
                // Para MULTIPLE_CHOICE, permitir múltiples selecciones
                const currentIds = existing?.answerOptionIds || [];
                const newIds = currentIds.includes(answerOptionId)
                    ? currentIds.filter((id) => id !== answerOptionId)
                    : [...currentIds, answerOptionId];

                newAnswers.set(questionId, {
                    questionId,
                    answerOptionIds: newIds,
                });
            } else {
                // Para TRUE_FALSE, solo una opción
                newAnswers.set(questionId, {
                    questionId,
                    answerOptionIds: [answerOptionId],
                });
            }

            return newAnswers;
        });
    };

    const handleTextAnswerChange = (questionId: string, text: string) => {
        setAnswers((prev) => {
            const newAnswers = new Map(prev);
            newAnswers.set(questionId, {
                questionId,
                textAnswer: text,
            });
            return newAnswers;
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        // Verificar que todas las preguntas tengan respuesta
        const unansweredCount = quizPreview!.questions.length - answers.size;
        if (unansweredCount > 0) {
            const confirmSubmit = window.confirm(
                `Tienes ${unansweredCount} pregunta(s) sin responder. ¿Deseas enviar el quiz de todos modos?`
            );
            if (!confirmSubmit) return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitQuizMutation.mutateAsync({
                quizId,
                data: {
                    quizId,
                    answers: Array.from(answers.values()),
                },
            });

            // Redirigir a resultados
            router.push(`/student/courses/${courseId}/quizzes/${quizId}/results`);
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = () => {
        return answers.size;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !quizPreview) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el quiz</h3>
                    <p className="text-gray-600 mb-4">No se pudo cargar el quiz. Intenta nuevamente.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quizPreview.questions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestion.id);
    const progress = ((currentQuestionIndex + 1) / quizPreview.questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{quizPreview.title}</h1>
                        {quizPreview.description && (
                            <p className="text-gray-600">{quizPreview.description}</p>
                        )}
                    </div>

                    {/* Temporizador */}
                    {timeRemaining !== null && (
                        <div
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                timeRemaining < 60
                                    ? 'bg-red-100 text-red-700'
                                    : timeRemaining < 300
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                        >
                            <Clock className="w-5 h-5" />
                            <span className="font-mono font-semibold text-lg">{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        <span>{quizPreview.questionsCount} preguntas</span>
                    </div>
                    <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span>{quizPreview.passingScore}% para aprobar</span>
                    </div>
                    <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        <span>{quizPreview.totalPoints} puntos totales</span>
                    </div>
                </div>

                {/* Progreso */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                            Pregunta {currentQuestionIndex + 1} de {quizPreview.questions.length}
                        </span>
                        <span>
                            {getAnsweredCount()} de {quizPreview.questions.length} respondidas
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Pregunta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <div className="flex items-start justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 flex-1">
                            {currentQuestionIndex + 1}. {currentQuestion.text}
                        </h2>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full ml-4">
                            {currentQuestion.weight} pts
                        </span>
                    </div>

                    {/* Imagen de la pregunta */}
                    {currentQuestion.imageUrl && (
                        <img
                            src={currentQuestion.imageUrl}
                            alt="Imagen de la pregunta"
                            className="max-w-full h-auto rounded-lg mb-4"
                        />
                    )}
                </div>

                {/* Opciones */}
                <div className="space-y-3">
                    {currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE' ? (
                        currentQuestion.answerOptions.map((option) => {
                            const isSelected = currentAnswer?.answerOptionIds?.includes(option.id);
                            return (
                                <button
                                    key={option.id}
                                    onClick={() =>
                                        handleAnswerChange(
                                            currentQuestion.id,
                                            option.id,
                                            currentQuestion.type === 'MULTIPLE_CHOICE'
                                        )
                                    }
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <span className="text-gray-900">{option.text}</span>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        // SHORT_ANSWER o ESSAY
                        <textarea
                            value={currentAnswer?.textAnswer || ''}
                            onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            rows={currentQuestion.type === 'ESSAY' ? 8 : 3}
                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        />
                    )}
                </div>
            </div>

            {/* Navegación */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                    </button>

                    {currentQuestionIndex === quizPreview.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Quiz
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                setCurrentQuestionIndex((prev) =>
                                    Math.min(quizPreview.questions.length - 1, prev + 1)
                                )
                            }
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mapa de preguntas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Navegación rápida</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {quizPreview.questions.map((question, index) => {
                        const isAnswered = answers.has(question.id);
                        const isCurrent = index === currentQuestionIndex;

                        return (
                            <button
                                key={question.id}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`aspect-square rounded-lg border-2 font-medium text-sm transition-all ${
                                    isCurrent
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : isAnswered
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
