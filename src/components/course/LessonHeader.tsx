// src/components/course/LessonHeader.tsx
'use client';

import { ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import Image from 'next/image';

interface LessonHeaderProps {
    courseId: string;
    moduleTitle: string;
    lessonTitle: string;
    isCompleted: boolean;
}

export default function LessonHeader({
                                         courseId,
                                         moduleTitle,
                                         lessonTitle,
                                         isCompleted,
                                     }: LessonHeaderProps) {
    return (
        <div className="bg-[#001F3F] border-b border-white/5 flex-shrink-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo y navegación */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Logo */}
                        <Link
                            href={ROUTES.STUDENT.DASHBOARD}
                            className="flex-shrink-0 transition-opacity hover:opacity-80"
                        >
                            <Image
                                src="/logo-light.png"
                                alt="Logo"
                                width={160}
                                height={52}
                                className="h-8 w-auto"
                                priority
                            />
                        </Link>

                        {/* Separador vertical */}
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />

                        {/* Botón volver */}
                        <Link
                            href={`${ROUTES.STUDENT.COURSES}/${courseId}`}
                            className="text-white/70 hover:text-white transition-colors flex-shrink-0 p-1.5 hover:bg-white/5 rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                        </Link>

                        {/* Info de la lección */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/50 truncate font-medium">
                                {moduleTitle}
                            </p>
                            <h1 className="text-base sm:text-lg font-semibold truncate text-white">
                                {lessonTitle}
                            </h1>
                        </div>
                    </div>

                    {/* Indicador de completado */}
                    {isCompleted && (
                        <div className="flex items-center gap-2 text-emerald-400 flex-shrink-0 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                            <CheckCircle className="w-4.5 h-4.5" strokeWidth={2} />
                            <span className="text-sm font-medium hidden sm:inline">
                                Completada
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}