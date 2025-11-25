// src/hooks/use-quizzes-admin.ts
'use client';

import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/types/api';
import {
    quizzesApi,
    questionsApi,
    answerOptionsApi,
} from '@/lib/api/quizzes';
import {
    Quiz,
    CreateQuizDto,
    UpdateQuizDto,
    Question,
    CreateQuestionDto,
    CreateQuestionSimpleDto,
    UpdateQuestionDto,
    AnswerOption,
    CreateAnswerOptionSimpleDto,
    UpdateAnswerOptionDto,
    QueryQuizzesDto,
} from '@/types/quiz';

/**
 * Hook personalizado para operaciones de ADMIN en quizzes
 */
export function useQuizzesAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== QUIZZES ==========

    const createQuiz = useCallback(async (data: CreateQuizDto): Promise<Quiz> => {
        setIsLoading(true);
        setError(null);
        try {
            return await quizzesApi.create(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al crear quiz');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getQuizzes = useCallback(
        async (params?: QueryQuizzesDto): Promise<{ data: Quiz[]; pagination: any }> => {
            setIsLoading(true);
            setError(null);
            try {
                return await quizzesApi.getAll(params);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al cargar quizzes');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getQuizById = useCallback(async (id: string): Promise<Quiz> => {
        setIsLoading(true);
        setError(null);
        try {
            return await quizzesApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar quiz');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getQuizzesByModule = useCallback(async (moduleId: string): Promise<Quiz[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quizzesApi.getAll({ moduleId });
            return result.data;
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar quizzes del módulo'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateQuiz = useCallback(
        async (id: string, data: UpdateQuizDto): Promise<Quiz> => {
            setIsLoading(true);
            setError(null);
            try {
                return await quizzesApi.update(id, data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al actualizar quiz');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteQuiz = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await quizzesApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar quiz');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const duplicateQuiz = useCallback(
        async (id: string, targetModuleId: string): Promise<Quiz> => {
            setIsLoading(true);
            setError(null);
            try {
                return await quizzesApi.duplicate(id, targetModuleId);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al duplicar quiz');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // ========== QUESTIONS ==========

    const createQuestion = useCallback(
        async (data: CreateQuestionDto): Promise<Question> => {
            setIsLoading(true);
            setError(null);
            try {
                return await questionsApi.create(data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al crear pregunta');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createQuestionSimple = useCallback(
        async (data: CreateQuestionSimpleDto): Promise<Question> => {
            setIsLoading(true);
            setError(null);
            try {
                return await questionsApi.createSimple(data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al crear pregunta');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getQuestionsByQuiz = useCallback(
        async (quizId: string): Promise<Question[]> => {
            try {
                return await questionsApi.getByQuiz(quizId);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al cargar preguntas'
                );
                console.error(errorMessage);
                throw err;
            }
        },
        []
    );

    const getQuestionNextOrder = useCallback(
        async (quizId: string): Promise<number> => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await questionsApi.getNextOrder(quizId);
                return result.nextOrder;
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al obtener siguiente orden'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getQuestionById = useCallback(async (id: string): Promise<Question> => {
        setIsLoading(true);
        setError(null);
        try {
            return await questionsApi.getById(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar pregunta');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateQuestion = useCallback(
        async (id: string, data: UpdateQuestionDto): Promise<Question> => {
            setIsLoading(true);
            setError(null);
            try {
                return await questionsApi.update(id, data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al actualizar pregunta');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteQuestion = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await questionsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar pregunta');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ========== ANSWER OPTIONS ==========

    const createAnswerOption = useCallback(
        async (data: CreateAnswerOptionSimpleDto): Promise<AnswerOption> => {
            setIsLoading(true);
            setError(null);
            try {
                return await answerOptionsApi.create(data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al crear opción de respuesta'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getAnswerOptionsByQuestion = useCallback(
        async (questionId: string): Promise<AnswerOption[]> => {
            setIsLoading(true);
            setError(null);
            try {
                return await answerOptionsApi.getByQuestion(questionId);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al cargar opciones de respuesta'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const updateAnswerOption = useCallback(
        async (id: string, data: UpdateAnswerOptionDto): Promise<AnswerOption> => {
            setIsLoading(true);
            setError(null);
            try {
                return await answerOptionsApi.update(id, data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al actualizar opción de respuesta'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteAnswerOption = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await answerOptionsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al eliminar opción de respuesta'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ========== QUESTION IMAGE ==========

    const uploadQuestionImage = useCallback(
        async (questionId: string, file: File): Promise<Question> => {
            setIsLoading(true);
            setError(null);
            try {
                return await questionsApi.uploadImage(questionId, file);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al subir imagen de pregunta'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const removeQuestionImage = useCallback(
        async (questionId: string): Promise<Question> => {
            setIsLoading(true);
            setError(null);
            try {
                return await questionsApi.removeImage(questionId);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al eliminar imagen de pregunta'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        isLoading,
        error,
        // Quizzes
        createQuiz,
        getQuizzes,
        getQuizById,
        getQuizzesByModule,
        updateQuiz,
        deleteQuiz,
        duplicateQuiz,
        // Questions
        createQuestion,
        createQuestionSimple,
        getQuestionsByQuiz,
        getQuestionNextOrder,
        getQuestionById,
        updateQuestion,
        deleteQuestion,
        // Answer Options
        createAnswerOption,
        getAnswerOptionsByQuestion,
        updateAnswerOption,
        deleteAnswerOption,
        // Question Image
        uploadQuestionImage,
        removeQuestionImage,
    };
}
