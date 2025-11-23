'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { useEnrollments } from '@/hooks/use-enrollments';
import { Course, Module, Lesson } from '@/types/course';
import { EnrollmentWithProgress, EnrollmentStatus } from '@/lib/api/enrollments';
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Eye,
    ArrowLeft,
    Settings,
    Users,
    FileText,
    Video,
    HelpCircle,
    GripVertical,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

// Importar modales
import CreateModuleModal from '@/components/admin/courses/CreateModuleModal';
import EditModuleModal from '@/components/admin/courses/EditModuleModal';
import CreateLessonModal from '@/components/admin/courses/CreateLessonModal';
import EditLessonModal from '@/components/admin/courses/EditLessonModal';
import EditCourseModal from '@/components/admin/courses/EditCourseModal';
import CreateQuizModal from '@/components/admin/courses/CreateQuizModal';
import EditQuizModal from '@/components/admin/courses/EditQuizModal';
import ModuleQuizzesCard from '@/components/admin/courses/ModuleQuizzesCard';
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
        isLoading,
    } = useCoursesAdmin();

    const {
        getEnrollments,
        getCourseEnrollments,
        updateEnrollment,
        suspendEnrollment,
        activateEnrollment,
        deleteEnrollment,
        isLoading: isLoadingEnrollments,
    } = useEnrollments();

    const [activeTab, setActiveTab] = useState<TabType>('content');
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

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

    const reloadEnrollments = async () => {
        if (activeTab === 'students') {
            loadEnrollments();
        }
    };

    const loadEnrollments = async () => {
        try {
            // Si hay búsqueda, usar getEnrollments que soporta search
            // Si no hay búsqueda, usar getCourseEnrollments
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

    // Resetear paginación cuando cambian los filtros
    useEffect(() => {
        if (activeTab === 'students') {
            setEnrollmentsPagination(prev => ({ ...prev, page: 1 }));
        }
    }, [enrollmentStatusFilter, enrollmentSearchQuery, activeTab]);

    // Cargar enrollments cuando se cambia al tab de estudiantes
    // NOTA: Similar al efecto de carga del curso, omitimos las funciones de las dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (activeTab === 'students') {
            loadEnrollments();
        }
    }, [activeTab, courseId, enrollmentsPagination.page, enrollmentStatusFilter, enrollmentSearchQuery]);

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
            // Recargar datos
            (async () => {
                try {
                    const modulesData = await getModulesByCourse(courseId);
                    setModules(modulesData);
                } catch (err) {
                    console.error(err);
                }
            })();
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
            (async () => {
                try {
                    const modulesData = await getModulesByCourse(courseId);
                    setModules(modulesData);
                } catch (err) {
                    console.error(err);
                }
            })();
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

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return Video;
            case 'TEXT':
                return FileText;
            default:
                return BookOpen;
        }
    };

    const getStatusBadge = (status: EnrollmentStatus) => {
        const statusConfig = {
            [EnrollmentStatus.ACTIVE]: {
                label: 'Activo',
                className: 'bg-green-100 text-green-800',
                icon: CheckCircle,
            },
            [EnrollmentStatus.SUSPENDED]: {
                label: 'Suspendido',
                className: 'bg-yellow-100 text-yellow-800',
                icon: Clock,
            },
            [EnrollmentStatus.COMPLETED]: {
                label: 'Completado',
                className: 'bg-blue-100 text-blue-800',
                icon: CheckCircle,
            },
            [EnrollmentStatus.EXPIRED]: {
                label: 'Expirado',
                className: 'bg-red-100 text-red-800',
                icon: XCircle,
            },
        };

        const config = statusConfig[status] || statusConfig[EnrollmentStatus.ACTIVE];
        const Icon = config.icon;

        return (
            <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const handleEnrollmentAction = async (enrollmentId: string, action: 'activate' | 'suspend' | 'delete') => {
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
            reloadCourseData(); // Para actualizar el contador de estudiantes
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || `Error al ${action === 'delete' ? 'eliminar' : action === 'activate' ? 'activar' : 'suspender'} matrícula`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <button
                            onClick={() => router.push('/admin/courses')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {course.title}
                            </h1>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    {modules.length} módulos
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {course._count?.enrollments || 0} estudiantes
                                </span>
                                <span>•</span>
                                <span>{course.category?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowEditCourseModal(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Editar Curso
                        </button>
                        {activeTab === 'content' && (
                            <button
                                onClick={() => setShowCreateModuleModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Módulo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={cn(
                                'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'content'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            Contenido del Curso
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={cn(
                                'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'students'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            Estudiantes
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={cn(
                                'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'stats'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            Estadísticas
                        </button>
                    </nav>
                </div>

                {/* Contenido del Tab: Contenido del Curso */}
                {activeTab === 'content' && (
                    <div className="p-6">
                    {modules.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No hay módulos
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza agregando módulos a este curso
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModuleModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Primer Módulo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {modules.map((module, index) => (
                                <div
                                    key={module.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    {/* Header del módulo */}
                                    <div className="bg-gray-50 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button className="cursor-move text-gray-400 hover:text-gray-600">
                                                    <GripVertical className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => toggleModule(module.id)}
                                                    className="flex items-center space-x-3 text-left flex-1"
                                                >
                                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            {module.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {module._count?.lessons || 0} lecciones •{' '}
                                                            {module._count?.quizzes || 0} quizzes
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleCreateLesson(module.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Agregar lección"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditModule(module)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                    title="Editar módulo"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModule(module.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Eliminar módulo"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenido del módulo (expandible) */}
                                    {expandedModules.has(module.id) && (
                                        <div className="bg-white space-y-4 p-4">
                                            {/* Lecciones */}
                                            {module.lessons && module.lessons.length > 0 ? (
                                                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg p-3">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Lecciones</h4>
                                                    {module.lessons.map((lesson, lessonIndex) => {
                                                        const LessonIcon = getLessonIcon(lesson.type);
                                                        const resourcesCount = lesson._count?.resources ?? 0;
                                                        return (
                                                            <div
                                                                key={lesson.id}
                                                                className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <button className="opacity-0 group-hover:opacity-100 cursor-move text-gray-400">
                                                                        <GripVertical className="h-4 w-4" />
                                                                    </button>
                                                                    <div className="flex items-center space-x-3">
                                                                        <LessonIcon className="h-4 w-4 text-gray-400" />
                                                                        <span className="text-sm text-gray-900">
                                                                            {lessonIndex + 1}. {lesson.title}
                                                                        </span>
                                                                    </div>
                                                                    {lesson.durationSec && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {Math.floor(lesson.durationSec / 60)} min
                                                                        </span>
                                                                    )}
                                                                    {resourcesCount > 0 && (
                                                                        <span className="text-xs text-blue-600">
                                                                            {resourcesCount} recursos
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                                                                    <Link
                                                                        href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleEditLesson(lesson)}
                                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteLesson(lesson.id)}
                                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-6 text-center border border-gray-200 rounded-lg">
                                                    <p className="text-sm text-gray-500">
                                                        No hay lecciones en este módulo
                                                    </p>
                                                    <button
                                                        onClick={() => handleCreateLesson(module.id)}
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Agregar primera lección
                                                    </button>
                                                </div>
                                            )}

                                            {/* Quizzes - Nuevo componente */}
                                            <ModuleQuizzesCard
                                                module={module}
                                                onModuleChanged={reloadCourseData}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}

                {/* Contenido del Tab: Estudiantes */}
                {activeTab === 'students' && (
                    <div className="p-6">
                        {/* Header con búsqueda y filtros */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar estudiantes..."
                                        value={enrollmentSearchQuery}
                                        onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        value={enrollmentStatusFilter}
                                        onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value={EnrollmentStatus.ACTIVE}>Activos</option>
                                        <option value={EnrollmentStatus.SUSPENDED}>Suspendidos</option>
                                        <option value={EnrollmentStatus.COMPLETED}>Completados</option>
                                        <option value={EnrollmentStatus.EXPIRED}>Expirados</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setShowCreateEnrollmentModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Matricular Estudiante
                                </button>
                            </div>
                        </div>

                        {/* Lista de estudiantes */}
                        {isLoadingEnrollments ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : enrollments.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No hay estudiantes matriculados
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {enrollmentSearchQuery || enrollmentStatusFilter
                                        ? 'No se encontraron estudiantes con los filtros aplicados'
                                        : 'Comienza matriculando estudiantes a este curso'}
                                </p>
                                {!enrollmentSearchQuery && !enrollmentStatusFilter && (
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setShowCreateEnrollmentModal(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Matricular Primer Estudiante
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                    Estudiante
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Estado
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Progreso
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Fecha de Matrícula
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Expiración
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Pago
                                                </th>
                                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                    <span className="sr-only">Acciones</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {enrollments.map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <span className="text-blue-600 font-medium text-sm">
                                                                        {enrollment.user.firstName[0]}
                                                                        {enrollment.user.lastName[0]}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">
                                                                    {enrollment.user.firstName} {enrollment.user.lastName}
                                                                </div>
                                                                <div className="text-gray-500 flex items-center mt-1">
                                                                    <Mail className="h-3 w-3 mr-1" />
                                                                    {enrollment.user.email}
                                                                </div>
                                                                {enrollment.user.phone && (
                                                                    <div className="text-gray-500 flex items-center mt-1">
                                                                        <Phone className="h-3 w-3 mr-1" />
                                                                        {enrollment.user.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        {getStatusBadge(enrollment.status)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <div className="flex items-center">
                                                            <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                                                            <div className="flex-1">
                                                                {enrollment.progress ? (
                                                                    <>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {Math.max(0, Math.min(100, enrollment.progress.completionPercentage)).toFixed(0)}%
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {enrollment.progress.completedLessons} / {enrollment.progress.totalLessons} lecciones
                                                                        </div>
                                                                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div
                                                                                className="bg-blue-600 h-1.5 rounded-full"
                                                                                style={{ width: `${Math.max(0, Math.min(100, enrollment.progress.completionPercentage))}%` }}
                                                                            />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-sm font-medium text-gray-500">
                                                                            Sin progreso
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            No hay datos disponibles
                                                                        </div>
                                                                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div
                                                                                className="bg-gray-300 h-1.5 rounded-full"
                                                                                style={{ width: '0%' }}
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                            {formatDate(enrollment.enrolledAt)}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {enrollment.expiresAt ? (
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                                {formatDate(enrollment.expiresAt)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Sin expiración</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        {enrollment.paymentConfirmed ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Confirmado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {enrollment.status === EnrollmentStatus.ACTIVE ? (
                                                                <button
                                                                    onClick={() => handleEnrollmentAction(enrollment.id, 'suspend')}
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                    title="Suspender"
                                                                >
                                                                    <Clock className="h-4 w-4" />
                                                                </button>
                                                            ) : enrollment.status === EnrollmentStatus.SUSPENDED ? (
                                                                <button
                                                                    onClick={() => handleEnrollmentAction(enrollment.id, 'activate')}
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Activar"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                            ) : null}
                                                            <button
                                                                onClick={() => handleEnrollmentAction(enrollment.id, 'delete')}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {enrollmentsPagination.totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Mostrando{' '}
                                            <span className="font-medium">
                                                {(enrollmentsPagination.page - 1) * enrollmentsPagination.limit + 1}
                                            </span>{' '}
                                            a{' '}
                                            <span className="font-medium">
                                                {Math.min(enrollmentsPagination.page * enrollmentsPagination.limit, enrollmentsPagination.total)}
                                            </span>{' '}
                                            de <span className="font-medium">{enrollmentsPagination.total}</span> estudiantes
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEnrollmentsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                disabled={enrollmentsPagination.page === 1}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => setEnrollmentsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                disabled={enrollmentsPagination.page >= enrollmentsPagination.totalPages}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Contenido del Tab: Estadísticas */}
                {activeTab === 'stats' && (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Estadísticas
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Esta sección estará disponible próximamente
                            </p>
                        </div>
                    </div>
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
                    reloadEnrollments();
                    reloadCourseData();
                }}
            />
        </div>
    );
}