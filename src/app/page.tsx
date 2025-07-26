// src/app/page.tsx
'use client';

import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function HomePage() {
  const { isAuthenticated, isLoading, isAdmin, isStudent, user } = useAuth();
  const router = useRouter();
  const [redirectStatus, setRedirectStatus] = useState('Inicializando...');
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const currentDebug = {
      isLoading,
      isAuthenticated,
      isAdmin,
      isStudent,
      userExists: !!user,
      userRoles: user?.roles?.map(r => r.name) || [],
      timestamp: new Date().toISOString()
    };

    setDebugInfo(currentDebug);

    console.log('🏠 HomePage useEffect triggered:', currentDebug);

    if (isLoading) {
      setRedirectStatus('Verificando autenticación...');
      console.log('⏳ Still loading, waiting...');
      return;
    }

    if (isAuthenticated) {
      console.log('✅ User is authenticated, checking roles...');

      if (isAdmin) {
        setRedirectStatus('Redirigiendo al panel de administración...');
        console.log('👑 Redirecting to admin dashboard:', ROUTES.ADMIN.DASHBOARD);

        // Usar replace y timeout para evitar loops
        setTimeout(() => {
          router.replace(ROUTES.ADMIN.DASHBOARD);
        }, 100);

      } else if (isStudent) {
        setRedirectStatus('Redirigiendo al dashboard de estudiante...');
        console.log('🎓 Redirecting to student dashboard:', ROUTES.STUDENT.DASHBOARD);

        // Agregar timeout para asegurar que el estado esté listo
        setTimeout(() => {
          router.replace(ROUTES.STUDENT.DASHBOARD);
        }, 100);

      } else {
        setRedirectStatus('Usuario sin rol válido, redirigiendo al login...');
        console.warn('⚠️ User has no valid role:', user?.roles);
        setTimeout(() => {
          router.replace(ROUTES.AUTH.LOGIN);
        }, 100);
      }
    } else {
      setRedirectStatus('No autenticado, redirigiendo al login...');
      console.log('❌ Not authenticated, redirecting to login');
      setTimeout(() => {
        router.replace(ROUTES.AUTH.LOGIN);
      }, 100);
    }
  }, [isAuthenticated, isLoading, isAdmin, isStudent, router, user]);

  // Función para redirección manual (debugging)
  const forceRedirect = () => {
    console.log('🚀 Force redirect clicked');
    if (isStudent) {
      router.push(ROUTES.STUDENT.DASHBOARD);
    } else if (isAdmin) {
      router.push(ROUTES.ADMIN.DASHBOARD);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <LoadingSpinner size="lg" className="mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 mb-4">{redirectStatus}</p>

          {/* Información de debug en modo desarrollo */}
          {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left text-xs space-y-2">
                <p><strong>🐛 Debug Info:</strong></p>
                <p>Loading: {debugInfo.isLoading?.toString()}</p>
                <p>Authenticated: {debugInfo.isAuthenticated?.toString()}</p>
                <p>Admin: {debugInfo.isAdmin?.toString()}</p>
                <p>Student: {debugInfo.isStudent?.toString()}</p>
                <p>User exists: {debugInfo.userExists?.toString()}</p>
                <p>User roles: {debugInfo.userRoles?.join(', ') || 'none'}</p>
                <p>Timestamp: {debugInfo.timestamp}</p>

                {/* Botón de redirección manual para debugging */}
                {isAuthenticated && (
                    <button
                        onClick={forceRedirect}
                        className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      🚀 Forzar Redirección Manual
                    </button>
                )}

                {/* Información adicional */}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p><strong>LocalStorage:</strong></p>
                  <p>Token: {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? '✅ Exists' : '❌ Missing'}</p>
                  <p>User Data: {typeof window !== 'undefined' && localStorage.getItem('user_data') ? '✅ Exists' : '❌ Missing'}</p>
                </div>
              </div>
          )}

          {/* Mensaje de ayuda si la redirección no funciona */}
          {isAuthenticated && !isLoading && (
              <div className="mt-4 text-sm text-gray-500">
                Si no redirige automáticamente en 3 segundos:
                <br />
                <a
                    href={isStudent ? ROUTES.STUDENT.DASHBOARD : ROUTES.ADMIN.DASHBOARD}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Haz clic aquí para ir al dashboard
                </a>
              </div>
          )}
        </div>
      </div>
  );
}