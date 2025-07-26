export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Aula Virtual';

export const ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
    },
    STUDENT: {
        DASHBOARD: '/student/dashboard',
        COURSES: '/student/courses',
        PROFILE: '/student/profile',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        COURSES: '/admin/courses',
        USERS: '/admin/users',
        ENROLLMENTS: '/admin/enrollments',
    },
    UNAUTHORIZED: '/unauthorized',
} as const;