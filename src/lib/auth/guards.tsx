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

        if (requireAuth && !isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        if (roles.length > 0 && user) {
            const userRoles = user.roles.map(role => role.name);
            const hasRequiredRole = roles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
                router.push(ROUTES.UNAUTHORIZED);
                return;
            }
        }
    }, [isAuthenticated, isLoading, user, router, requireAuth, redirectTo, roles]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (roles.length > 0 && user) {
        const userRoles = user.roles.map(role => role.name);
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