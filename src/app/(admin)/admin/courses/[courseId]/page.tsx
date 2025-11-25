// src/app/(admin)/admin/courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
    const reloadCourseData = async () => {
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
    };

    const loadEnrollments = async () => {
        try {
            const response = enrollmentSearchQuery
                ? await getEnrollments({
                    page: enrollmentsPagination.page,
                    limit: enrollmentsPagination.limit,
                    courseId,
                    status: enrollmentStatusFilter || undefined,
                    search: enrollmentSearchQuery || undefined,
                })
                : await getCourseEnrollments(courseId, {
                    page: enrollmentsPagination.page,
                    limit: enrollmentsPagination.limit,
                    status: enrollmentStatusFilter || undefined,
                });
            setEnrollments(response.data);
            setEnrollmentsPagination(response.pagination);
        } catch (err) {
            console.error('Error al cargar enrollments:', err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al cargar estudiantes');
        }
    };

    const loadCourseStatistics = async () => {
        try {
            const stats = await getCourseStatistics(courseId);
            setCourseStats(stats);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al cargar estadísticas');
        }
    };

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
    }, [courseId, router]);

    useEffect(() => {
        if (activeTab === 'students') {
            loadEnrollments();
        } else if (activeTab === 'stats') {
            loadCourseStatistics();
        }
    }, [activeTab, courseId, enrollmentsPagination.page, enrollmentStatusFilter, enrollmentSearchQuery]);

    useEffect(() => {
        if (activeTab === 'students') {
            setEnrollmentsPagination(prev => ({ ...prev, page: 1 }));
        }
    }, [enrollmentStatusFilter, enrollmentSearchQuery, activeTab]);

    // Handlers para módulos y lecciones
    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const handleDeleteModule = async (moduleId: string) => {
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
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta lección?')) return;

        try {
            await deleteLesson(lessonId);
            toast.success('Lección eliminada exitosamente');
            const modulesData = await getModulesByCourse(courseId);
            setModules(modulesData);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || 'Error al eliminar lección');
        }
    };

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

    // Handlers para enrollments
    const handleEnrollmentAction = async (
        enrollmentId: string,
        action: 'activate' | 'suspend' | 'delete'
    ) => {
        try {
            if (action === 'delete') {
                if (!confirm('¿Estás seguro de que deseas eliminar esta matrícula?')) return;
                await deleteEnrollment(enrollmentId);
                toast.success('Matrícula eliminada exitosamente');
            } else if (action === 'activate') {
                await activateEnrollment(enrollmentId);
                toast.success('Matrícula activada exitosamente');
            } else if (action === 'suspend') {
                await suspendEnrollment(enrollmentId);
                toast.success('Matrícula suspendida exitosamente');
            }
            loadEnrollments();
            reloadCourseData();
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(
                msg ||
                `Error al ${
                    action === 'delete' ? 'eliminar' : action === 'activate' ? 'activar' : 'suspender'
                } matrícula`
            );
        }
    };

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
                    loadEnrollments();
                    reloadCourseData();
                }}
            />
        </div>
    );
}