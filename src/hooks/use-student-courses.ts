// src/hooks/use-student-courses.ts
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';

export function useStudentCourses() {

    // Query para obtener los enrollments del estudiante
    const {
        data: enrollmentsData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: coursesApi.getMyEnrollments,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });

    const enrollments = enrollmentsData?.data || [];
    const total = enrollmentsData?.total || 0;

    // Estadísticas calculadas
    const stats = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === 'ACTIVE').length,
        completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        inProgress: enrollments.filter(e =>
            e.status === 'ACTIVE' &&
            e.progress &&
            e.progress.completionPercentage > 0 &&
            e.progress.completionPercentage < 100
        ).length,
        totalHours: enrollments.reduce((acc, e) => acc + (e.course.estimatedHours || 0), 0),
        avgProgress: enrollments.length > 0
            ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress?.completionPercentage || 0), 0) / enrollments.length)
            : 0
    };

    return {
        enrollments,
        total,
        stats,
        isLoading,
        error,
        refetch
    };
}

export function useStudentCourse(courseId: string) {
    return useQuery({
        queryKey: ['student-course', courseId],
        queryFn: () => coursesApi.getCourse(courseId),
        enabled: !!courseId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

export function useStudentCourseProgress(courseId: string) {
    return useQuery({
        queryKey: ['student-course-progress', courseId],
        queryFn: () => coursesApi.getMyCourseProgress(courseId),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente para el progreso)
    });
}

export function useStudentCourseModules(courseId: string) {
    return useQuery({
        queryKey: ['student-course-modules', courseId],
        queryFn: () => coursesApi.getCourseModules(courseId),
        enabled: !!courseId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

export function useStudentModuleLessons(moduleId: string) {
    return useQuery({
        queryKey: ['student-module-lessons', moduleId],
        queryFn: () => coursesApi.getModuleLessons(moduleId),
        enabled: !!moduleId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

export function useStudentLesson(lessonId: string) {
    return useQuery({
        queryKey: ['student-lesson', lessonId],
        queryFn: () => coursesApi.getLesson(lessonId),
        enabled: !!lessonId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}