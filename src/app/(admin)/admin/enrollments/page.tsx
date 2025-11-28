// src/app/(admin)/admin/enrollments/page.tsx
'use client';

import {useState, useEffect, useCallback} from 'react';
import { useEnrollments } from '@/hooks/use-enrollments';
import CreateEnrollmentModal from '@/components/admin/CreateEnrollmentModal';
import EditEnrollmentModal from '@/components/admin/EditEnrollmentModal';
import {
    EnrollmentStatus,
    EnrollmentWithProgress,
} from '@/lib/api/enrollments';
import {
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    Trash2,
    Calendar,
    User,
    BookOpen,
    Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function AdminEnrollmentsPage() {
    const {
        getEnrollments,
        suspendEnrollment,
        activateEnrollment,
        deleteEnrollment,
        isLoading,
    } = useEnrollments();

    const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | ''>('');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithProgress | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Cargar enrollments
    const fetchEnrollments = async () => {
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            if (paymentFilter !== 'all') {
                params.paymentConfirmed = paymentFilter === 'confirmed';
            }

            const response = await getEnrollments(params);

            if (response && response.data) {
                setEnrollments(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error al cargar enrollments:', error);
            setEnrollments([]);
        }
    };

    useEffect(() => {
        fetchEnrollments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, paymentFilter]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleEdit = useCallback((enrollment: EnrollmentWithProgress) => {
        setSelectedEnrollment(enrollment);
        setShowEditModal(true);
        setActiveDropdown(null);
    }, []);

    const handleSuspend = useCallback(async (enrollmentId: string) => {
        if (!confirm('¿Estás seguro de que deseas suspender este enrollment?')) {
            return;
        }

        try {
            await suspendEnrollment(enrollmentId);
            fetchEnrollments();
        } catch (error) {
            console.error('Error al suspender enrollment:', error);
        }
        setActiveDropdown(null);
    }, [suspendEnrollment]);

    const handleActivate = useCallback(async (enrollmentId: string) => {
        try {
            await activateEnrollment(enrollmentId);
            fetchEnrollments();
        } catch (error) {
            console.error('Error al activar enrollment:', error);
        }
        setActiveDropdown(null);
    }, [activateEnrollment, fetchEnrollments]);

    const handleDelete = useCallback(async (enrollmentId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar este enrollment? Esta acción no se puede deshacer.'
            )
        )
            return;

        try {
            await deleteEnrollment(enrollmentId);
            fetchEnrollments();
        } catch (error) {
            console.error('Error al eliminar enrollment:', error);
        }
        setActiveDropdown(null);
    }, [deleteEnrollment]);

    const getStatusBadge = (status: EnrollmentStatus) => {
        const variants = {
            ACTIVE: 'bg-green-100 text-green-800',
            SUSPENDED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
            EXPIRED: 'bg-gray-100 text-gray-800',
        };

        const icons = {
            ACTIVE: CheckCircle,
            SUSPENDED: XCircle,
            COMPLETED: Award,
            EXPIRED: Clock,
        };

        const Icon = icons[status];

        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    variants[status]
                )}
            >
                <Icon className="h-3 w-3 mr-1" />
                {status === 'ACTIVE' && 'Activo'}
                {status === 'SUSPENDED' && 'Suspendido'}
                {status === 'COMPLETED' && 'Completado'}
                {status === 'EXPIRED' && 'Expirado'}
            </span>
        );
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    if (isLoading && enrollments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Matrículas
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {pagination.total} matrícula(s) registrada(s)
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Nueva Matrícula
                </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por estudiante o curso..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    {/* Filtro por Estado */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as EnrollmentStatus | '')
                            }
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Todos los estados</option>
                            <option value={EnrollmentStatus.ACTIVE}>Activo</option>
                            <option value={EnrollmentStatus.SUSPENDED}>Suspendido</option>
                            <option value={EnrollmentStatus.COMPLETED}>Completado</option>
                            <option value={EnrollmentStatus.EXPIRED}>Expirado</option>
                        </select>
                    </div>

                    {/* Filtro por Pago */}
                    <div>
                        <select
                            value={paymentFilter}
                            onChange={(e) =>
                                setPaymentFilter(e.target.value as 'all' | 'confirmed' | 'pending')
                            }
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">Todos los pagos</option>
                            <option value="confirmed">Pagos confirmados</option>
                            <option value="pending">Pagos pendientes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Enrollments */}
            {enrollments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchQuery || statusFilter || paymentFilter !== 'all'
                            ? 'No se encontraron matrículas'
                            : 'No hay matrículas registradas'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery || statusFilter || paymentFilter !== 'all'
                            ? 'Intenta con otros filtros'
                            : 'Comienza creando una nueva matrícula'}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {enrollments.map((enrollment) => (
                            <li key={enrollment.id} className="hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            {/* Información del Estudiante y Curso */}
                                            <div className="flex items-start space-x-4">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {enrollment.user.firstName.charAt(0)}
                                                            {enrollment.user.lastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Detalles */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {enrollment.user.firstName}{' '}
                                                            {enrollment.user.lastName}
                                                        </p>
                                                        {getStatusBadge(enrollment.status)}
                                                        {enrollment.paymentConfirmed ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Pago confirmado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pago pendiente
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex items-center space-x-4">
                                                        <span className="flex items-center text-sm text-gray-500">
                                                            <BookOpen className="h-4 w-4 mr-1" />
                                                            {enrollment.course.title}
                                                        </span>
                                                        <span className="flex items-center text-sm text-gray-500">
                                                            <User className="h-4 w-4 mr-1" />
                                                            {enrollment.user.email}
                                                        </span>
                                                    </div>


                                                    {/* Progreso */}
                                                    {enrollment.progress && (
                                                        <div className="mt-3">
                                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                                <span>Progreso del curso</span>
                                                                <span>
                                                                    {enrollment.progress.completedLessons}/{enrollment.progress.totalLessons} lecciones
                                                                </span>
                                                           </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${Math.max(0, Math.min(100, enrollment.progress.completionPercentage))}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {enrollment.progress.completionPercentage.toFixed(1)}% completado
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Fechas */}
                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Matriculado:{' '}
                                                            {new Date(
                                                                enrollment.enrolledAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        {enrollment.expiresAt && (
                                                            <span
                                                                className={cn(
                                                                    'flex items-center',
                                                                    isExpired(enrollment.expiresAt) &&
                                                                    'text-red-600'
                                                                )}
                                                            >
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Expira:{' '}
                                                                {new Date(
                                                                    enrollment.expiresAt
                                                                ).toLocaleDateString()}
                                                                {isExpired(enrollment.expiresAt) &&
                                                                    ' (Expirado)'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menú de acciones */}
                                        <div className="relative ml-2">
                                            <button
                                                onClick={() =>
                                                    setActiveDropdown(
                                                        activeDropdown === enrollment.id
                                                            ? null
                                                            : enrollment.id
                                                    )
                                                }
                                                className="p-2 rounded-full hover:bg-gray-100"
                                            >
                                                <MoreVertical className="h-5 w-5 text-gray-400" />
                                            </button>

                                            {activeDropdown === enrollment.id && (
                                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleEdit(enrollment)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Edit className="inline h-4 w-4 mr-2" />
                                                            Editar
                                                        </button>
                                                        {enrollment.status === EnrollmentStatus.ACTIVE ? (
                                                            <button
                                                                onClick={() => handleSuspend(enrollment.id)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <XCircle className="inline h-4 w-4 mr-2" />
                                                                Suspender
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivate(enrollment.id)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <CheckCircle className="inline h-4 w-4 mr-2" />
                                                                Activar
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(enrollment.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                        >
                                                            <Trash2 className="inline h-4 w-4 mr-2" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                                setPagination(prev => ({
                                                    ...prev,
                                                    page: prev.page - 1,
                                                }))
                                            }
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPagination(prev => ({
                                                    ...prev,
                                                    page: prev.page + 1,
                                                }))
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
                </div>
            )}

            {/* Modal de Creación */}
            <CreateEnrollmentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchEnrollments}
            />

            {/* Modal de Edición */}
            {selectedEnrollment && (
                <EditEnrollmentModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEnrollment(null);
                    }}
                    onSuccess={fetchEnrollments}
                    enrollment={selectedEnrollment}
                />
            )}
        </div>
    );
}