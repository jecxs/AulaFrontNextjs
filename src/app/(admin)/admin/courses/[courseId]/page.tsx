'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { Course, Module, Lesson } from '@/types/course';
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
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
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

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Estados de modales
    const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
    const [showEditModuleModal, setShowEditModuleModal] = useState(false);
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);

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

    // Cargar datos iniciales del curso.
    // NOTA: `getCourseById` y `getModulesByCourse` provienen del hook `useCoursesAdmin`
    // y pueden ser recreadas en cada render — incluirlas en las dependencias provoca
    // que el efecto se ejecute repetidamente. Queremos ejecutar la carga solo cuando
    // cambia `courseId` (o el router), por eso omitimos intencionalmente esas funciones
    // de la lista. Deshabilitamos la regla del linter en este caso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <button
                            onClick={() => setShowCreateModuleModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Módulo
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button className="border-b-2 border-blue-500 py-4 px-6 text-sm font-medium text-blue-600">
                            Contenido del Curso
                        </button>
                        <Link
                            href={`/admin/courses/${courseId}/enrollments`}
                            className="border-b-2 border-transparent py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        >
                            Estudiantes
                        </Link>
                        <Link
                            href={`/admin/courses/${courseId}/stats`}
                            className="border-b-2 border-transparent py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        >
                            Estadísticas
                        </Link>
                    </nav>
                </div>

                {/* Lista de módulos */}
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
        </div>
    );
}