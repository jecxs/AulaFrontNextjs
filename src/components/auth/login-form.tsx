// src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ROUTES } from '@/lib/utils/constants';
import { RoleName } from '@/types/auth';
import { Eye, EyeOff, Mail, Lock, GraduationCap } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    // ✅ Función helper para verificar roles (maneja ambos formatos)
    const hasRole = (user: any, roleName: RoleName): boolean => {
        if (!user?.roles) return false;

        return user.roles.some((role: any) => {
            // Formato nuevo: { id, name, description }
            if (typeof role === 'object' && role.name) {
                return role.name === roleName;
            }
            // Formato viejo: string directo
            if (typeof role === 'string') {
                return role === roleName;
            }
            return false;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await login({ email, password });

            console.log('✅ Login successful:', response);
            console.log('👤 User roles:', response.user.roles);

            // ✅ CORREGIDO: Usar función helper para verificar roles
            const isAdmin = hasRole(response.user, RoleName.ADMIN);
            const isStudent = hasRole(response.user, RoleName.STUDENT);

            console.log('🔍 Role check - isAdmin:', isAdmin, 'isStudent:', isStudent);

            // Forzar redirección inmediata basada en el rol
            if (isAdmin) {
                console.log('🔀 Redirecting to admin dashboard');
                router.replace(ROUTES.ADMIN.DASHBOARD);
            } else if (isStudent) {
                console.log('🔀 Redirecting to student dashboard');
                router.replace(ROUTES.STUDENT.DASHBOARD);
            } else {
                console.warn('⚠️ User has no valid role, redirecting to login');
                console.warn('Available roles:', response.user.roles);
                router.replace(ROUTES.AUTH.LOGIN);
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            // El error ya es manejado en el context con toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Accede a tu aula virtual
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Iniciando sesión...
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </div>

                    {/* Debug info en desarrollo */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                            <p className="font-semibold text-gray-700 mb-2">🧪 Modo Desarrollo:</p>
                            <div className="space-y-1 text-gray-600">
                                <p><strong>Admin:</strong> admin@test.com</p>
                                <p><strong>Estudiante:</strong> estu@gmail.com</p>
                                <p><strong>Password:</strong> password123</p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}