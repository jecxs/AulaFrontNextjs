// src/app/(admin)/admin/courses/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

    // ✅ OPTIMIZACIÓN 1: Memoizar función fetchCourses con useCallback
    // Esto evita que se recree en cada render
    const fetchCourses = useCallback(async () => {
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
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, levelFilter, getCourses]);

    // ✅ OPTIMIZACIÓN 2: useEffect con dependencias correctas
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]); // Ahora incluye fetchCourses correctamente memoizado

    // ✅ OPTIMIZACIÓN 3: Debounce optimizado para búsqueda
    useEffect(() => {
        // Solo ejecutar debounce si hay cambios en searchQuery
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchCourses();
            } else {
                setPagination(prev => ({ ...prev, page: 1 }));
            }
        }, 500);

        return () => clearTimeout(timer);
        // ⚠️ IMPORTANTE: NO incluir fetchCourses aquí para evitar loops
    }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // ✅ OPTIMIZACIÓN 4: Memoizar handlers con useCallback
    const handlePublish = useCallback(async (courseId: string) => {
        if (!confirm('¿Estás seguro de que deseas publicar este curso?')) return;

        try {
            await publishCourse(courseId);
            toast.success('Curso publicado exitosamente');
            fetchCourses();
            setActiveDropdown(null);
        } catch (error) {
            console.error('Error al publicar curso:', error);
        }
    }, [publishCourse, fetchCourses]);

    const handleArchive = useCallback(async (courseId: string) => {
        if (!confirm('¿Estás seguro de que deseas archivar este curso?')) return;

        try {
            await archiveCourse(courseId);
            toast.success('Curso archivado exitosamente');
            fetchCourses();
            setActiveDropdown(null);
        } catch (error) {
            console.error('Error al archivar curso:', error);
        }
    }, [archiveCourse, fetchCourses]);

    const handleDelete = useCallback(async (courseId: string) => {
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
    }, [deleteCourse, fetchCourses]);

    // ✅ OPTIMIZACIÓN 5: Memoizar función de limpiar filtros
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setStatusFilter('');
        setLevelFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // ✅ OPTIMIZACIÓN 6: Memoizar verificación de filtros activos
    const hasActiveFilters = useMemo(() => {
        return searchQuery !== '' || statusFilter !== '' || levelFilter !== '';
    }, [searchQuery, statusFilter, levelFilter]);

    // ✅ OPTIMIZACIÓN 7: Event listener con cleanup optimizado
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); // Empty deps - solo se crea una vez

    // ✅ OPTIMIZACIÓN 8: Memoizar badges de estado
    const getStatusBadge = useCallback((status: CourseStatus) => {
        const statusConfig = {
            [CourseStatus.PUBLISHED]: {
                label: 'Publicado',
                className: 'bg-green-50 text-green-700 border border-green-200',
                icon: CheckCircle,
            },
            [CourseStatus.DRAFT]: {
                label: 'Borrador',
                className: 'bg-gray-50 text-gray-700 border border-gray-200',
                icon: Clock,
            },
            [CourseStatus.ARCHIVED]: {
                label: 'Archivado',
                className: 'bg-amber-50 text-amber-700 border border-amber-200',
                icon: Archive,
            },
        };

        const config = statusConfig[status] || statusConfig[CourseStatus.DRAFT];
        const Icon = config.icon;

        return (
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold', config.className)}>
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </span>
        );
    }, []);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#001F3F] flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-[#00B4D8]/20 to-[#001F3F]/10 rounded-xl">
                                <BookOpen className="h-6 w-6 text-[#00B4D8]" />
                            </div>
                            Gestión de Cursos
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {pagination.total} curso{pagination.total !== 1 ? 's' : ''} en total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Crear Curso
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
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
                            onChange={(e) => setStatusFilter(e.target.value as CourseStatus | '')}
                            className="w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
                        >
                            <option value="">Todos los estados</option>
                            <option value={CourseStatus.PUBLISHED}>Publicados</option>
                            <option value={CourseStatus.DRAFT}>Borradores</option>
                            <option value={CourseStatus.ARCHIVED}>Archivados</option>
                        </select>
                    </div>

                    {/* Filtro por nivel */}
                    <div>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value as CourseLevel | '')}
                            className="w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
                        >
                            <option value="">Todos los niveles</option>
                            <option value={CourseLevel.BEGINNER}>Principiante</option>
                            <option value={CourseLevel.INTERMEDIATE}>Intermedio</option>
                            <option value={CourseLevel.ADVANCED}>Avanzado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de cursos */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {courses.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                No se encontraron cursos
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {hasActiveFilters
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Comienza creando tu primer curso'}
                            </p>
                            {!hasActiveFilters && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096C7] transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    Crear Primer Curso
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="p-6 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-6">
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
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                            {course.summary || 'Sin descripción'}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            {getStatusBadge(course.status)}

                                                            {course.category && (
                                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <span className="font-medium">Categoría:</span>
                                                                    {course.category.name}
                                                                </span>
                                                            )}

                                                            {course._count && (
                                                                <>
                                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <Users className="h-3.5 w-3.5" />
                                                                        {course._count.enrollments} estudiantes
                                                                    </span>
                                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <BookOpen className="h-3.5 w-3.5" />
                                                                        {course._count.modules} módulos
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Acciones */}
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/courses/${course.id}`}
                                                            className="p-2 text-gray-600 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 rounded-lg transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>

                                                        <div className="relative" ref={activeDropdown === course.id ? dropdownRef : null}>
                                                            <button
                                                                onClick={() =>
                                                                    setActiveDropdown(
                                                                        activeDropdown === course.id
                                                                            ? null
                                                                            : course.id
                                                                    )
                                                                }
                                                                className="p-2 text-gray-600 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 rounded-lg transition-colors"
                                                            >
                                                                <MoreVertical className="h-5 w-5" />
                                                            </button>

                                                            {activeDropdown === course.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                                    {course.status === CourseStatus.DRAFT && (
                                                                        <button
                                                                            onClick={() => handlePublish(course.id)}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                            Publicar
                                                                        </button>
                                                                    )}

                                                                    {course.status === CourseStatus.PUBLISHED && (
                                                                        <button
                                                                            onClick={() => handleArchive(course.id)}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            <Archive className="h-4 w-4" />
                                                                            Archivar
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={() => handleDelete(course.id)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Mostrando{' '}
                                        <span className="font-medium">
                                            {(pagination.page - 1) * pagination.limit + 1}
                                        </span>{' '}
                                        a{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span>{' '}
                                        de <span className="font-medium">{pagination.total}</span> resultados
                                    </div>
                                    <nav className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setPagination(prev => ({
                                                    ...prev,
                                                    page: prev.page - 1,
                                                }))
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
                                                setPagination(prev => ({
                                                    ...prev,
                                                    page: prev.page + 1,
                                                }))
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