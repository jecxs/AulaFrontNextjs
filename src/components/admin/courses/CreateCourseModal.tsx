// src/components/admin/courses/CreateCourseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import {
    CreateCourseDto,
    CourseLevel,
    CourseStatus,
    CourseVisibility,
} from '@/types/course';
import { X, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'react-hot-toast';

// Importar estos APIs (deberás tener estos módulos creados)
import { courseCategoriesApi } from '@/lib/api/course-categories';
import { instructorsApi } from '@/lib/api/instructors';
import { CourseCategory } from '@/types/course-category';
import { Instructor } from '@/types/instructor';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateCourseModal({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                          }: CreateCourseModalProps) {
    const { createCourse, isLoading } = useCoursesAdmin();

    const [formData, setFormData] = useState<CreateCourseDto>({
        title: '',
        slug: '',
        summary: '',
        description: '',
        level: CourseLevel.BEGINNER,
        thumbnailUrl: '',
        estimatedHours: undefined,
        price: undefined,
        status: CourseStatus.DRAFT,
        visibility: CourseVisibility.PRIVATE,
        categoryId: '',
        instructorId: '',
    });

    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Cargar categorías e instructores
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [categoriesData, instructorsData] = await Promise.all([
                courseCategoriesApi.getActive(),
                instructorsApi.getAll({ page: 1, limit: 100 }),
            ]);
            setCategories(categoriesData);
            setInstructors(instructorsData.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar categorías e instructores');
        } finally {
            setLoadingData(false);
        }
    };

    // Generar slug automático del título
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'El slug es requerido';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Debes seleccionar una categoría';
        }

        if (!formData.instructorId) {
            newErrors.instructorId = 'Debes seleccionar un instructor';
        }

        if (formData.estimatedHours && formData.estimatedHours < 0) {
            newErrors.estimatedHours = 'Las horas deben ser un valor positivo';
        }

        if (formData.price && formData.price < 0) {
            newErrors.price = 'El precio debe ser un valor positivo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Preparar datos
            const dataToSubmit: CreateCourseDto = {
                ...formData,
                estimatedHours: formData.estimatedHours || undefined,
                price: formData.price || undefined,
            };

            await createCourse(dataToSubmit);

            setSubmitSuccess(true);
            toast.success('Curso creado exitosamente');

            // Esperar un poco antes de cerrar para mostrar el mensaje
            setTimeout(() => {
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            }, 1000);
        } catch (error) {
            console.error('Error al crear curso:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            slug: '',
            summary: '',
            description: '',
            level: CourseLevel.BEGINNER,
            thumbnailUrl: '',
            estimatedHours: undefined,
            price: undefined,
            status: CourseStatus.DRAFT,
            visibility: CourseVisibility.PRIVATE,
            categoryId: '',
            instructorId: '',
        });
        setErrors({});
        setSubmitSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Crear Nuevo Curso
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Completa la información del curso
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {loadingData ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <>
                                {/* Información básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Información Básica
                                    </h3>

                                    {/* Título */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Título del Curso *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            className={cn(
                                                'w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                                errors.title && 'border-red-300'
                                            )}
                                            placeholder="Ej: Introducción a React"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug (URL amigable) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData({ ...formData, slug: e.target.value })
                                            }
                                            className={cn(
                                                'w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                                errors.slug && 'border-red-300'
                                            )}
                                            placeholder="introduccion-a-react"
                                        />
                                        {errors.slug && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    {/* Resumen */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Resumen
                                        </label>
                                        <textarea
                                            value={formData.summary}
                                            onChange={(e) =>
                                                setFormData({ ...formData, summary: e.target.value })
                                            }
                                            rows={2}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Breve descripción del curso..."
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            rows={4}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Descripción completa del curso..."
                                        />
                                    </div>
                                </div>

                                {/* Configuración del curso */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Configuración
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Categoría */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                value={formData.categoryId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        categoryId: e.target.value,
                                                    })
                                                }
                                                className={cn(
                                                    'w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                                    errors.categoryId && 'border-red-300'
                                                )}
                                            >
                                                <option value="">Seleccionar...</option>
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
                                        </div>

                                        {/* Instructor */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Instructor *
                                            </label>
                                            <select
                                                value={formData.instructorId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        instructorId: e.target.value,
                                                    })
                                                }
                                                className={cn(
                                                    'w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                                    errors.instructorId && 'border-red-300'
                                                )}
                                            >
                                                <option value="">Seleccionar...</option>
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
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value={CourseLevel.BEGINNER}>
                                                    Principiante
                                                </option>
                                                <option value={CourseLevel.INTERMEDIATE}>
                                                    Intermedio
                                                </option>
                                                <option value={CourseLevel.ADVANCED}>
                                                    Avanzado
                                                </option>
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
                                                step="0.5"
                                                value={formData.estimatedHours || ''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        estimatedHours: e.target.value
                                                            ? parseFloat(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="0"
                                            />
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
                                                value={formData.price || ''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value
                                                            ? parseFloat(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
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
                                                        visibility: e.target
                                                            .value as CourseVisibility,
                                                    })
                                                }
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value={CourseVisibility.PRIVATE}>
                                                    Privado
                                                </option>
                                                <option value={CourseVisibility.PUBLIC}>
                                                    Público
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* URL de thumbnail */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL de Imagen
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
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="https://..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            URL de Bunny.net o cualquier CDN
                                        </p>
                                    </div>
                                </div>

                                {/* Success message */}
                                {submitSuccess && (
                                    <div className="rounded-md bg-green-50 p-4">
                                        <div className="flex">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    Curso creado exitosamente
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading || loadingData || submitSuccess}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        >
                            {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            {isLoading ? 'Creando...' : 'Crear Curso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}