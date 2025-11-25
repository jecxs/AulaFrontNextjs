// src/app/(admin)/admin/instructors/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInstructorsAdmin } from '@/hooks/use-instructors-admin';
import { InstructorList } from '@/types/instructor';
import InstructorModal from '@/components/admin/instructors/InstructorModal';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    UserCheck,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

export default function AdminInstructorsPage() {
    const { getInstructors, deleteInstructor, isLoading } = useInstructorsAdmin();

    const [instructors, setInstructors] = useState<InstructorList[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<InstructorList | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    //  OPTIMIZACIÓN: Memoizar fetchInstructors
    const fetchInstructors = useCallback(async () => {
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
            };

            const response = await getInstructors(params);
            setInstructors(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error al cargar instructores:', error);
            toast.error('Error al cargar los instructores');
        }
    }, [pagination.page, pagination.limit, searchQuery, getInstructors]);

    //  Cargar instructores cuando cambia la página
    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    //  OPTIMIZACIÓN: Búsqueda con debounce mejorado
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchInstructors();
            } else {
                setPagination(prev => ({ ...prev, page: 1 }));
            }
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // OPTIMIZACIÓN: Memoizar handlers
    const handleDelete = useCallback(async (instructorId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar este instructor? Debe no tener cursos asignados.'
            )
        )
            return;

        try {
            await deleteInstructor(instructorId);
            toast.success('Instructor eliminado exitosamente');
            fetchInstructors();
        } catch (error) {
            console.error('Error al eliminar instructor:', error);
        }
        setActiveDropdown(null);
    }, [deleteInstructor, fetchInstructors]);

    const handleEdit = useCallback((instructor: InstructorList) => {
        setSelectedInstructor(instructor);
        setShowModal(true);
        setActiveDropdown(null);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedInstructor(null);
    }, []);

    const handleSuccess = useCallback(() => {
        handleCloseModal();
        fetchInstructors();
    }, [handleCloseModal, fetchInstructors]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#001F3F] flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-[#00B4D8]/20 to-[#001F3F]/10 rounded-xl">
                                <UserCheck className="h-6 w-6 text-[#00B4D8]" />
                            </div>
                            Gestión de Instructores
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {pagination.total} instructor{pagination.total !== 1 ? 'es' : ''} registrado
                            {pagination.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Agregar Instructor
                    </button>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar instructores por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 w-full h-11 rounded-lg border border-gray-200 shadow-sm focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 transition-all"
                    />
                </div>
            </div>

            {/* Lista de instructores */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {instructors.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                No se encontraron instructores
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {searchQuery
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza agregando tu primer instructor'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {instructors.map((instructor) => (
                                    <div
                                        key={instructor.id}
                                        className="p-6 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#001F3F]/10 to-[#00B4D8]/10 flex items-center justify-center border border-gray-100">
                                                    <UserCheck className="h-6 w-6 text-[#00B4D8]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-[#001F3F]">
                                                        {instructor.firstName} {instructor.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {instructor.email}
                                                    </p>
                                                    {instructor.specialization && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {instructor.specialization}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {instructor._count && (
                                                    <div className="text-sm text-gray-600 flex items-center gap-1.5">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {instructor._count.courses}
                                                        </span>
                                                        curso{instructor._count.courses !== 1 ? 's' : ''}
                                                    </div>
                                                )}

                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                activeDropdown === instructor.id
                                                                    ? null
                                                                    : instructor.id
                                                            )
                                                        }
                                                        className="p-2 text-gray-600 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>

                                                    {activeDropdown === instructor.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                            <button
                                                                onClick={() => handleEdit(instructor)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(instructor.id)}
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
                                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
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
                                            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

            {/* Modal */}
            <InstructorModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                instructor={selectedInstructor}
            />
        </div>
    );
}