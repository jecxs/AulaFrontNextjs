// src/app/(admin)/admin/courses/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
    Filter,
    X,
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            setActiveDropdown(null);
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
            setActiveDropdown(null);
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
            setActiveDropdown(null);
        } catch (error) {
            console.error('Error al eliminar curso:', error);
        }
    };

    const getStatusBadge = (status: CourseStatus) => {
        const badges = {
            DRAFT: {
                className: 'bg-gray-50 text-gray-700 border border-gray-200',
                icon: Clock,
                text: 'Borrador',
            },
            PUBLISHED: {
                className: 'bg-green-50 text-green-700 border border-green-200',
                icon: CheckCircle,
                text: 'Publicado',
            },
            ARCHIVED: {
                className: 'bg-amber-50 text-amber-700 border border-amber-200',
                icon: Archive,
                text: 'Archivado',
            },
        };

        const badge = badges[status];
        const Icon = badge.icon;

        return (
            <span
                className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                    badge.className
                )}
            >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {badge.text}
            </span>
        );
    };

    const getLevelBadge = (level: CourseLevel) => {
        const levels = {
            BEGINNER: { text: 'Principiante', color: 'text-blue-600' },
            INTERMEDIATE: { text: 'Intermedio', color: 'text-[#00B4D8]' },
            ADVANCED: { text: 'Avanzado', color: 'text-[#001F3F]' },
        };
        return levels[level];
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setLevelFilter('');
    };

    const hasActiveFilters = searchQuery || statusFilter || levelFilter;

    if (isLoading && courses.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#001F3F]">
                            Gestión de Cursos
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm">
                            Administra todos los cursos de la plataforma
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#001F3F] shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Crear Curso
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-[#00B4D8]" />
                        <span className="text-sm font-semibold text-[#001F3F]">Filtros</span>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-gray-500 hover:text-[#00B4D8] transition-colors flex items-center gap-1"
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cursos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
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
                            className="w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all text-sm font-medium"
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
                            className="w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all text-sm font-medium"
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#001F3F]/5 to-[#00B4D8]/5 mb-4">
                        <BookOpen className="h-8 w-8 text-[#00B4D8]" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {searchQuery || statusFilter || levelFilter
                            ? 'No se encontraron cursos'
                            : 'No hay cursos registrados'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {searchQuery || statusFilter || levelFilter
                            ? 'Intenta ajustando los filtros de búsqueda'
                            : 'Comienza creando tu primer curso'}
                    </p>
                    {!searchQuery && !statusFilter && !levelFilter && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-[#00B4D8] bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear primer curso
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
                        <ul className="divide-y divide-gray-100">
                            {courses.map((course) => (
                                <li key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                    <div className="px-6 py-5">
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                {/* Thumbnail */}
                                                <div className="flex-shrink-0">
                                                    {course.thumbnailUrl ? (
                                                        <img
                                                            src={course.thumbnailUrl}
                                                            alt={course.title}
                                                            className="h-20 w-20 rounded-xl object-cover shadow-sm border border-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-[#001F3F]/10 to-[#00B4D8]/10 flex items-center justify-center border border-gray-100">
                                                            <BookOpen className="h-8 w-8 text-[#00B4D8]" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info del curso */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                href={`/admin/courses/${course.id}`}
                                                                className="text-base font-semibold text-[#001F3F] hover:text-[#00B4D8] transition-colors block truncate"
                                                            >
                                                                {course.title}
                                                            </Link>
                                                            <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-2">
                                                                <span className="inline-flex items-center text-sm text-gray-600">
                                                                    <span className="font-medium text-gray-900">{course.category?.name}</span>
                                                                </span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className={cn(
                                                                    "text-sm font-medium",
                                                                    getLevelBadge(course.level).color
                                                                )}>
                                                                    {getLevelBadge(course.level).text}
                                                                </span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="inline-flex items-center text-sm text-gray-600">
                                                                    <Users className="h-4 w-4 mr-1.5 text-[#00B4D8]" />
                                                                    <span className="font-medium">{course._count?.enrollments || 0}</span>
                                                                    <span className="ml-1">estudiantes</span>
                                                                </span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="text-sm text-gray-600">
                                                                    <span className="font-medium">{course._count?.modules || 0}</span> módulos
                                                                </span>
                                                            </div>
                                                            {course.summary && (
                                                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                                    {course.summary}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {/* Badge de estado */}
                                                {getStatusBadge(course.status)}

                                                {/* Menú de acciones */}
                                                <div className="relative" ref={activeDropdown === course.id ? dropdownRef : null}>
                                                    <button
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                activeDropdown === course.id
                                                                    ? null
                                                                    : course.id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="h-5 w-5 text-gray-400" />
                                                    </button>

                                                    {/* Dropdown con z-index alto para evitar cortes */}
                                                    {activeDropdown === course.id && (
                                                        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-[100] border border-gray-100">
                                                            <div className="py-2">
                                                                <Link
                                                                    href={`/admin/courses/${course.id}`}
                                                                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    onClick={() => setActiveDropdown(null)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-3 text-[#00B4D8]" />
                                                                    Ver/Editar
                                                                </Link>

                                                                {course.status === 'DRAFT' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handlePublish(course.id)
                                                                        }
                                                                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                                                                        Publicar
                                                                    </button>
                                                                )}

                                                                {course.status === 'PUBLISHED' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleArchive(course.id)
                                                                        }
                                                                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <Archive className="h-4 w-4 mr-3 text-amber-500" />
                                                                        Archivar
                                                                    </button>
                                                                )}

                                                                <div className="my-1 border-t border-gray-100" />

                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(course.id)
                                                                    }
                                                                    className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-3" />
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, page: pagination.page - 1 })
                                    }
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() =>
                                        setPagination({ ...pagination, page: pagination.page + 1 })
                                    }
                                    disabled={pagination.page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Mostrando{' '}
                                        <span className="font-semibold text-[#001F3F]">
                                            {(pagination.page - 1) * pagination.limit + 1}
                                        </span>{' '}
                                        a{' '}
                                        <span className="font-semibold text-[#001F3F]">
                                            {Math.min(
                                                pagination.page * pagination.limit,
                                                pagination.total
                                            )}
                                        </span>{' '}
                                        de{' '}
                                        <span className="font-semibold text-[#001F3F]">
                                            {pagination.total}
                                        </span>{' '}
                                        resultados
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    page: pagination.page - 1,
                                                })
                                            }
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-200 bg-white text-sm font-medium text-gray-700">
                                            Página {pagination.page} de {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    page: pagination.page + 1,
                                                })
                                            }
                                            disabled={pagination.page === pagination.totalPages}
                                            className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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