// src/components/admin/categories/CategoryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCourseCategoriesAdmin } from '@/hooks/use-course-categories-admin';
import { CourseCategory } from '@/types/course-category';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category?: CourseCategory | null;
}

export default function CategoryModal({
                                          isOpen,
                                          onClose,
                                          onSuccess,
                                          category,
                                      }: CategoryModalProps) {
    const { createCategory, updateCategory, isLoading } = useCourseCategoriesAdmin();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar datos si estamos editando
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                isActive: category.isActive,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                isActive: true,
            });
        }
        setErrors({});
    }, [category, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                isActive: formData.isActive,
            };

            if (category) {
                await updateCategory(category.id, data);
                toast.success('Categoría actualizada exitosamente');
            } else {
                await createCategory(data);
                toast.success('Categoría creada exitosamente');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error al guardar categoría:', error);
            // El error ya se muestra en el hook
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {category ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className={`w-full rounded-md border ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Ej: Programación, Diseño, Marketing..."
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción opcional de la categoría..."
                            disabled={isLoading}
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="isActive"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Categoría activa
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>{category ? 'Actualizar' : 'Crear'} Categoría</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}