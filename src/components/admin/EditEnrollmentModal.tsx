// src/components/admin/EditEnrollmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useEnrollments } from '@/hooks/use-enrollments';
import {
    EnrollmentStatus,
    EnrollmentWithProgress,
} from '@/lib/api/enrollments';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface EditEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    enrollment: EnrollmentWithProgress;
}

export default function EditEnrollmentModal({
                                                isOpen,
                                                onClose,
                                                onSuccess,
                                                enrollment,
                                            }: EditEnrollmentModalProps) {
    const { updateEnrollment, isLoading } = useEnrollments();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        status: enrollment.status,
        paymentConfirmed: enrollment.paymentConfirmed,
        expiresAt: enrollment.expiresAt
            ? new Date(enrollment.expiresAt).toISOString().split('T')[0]
            : '',
    });

    // Resetear form cuando cambie el enrollment
    useEffect(() => {
        if (enrollment) {
            setFormData({
                status: enrollment.status,
                paymentConfirmed: enrollment.paymentConfirmed,
                expiresAt: enrollment.expiresAt
                    ? new Date(enrollment.expiresAt).toISOString().split('T')[0]
                    : '',
            });
            setError(null);
        }
    }, [enrollment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await updateEnrollment(enrollment.id, {
                status: formData.status as EnrollmentStatus,
                paymentConfirmed: formData.paymentConfirmed,
                expiresAt: formData.expiresAt || undefined,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la matrícula');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Editar Matrícula
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            {/* Información del estudiante y curso */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Estudiante</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {enrollment.user.firstName} {enrollment.user.lastName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {enrollment.user.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Curso</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {enrollment.course.title}
                                    </p>
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estado */}
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Estado
                                </label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as EnrollmentStatus,
                                        })
                                    }
                                    disabled={isLoading}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value={EnrollmentStatus.ACTIVE}>Activo</option>
                                    <option value={EnrollmentStatus.SUSPENDED}>Suspendido</option>
                                    <option value={EnrollmentStatus.COMPLETED}>Completado</option>
                                    <option value={EnrollmentStatus.EXPIRED}>Expirado</option>
                                </select>
                            </div>

                            {/* Confirmación de Pago */}
                            <div>
                                <label
                                    htmlFor="paymentConfirmed"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Estado del Pago
                                </label>
                                <select
                                    id="paymentConfirmed"
                                    value={formData.paymentConfirmed ? 'confirmed' : 'pending'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            paymentConfirmed: e.target.value === 'confirmed',
                                        })
                                    }
                                    disabled={isLoading}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="pending">Pago Pendiente</option>
                                    <option value="confirmed">Pago Confirmado</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Cambia a "Pago Confirmado" cuando verifiques el pago del estudiante
                                </p>
                            </div>

                            {/* Fecha de expiración */}
                            <div>
                                <label
                                    htmlFor="expiresAt"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Fecha de Expiración
                                </label>
                                <input
                                    type="date"
                                    id="expiresAt"
                                    value={formData.expiresAt}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expiresAt: e.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Deja vacío para acceso ilimitado
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner className="h-4 w-4 mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}