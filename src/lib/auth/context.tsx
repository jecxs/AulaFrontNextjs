// src/lib/auth/context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, LoginCredentials, RoleName, AuthResponse } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Inicializar autenticación al cargar la aplicación
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const savedToken = localStorage.getItem('auth_token');
            const savedUser = localStorage.getItem('user_data');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));

                // Verificar que el token siga siendo válido
                try {
                    const currentUser = await authApi.getProfile();
                    setUser(currentUser);
                    localStorage.setItem('user_data', JSON.stringify(currentUser));
                } catch (error) {
                    // Token inválido, limpiar datos
                    console.warn('Token inválido, limpiando sesión');
                    logout();
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ CORREGIDO: Ahora retorna la respuesta AuthResponse
    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            setIsLoading(true);
            const response = await authApi.login(credentials);

            // Guardar datos en localStorage
            localStorage.setItem('auth_token', response.access_token);
            localStorage.setItem('user_data', JSON.stringify(response.user));

            // Actualizar estado
            setToken(response.access_token);
            setUser(response.user);

            toast.success(`¡Bienvenido, ${response.user.firstName}!`);

            // ✅ RETORNAR la respuesta para que pueda ser usada en login-form
            return response;

        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            toast.error(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Limpiar estado
        setToken(null);
        setUser(null);

        toast.success('Sesión cerrada correctamente');
        router.push(ROUTES.AUTH.LOGIN);
    };

    // ✅ Función helper para verificar roles (maneja ambos formatos)
    const hasRole = (roleName: RoleName): boolean => {
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

    const isAuthenticated = !!user && !!token;
    const isAdmin = hasRole(RoleName.ADMIN);
    const isStudent = hasRole(RoleName.STUDENT);

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated,
        isAdmin,
        isStudent,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}