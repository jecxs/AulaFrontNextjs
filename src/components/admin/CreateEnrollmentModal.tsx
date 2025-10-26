// src/components/admin/CreateEnrollmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useEnrollments } from '@/hooks/use-enrollments';
import { coursesApi } from '@/lib/api/courses';
import { rolesApi } from '@/lib/api/roles';
import { CreateEnrollmentDto } from '@/lib/api/enrollments';
import { useAuth } from '@/lib/auth/context';
import { X, UserPlus, BookOpen, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CreateEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    preSelectedUserId?: string; // Para pre-seleccionar un estudiante
    preSelectedCourseId?: string; // Para pre-seleccionar un curso
}

export default function CreateEnrollmentModal({
                                                  isOpen,
                                                  onClose,
                                                  onSuccess,
                                                  preSelectedUserId,
                                                  preSelectedCourseId,
                                              }: CreateEnrollmentModalProps) {
    const { user } = useAuth();
    const { createEnrollment, isLoading } = useEnrollments();

    const [formData, setFormData] = useState<Omit<CreateEnrollmentDto, 'enrolledById'>>({
        userId: preSelectedUserId || '',
        courseId: preSelectedCourseId || '',
        expiresAt: '',
        paymentConfirmed: false,
    });

    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Cargar estudiantes y cursos disponibles
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [studentsData, coursesData] = await Promise.all([
                rolesApi.getStudents(),
                coursesApi.getAll({ page: 1, limit: 100, status: 'PUBLISHED' }),
            ]);
            setStudents(studentsData);
            setCourses(coursesData.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId) {
            newErrors.userId = 'Debes seleccionar un estudiante';
        }

        if (!formData.courseId) {
            newErrors.courseId = 'Debes seleccionar un curso';
        }

        if (formData.expiresAt) {
            const expiryDate = new Date(formData.expiresAt);
            if (expiryDate < new Date()) {
                newErrors.expiresAt = 'La fecha de expiración debe ser futura';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!user?.id) {
            setErrors({ general: 'No se pudo identificar al usuario administrador' });
            return;
        }

        try {
            const enrollmentData: CreateEnrollmentDto = {
                ...formData,
                enrolledById: user.id,
                expiresAt: formData.expiresAt || undefined,
            };

            await createEnrollment(enrollmentData);
            setSubmitSuccess(true);

            // Mostrar mensaje de éxito por 1.5 segundos
            setTimeout(() => {
                setSubmitSuccess(false);
                resetForm();
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al crear enrollment';
            setErrors({ general: errorMessage });
        }
    };

    const resetForm = () => {
        setFormData({
            userId: preSelectedUserId || '',
            courseId: preSelectedCourseId || '',
            expiresAt: '',
            paymentConfirmed: false,
        });
        setErrors({});
        setSubmitSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    // Calcular fecha por defecto (1 año desde hoy)
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Matricular Estudiante
                            </h3>
                            <p className="text-sm text-gray-500">
                                Asigna un curso a un estudiante
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <div className="mx-6 mt-6 rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    ¡Matriculación exitosa!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errors.general && !submitSuccess && (
                    <div className="mx-6 mt-6 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {errors.general}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                    {loadingData ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            {/* Seleccionar Estudiante */}
                            <div>
                                <label
                                    htmlFor="userId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Estudiante <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="userId"
                                    value={formData.userId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, userId: e.target.value })
                                    }
                                    disabled={!!preSelectedUserId || isLoading}
                                    className={cn(
                                        'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
                                        'focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                                        errors.userId && 'border-red-300'
                                    )}
                                >
                                    <option value="">Seleccionar estudiante...</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.firstName} {student.lastName} ({student.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.userId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
                                )}
                            </div>

                            {/* Seleccionar Curso */}
                            <div>
                                <label
                                    htmlFor="courseId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Curso <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="courseId"
                                    value={formData.courseId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, courseId: e.target.value })
                                    }
                                    disabled={!!preSelectedCourseId || isLoading}
                                    className={cn(
                                        'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
                                        'focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                                        errors.courseId && 'border-red-300'
                                    )}
                                >
                                    <option value="">Seleccionar curso...</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} - {course.category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.courseId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
                                )}
                                {formData.courseId && (
                                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        {courses.find((c) => c.id === formData.courseId)?.level}
                                    </p>
                                )}
                            </div>

                            {/* Fecha de Expiración */}
                            <div>
                                <label
                                    htmlFor="expiresAt"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Fecha de Expiración (Opcional)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        id="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={(e) =>
                                            setFormData({ ...formData, expiresAt: e.target.value })
                                        }
                                        min={minDate}
                                        disabled={isLoading}
                                        className={cn(
                                            'block w-full pl-10 rounded-md border-gray-300 shadow-sm',
                                            'focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                                            'disabled:bg-gray-100 disabled:cursor-not-allowed',
                                            errors.expiresAt && 'border-red-300'
                                        )}
                                    />
                                </div>
                                {errors.expiresAt && (
                                    <p className="mt-1 text-sm text-red-600">{errors.expiresAt}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    Si no se especifica, el acceso será ilimitado
                                </p>
                            </div>

                            {/* Pago Confirmado */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="paymentConfirmed"
                                        type="checkbox"
                                        checked={formData.paymentConfirmed}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                paymentConfirmed: e.target.checked,
                                            })
                                        }
                                        disabled={isLoading}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label
                                        htmlFor="paymentConfirmed"
                                        className="font-medium text-gray-700"
                                    >
                                        Pago confirmado
                                    </label>
                                    <p className="text-gray-500">
                                        Marca esta casilla si el estudiante ya realizó el pago
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || loadingData || submitSuccess}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Creando...
                            </>
                        ) : submitSuccess ? (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                ¡Creado!
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-5 w-5 mr-2" />
                                Matricular Estudiante
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}