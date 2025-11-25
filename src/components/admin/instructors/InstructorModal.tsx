// src/components/admin/instructors/InstructorModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useInstructorsAdmin } from '@/hooks/use-instructors-admin';
import { Instructor } from '@/types/instructor';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface InstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    instructor?: Instructor | null;
}

export default function InstructorModal({
                                            isOpen,
                                            onClose,
                                            onSuccess,
                                            instructor,
                                        }: InstructorModalProps) {
    const { createInstructor, updateInstructor, isLoading } = useInstructorsAdmin();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        specialization: '',
        experience: '',
        linkedinUrl: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar datos si estamos editando
    useEffect(() => {
        if (instructor) {
            setFormData({
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                email: instructor.email || '',
                phone: instructor.phone || '',
                bio: instructor.bio || '',
                specialization: instructor.specialization || '',
                experience: instructor.experience || '',
                linkedinUrl: instructor.linkedinUrl || '',
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                bio: '',
                specialization: '',
                experience: '',
                linkedinUrl: '',
            });
        }
        setErrors({});
    }, [instructor, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (formData.linkedinUrl && !formData.linkedinUrl.startsWith('http')) {
            newErrors.linkedinUrl = 'La URL debe comenzar con http:// o https://';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                bio: formData.bio.trim() || undefined,
                specialization: formData.specialization.trim() || undefined,
                experience: formData.experience.trim() || undefined,
                linkedinUrl: formData.linkedinUrl.trim() || undefined,
            };

            if (instructor) {
                await updateInstructor(instructor.id, data);
                toast.success('Instructor actualizado exitosamente');
            } else {
                await createInstructor(data);
                toast.success('Instructor creado exitosamente');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error al guardar instructor:', error);
            // El error ya se muestra en el hook
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {instructor ? 'Editar Instructor' : 'Nuevo Instructor'}
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información Básica */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    className={`w-full rounded-md border ${
                                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastName: e.target.value })
                                    }
                                    className={`w-full rounded-md border ${
                                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className={`w-full rounded-md border ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información Profesional */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Información Profesional
                        </h3>
                        <div className="space-y-4">
                            {/* Especialización */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Especialización
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialization: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Frontend Development, UI/UX Design..."
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Biografía */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Biografía
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bio: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Breve descripción profesional..."
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Experiencia */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experiencia
                                </label>
                                <textarea
                                    value={formData.experience}
                                    onChange={(e) =>
                                        setFormData({ ...formData, experience: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Experiencia laboral relevante..."
                                    disabled={isLoading}
                                />
                            </div>

                            {/* LinkedIn URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.linkedinUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, linkedinUrl: e.target.value })
                                    }
                                    className={`w-full rounded-md border ${
                                        errors.linkedinUrl ? 'border-red-300' : 'border-gray-300'
                                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="https://www.linkedin.com/in/usuario"
                                    disabled={isLoading}
                                />
                                {errors.linkedinUrl && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.linkedinUrl}
                                    </p>
                                )}
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
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>{instructor ? 'Actualizar' : 'Crear'} Instructor</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}