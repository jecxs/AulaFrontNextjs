// src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ROUTES } from '@/lib/utils/constants';
import { RoleName } from '@/types/auth';
import { Eye, EyeOff, Mail, Lock, BookOpen, Users, Award } from 'lucide-react';
import Image from 'next/image';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const hasRole = (user: any, roleName: RoleName): boolean => {
        if (!user?.roles) return false;

        return user.roles.some((role: any) => {
            if (typeof role === 'object' && role.name) {
                return role.name === roleName;
            }
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

            const isAdmin = hasRole(response.user, RoleName.ADMIN);
            const isStudent = hasRole(response.user, RoleName.STUDENT);

            if (isAdmin) {
                router.replace(ROUTES.ADMIN.DASHBOARD);
            } else if (isStudent) {
                router.replace(ROUTES.STUDENT.DASHBOARD);
            } else {
                router.replace(ROUTES.AUTH.LOGIN);
            }

        } catch (error) {
            // El error ya es manejado en el context con toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#001F3F] via-[#003661] to-[#001F3F] overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-[#00B4D8] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00B4D8] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00B4D8] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="space-y-8">
                        {/* Logo and Title */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {/* Logo de la empresa */}
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2">
                                    <Image
                                        src="/logo-palomino.png"
                                        alt="Palomino Learning Center"
                                        width={56}
                                        height={56}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Illumina</h1>
                                    <p className="text-[#00B4D8] text-sm font-medium">Aula Virtual</p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-6 mt-16">
                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors duration-300">
                                    <BookOpen className="h-6 w-6 text-[#00B4D8]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Cursos Personalizados</h3>
                                    <p className="text-white/70 text-sm">Accede a contenido diseñado específicamente para tu aprendizaje</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors duration-300">
                                    <Users className="h-6 w-6 text-[#00B4D8]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Enseñanza personalizada</h3>
                                    <p className="text-white/70 text-sm">Aprende con profesionales</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors duration-300">
                                    <Award className="h-6 w-6 text-[#00B4D8]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Certificados Oficiales</h3>
                                    <p className="text-white/70 text-sm">Obtén reconocimiento por tus logros académicos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                                <Image
                                    src="/logo-palomino.png"
                                    alt="Palomino Learning Center"
                                    width={68}
                                    height={68}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#001F3F]">Aula Virtual</h1>
                            </div>
                        </div>
                    </div>

                    {/* Logo grande arriba de Bienvenido */}
                    <div className="flex justify-center mb-8">
                        <div className="w-52 h-52 relative">
                            <Image
                                src="/logo-palomino.png"
                                alt="Palomino Learning Center"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[#001F3F] mb-2">Bienvenido de nuevo</h2>
                        <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#001F3F] mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#00B4D8] transition-colors duration-200" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent focus:bg-white transition-all duration-200"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#001F3F] mb-2">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#00B4D8] transition-colors duration-200" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent focus:bg-white transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#00B4D8] transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-[#001F3F] to-[#00B4D8] hover:from-[#002a54] hover:to-[#0096c7] focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:shadow-lg active:scale-[0.98] overflow-hidden group"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Iniciando sesión...</span>
                                </div>
                            ) : (
                                <span>Iniciar Sesión</span>
                            )}
                        </button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-xs mt-8">
                        © 2025 Aula Virtual - Illumina. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}