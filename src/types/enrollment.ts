// src/types/enrollment.ts
import { Course } from './course';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'EXPIRED';

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

export interface EnrollmentProgress {
    completedLessons: number;
    totalLessons: number;
    completionPercentage: number;
}

export interface EnrollmentWithCourse extends Enrollment {
    course: Course;
    progress?: EnrollmentProgress;
}

export interface MyEnrollmentsResponse {
    data: EnrollmentWithCourse[];
    total: number;
}

export interface StudentCoursesStats {
    total: number;
    completed: number;
    inProgress: number;
    active: number;
    totalHours: number;
    avgProgress: number;
}