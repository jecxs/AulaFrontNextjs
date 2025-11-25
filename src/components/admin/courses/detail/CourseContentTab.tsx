// src/components/admin/courses/detail/CourseContentTab.tsx
'use client';

import { Module, Lesson } from '@/types/course';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    GripVertical,
    BookOpen,
    Video,
    FileText,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import ModuleQuizzesCard from '@/components/admin/courses/ModuleQuizzesCard';

interface CourseContentTabProps {
    courseId: string;
    modules: Module[];
    expandedModules: Set<string>;
    onToggleModule: (moduleId: string) => void;
    onCreateModule: () => void;
    onEditModule: (module: Module) => void;
    onDeleteModule: (moduleId: string) => void;
    onCreateLesson: (moduleId: string) => void;
    onEditLesson: (lesson: Lesson) => void;
    onDeleteLesson: (lessonId: string) => void;
    onModuleChanged: () => void;
}

const getLessonIcon = (type: string) => {
    switch (type) {
        case 'VIDEO':
            return Video;
        case 'TEXT':
            return FileText;
        default:
            return BookOpen;
    }
};

export default function CourseContentTab({
                                             courseId,
                                             modules,
                                             expandedModules,
                                             onToggleModule,
                                             onCreateModule,
                                             onEditModule,
                                             onDeleteModule,
                                             onCreateLesson,
                                             onEditLesson,
                                             onDeleteLesson,
                                             onModuleChanged,
                                         }: CourseContentTabProps) {
    if (modules.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#001F3F]/5 to-[#00B4D8]/5 mb-4">
                    <BookOpen className="h-8 w-8 text-[#00B4D8]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    No hay módulos
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Comienza agregando módulos a este curso para organizar el contenido
                </p>
                <div className="mt-6">
                    <button
                        onClick={onCreateModule}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#001F3F] to-[#003366] hover:from-[#003366] hover:to-[#001F3F] shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primer Módulo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {modules.map((module, index) => {
                const isExpanded = expandedModules.has(module.id);

                return (
                    <div
                        key={module.id}
                        className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300"
                    >
                        {/* Header del módulo */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button className="cursor-move text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                                        <GripVertical className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => onToggleModule(module.id)}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left group"
                                    >
                                        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#001F3F] to-[#003366] text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-[#001F3F] group-hover:text-[#00B4D8] transition-colors truncate">
                                                {module.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center text-xs text-gray-600">
                                                    <BookOpen className="h-3.5 w-3.5 mr-1 text-[#00B4D8]" />
                                                    <span className="font-medium">{module._count?.lessons || 0}</span>
                                                    <span className="ml-1">lecciones</span>
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="inline-flex items-center text-xs text-gray-600">
                                                    <span className="font-medium">{module._count?.quizzes || 0}</span>
                                                    <span className="ml-1">quizzes</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            {isExpanded ? (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => onCreateLesson(module.id)}
                                        className="p-2 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 rounded-lg transition-all"
                                        title="Agregar lección"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onEditModule(module)}
                                        className="p-2 text-gray-400 hover:text-[#001F3F] hover:bg-gray-100 rounded-lg transition-all"
                                        title="Editar módulo"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteModule(module.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Eliminar módulo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del módulo (expandible) */}
                        {isExpanded && (
                            <div className="bg-white p-5 space-y-4">
                                {/* Lecciones */}
                                {module.lessons && module.lessons.length > 0 ? (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                                            <h4 className="font-semibold text-sm text-[#001F3F]">Lecciones</h4>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {module.lessons.map((lesson, lessonIndex) => {
                                                const LessonIcon = getLessonIcon(lesson.type);
                                                const resourcesCount = lesson._count?.resources ?? 0;

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className="px-4 py-3 hover:bg-gray-50/50 flex items-center justify-between group transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <button className="opacity-0 group-hover:opacity-100 cursor-move text-gray-400 transition-opacity">
                                                                <GripVertical className="h-4 w-4" />
                                                            </button>
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#00B4D8]/10 to-[#00B4D8]/5 rounded-lg flex items-center justify-center">
                                                                    <LessonIcon className="h-4 w-4 text-[#00B4D8]" />
                                                                </div>
                                                                <span className="text-sm text-gray-900 font-medium truncate">
                                                                    {lessonIndex + 1}. {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                {/* Solo mostrar duración para lecciones de tipo VIDEO */}
                                                                {lesson.type === 'VIDEO' && lesson.durationSec && lesson.durationSec > 0 && (
                                                                    <span className="text-xs text-gray-500 font-medium">
                                                                        {Math.floor(lesson.durationSec / 60)} min
                                                                    </span>
                                                                )}
                                                                {resourcesCount > 0 && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00B4D8]/10 text-[#00B4D8]">
                                                                        {resourcesCount} recursos
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                                                            <Link
                                                                href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                                                                className="p-1.5 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/10 rounded-lg transition-all"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => onEditLesson(lesson)}
                                                                className="p-1.5 text-gray-400 hover:text-[#001F3F] hover:bg-gray-100 rounded-lg transition-all"
                                                                title="Editar"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteLesson(lesson.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                                        <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 mb-3">
                                            No hay lecciones en este módulo
                                        </p>
                                        <button
                                            onClick={() => onCreateLesson(module.id)}
                                            className="text-sm font-medium text-[#00B4D8] hover:text-[#001F3F] transition-colors"
                                        >
                                            + Agregar primera lección
                                        </button>
                                    </div>
                                )}

                                {/* Quizzes */}
                                <ModuleQuizzesCard
                                    module={module}
                                    onModuleChanged={onModuleChanged}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}