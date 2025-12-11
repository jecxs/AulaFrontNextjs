// src/components/student/PasswordChangeBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';

export default function PasswordChangeBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar si el banner ya fue cerrado
        const bannerDismissed = localStorage.getItem('password_change_banner_dismissed');
        if (!bannerDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('password_change_banner_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-amber-900 mb-1">
                        Recomendación de Seguridad
                    </h3>
                    <p className="text-sm text-amber-800 mb-3">
                        Por tu seguridad, te recomendamos cambiar tu contraseña temporal por una personalizada.
                    </p>
                    <Link
                        href={ROUTES.STUDENT.CHANGE_PASSWORD}
                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
                    >
                        Cambiar Contraseña
                    </Link>
                </div>

                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}