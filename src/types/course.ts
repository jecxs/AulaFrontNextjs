// src/types/course.ts
export enum CourseLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
}

export enum CourseStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum CourseVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

export enum LessonType {
    VIDEO = 'VIDEO',
    TEXT = 'TEXT',
    SCORM = 'SCORM',
}

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
}

// ========== ENROLLMENT ==========
export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledById: string;
    status: EnrollmentStatus;
    paymentConfirmed: boolean;
    enrolledAt: string;
    expiresAt?: string;
}

// ========== COURSE ==========
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
    categoryId: string;
    instructorId: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    instructor?: {
        id: string;
        firstName: string;
        lastName: string;
        bio?: string;
    };
    modules?: Module[];
    _count?: {
        modules: number;
        enrollments: number;
    };
}

export interface CreateCourseDto {
    title: string;
    slug: string;
    summary?: string;
    description?: string;
    level: CourseLevel;
    thumbnailUrl?: string;
    estimatedHours?: number;
    price?: number;
    status?: CourseStatus;
    visibility?: CourseVisibility;
    categoryId: string;
    instructorId: string;
}

export interface UpdateCourseDto {
    title?: string;
    slug?: string;
    summary?: string;
    description?: string;
    level?: CourseLevel;
    thumbnailUrl?: string;
    estimatedHours?: number;
    price?: number;
    status?: CourseStatus;
    visibility?: CourseVisibility;
    categoryId?: string;
    instructorId?: string;
}

export interface CourseListResponse {
    data: Course[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CourseStats {
    total: number;
    byStatus: {
        draft: number;
        published: number;
        archived: number;
    };
    byLevel: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
    recent: {
        last30Days: number;
    };
}

// ========== MODULE ==========
export interface Module {
    id: string;
    title: string;
    description?: string;
    order: number;
    isRequired: boolean;
    courseId: string;
    course?: {
        id: string;
        title: string;
        status: string;
    };
    lessons?: Lesson[];
    quizzes?: any[];
    _count?: {
        lessons: number;
        quizzes: number;
    };
}

export interface CreateModuleDto {
    title: string;
    description?: string;
    order: number;
    isRequired?: boolean;
    courseId: string;
}

export interface UpdateModuleDto {
    title?: string;
    description?: string;
    order?: number;
    isRequired?: boolean;
}

export interface ReorderModulesDto {
    modules: Array<{
        id: string;
        order: number;
    }>;
}

// ========== LESSON ==========
export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    order: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
    moduleId: string;
    module?: {
        id: string;
        title: string;
        course?: {
            id: string;
            title: string;
        };
    };
    resources?: Resource[];
    _count?: {
        resources: number;
    };
}

export interface Resource {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    sizeKb?: number;
    lessonId: string;
}

export interface CreateLessonDto {
    title: string;
    type: LessonType;
    order: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
    moduleId: string;
}

export interface UpdateLessonDto {
    title?: string;
    type?: LessonType;
    order?: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
}

export interface ReorderLessonsDto {
    lessons: Array<{
        id: string;
        order: number;
    }>;
}

export interface CreateResourceDto {
    fileName: string;
    fileType: string;
    fileUrl: string;
    sizeKb?: number;
    lessonId: string;
}

export interface UpdateResourceDto {
    fileName?: string;
    fileType?: string;
    fileUrl?: string;
    sizeKb?: number;
}

// ========== PROGRESS (para contexto) ==========
export interface CourseProgress {
    courseId: string;
    userId: string;
    enrollment: {
        id: string;
        enrolledAt: string;
        expiresAt?: string;
        status: string;
    };
    overall: {
        totalLessons: number;
        completedLessons: number;
        completionPercentage: number;
        averageScore?: number;
    };
    modules: Array<{
        moduleId: string;
        title: string;
        order: number;
        totalLessons: number;
        completedLessons: number;
        completionPercentage: number;
        lessons: Array<{
            lessonId: string;
            title: string;
            type: LessonType;
            order: number;
            isCompleted: boolean;
            completedAt?: string;
            score?: number;
        }>;
    }>;
}

// Crear Curso
export interface CreateCourseDto {
    title: string;
    slug: string;
    summary?: string;
    description?: string;
    level: CourseLevel;
    thumbnailUrl?: string;
    estimatedHours?: number;
    price?: number;
    status?: CourseStatus;
    visibility?: CourseVisibility;
    categoryId: string;
    instructorId: string;
}

// Actualizar Curso
export interface UpdateCourseDto {
    title?: string;
    slug?: string;
    summary?: string;
    description?: string;
    level?: CourseLevel;
    thumbnailUrl?: string;
    estimatedHours?: number;
    price?: number;
    status?: CourseStatus;
    visibility?: CourseVisibility;
    categoryId?: string;
    instructorId?: string;
}

// Estadísticas de Cursos
export interface CourseStats {
    total: number;
    byStatus: {
        draft: number;
        published: number;
        archived: number;
    };
    byLevel: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
    recent: {
        last30Days: number;
    };
}

// ========== DTOs PARA MÓDULOS ==========

export interface CreateModuleDto {
    title: string;
    description?: string;
    order: number;
    isRequired?: boolean;
    courseId: string;
}

export interface UpdateModuleDto {
    title?: string;
    description?: string;
    order?: number;
    isRequired?: boolean;
}

export interface ReorderModulesDto {
    modules: Array<{
        id: string;
        order: number;
    }>;
}

// ========== DTOs PARA LECCIONES ==========

export interface CreateLessonDto {
    title: string;
    type: LessonType;
    order: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
    moduleId: string;
}

export interface UpdateLessonDto {
    title?: string;
    type?: LessonType;
    order?: number;
    durationSec?: number;
    videoUrl?: string;
    markdownContent?: string;
}

export interface ReorderLessonsDto {
    lessons: Array<{
        id: string;
        order: number;
    }>;
}

// ========== DTOs PARA RECURSOS ==========

export interface CreateResourceDto {
    fileName: string;
    fileType: string;
    fileUrl: string;
    sizeKb?: number;
    lessonId: string;
}

export interface UpdateResourceDto {
    fileName?: string;
    fileType?: string;
    fileUrl?: string;
    sizeKb?: number;
}

// ========== RESPUESTAS CON PAGINACIÓN ==========

export interface ModulesResponse {
    data: Module[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LessonsResponse {
    data: Lesson[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}


export interface QueryCoursesDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    categoryId?: string;
    instructorId?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}