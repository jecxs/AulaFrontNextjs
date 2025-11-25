// src/app/(admin)/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCourseCategoriesAdmin } from '@/hooks/use-course-categories-admin';
import { CourseCategoryList } from '@/types/course-category';
import CategoryModal from '@/components/admin/categories/CategoryModal';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Tag,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const {
        getCategories,
        toggleCategoryStatus,
        deleteCategory,
        isLoading,
    } = useCourseCategoriesAdmin();

    const [categories, setCategories] = useState<CourseCategoryList[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CourseCategoryList | null>(
        null
    );
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Cargar categorías
    const fetchCategories = async () => {
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
            };

            if (statusFilter !== '') params.isActive = statusFilter;

            const response = await getCategories(params);
            setCategories(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            toast.error('Error al cargar las categorías');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [pagination.page, statusFilter]);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                fetchCategories();
            } else {
                setPagination({ ...pagination, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleToggleStatus = async (categoryId: string) => {
        try {
            await toggleCategoryStatus(categoryId);
            toast.success('Estado actualizado exitosamente');
            fetchCategories();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar esta categoría? Los cursos asociados quedarán sin categoría.'
            )
        )
            return;

        try {
            await deleteCategory(categoryId);
            toast.success('Categoría eliminada exitosamente');
            fetchCategories();
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
        }
    };

    const handleEdit = (category: CourseCategoryList) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchCategories();
    };

    if (isLoading && categories.length === 0) {
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
                        <h1 className="text-2xl font-bold text-gray-900">
                            Categorías de Cursos
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona las categorías para organizar los cursos
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nueva Categoría
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar categorías..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <select
                            value={String(statusFilter)}
                            onChange={(e) => {
                                const value = e.target.value;
                                setStatusFilter(
                                    value === '' ? '' : value === 'true'
                                );
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="true">Activas</option>
                            <option value="false">Inactivas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de categorías */}
            {categories.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Tag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchQuery || statusFilter !== ''
                            ? 'No se encontraron categorías'
                            : 'No hay categorías registradas'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery || statusFilter !== ''
                            ? 'Intenta con otros filtros'
                            : 'Comienza creando una nueva categoría'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {categories.map((category) => (
                                <li key={category.id} className="hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <Tag className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {category.name}
                                                            </p>
                                                            {category.isActive ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Activa
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    Inactiva
                                                                </span>
                                                            )}
                                                        </div>
                                                        {category.description && (
                                                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {category._count.courses} curso(s)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menú de acciones */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                activeDropdown === category.id
                                                                    ? null
                                                                    : category.id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-full"
                                                    >
                                                        <MoreVertical className="h-5 w-5 text-gray-400" />
                                                    </button>

                                                    {/* Dropdown */}
                                                    {activeDropdown === category.id && (
                                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() =>
                                                                        handleEdit(category)
                                                                    }
                                                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            category.id
                                                                        )
                                                                    }
                                                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    {category.isActive ? (
                                                                        <>
                                                                            <ToggleLeft className="h-4 w-4 mr-2" />
                                                                            Desactivar
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ToggleRight className="h-4 w-4 mr-2" />
                                                                            Activar
                                                                        </>
                                                                    )}
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(category.id)
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
            <CategoryModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                category={selectedCategory}
            />
        </div>
    );
}