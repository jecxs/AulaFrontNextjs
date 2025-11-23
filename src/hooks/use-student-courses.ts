// src/hooks/use-student-courses.ts
import { useState, useEffect } from 'react';
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

            // Invalidar TODAS las queries relacionadas con progreso para asegurar actualización completa
            // 1. Progreso de la lección específica
            queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
            
            // 2. Progreso del curso (todas las variantes)
            queryClient.invalidateQueries({ queryKey: ['course-progress'] });
            queryClient.invalidateQueries({ queryKey: ['student-course-progress'] });
            
            // 3. Enrollments del estudiante (para dashboard y lista de cursos)
            queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['student-courses'] });
            
            // 4. Siguiente lección
            queryClient.invalidateQueries({ queryKey: ['next-lesson'] });
            
            // 5. Progreso de módulos
            queryClient.invalidateQueries({ queryKey: ['module-progress'] });
            
            // 6. Resumen de progreso general
            queryClient.invalidateQueries({ queryKey: ['my-progress'] });
            
            // 7. Invalidar también queries de enrollments (para que el admin vea el progreso actualizado)
            // Esto es importante porque el admin necesita ver el progreso actualizado
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
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
    const [enrichedEnrollments, setEnrichedEnrollments] = useState<EnrollmentWithCourse[]>([]);
    const [isEnriching, setIsEnriching] = useState(false);

    const query = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: coursesApi.getMyEnrollments,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });

    // La API retorna { data: [...], total: number }
    const enrollments = query.data?.data || [];
    const total = query.data?.total || 0;

    // Enriquecer enrollments con el conteo real de módulos
    useEffect(() => {
        if (enrollments.length > 0 && !isEnriching) {
            setIsEnriching(true);

            // Obtener el conteo de módulos para cada curso
            Promise.all(
                enrollments.map(async (enrollment) => {
                    try {
                        // Solo obtener el conteo si no está presente o es 0
                        if (!enrollment.course._count?.modules || enrollment.course._count.modules === 0) {
                            const modules = await coursesApi.getCourseModules(enrollment.course.id);
                            return {
                                ...enrollment,
                                course: {
                                    ...enrollment.course,
                                    _count: {
                                        ...enrollment.course._count,
                                        modules: modules.length,
                                        enrollments: enrollment.course._count?.enrollments || 0
                                    }
                                }
                            };
                        }
                        return enrollment;
                    } catch (error) {
                        console.error(`Error loading modules count for course ${enrollment.course.id}:`, error);
                        return enrollment;
                    }
                })
            ).then(enriched => {
                setEnrichedEnrollments(enriched);
                setIsEnriching(false);
            });
        } else if (enrollments.length === 0) {
            setEnrichedEnrollments([]);
            setIsEnriching(false);
        }
    }, [enrollments, isEnriching]);

    // Usar los enrollments enriquecidos si están disponibles, sino usar los originales
    const finalEnrollments = enrichedEnrollments.length > 0 ? enrichedEnrollments : enrollments;

    // Calcular estadísticas basadas en los enrollments
    const stats: StudentCoursesStats = {
        total: finalEnrollments.length,
        completed: finalEnrollments.filter(e =>
            e.progress?.completionPercentage === 100
        ).length,
        inProgress: finalEnrollments.filter(e =>
            e.progress &&
            e.progress.completionPercentage > 0 &&
            e.progress.completionPercentage < 100
        ).length,
        active: finalEnrollments.filter(e => e.status === 'ACTIVE').length,
        totalHours: finalEnrollments.reduce((acc, e) =>
            acc + (e.course?.estimatedHours || 0), 0
        ),
        avgProgress: finalEnrollments.length > 0
            ? Math.round(
                finalEnrollments.reduce((acc, e) =>
                    acc + (e.progress?.completionPercentage || 0), 0
                ) / finalEnrollments.length
            )
            : 0
    };

    return {
        enrollments: finalEnrollments,
        total,
        stats,
        isLoading: query.isLoading || isEnriching,
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