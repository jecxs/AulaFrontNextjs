// src/app/(admin)/admin/courses/[courseId]/page.tsx
'use client';

import {useState, useEffect, useCallback} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { useEnrollments } from '@/hooks/use-enrollments';
import { Course, Module, Lesson, CourseStatistics } from '@/types/course';
import { EnrollmentWithProgress } from '@/lib/api/enrollments';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

// Componentes divididos
import CourseHeader from '@/components/admin/courses/detail/CourseHeader';
import CourseTabs from '@/components/admin/courses/detail/CourseTabs';
import CourseContentTab from '@/components/admin/courses/detail/CourseContentTab';
import CourseStudentsTab from '@/components/admin/courses/detail/CourseStudentsTab';
import CourseStatsTab from '@/components/admin/courses/detail/CourseStatsTab';

// Modales
import CreateModuleModal from '@/components/admin/courses/CreateModuleModal';
import EditModuleModal from '@/components/admin/courses/EditModuleModal';
import CreateLessonModal from '@/components/admin/courses/CreateLessonModal';
import EditLessonModal from '@/components/admin/courses/EditLessonModal';
import EditCourseModal from '@/components/admin/courses/EditCourseModal';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';

type TabType = 'content' | 'students' | 'stats';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const {
        getCourseById,
        getModulesByCourse,
        deleteModule,
        deleteLesson,
        getCourseStatistics,
        isLoading,
    } = useCoursesAdmin();

    const {
        getCourseEnrollments,
        getEnrollments,
        suspendEnrollment,
        activateEnrollment,
        deleteEnrollment,
        isLoading: isLoadingEnrollments,
    } = useEnrollments();

    // Estados principales
    const [activeTab, setActiveTab] = useState<TabType>('content');
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [courseStats, setCourseStats] = useState<CourseStatistics | null>(null);

    // Estados para enrollments
    const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
    const [enrollmentsPagination, setEnrollmentsPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('');
    const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState('');

    // Estados de modales
    const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
    const [showEditModuleModal, setShowEditModuleModal] = useState(false);
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [showCreateEnrollmentModal, setShowCreateEnrollmentModal] = useState(false);

    // Estados para edición
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<string | null>(null);

    // Funciones de carga
    const reloadCourseData = useCallback(async () => {
        try {
            const [courseData, modulesData] = await Promise.all([
                getCourseById(courseId),
                getModulesByCourse(courseId),
            ]);
            setCourse(courseData);
            setModules(modulesData);
        } catch (err) {
            console.error('Error al recargar curso:', err);
        }
    }, [courseId, getCourseById, getModulesByCourse]);

    // Remover enrollmentsPagination de las dependencias
    const loadEnrollments = useCallback(async (
        page: number,
        limit: number,
        statusFilter: string,
        searchQuery: string
    ) => {
        try {
            const response = searchQuery
                ? await getEnrollments({
                    page,
                    limit,
                    courseId,
                    status: statusFilter || undefined,
                    search: searchQuery || undefined,
                })
                : await getCourseEnrollments(courseId, {
                    page,
                    limit,
                    status: statusFilter || undefined,
                });
            setEnrollments(response.data);
            setEnrollmentsPagination(response.pagination);
        } catch (err) {
            console.error('Error al cargar enrollments:', err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al cargar estudiantes');
        }
    }, [courseId, getEnrollments, getCourseEnrollments]);

    const loadCourseStatistics = useCallback(async () => {
        try {
            const stats = await getCourseStatistics(courseId);
            setCourseStats(stats);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al cargar estadísticas');
        }
    }, [courseId, getCourseStatistics]);

    // Efectos
    useEffect(() => {
        (async () => {
            try {
                const [courseData, modulesData] = await Promise.all([
                    getCourseById(courseId),
                    getModulesByCourse(courseId),
                ]);
                setCourse(courseData);
                setModules(modulesData);
            } catch (err) {
                console.error('Error al cargar curso:', err);
                const msg = err instanceof Error ? err.message : String(err);
                toast.error(msg || 'Error al cargar el curso');
                router.push('/admin/courses');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // ✅ SOLUCIÓN: Cargar enrollments cuando cambia el tab o los filtros
    useEffect(() => {
        if (activeTab === 'students') {
            loadEnrollments(
                enrollmentsPagination.page,
                enrollmentsPagination.limit,
                enrollmentStatusFilter,
                enrollmentSearchQuery
            );
        } else if (activeTab === 'stats') {
            loadCourseStatistics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        activeTab,
        enrollmentsPagination.page,
        enrollmentsPagination.limit,
        enrollmentStatusFilter,
        enrollmentSearchQuery
    ]);

    // Reset de página cuando cambian los filtros
    useEffect(() => {
        if (activeTab === 'students' && enrollmentsPagination.page !== 1) {
            setEnrollmentsPagination(prev => ({ ...prev, page: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrollmentStatusFilter, enrollmentSearchQuery]);

    // Handlers para módulos y lecciones
    const toggleModule = useCallback((moduleId: string) => {
        setExpandedModules(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(moduleId)) {
                newExpanded.delete(moduleId);
            } else {
                newExpanded.add(moduleId);
            }
            return newExpanded;
        });
    }, []);

    const handleDeleteModule = useCallback(async (moduleId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este módulo?')) return;

        try {
            await deleteModule(moduleId);
            toast.success('Módulo eliminado exitosamente');
            const modulesData = await getModulesByCourse(courseId);
            setModules(modulesData);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || 'Error al eliminar módulo');
        }
    }, [courseId, deleteModule, getModulesByCourse]);

    const handleDeleteLesson = useCallback(async (lessonId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta lección?')) return;

        try {
            await deleteLesson(lessonId);
            toast.success('Lección eliminada exitosamente');
            reloadCourseData();
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || 'Error al eliminar lección');
        }
    }, [deleteLesson, reloadCourseData]);

    const handleEditModule = (module: Module) => {
        setSelectedModule(module);
        setShowEditModuleModal(true);
    };

    const handleEditLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setShowEditLessonModal(true);
    };

    const handleCreateLesson = (moduleId: string) => {
        setSelectedModuleForLesson(moduleId);
        setShowCreateLessonModal(true);
    };

    // ✅ SOLUCIÓN: Recargar enrollments sin causar loop
    const handleEnrollmentAction = useCallback(async (
        enrollmentId: string,
        action: 'activate' | 'suspend' | 'delete'
    ) => {
        try {
            switch (action) {
                case 'activate':
                    await activateEnrollment(enrollmentId);
                    toast.success('Enrollment activado');
                    break;
                case 'suspend':
                    await suspendEnrollment(enrollmentId);
                    toast.success('Enrollment suspendido');
                    break;
                case 'delete':
                    if (!confirm('¿Eliminar este enrollment?')) return;
                    await deleteEnrollment(enrollmentId);
                    toast.success('Enrollment eliminado');
                    break;
            }
            // Recargar con los valores actuales
            loadEnrollments(
                enrollmentsPagination.page,
                enrollmentsPagination.limit,
                enrollmentStatusFilter,
                enrollmentSearchQuery
            );
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || 'Error al realizar la acción');
        }
    }, [
        activateEnrollment,
        suspendEnrollment,
        deleteEnrollment,
        loadEnrollments,
        enrollmentsPagination.page,
        enrollmentsPagination.limit,
        enrollmentStatusFilter,
        enrollmentSearchQuery
    ]);

    if (isLoading || !course) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <CourseHeader
                course={course}
                modules={modules}
                onEditCourse={() => setShowEditCourseModal(true)}
                onCreateModule={() => setShowCreateModuleModal(true)}
                showCreateButton={activeTab === 'content'}
            />

            {/* Tabs */}
            <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Contenido según tab activo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {activeTab === 'content' && (
                    <CourseContentTab
                        courseId={courseId}
                        modules={modules}
                        expandedModules={expandedModules}
                        onToggleModule={toggleModule}
                        onCreateModule={() => setShowCreateModuleModal(true)}
                        onEditModule={handleEditModule}
                        onDeleteModule={handleDeleteModule}
                        onCreateLesson={handleCreateLesson}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                        onModuleChanged={reloadCourseData}
                    />
                )}

                {activeTab === 'students' && (
                    <CourseStudentsTab
                        enrollments={enrollments}
                        isLoading={isLoadingEnrollments}
                        searchQuery={enrollmentSearchQuery}
                        statusFilter={enrollmentStatusFilter}
                        pagination={enrollmentsPagination}
                        onSearchChange={setEnrollmentSearchQuery}
                        onStatusFilterChange={setEnrollmentStatusFilter}
                        onPageChange={(page) =>
                            setEnrollmentsPagination((prev) => ({ ...prev, page }))
                        }
                        onCreateEnrollment={() => setShowCreateEnrollmentModal(true)}
                        onEnrollmentAction={handleEnrollmentAction}
                    />
                )}

                {activeTab === 'stats' && (
                    <CourseStatsTab stats={courseStats} isLoading={isLoading} />
                )}
            </div>

            {/* Modales */}
            <CreateModuleModal
                isOpen={showCreateModuleModal}
                onClose={() => setShowCreateModuleModal(false)}
                courseId={courseId}
                onSuccess={() => {
                    setShowCreateModuleModal(false);
                    reloadCourseData();
                }}
            />

            {selectedModule && (
                <EditModuleModal
                    isOpen={showEditModuleModal}
                    onClose={() => {
                        setShowEditModuleModal(false);
                        setSelectedModule(null);
                    }}
                    module={selectedModule}
                    onSuccess={() => {
                        setShowEditModuleModal(false);
                        setSelectedModule(null);
                        reloadCourseData();
                    }}
                />
            )}

            {selectedModuleForLesson && (
                <CreateLessonModal
                    isOpen={showCreateLessonModal}
                    onClose={() => {
                        setShowCreateLessonModal(false);
                        setSelectedModuleForLesson(null);
                    }}
                    moduleId={selectedModuleForLesson}
                    onSuccess={() => {
                        setShowCreateLessonModal(false);
                        setSelectedModuleForLesson(null);
                        reloadCourseData();
                    }}
                />
            )}

            {selectedLesson && (
                <EditLessonModal
                    isOpen={showEditLessonModal}
                    onClose={() => {
                        setShowEditLessonModal(false);
                        setSelectedLesson(null);
                    }}
                    lesson={selectedLesson}
                    onSuccess={() => {
                        setShowEditLessonModal(false);
                        setSelectedLesson(null);
                        reloadCourseData();
                    }}
                />
            )}

            {course && (
                <EditCourseModal
                    isOpen={showEditCourseModal}
                    onClose={() => setShowEditCourseModal(false)}
                    course={course}
                    onSuccess={() => {
                        setShowEditCourseModal(false);
                        reloadCourseData();
                    }}
                />
            )}

            <CreateEnrollmentModal
                isOpen={showCreateEnrollmentModal}
                onClose={() => setShowCreateEnrollmentModal(false)}
                preSelectedCourseId={courseId}
                onSuccess={() => {
                    setShowCreateEnrollmentModal(false);
                    loadEnrollments(
                        enrollmentsPagination.page,
                        enrollmentsPagination.limit,
                        enrollmentStatusFilter,
                        enrollmentSearchQuery
                    );
                    reloadCourseData();
                }}
            />
        </div>
    );
}