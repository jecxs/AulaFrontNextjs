// src/types/instructor.ts

export interface Instructor {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    bio?: string;
    specialization?: string;
    experience?: string;
    linkedinUrl?: string;
    createdAt: string;
}

export interface InstructorWithCourses extends Instructor {
    courses: Array<{
        id: string;
        title: string;
        slug: string;
        status: string;
        level: string;
        enrollmentCount: number;
    }>;
    _count: {
        courses: number;
    };
}

export interface InstructorList {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    specialization?: string;
    _count: {
        courses: number;
    };
    createdAt: string;
}

export interface CreateInstructorDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    bio?: string;
    specialization?: string;
    experience?: string;
    linkedinUrl?: string;
}

export interface UpdateInstructorDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
    specialization?: string;
    experience?: string;
    linkedinUrl?: string;
}

export interface QueryInstructorsDto {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface InstructorsResponse {
    data: InstructorList[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface InstructorStats {
    total: number;
    withCourses: number;
    withoutCourses: number;
    totalCourses: number;
    avgCoursesPerInstructor: number;
}