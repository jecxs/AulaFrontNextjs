// src/hooks/use-student-quizzes.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api/quizzes';
import {
    QuizForStudent,
    QuizPreview,
    SubmitQuizDto,
    QuizSubmissionResult,
    QuizResults,
} from '@/types/quiz';
import { toast } from 'sonner';

/**
 * Hook para obtener quizzes de un módulo
 */
export function useModuleQuizzes(moduleId: string | null) {
    return useQuery({
        queryKey: ['quizzes', 'module', moduleId],
        queryFn: () => quizzesApi.getByModule(moduleId!),
        enabled: !!moduleId,
    });
}

/**
 * Hook para obtener preview de un quiz (con preguntas pero sin respuestas correctas)
 */
export function useQuizPreview(quizId: string | null) {
    return useQuery({
        queryKey: ['quizzes', quizId, 'preview'],
        queryFn: () => quizzesApi.getPreview(quizId!),
        enabled: !!quizId,
    });
}

/**
 * Hook para obtener resultados de un quiz
 */
export function useQuizResults(quizId: string | null, userId: string | null) {
    return useQuery({
        queryKey: ['quizzes', quizId, 'results', userId],
        queryFn: () => quizzesApi.getResults(quizId!, userId!),
        enabled: !!quizId && !!userId,
    });
}

/**
 * Hook para enviar respuestas de un quiz
 */
export function useSubmitQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, data }: { quizId: string; data: SubmitQuizDto }) =>
            quizzesApi.submitQuiz(quizId, data),
        onSuccess: (result, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({
                queryKey: ['quizzes', variables.quizId, 'results'],
            });
            queryClient.invalidateQueries({
                queryKey: ['progress'],
            });

            // Mostrar mensaje según el resultado
            if (result.passed) {
                toast.success('¡Felicitaciones!', {
                    description: `Has aprobado el quiz con ${result.score}% de puntaje.`,
                });
            } else {
                toast.warning('Quiz completado', {
                    description: `Obtuviste ${result.score}%. Necesitas ${result.quiz?.passingScore || 70}% para aprobar.`,
                });
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error al enviar el quiz';
            toast.error('Error', {
                description: message,
            });
        },
    });
}
