// src/lib/api/quizzes.ts
import { apiClient } from './client';
import {
    Quiz,
    CreateQuizDto,
    UpdateQuizDto,
    QueryQuizzesDto,
    QuizStats,
    Question,
    CreateQuestionDto,
    CreateQuestionSimpleDto,
    UpdateQuestionDto,
    QueryQuestionsDto,
    AnswerOption,
    CreateAnswerOptionDto,
    CreateAnswerOptionSimpleDto,
    UpdateAnswerOptionDto,
    QuizForStudent,
    QuizPreview,
    SubmitQuizDto,
    QuizSubmissionResult,
    QuizResults,
} from '@/types/quiz';

// ========== QUIZZES API ==========
export const quizzesApi = {
    // Crear quiz (Solo ADMIN)
    create: async (data: CreateQuizDto): Promise<Quiz> => {
        return apiClient.post<Quiz>('/quizzes', data);
    },

    // Obtener todos los quizzes con filtros (Solo ADMIN)
    getAll: async (query?: QueryQuizzesDto): Promise<{ data: Quiz[]; pagination: any }> => {
        return apiClient.get('/quizzes', { params: query });
    },

    // Obtener quiz por ID
    getById: async (id: string): Promise<Quiz> => {
        return apiClient.get(`/quizzes/${id}`);
    },

    // Obtener quizzes de un módulo específico
    getByModule: async (moduleId: string): Promise<QuizForStudent[]> => {
        return apiClient.get(`/quizzes/module/${moduleId}`);
    },

    // Obtener preview del quiz para estudiantes
    getPreview: async (id: string): Promise<QuizPreview> => {
        return apiClient.get(`/quizzes/${id}/preview`);
    },

    // Enviar respuestas de quiz (ESTUDIANTE)
    submitQuiz: async (quizId: string, data: SubmitQuizDto): Promise<QuizSubmissionResult> => {
        return apiClient.post(`/quizzes/${quizId}/submit`, data);
    },

    // Obtener resultados de un quiz (ESTUDIANTE)
    getResults: async (quizId: string, userId: string): Promise<QuizResults> => {
        return apiClient.get(`/quizzes/${quizId}/results/${userId}`);
    },

    // Actualizar quiz (Solo ADMIN)
    update: async (id: string, data: UpdateQuizDto): Promise<Quiz> => {
        return apiClient.patch<Quiz>(`/quizzes/${id}`, data);
    },

    // Duplicar quiz a otro módulo (Solo ADMIN)
    duplicate: async (id: string, targetModuleId: string): Promise<Quiz> => {
        return apiClient.post(`/quizzes/${id}/duplicate`, {
            targetModuleId,
        });
    },

    // Obtener estadísticas de quizzes (Solo ADMIN)
    getStats: async (): Promise<QuizStats> => {
        return apiClient.get('/quizzes/stats');
    },

    // Eliminar quiz (Solo ADMIN)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete(`/quizzes/${id}`);
    },
};

// ========== QUESTIONS API ==========
export const questionsApi = {
    // Crear pregunta completa con opciones (Solo ADMIN)
    create: async (data: CreateQuestionDto): Promise<Question> => {
        return apiClient.post<Question>('/questions', data);
    },

    // Crear pregunta simple sin opciones (Solo ADMIN)
    createSimple: async (data: CreateQuestionSimpleDto): Promise<Question> => {
        return apiClient.post<Question>('/questions/simple', data);
    },

    // Crear pregunta con imagen (Solo ADMIN)
    createWithImage: async (data: FormData): Promise<Question> => {
        return apiClient.post<Question>('/questions/upload-with-image', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Obtener todas las preguntas con filtros (Solo ADMIN)
    getAll: async (query?: QueryQuestionsDto): Promise<{ data: Question[]; pagination: any }> => {
        return apiClient.get('/questions', { params: query });
    },

    // Obtener preguntas de un quiz específico
    getByQuiz: async (quizId: string): Promise<Question[]> => {
        return apiClient.get(`/questions/quiz/${quizId}`);
    },

    // Obtener siguiente orden disponible para un quiz
    getNextOrder: async (quizId: string): Promise<{ nextOrder: number }> => {
        return apiClient.get(`/questions/quiz/${quizId}/next-order`);
    },

    // Obtener pregunta por ID
    getById: async (id: string): Promise<Question> => {
        return apiClient.get(`/questions/${id}`);
    },

    // Actualizar pregunta (Solo ADMIN)
    update: async (id: string, data: UpdateQuestionDto): Promise<Question> => {
        return apiClient.patch<Question>(`/questions/${id}`, data);
    },

    // Cargar imagen a pregunta existente (Solo ADMIN)
    uploadImage: async (questionId: string, file: File): Promise<Question> => {
        const formData = new FormData();
        formData.append('image', file);
        return apiClient.patch<Question>(`/questions/${questionId}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Eliminar imagen de pregunta (Solo ADMIN)
    removeImage: async (questionId: string): Promise<Question> => {
        return apiClient.delete<Question>(`/questions/${questionId}/remove-image`);
    },

    // Duplicar pregunta a otro quiz (Solo ADMIN)
    duplicate: async (id: string, targetQuizId: string): Promise<Question> => {
        return apiClient.post(`/questions/${id}/duplicate`, {
            targetQuizId,
        });
    },

    // Obtener estadísticas de preguntas (Solo ADMIN)
    getStats: async (): Promise<any> => {
        return apiClient.get('/questions/stats');
    },

    // Eliminar pregunta (Solo ADMIN)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete(`/questions/${id}`);
    },
};

// ========== ANSWER OPTIONS API ==========
export const answerOptionsApi = {
    // Agregar opción de respuesta (Solo ADMIN)
    create: async (data: CreateAnswerOptionSimpleDto): Promise<AnswerOption> => {
        return apiClient.post<AnswerOption>(
            `/questions/${data.questionId}/answer-options`,
            data
        );
    },

    // Obtener opciones de una pregunta (Solo ADMIN)
    getByQuestion: async (questionId: string): Promise<AnswerOption[]> => {
        return apiClient.get(`/questions/${questionId}/answer-options`);
    },

    // Actualizar opción (Solo ADMIN)
    update: async (id: string, data: UpdateAnswerOptionDto): Promise<AnswerOption> => {
        return apiClient.patch<AnswerOption>(`/questions/answer-options/${id}`, data);
    },

    // Eliminar opción (Solo ADMIN)
    delete: async (id: string): Promise<void> => {
        return apiClient.delete(`/questions/answer-options/${id}`);
    },
};

