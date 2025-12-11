// src/app/(student)/student/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { usersApi } from '@/lib/api/users';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';

export default function ChangePasswordPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu nueva contraseña';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await usersApi.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            toast.success('Contraseña actualizada exitosamente');
            setPasswordChanged(true);

            // Limpiar formulario
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                router.push(ROUTES.STUDENT.PROFILE);
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    if (passwordChanged) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Contraseña Actualizada!
                        </h2>
                        <p className="text-gray-600">
                            Tu contraseña ha sido cambiada exitosamente. Serás redirigido a tu perfil...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Cambiar Contraseña
                </h1>
                <p className="text-gray-600">
                    Mantén tu cuenta segura actualizando tu contraseña regularmente
                </p>
            </div>

            {/* Advertencia de seguridad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-900 mb-1">
                            Recomendaciones de Seguridad
                        </h3>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Usa al menos 8 caracteres</li>
                            <li>• Combina mayúsculas, minúsculas, números y símbolos</li>
                            <li>• No uses información personal fácil de adivinar</li>
                            <li>• No reutilices contraseñas de otras cuentas</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contraseña Actual */}
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Contraseña Actual <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className={cn(
                                    'pl-10 pr-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                    errors.currentPassword && 'border-red-500'
                                )}
                                placeholder="Ingresa tu contraseña actual"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* Nueva Contraseña */}
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nueva Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className={cn(
                                    'pl-10 pr-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                    errors.newPassword && 'border-red-500'
                                )}
                                placeholder="Ingresa tu nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirmar Nueva Contraseña */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={cn(
                                    'pl-10 pr-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                    errors.confirmPassword && 'border-red-500'
                                )}
                                placeholder="Confirma tu nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                'px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors',
                                isLoading && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}