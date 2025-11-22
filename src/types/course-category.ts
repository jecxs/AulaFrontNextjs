// src/types/course-category.ts

export interface CourseCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
}

export interface CourseCategoryWithCourses extends CourseCategory {
    courses: Array<{
        id: string;
        title: string;
        slug: string;
        status: string;
        level: string;
        thumbnailUrl?: string;
        enrollmentCount: number;
    }>;
    _count: {
        courses: number;
    };
}

export interface CourseCategoryList {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    _count: {
        courses: number;
    };
}

export interface CreateCourseCategoryDto {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateCourseCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
}

export interface QueryCourseCategoriesDto {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CourseCategoriesResponse {
    data: CourseCategoryList[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CategoryStats {
    total: number;
    active: number;
    inactive: number;
    categoriesWithCourses: number;
    categoriesWithoutCourses: number;
}