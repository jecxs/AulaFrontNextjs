// src/components/admin/courses/CreateCourseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { useCourseCategoriesAdmin } from '@/hooks/use-course-categories-admin';
import { useInstructorsAdmin } from '@/hooks/use-instructors-admin';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { CourseLevel, CourseVisibility } from '@/types/course';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCourseModal({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                          }: CreateCourseModalProps) {
    const { createCourse, isLoading: isCreating } = useCoursesAdmin();
    const { getActiveCategories } = useCourseCategoriesAdmin();
    const { getInstructors } = useInstructorsAdmin();

    const [categories, setCategories] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        description: '',
        level: CourseLevel.BEGINNER,
        thumbnailUrl: '',
        estimatedHours: '',
        price: '',
        visibility: CourseVisibility.PRIVATE,
        categoryId: '',
        instructorId: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar categorías e instructores al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setIsLoadingData(true);
        try {
            // Cargar categorías activas
            const categoriesData = await getActiveCategories();
            setCategories(categoriesData);

            // Cargar instructores (primeros 100 para el select)
            const instructorsData = await getInstructors({ limit: 100 });
            setInstructors(instructorsData.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar categorías e instructores');
        } finally {
            setIsLoadingData(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Debes seleccionar una categoría';
        }

        if (!formData.instructorId) {
            newErrors.instructorId = 'Debes seleccionar un instructor';
        }

        if (formData.estimatedHours && parseFloat(formData.estimatedHours) <= 0) {
            newErrors.estimatedHours = 'Las horas estimadas deben ser positivas';
        }

        if (formData.price && parseFloat(formData.price) < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = {
                title: formData.title.trim(),
                summary: formData.summary.trim() || undefined,
                description: formData.description.trim() || undefined,
                level: formData.level,
                thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
                estimatedHours: formData.estimatedHours
                    ? parseInt(formData.estimatedHours)
                    : undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
                visibility: formData.visibility,
                categoryId: formData.categoryId,
                instructorId: formData.instructorId,
            };

            await createCourse(data);
            toast.success('Curso creado exitosamente');

            // Resetear formulario
            setFormData({
                title: '',
                summary: '',
                description: '',
                level: CourseLevel.BEGINNER,
                thumbnailUrl: '',
                estimatedHours: '',
                price: '',
                visibility: CourseVisibility.PRIVATE,
                categoryId: '',
                instructorId: '',
            });

            onSuccess();
        } catch (error: any) {
            console.error('Error al crear curso:', error);
            // El error ya se muestra en el hook
        }
    };

    if (!isOpen) return null;

    const isLoading = isCreating || isLoadingData;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Curso</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información básica */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Información Básica
                        </h3>
                        <div className="space-y-4">
                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título del Curso <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className={`w-full rounded-md border ${
                                        errors.title ? 'border-red-300' : 'border-gray-300'
                                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Ej: Introducción a JavaScript"
                                    disabled={isLoading}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Resumen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resumen
                                </label>
                                <input
                                    type="text"
                                    value={formData.summary}
                                    onChange={(e) =>
                                        setFormData({ ...formData, summary: e.target.value })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Breve descripción del curso (1-2 líneas)"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción Completa
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Descripción detallada del curso, objetivos, contenido..."
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Categoría */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoría <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                categoryId: e.target.value,
                                            })
                                        }
                                        className={`w-full rounded-md border ${
                                            errors.categoryId
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                        } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        disabled={isLoading}
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.categoryId}
                                        </p>
                                    )}
                                    {categories.length === 0 && !isLoadingData && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            No hay categorías disponibles. Crea una primero.
                                        </p>
                                    )}
                                </div>

                                {/* Instructor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instructor <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.instructorId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                instructorId: e.target.value,
                                            })
                                        }
                                        className={`w-full rounded-md border ${
                                            errors.instructorId
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                        } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        disabled={isLoading}
                                    >
                                        <option value="">Seleccionar instructor</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.firstName} {instructor.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.instructorId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.instructorId}
                                        </p>
                                    )}
                                    {instructors.length === 0 && !isLoadingData && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            No hay instructores disponibles. Crea uno primero.
                                        </p>
                                    )}
                                </div>

                                {/* Nivel */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nivel
                                    </label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                level: e.target.value as CourseLevel,
                                            })
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    >
                                        <option value="BEGINNER">Principiante</option>
                                        <option value="INTERMEDIATE">Intermedio</option>
                                        <option value="ADVANCED">Avanzado</option>
                                    </select>
                                </div>

                                {/* Visibilidad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visibilidad
                                    </label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                visibility: e.target.value as CourseVisibility,
                                            })
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    >
                                        <option value="PRIVATE">Privado</option>
                                        <option value="PUBLIC">Público</option>
                                    </select>
                                </div>

                                {/* Horas estimadas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Horas Estimadas
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.estimatedHours}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estimatedHours: e.target.value,
                                            })
                                        }
                                        className={`w-full rounded-md border ${
                                            errors.estimatedHours
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                        } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Ej: 10"
                                        disabled={isLoading}
                                    />
                                    {errors.estimatedHours && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.estimatedHours}
                                        </p>
                                    )}
                                </div>

                                {/* Precio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price: e.target.value })
                                        }
                                        className={`w-full rounded-md border ${
                                            errors.price ? 'border-red-300' : 'border-gray-300'
                                        } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Ej: 99.99"
                                        disabled={isLoading}
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* URL de imagen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL de Imagen (Thumbnail)
                                </label>
                                <input
                                    type="url"
                                    value={formData.thumbnailUrl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            thumbnailUrl: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
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
                            {isCreating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Curso'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}