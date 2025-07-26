// src/app/unauthorized/page.tsx
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldX className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Acceso No Autorizado
                </h1>
                <p className="text-gray-600 mb-6">
                    No tienes permisos para acceder a esta página.
                </p>
                <Link
                    href={ROUTES.AUTH.LOGIN}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Volver al Login
                </Link>
            </div>
        </div>
    );
}