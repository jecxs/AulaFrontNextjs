// src/components/admin/CredentialsDisplay.tsx
'use client';

import { useState } from 'react';
import { Copy, Check, User, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface CredentialsDisplayProps {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    onClose: () => void;
}

export default function CredentialsDisplay({
                                               email,
                                               password,
                                               firstName,
                                               lastName,
                                               onClose
                                           }: CredentialsDisplayProps) {
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);

    const copyAll = () => {
        const credentials = `
🎓 Credenciales de Acceso - Aula Virtual

👤 Nombre: ${firstName} ${lastName}
📧 Email: ${email}
🔐 Contraseña: ${password}

🔗 Accede aquí: ${window.location.origin}/auth/login

⚠️ IMPORTANTE: Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
        `.trim();

        navigator.clipboard.writeText(credentials);
        setCopiedAll(true);
        toast.success('Credenciales completas copiadas');
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        toast.success('Email copiado');
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(password);
        setCopiedPassword(true);
        toast.success('Contraseña copiada');
        setTimeout(() => setCopiedPassword(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Usuario Creado Exitosamente!
                    </h2>
                    <p className="text-sm text-gray-600">
                        Guarda estas credenciales para enviarlas al estudiante
                    </p>
                </div>

                {/* Credenciales */}
                <div className="space-y-4 bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
                    {/* Nombre */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                                Nombre Completo
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {firstName} {lastName}
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                                Email de acceso
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 break-all flex-1">
                                    {email}
                                </p>
                                <button
                                    onClick={copyEmail}
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                    title="Copiar email"
                                >
                                    {copiedEmail ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Lock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                                Contraseña temporal
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-mono font-semibold text-gray-900 break-all flex-1">
                                    {password}
                                </p>
                                <button
                                    onClick={copyPassword}
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                    title="Copiar contraseña"
                                >
                                    {copiedPassword ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advertencia de seguridad */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 mb-1">
                                Importante para el estudiante
                            </p>
                            <p className="text-xs text-amber-800">
                                Se recomienda cambiar la contraseña después del primer inicio de sesión por motivos de seguridad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={copyAll}
                        className={cn(
                            "flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                            copiedAll
                                ? "bg-green-100 text-green-700 border-2 border-green-300"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        {copiedAll ? (
                            <>
                                <Check className="h-5 w-5" />
                                ¡Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5" />
                                Copiar Credenciales
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}