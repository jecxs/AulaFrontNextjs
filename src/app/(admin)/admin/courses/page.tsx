// src/app/(admin)/admin/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { Course, CourseStatus, CourseLevel } from '@/types/course';
import CreateCourseModal from '@/components/admin/courses/CreateCourseModal';
import {
    Plus,
    Search,
    MoreVertical,
    Eye,
    Archive,
    Trash2,
    BookOpen,
    Users,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminCoursesPage() {
    const {
        getCourses,
        publishCourse,
        archiveCourse,
        deleteCourse,
        isLoading,
    } = useCoursesAdmin();

    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');
    const [levelFilter, setLevelFilter] = useState<CourseLevel | ''>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Cargar cursos
    const fetchCourses = async () => {
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
            };

            if (statusFilter) params.status = statusFilter;
            if (levelFilter) params.level = levelFilter;

            const response = await getCourses(params);
            setCourses(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            toast.error('Error al cargar los cursos');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [pagination.page, statusFilter, levelFilter]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchCourses();
            } else {
                setPagination({ ...pagination, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePublish = async (courseId: string) => {
        if (!confirm('¿Estás seguro de que deseas publicar este curso?')) return;

        try {
            await publishCourse(courseId);
            toast.success('Curso publicado exitosamente');
            fetchCourses();
        } catch (error) {
            console.error('Error al publicar curso:', error);
        }
    };

    const handleArchive = async (courseId: string) => {
        if (!confirm('¿Estás seguro de que deseas archivar este curso?')) return;

        try {
            await archiveCourse(courseId);
            toast.success('Curso archivado exitosamente');
            fetchCourses();
        } catch (error) {
            console.error('Error al archivar curso:', error);
        }
    };

    const handleDelete = async (courseId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.'
            )
        )
            return;

        try {
            await deleteCourse(courseId);
            toast.success('Curso eliminado exitosamente');
            fetchCourses();
        } catch (error) {
            console.error('Error al eliminar curso:', error);
        }
    };

    const getStatusBadge = (status: CourseStatus) => {
        const badges = {
            DRAFT: {
                className: 'bg-gray-100 text-gray-800',
                icon: Clock,
                text: 'Borrador',
            },
            PUBLISHED: {
                className: 'bg-green-100 text-green-800',
                icon: CheckCircle,
                text: 'Publicado',
            },
            ARCHIVED: {
                className: 'bg-yellow-100 text-yellow-800',
                icon: Archive,
                text: 'Archivado',
            },
        };

        const badge = badges[status];
        const Icon = badge.icon;

        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    badge.className
                )}
            >
                <Icon className="h-3 w-3 mr-1" />
                {badge.text}
            </span>
        );
    };

    const getLevelBadge = (level: CourseLevel) => {
        const levels = {
            BEGINNER: 'Principiante',
            INTERMEDIATE: 'Intermedio',
            ADVANCED: 'Avanzado',
        };
        return levels[level];
    };

    if (isLoading && courses.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Gestión de Cursos
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Administra todos los cursos de la plataforma
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Crear Curso
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cursos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as CourseStatus | '')
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="DRAFT">Borrador</option>
                            <option value="PUBLISHED">Publicado</option>
                            <option value="ARCHIVED">Archivado</option>
                        </select>
                    </div>

                    {/* Filtro por nivel */}
                    <div>
                        <select
                            value={levelFilter}
                            onChange={(e) =>
                                setLevelFilter(e.target.value as CourseLevel | '')
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Todos los niveles</option>
                            <option value="BEGINNER">Principiante</option>
                            <option value="INTERMEDIATE">Intermedio</option>
                            <option value="ADVANCED">Avanzado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de cursos */}
            {courses.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchQuery || statusFilter || levelFilter
                            ? 'No se encontraron cursos'
                            : 'No hay cursos registrados'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery || statusFilter || levelFilter
                            ? 'Intenta con otros filtros'
                            : 'Comienza creando un nuevo curso'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {courses.map((course) => (
                                <li key={course.id} className="hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start space-x-4">
                                                    {/* Thumbnail */}
                                                    <div className="flex-shrink-0">
                                                        {course.thumbnailUrl ? (
                                                            <img
                                                                src={course.thumbnailUrl}
                                                                alt={course.title}
                                                                className="h-16 w-16 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                <BookOpen className="h-8 w-8 text-blue-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info del curso */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`/admin/courses/${course.id}`}
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate block"
                                                        >
                                                            {course.title}
                                                        </Link>
                                                        <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                            <span>{course.category?.name}</span>
                                                            <span>•</span>
                                                            <span>{getLevelBadge(course.level)}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center">
                                                                <Users className="h-4 w-4 mr-1" />
                                                                {course._count?.enrollments || 0}{' '}
                                                                estudiantes
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {course._count?.modules || 0} módulos
                                                            </span>
                                                        </div>
                                                        {course.summary && (
                                                            <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                                                                {course.summary}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex items-center space-x-4 ml-4">
                                                {/* Badge de estado */}
                                                {getStatusBadge(course.status)}

                                                {/* Menú de acciones */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                activeDropdown === course.id
                                                                    ? null
                                                                    : course.id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-full"
                                                    >
                                                        <MoreVertical className="h-5 w-5 text-gray-400" />
                                                    </button>

                                                    {/* Dropdown */}
                                                    {activeDropdown === course.id && (
                                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <div className="py-1">
                                                                <Link
                                                                    href={`/admin/courses/${course.id}`}
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver/Editar
                                                                </Link>

                                                                {course.status === 'DRAFT' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handlePublish(course.id)
                                                                        }
                                                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Publicar
                                                                    </button>
                                                                )}

                                                                {course.status === 'PUBLISHED' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleArchive(course.id)
                                                                        }
                                                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        <Archive className="h-4 w-4 mr-2" />
                                                                        Archivar
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(course.id)
                                                                    }
                                                                    className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, page: pagination.page - 1 })
                                    }
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, page: pagination.page + 1 })
                                    }
                                    disabled={pagination.page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando{' '}
                                        <span className="font-medium">
                                            {(pagination.page - 1) * pagination.limit + 1}
                                        </span>{' '}
                                        a{' '}
                                        <span className="font-medium">
                                            {Math.min(
                                                pagination.page * pagination.limit,
                                                pagination.total
                                            )}
                                        </span>{' '}
                                        de <span className="font-medium">{pagination.total}</span>{' '}
                                        resultados
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    page: pagination.page - 1,
                                                })
                                            }
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    page: pagination.page + 1,
                                                })
                                            }
                                            disabled={pagination.page === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Siguiente
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal de crear curso */}
            <CreateCourseModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchCourses();
                }}
            />
        </div>
    );
}