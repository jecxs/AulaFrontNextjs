// src/app/(admin)/admin/instructors/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
    const [selectedInstructor, setSelectedInstructor] = useState<InstructorList | null>(
        null
    );
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Cargar instructores
    const fetchInstructors = async () => {
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
    };

    useEffect(() => {
        fetchInstructors();
    }, [pagination.page]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchInstructors();
            } else {
                setPagination({ ...pagination, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (instructorId: string) => {
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
    };

    const handleEdit = (instructor: InstructorList) => {
        setSelectedInstructor(instructor);
        setShowModal(true);
        setActiveDropdown(null); // Cerrar dropdown al editar
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedInstructor(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchInstructors();
    };

    if (isLoading && instructors.length === 0) {
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Instructores</h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona los instructores de la plataforma
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nuevo Instructor
                    </button>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar instructores por nombre, email o especialización..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Lista de instructores */}
            {instructors.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchQuery
                            ? 'No se encontraron instructores'
                            : 'No hay instructores registrados'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery
                            ? 'Intenta con otros términos de búsqueda'
                            : 'Comienza creando un nuevo instructor'}
                    </p>
                </div>
            ) : (
                <>
                    {/* CAMBIO CRÍTICO: Eliminé overflow-hidden del contenedor */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {instructors.map((instructor) => (
                                <li key={instructor.id} className="hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-4">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0">
                                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-lg">
                                                                {instructor.firstName[0]}
                                                                {instructor.lastName[0]}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Info del instructor */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {instructor.firstName}{' '}
                                                            {instructor.lastName}
                                                        </p>
                                                        <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                            {instructor.email && (
                                                                <>
                                                                    <span>{instructor.email}</span>
                                                                    {instructor.specialization && (
                                                                        <span>•</span>
                                                                    )}
                                                                </>
                                                            )}
                                                            {instructor.specialization && (
                                                                <span>
                                                                    {instructor.specialization}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                                                            <BookOpen className="h-3 w-3 mr-1" />
                                                            {instructor._count.courses} curso(s)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menú de acciones */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                {/* CAMBIO CRÍTICO: Agregué relative aquí */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                activeDropdown === instructor.id
                                                                    ? null
                                                                    : instructor.id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <MoreVertical className="h-5 w-5 text-gray-400" />
                                                    </button>

                                                    {/* Dropdown - CAMBIO CRÍTICO: Aumenté z-index a z-50 */}
                                                    {activeDropdown === instructor.id && (
                                                        <>
                                                            {/* Overlay para cerrar el dropdown al hacer click fuera */}
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={() => setActiveDropdown(null)}
                                                            />

                                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleEdit(instructor)
                                                                        }
                                                                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Editar
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            handleDelete(instructor.id);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
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
                                        setPagination({
                                            ...pagination,
                                            page: pagination.page - 1,
                                        })
                                    }
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                                        de{' '}
                                        <span className="font-medium">
                                            {pagination.total}
                                        </span>{' '}
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
                                            disabled={
                                                pagination.page === pagination.totalPages
                                            }
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