// src/app/page.tsx
'use client';

import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function HomePage() {
  const { isAuthenticated, isLoading, isAdmin, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Redirigir según el rol
      if (isAdmin) {
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else if (isStudent) {
        router.push(ROUTES.STUDENT.DASHBOARD);
      }
    } else {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [isAuthenticated, isLoading, isAdmin, isStudent, router]);

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
  );
}