// src/types/enrollment.ts
import { Course, Enrollment } from './course';

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