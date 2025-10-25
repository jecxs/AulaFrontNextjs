// src/hooks/use-student-courses.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '@/lib/api/progress';
import { coursesApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import {
    EnrollmentWithCourse,
    StudentCoursesStats
} from '@/types/enrollment';
import { Course, Module, Lesson, CourseProgress } from '@/types/course';

// ========== HOOKS DE PROGRESO ==========

// Hook principal para marcar lección como completada
export function useMarkLessonComplete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, score }: { lessonId: string; score?: number }) =>
            progressApi.markLessonComplete(lessonId, score),
        onSuccess: (data, variables) => {
            toast.success('¡Lección completada!');

            // Invalidar caché para actualizar el progreso
            queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.lessonId] });
            queryClient.invalidateQueries({ queryKey: ['course-progress'] });
            queryClient.invalidateQueries({ queryKey: ['student-courses'] });
            queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
        },
        onError: (error) => {
            console.error('Error marking lesson complete:', error);
            toast.error('Error al completar la lección');
        }
    });
}

// Hook para verificar progreso de lección
export function useLessonProgress(lessonId: string) {
    return useQuery({
        queryKey: ['lesson-progress', lessonId],
        queryFn: () => progressApi.checkLessonProgress(lessonId),
        enabled: !!lessonId
    });
}

// Hook para obtener progreso del curso
export function useCourseProgress(courseId: string) {
    return useQuery<CourseProgress>({
        queryKey: ['course-progress', courseId],
        queryFn: () => progressApi.getCourseProgress(courseId),
        enabled: !!courseId
    });
}

// Hook para obtener siguiente lección
export function useNextLesson(courseId: string) {
    return useQuery<Lesson | null>({
        queryKey: ['next-lesson', courseId],
        queryFn: () => progressApi.getNextLesson(courseId),
        enabled: !!courseId
    });
}

// ========== HOOKS PARA DASHBOARD Y CURSOS ==========

interface UseStudentCoursesReturn {
    enrollments: EnrollmentWithCourse[];
    total: number;
    stats: StudentCoursesStats;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Hook principal para obtener cursos del estudiante (para el dashboard)
export function useStudentCourses(): UseStudentCoursesReturn {
    const query = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: coursesApi.getMyEnrollments,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });

    // La API retorna { data: [...], total: number }
    const enrollments = query.data?.data || [];
    const total = query.data?.total || 0;

    // Calcular estadísticas basadas en los enrollments
    const stats: StudentCoursesStats = {
        total: enrollments.length,
        completed: enrollments.filter(e =>
            e.progress?.completionPercentage === 100
        ).length,
        inProgress: enrollments.filter(e =>
            e.progress &&
            e.progress.completionPercentage > 0 &&
            e.progress.completionPercentage < 100
        ).length,
        active: enrollments.filter(e => e.status === 'ACTIVE').length,
        totalHours: enrollments.reduce((acc, e) =>
            acc + (e.course?.estimatedHours || 0), 0
        ),
        avgProgress: enrollments.length > 0
            ? Math.round(
                enrollments.reduce((acc, e) =>
                    acc + (e.progress?.completionPercentage || 0), 0
                ) / enrollments.length
            )
            : 0
    };

    return {
        enrollments,
        total,
        stats,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
}

// Hook para obtener un curso específico
export function useStudentCourse(courseId: string) {
    return useQuery<Course>({
        queryKey: ['student-course', courseId],
        queryFn: () => coursesApi.getCourse(courseId),
        enabled: !!courseId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener progreso de un curso específico
export function useStudentCourseProgress(courseId: string) {
    return useQuery<CourseProgress>({
        queryKey: ['student-course-progress', courseId],
        queryFn: () => coursesApi.getMyCourseProgress(courseId),
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente para el progreso)
    });
}

// Hook para obtener módulos de un curso
export function useStudentCourseModules(courseId: string) {
    return useQuery<Module[]>({
        queryKey: ['student-course-modules', courseId],
        queryFn: () => coursesApi.getCourseModules(courseId),
        enabled: !!courseId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener lecciones de un módulo
export function useStudentModuleLessons(moduleId: string) {
    return useQuery<Lesson[]>({
        queryKey: ['student-module-lessons', moduleId],
        queryFn: () => coursesApi.getModuleLessons(moduleId),
        enabled: !!moduleId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener una lección específica
export function useStudentLesson(lessonId: string) {
    return useQuery<Lesson>({
        queryKey: ['student-lesson', lessonId],
        queryFn: () => coursesApi.getLesson(lessonId),
        enabled: !!lessonId,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener un curso con su información completa (curso + módulos + progreso)
export function useStudentCourseComplete(courseId: string) {
    const courseQuery = useStudentCourse(courseId);
    const modulesQuery = useStudentCourseModules(courseId);
    const progressQuery = useStudentCourseProgress(courseId);

    return {
        course: courseQuery.data,
        modules: modulesQuery.data,
        progress: progressQuery.data,
        isLoading: courseQuery.isLoading || modulesQuery.isLoading || progressQuery.isLoading,
        error: courseQuery.error || modulesQuery.error || progressQuery.error,
        refetch: () => {
            courseQuery.refetch();
            modulesQuery.refetch();
            progressQuery.refetch();
        }
    };
}