// src/lib/auth/guards.tsx
'use client';

import { useAuth } from './context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RoleName } from '@/types/auth';
import { ROUTES } from '@/lib/utils/constants';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
    roles?: RoleName[];
}

// ✅ Función helper para extraer roles (maneja ambos formatos)
function extractUserRoles(user: any): string[] {
    if (!user?.roles) return [];

    return user.roles.map((role: any) => {
        // Formato nuevo: { id, name, description }
        if (typeof role === 'object' && role.name) {
            return role.name;
        }
        // Formato viejo: string directo
        if (typeof role === 'string') {
            return role;
        }
        return '';
    }).filter(Boolean);
}

export function AuthGuard({
                              children,
                              requireAuth = true,
                              redirectTo = ROUTES.AUTH.LOGIN,
                              roles = []
                          }: AuthGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        console.log('🛡️ AuthGuard - Checking access:', {
            isLoading,
            isAuthenticated,
            user: user ? {
                id: user.id,
                email: user.email,
                roles: user.roles
            } : null,
            requiredRoles: roles
        });

        if (requireAuth && !isAuthenticated) {
            console.log('❌ AuthGuard - Not authenticated, redirecting to:', redirectTo);
            router.push(redirectTo);
            return;
        }

        if (roles.length > 0 && user) {
            // ✅ CORREGIDO: Usar función helper robusta
            const userRoles = extractUserRoles(user);
            const hasRequiredRole = roles.some(role => userRoles.includes(role));

            console.log('🔍 AuthGuard - Role check:', {
                userRoles,
                requiredRoles: roles,
                hasRequiredRole
            });

            if (!hasRequiredRole) {
                console.log('❌ AuthGuard - Insufficient permissions, redirecting to unauthorized');
                router.push(ROUTES.UNAUTHORIZED);
                return;
            }
        }

        console.log('✅ AuthGuard - Access granted');
    }, [isAuthenticated, isLoading, user, router, requireAuth, redirectTo, roles]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (roles.length > 0 && user) {
        // ✅ CORREGIDO: Usar función helper robusta
        const userRoles = extractUserRoles(user);
        const hasRequiredRole = roles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
}

// Guards específicos para roles
export function AdminGuard({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard roles={[RoleName.ADMIN]} redirectTo={ROUTES.UNAUTHORIZED}>
            {children}
        </AuthGuard>
    );
}

export function StudentGuard({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard roles={[RoleName.STUDENT]} redirectTo={ROUTES.UNAUTHORIZED}>
            {children}
        </AuthGuard>
    );
}