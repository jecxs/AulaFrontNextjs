// src/hooks/use-student-quizzes.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api/quizzes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type {
    QuizPreview,
    SubmitQuizDto,
    QuizSubmissionResult,
    UserQuizHistory,
    QuizAttemptDetail,
    QuizResults,
} from '@/types/quiz';

// ========== QUERY KEYS ==========
export const QUIZ_KEYS = {
    all: ['quizzes'] as const,
    preview: (id: string) => ['quizzes', 'preview', id] as const,
    myAttempts: (id: string) => ['quizzes', 'my-attempts', id] as const,
    attemptDetail: (id: string) => ['quizzes', 'attempt', id] as const,
    results: (id: string) => ['quizzes', 'results', id] as const,
    bestAttempt: (id: string) => ['quizzes', 'best-attempt', id] as const,
};

// ========== QUERIES ==========

/**
 * Hook para obtener la vista previa de un quiz (con preguntas pero sin respuestas correctas)
 */
export function useQuizPreview(quizId: string) {
    return useQuery<QuizPreview>({
        queryKey: QUIZ_KEYS.preview(quizId),
        queryFn: () => quizzesApi.getPreview(quizId),
        enabled: !!quizId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

/**
 * Hook para obtener el historial de intentos del estudiante en un quiz
 */
export function useMyQuizAttempts(quizId: string) {
    return useQuery<UserQuizHistory>({
        queryKey: QUIZ_KEYS.myAttempts(quizId),
        queryFn: () => quizzesApi.getMyAttempts(quizId),
        enabled: !!quizId,
    });
}

/**
 * Hook para obtener el detalle de un intento específico
 */
export function useQuizAttemptDetail(attemptId: string) {
    return useQuery<QuizAttemptDetail>({
        queryKey: QUIZ_KEYS.attemptDetail(attemptId),
        queryFn: () => quizzesApi.getAttemptDetail(attemptId),
        enabled: !!attemptId,
    });
}

/**
 * Hook para obtener resultados completos de un quiz
 * (incluye información del quiz + historial de intentos)
 */
export function useQuizResults(quizId: string) {
    return useQuery<QuizResults>({
        queryKey: QUIZ_KEYS.results(quizId),
        queryFn: () => quizzesApi.getResults(quizId),
        enabled: !!quizId,
    });
}

/**
 * Hook para obtener el mejor intento del estudiante
 */
export function useBestQuizAttempt(quizId: string) {
    return useQuery({
        queryKey: QUIZ_KEYS.bestAttempt(quizId),
        queryFn: () => quizzesApi.getBestAttempt(quizId),
        enabled: !!quizId,
    });
}

// ========== MUTATIONS ==========

/**
 * Hook para enviar respuestas de un quiz
 */
export function useSubmitQuiz() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<
        QuizSubmissionResult,
        Error,
        { quizId: string; data: SubmitQuizDto }
    >({
        mutationFn: ({ quizId, data }) => quizzesApi.submitQuiz(quizId, data),
        onSuccess: (result, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({
                queryKey: QUIZ_KEYS.myAttempts(variables.quizId),
            });
            queryClient.invalidateQueries({
                queryKey: QUIZ_KEYS.results(variables.quizId),
            });
            queryClient.invalidateQueries({
                queryKey: QUIZ_KEYS.bestAttempt(variables.quizId),
            });

            // Mostrar mensaje de éxito
            if (result.passed) {
                toast.success('¡Felicitaciones! Has aprobado el quiz', {
                    description: `Obtuviste ${result.percentage}% de puntaje`,
                });
            } else {
                toast.info('Quiz completado', {
                    description: `Obtuviste ${result.percentage}%. Puedes volver a intentarlo cuando quieras.`,
                });
            }
        },
        onError: (error: Error) => {
            console.error('Error submitting quiz:', error);
            toast.error('Error al enviar el quiz', {
                description: error.message || 'Por favor, intenta nuevamente',
            });
        },
    });
}

/**
 * Hook auxiliar para verificar si el estudiante ha completado un quiz
 */
export function useHasCompletedQuiz(quizId: string) {
    const { data: history } = useMyQuizAttempts(quizId);

    return {
        hasAttempts: (history?.totalAttempts ?? 0) > 0,
        hasPassed: history?.passed ?? false,
        totalAttempts: history?.totalAttempts ?? 0,
        bestScore: history?.bestPercentage ?? 0,
    };
}