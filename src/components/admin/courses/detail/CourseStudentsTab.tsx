// src/components/admin/courses/detail/CourseStudentsTab.tsx
'use client';

import { EnrollmentWithProgress, EnrollmentStatus } from '@/lib/api/enrollments';
import {
    Search,
    Filter,
    UserPlus,
    Users,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CourseStudentsTabProps {
    enrollments: EnrollmentWithProgress[];
    isLoading: boolean;
    searchQuery: string;
    statusFilter: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onSearchChange: (query: string) => void;
    onStatusFilterChange: (status: string) => void;
    onPageChange: (page: number) => void;
    onCreateEnrollment: () => void;
    onEnrollmentAction: (enrollmentId: string, action: 'activate' | 'suspend' | 'delete') => void;
}

const getStatusBadge = (status: EnrollmentStatus) => {
    const statusConfig = {
        [EnrollmentStatus.ACTIVE]: {
            label: 'Activo',
            className: 'bg-green-50 text-green-700 border border-green-200',
            icon: CheckCircle,
        },
        [EnrollmentStatus.SUSPENDED]: {
            label: 'Suspendido',
            className: 'bg-amber-50 text-amber-700 border border-amber-200',
            icon: Clock,
        },
        [EnrollmentStatus.COMPLETED]: {
            label: 'Completado',
            className: 'bg-blue-50 text-blue-700 border border-blue-200',
            icon: CheckCircle,
        },
        [EnrollmentStatus.EXPIRED]: {
            label: 'Expirado',
            className: 'bg-red-50 text-red-700 border border-red-200',
            icon: XCircle,
        },
    };

    const config = statusConfig[status] || statusConfig[EnrollmentStatus.ACTIVE];
    const Icon = config.icon;

    return (
        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', config.className)}>
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {config.label}
        </span>
    );
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function CourseStudentsTab({
                                              enrollments,
                                              isLoading,
                                              searchQuery,
                                              statusFilter,
                                              pagination,
                                              onSearchChange,
                                              onStatusFilterChange,
                                              onPageChange,
                                              onCreateEnrollment,
                                              onEnrollmentAction,
                                          }: CourseStudentsTabProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar estudiantes..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="pl-11 pr-10 h-11 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] transition-all appearance-none bg-white text-sm font-medium"
                        >
                            <option value="">Todos los estados</option>
                            <option value={EnrollmentStatus.ACTIVE}>Activos</option>
                            <option value={EnrollmentStatus.SUSPENDED}>Suspendidos</option>
                            <option value={EnrollmentStatus.COMPLETED}>Completados</option>
                            <option value={EnrollmentStatus.EXPIRED}>Expirados</option>
                        </select>
                    </div>
                    <button
                        onClick={onCreateEnrollment}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#001F3F] shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Matricular
                    </button>
                </div>
            </div>

            {/* Lista de estudiantes */}
            {enrollments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#001F3F]/5 to-[#00B4D8]/5 mb-4">
                        <Users className="h-8 w-8 text-[#00B4D8]" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                        No hay estudiantes matriculados
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                        {searchQuery || statusFilter
                            ? 'No se encontraron estudiantes con los filtros aplicados'
                            : 'Comienza matriculando estudiantes a este curso'}
                    </p>
                    {!searchQuery && !statusFilter && (
                        <div className="mt-6">
                            <button
                                onClick={onCreateEnrollment}
                                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#001F3F] shadow-md hover:shadow-lg transition-all"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Matricular Primer Estudiante
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Estudiante
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Progreso
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Matrícula
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Expiración
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Pago
                                    </th>
                                    <th className="relative py-3.5 pl-3 pr-6">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096c7] flex items-center justify-center shadow-sm">
                                                            <span className="text-white font-semibold text-sm">
                                                                {enrollment.user.firstName[0]}
                                                                {enrollment.user.lastName[0]}
                                                            </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-[#001F3F]">
                                                        {enrollment.user.firstName} {enrollment.user.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {enrollment.user.email}
                                                    </div>
                                                    {enrollment.user.phone && (
                                                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            {enrollment.user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            {getStatusBadge(enrollment.status)}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-3 min-w-[200px]">
                                                <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    {enrollment.progress ? (
                                                        <>
                                                            <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-sm font-semibold text-[#001F3F]">
                                                                        {Math.max(0, Math.min(100, enrollment.progress.completionPercentage)).toFixed(0)}%
                                                                    </span>
                                                                <span className="text-xs text-gray-500">
                                                                        {enrollment.progress.completedLessons} / {enrollment.progress.totalLessons}
                                                                    </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-gradient-to-r from-[#00B4D8] to-[#0096c7] h-1.5 rounded-full transition-all"
                                                                    style={{ width: `${Math.max(0, Math.min(100, enrollment.progress.completionPercentage))}%` }}
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-sm font-medium text-gray-400 mb-1">
                                                                Sin progreso
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }} />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                                                {formatDate(enrollment.enrolledAt)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            {enrollment.expiresAt ? (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                                                    {formatDate(enrollment.expiresAt)}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Sin expiración</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            {enrollment.paymentConfirmed ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Confirmado
                                                    </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pendiente
                                                    </span>
                                            )}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {enrollment.status === EnrollmentStatus.ACTIVE ? (
                                                    <button
                                                        onClick={() => onEnrollmentAction(enrollment.id, 'suspend')}
                                                        className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Suspender"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </button>
                                                ) : enrollment.status === EnrollmentStatus.SUSPENDED ? (
                                                    <button
                                                        onClick={() => onEnrollmentAction(enrollment.id, 'activate')}
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Activar"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                ) : null}
                                                <button
                                                    onClick={() => onEnrollmentAction(enrollment.id, 'delete')}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
                    </div>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4">
                            <div className="text-sm text-gray-600">
                                Mostrando{' '}
                                <span className="font-semibold text-[#001F3F]">
                                    {(pagination.page - 1) * pagination.limit + 1}
                                </span>{' '}
                                a{' '}
                                <span className="font-semibold text-[#001F3F]">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span>{' '}
                                de <span className="font-semibold text-[#001F3F]">{pagination.total}</span> estudiantes
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white">
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}