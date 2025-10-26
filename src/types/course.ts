// src/types/course.ts
export interface Course {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    description?: string;
    level: CourseLevel;
    thumbnailUrl?: string;
    estimatedHours?: number;
    price?: number;
    status: CourseStatus;
    visibility: CourseVisibility;
    createdAt: string;
    publishedAt?: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    instructor: {
        id: string;
        firstName: string;
        lastName: string;
        bio?: string;
    };
    _count?: {
        modules: number;
        enrollments: number;
    };
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    order: number;
    isRequired: boolean;
    courseId: string;
    lessons: Lesson[];
    quizzes: Quiz[];
    _count: {
        lessons: number;
        quizzes: number;
    };
}

export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    order: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
    moduleId: string;
    resources: Resource[];
    isCompleted?: boolean;
    completedAt?: string;
    score?: number;
}

export interface Resource {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    sizeKb?: number;
    lessonId: string;
}

export interface Quiz {
    id: string;
    title: string;
    passingScore: number;
    attemptsAllowed: number;
    moduleId: string;
    questions: Question[];
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    order: number;
    weight: number;
    quizId: string;
    answerOptions: AnswerOption[];
}

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
    questionId: string;
}

export interface Enrollment {
    id: string;
    status: EnrollmentStatus;
    paymentConfirmed: boolean;
    enrolledAt: string;
    expiresAt?: string;
    userId: string;
    courseId: string;
    course: Course;
}

export interface Progress {
    id: string;
    isCompleted: boolean;
    completedAt?: string;
    score?: number;
    enrollmentId: string;
    lessonId: string;
    lesson: Lesson;
}

export interface CourseProgress {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    lastActivity?: string;
    modules: ModuleProgress[];
}

export interface ModuleProgress {
    moduleId: string;
    moduleTitle: string;
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    lessons: LessonProgress[];
}

export interface LessonProgress {
    lessonId: string;
    title: string;
    type: LessonType;
    order: number;
    isCompleted: boolean;
    completedAt?: string;
    score?: number;
}

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    userId: string;
}

// Enums
export enum CourseLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export enum CourseStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export enum CourseVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE'
}

export enum LessonType {
    VIDEO = 'VIDEO',
    TEXT = 'TEXT'
}

export enum QuestionType {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE'
}

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

export enum NotificationType {
    GENERAL = 'GENERAL',
    COURSE_UPDATE = 'COURSE_UPDATE',
    ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
    QUIZ_RESULT = 'QUIZ_RESULT',
    MODULE_COMPLETED = 'MODULE_COMPLETED'
}


//Para admin
export interface QueryCoursesDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    categoryId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CoursesResponse {
    data: Course[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}