// src/components/admin/courses/detail/CourseHeader.tsx
'use client';

import { Course, Module } from '@/types/course';
import { ArrowLeft, Settings, Plus, BookOpen, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseHeaderProps {
    course: Course;
    modules: Module[];
    onEditCourse: () => void;
    onCreateModule: () => void;
    showCreateButton: boolean;
}

export default function CourseHeader({
                                         course,
                                         modules,
                                         onEditCourse,
                                         onCreateModule,
                                         showCreateButton,
                                     }: CourseHeaderProps) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <button
                        onClick={() => router.push('/admin/courses')}
                        className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-[#001F3F] mb-3">
                            {course.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                                <BookOpen className="h-4 w-4 mr-2 text-[#00B4D8]" />
                                <span className="font-semibold text-[#001F3F]">{modules.length}</span>
                                <span className="ml-1">módulos</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2 text-[#00B4D8]" />
                                <span className="font-semibold text-[#001F3F]">
                                    {course._count?.enrollments || 0}
                                </span>
                                <span className="ml-1">estudiantes</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">
                                <span className="font-medium text-gray-900">{course.category?.name}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={onEditCourse}
                        className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Editar Curso
                    </button>
                    {showCreateButton && (
                        <button
                            onClick={onCreateModule}
                            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#001F3F] shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Módulo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}