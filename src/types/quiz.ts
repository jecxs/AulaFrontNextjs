// src/types/quiz.ts

// ========== ENUMS ==========
export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
    SHORT_ANSWER = 'SHORT_ANSWER',
    ESSAY = 'ESSAY',
}

export enum QuizStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

// ========== QUIZ ==========
export interface Quiz {
    id: string;
    title: string;
    description?: string;
    moduleId: string;
    module?: {
        id: string;
        title: string;
        courseId: string;
    };
    passingScore: number;
    timeLimit?: number; // en minutos
    isRequired: boolean;
    status: QuizStatus;
    order: number;
    createdAt: string;
    updatedAt: string;
    questions?: Question[];
    _count?: {
        questions: number;
    };
}

export interface CreateQuizDto {
    title: string;
    moduleId: string;
    passingScore?: number;
    attemptsAllowed?: number;
}

export interface UpdateQuizDto {
    title?: string;
    passingScore?: number;
    attemptsAllowed?: number;
}

// ========== QUESTION ==========
export interface Question {
    id: string;
    quizId: string;
    quiz?: {
        id: string;
        title: string;
        moduleId: string;
    };
    text: string;  // Backend usa 'text' no 'questionText'
    type: string;  // Backend usa 'type' no 'questionType'
    imageUrl?: string;
    order: number;
    weight: number;  // Backend usa 'weight' no 'points'
    createdAt?: string;
    updatedAt?: string;
    answerOptions?: AnswerOption[];
    _count?: {
        answerOptions: number;
    };
}

export interface CreateQuestionDto {
    quizId: string;
    questionText: string;
    questionType: QuestionType;
    imageUrl?: string;
    order?: number;
    points?: number;
    answerOptions?: CreateAnswerOptionDto[];
}

export interface CreateQuestionSimpleDto {
    quizId: string;
    text: string;
    type: string;
    order: number;
    weight?: number;
    imageUrl?: string; // URL de la imagen (opcional)
}

export interface CreateQuestionWithImageDto {
    quizId: string;
    questionText: string;
    questionType: QuestionType;
    order?: number;
    points?: number;
}

export interface UpdateQuestionDto {
    text?: string;
    type?: string;
    order?: number;
    weight?: number;
    imageUrl?: string;
    quizId?: string;
}

// ========== ANSWER OPTION ==========
export interface AnswerOption {
    id: string;
    questionId: string;
    question?: {
        id: string;
        text: string;
        quizId: string;
    };
    text: string;  // Backend usa 'text' no 'optionText'
    isCorrect: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAnswerOptionDto {
    questionId: string;
    text: string;
    isCorrect: boolean;
    order?: number;
}

export interface CreateAnswerOptionSimpleDto {
    questionId: string;
    text: string;
    isCorrect: boolean;
}

export interface UpdateAnswerOptionDto {
    text?: string;
    isCorrect?: boolean;
    order?: number;
}

// ========== QUERIES ==========
export interface QueryQuizzesDto {
    page?: number;
    limit?: number;
    moduleId?: string;
    status?: QuizStatus;
}

export interface QueryQuestionsDto {
    page?: number;
    limit?: number;
    quizId?: string;
    questionType?: QuestionType;
}

// ========== STATS ==========
export interface QuizStats {
    total: number;
    byStatus: {
        draft: number;
        published: number;
        archived: number;
    };
    recent: {
        last30Days: number;
    };
}

export interface QuestionStats {
    total: number;
    byType: {
        multipleChoice: number;
        trueFalse: number;
        shortAnswer: number;
        essay: number;
    };
}

// ========== STUDENT TYPES ==========
// Para estudiantes (sin información sensible)
export interface QuizForStudent {
    id: string;
    title: string;
    description?: string;
    moduleId: string;
    passingScore: number;
    timeLimit?: number;
    attemptsAllowed: number;
    isRequired: boolean;
    order: number;
    questionsCount: number;
    totalPoints: number;
}

export interface AnswerOptionForStudent {
    id: string;
    text: string;
    // isCorrect omitido para estudiantes
}

export interface QuestionForStudent {
    id: string;
    text: string;
    type: string;
    order: number;
    weight: number;
    imageUrl?: string;
    answerOptions: AnswerOptionForStudent[];
}

export interface QuizPreview {
    id: string;
    title: string;
    description?: string;
    moduleId: string;
    passingScore: number;
    timeLimit?: number;
    attemptsAllowed: number;
    questionsCount: number;
    totalPoints: number;
    questions: QuestionForStudent[];
}

// ========== QUIZ SUBMISSION ==========
export interface QuizAnswer {
    questionId: string;
    answerOptionIds?: string[]; // Para MULTIPLE_CHOICE, TRUE_FALSE
    textAnswer?: string; // Para SHORT_ANSWER, ESSAY
}

export interface SubmitQuizDto {
    quizId: string;
    answers: QuizAnswer[];
}

export interface QuizSubmissionResult {
    id: string;
    quizId: string;
    userId: string;
    score: number;
    passed: boolean;
    submittedAt: string;
    answers: {
        questionId: string;
        questionText: string;
        questionWeight: number;
        answerOptionIds?: string[];
        textAnswer?: string;
        isCorrect: boolean;
        pointsEarned: number;
    }[];
}

// ========== QUIZ RESULTS ==========
export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    score: number;
    passed: boolean;
    submittedAt: string;
}

export interface QuizResults {
    quiz: QuizForStudent;
    attempts: QuizAttempt[];
    attemptsUsed: number;
    attemptsRemaining: number;
    canRetake: boolean;
    bestScore?: number;
    lastAttempt?: QuizAttempt;
}

// ========== MODULE WITH QUIZZES ==========
export interface ModuleWithQuizzes {
    id: string;
    title: string;
    description?: string;
    order: number;
    isRequired: boolean;
    courseId: string;
    lessons: any[];
    quizzes: QuizForStudent[];
    _count?: {
        lessons: number;
        quizzes: number;
    };
}