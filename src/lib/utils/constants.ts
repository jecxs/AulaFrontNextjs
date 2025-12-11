// src/lib/utils/constants.ts
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Illumina';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
    },
    STUDENT: {
        DASHBOARD: '/student/dashboard',
        COURSES: '/student/courses',
        PROFILE: '/student/profile',
        LIVE_SESSIONS: '/student/live-sessions',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        COURSES: '/admin/courses',
        USERS: '/admin/users',
        ENROLLMENTS: '/admin/enrollments',
        ANALYTICS: '/admin/analytics',
        CATEGORIES: '/admin/categories',
        INSTRUCTORS: '/admin/instructors',
    },
    UNAUTHORIZED: '/unauthorized',
    HOME: '/',
} as const;

// Tipos para TypeScript
export type RouteType = typeof ROUTES;

// Estados de enrollment
export const ENROLLMENT_STATUS = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    SUSPENDED: 'SUSPENDED',
    EXPIRED: 'EXPIRED',
} as const;

// Estados de cursos
export const COURSE_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
} as const;

// Niveles de curso
export const COURSE_LEVELS = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
} as const;

// Configuración de paginación
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
} as const;

// Configuración de cache
export const CACHE_TIMES = {
    SHORT: 2 * 60 * 1000,      // 2 minutos
    MEDIUM: 5 * 60 * 1000,     // 5 minutos
    LONG: 10 * 60 * 1000,      // 10 minutos
    VERY_LONG: 30 * 60 * 1000, // 30 minutos
} as const;