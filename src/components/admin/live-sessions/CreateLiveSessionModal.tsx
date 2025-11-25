// src/components/admin/live-sessions/CreateLiveSessionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useLiveSessionsAdmin } from '@/hooks/use-live-sessions-admin';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { CreateLiveSessionDto, LiveSession } from '@/types/live-session';
import { Course } from '@/types/course';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CreateLiveSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courseId?: string; // Si se pasa, se crea para ese curso específico
    session?: LiveSession; // Si se pasa, es modo edición
}

export default function CreateLiveSessionModal({
                                                   isOpen,
                                                   onClose,
                                                   onSuccess,
                                                   courseId,
                                                   session,
                                               }: CreateLiveSessionModalProps) {
    const { createSession, updateSession, isLoading } = useLiveSessionsAdmin();
    const { getCourses } = useCoursesAdmin();

    const [formData, setFormData] = useState({
        topic: '',
        startsAt: '',
        endsAt: '',
        meetingUrl: '',
        courseId: courseId || '',
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [searchCourse, setSearchCourse] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    const isEditMode = !!session;

    // Cargar cursos publicados
    useEffect(() => {
        const fetchCourses = async () => {
            if (courseId) return; // Si ya hay un courseId fijo, no cargar

            setLoadingCourses(true);
            try {
                const response = await getCourses({
                    status: 'PUBLISHED',
                    limit: 100, // Cargar todos los cursos publicados
                });
                setCourses(response.data);
            } catch (error) {
                console.error('Error al cargar cursos:', error);
                toast.error('Error al cargar la lista de cursos');
            } finally {
                setLoadingCourses(false);
            }
        };

        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen, courseId]);

    // Cargar datos si es modo edición
    useEffect(() => {
        if (session) {
            // Convertir fechas ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
            const formatForInput = (isoDate: string) => {
                const date = new Date(isoDate);
                // Ajustar a timezone local
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - offset * 60 * 1000);
                return localDate.toISOString().slice(0, 16);
            };

            setFormData({
                topic: session.topic,
                startsAt: formatForInput(session.startsAt),
                endsAt: formatForInput(session.endsAt),
                meetingUrl: session.meetingUrl || '',
                courseId: session.courseId,
            });

            // Si hay información del curso en la sesión, usarla para mostrar
            if (session.course) {
                setSearchCourse(session.course.title);
            }
        } else if (courseId) {
            setFormData((prev) => ({ ...prev, courseId }));
            // Buscar el curso por ID para mostrar el nombre
            const course = courses.find((c) => c.id === courseId);
            if (course) {
                setSearchCourse(course.title);
            }
        }
    }, [session, courseId, courses]);

    // Resetear formulario al cerrar
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                topic: '',
                startsAt: '',
                endsAt: '',
                meetingUrl: '',
                courseId: courseId || '',
            });
            setSearchCourse('');
            setShowCourseDropdown(false);
        }
    }, [isOpen, courseId]);

    // Filtrar cursos según búsqueda
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
        course.category?.name.toLowerCase().includes(searchCourse.toLowerCase())
    );

    // Obtener curso seleccionado
    const selectedCourse = courses.find((c) => c.id === formData.courseId);

    // Manejar selección de curso
    const handleSelectCourse = (course: Course) => {
        setFormData({ ...formData, courseId: course.id });
        setSearchCourse(course.title);
        setShowCourseDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!formData.topic.trim()) {
            toast.error('El tema es obligatorio');
            return;
        }

        if (!formData.startsAt || !formData.endsAt) {
            toast.error('Las fechas de inicio y fin son obligatorias');
            return;
        }

        if (!formData.courseId) {
            toast.error('Debes seleccionar un curso');
            return;
        }

        const startsAt = new Date(formData.startsAt);
        const endsAt = new Date(formData.endsAt);

        if (endsAt <= startsAt) {
            toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        try {
            const data: CreateLiveSessionDto = {
                topic: formData.topic.trim(),
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                meetingUrl: formData.meetingUrl.trim() || undefined,
                courseId: formData.courseId,
            };

            if (isEditMode && session) {
                await updateSession(session.id, data);
                toast.success('Sesión actualizada exitosamente');
            } else {
                await createSession(data);
                toast.success('Sesión creada exitosamente');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error al guardar sesión:', error);
            toast.error(error.message || 'Error al guardar la sesión');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {isEditMode ? 'Editar Sesión en Vivo' : 'Nueva Sesión en Vivo'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tema de la sesión *
                                </label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) =>
                                        setFormData({ ...formData, topic: e.target.value })
                                    }
                                    placeholder="Ej: Introducción a React Hooks"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Fecha y hora de inicio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha y hora de inicio *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startsAt}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startsAt: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Fecha y hora de fin */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha y hora de fin *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endsAt}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endsAt: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* URL de la reunión */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    URL de la reunión (opcional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.meetingUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, meetingUrl: e.target.value })
                                    }
                                    placeholder="https://zoom.us/j/123456789"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Puedes agregar el link de Zoom, Google Meet, etc.
                                </p>
                            </div>

                            {/* Selector de curso */}
                            {!courseId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Curso *
                                    </label>
                                    <div className="relative mt-1">
                                        {/* Input de búsqueda */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchCourse || selectedCourse?.title || ''}
                                                onChange={(e) => {
                                                    setSearchCourse(e.target.value);
                                                    setShowCourseDropdown(true);
                                                }}
                                                onFocus={() => setShowCourseDropdown(true)}
                                                placeholder="Buscar curso..."
                                                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                disabled={isEditMode}
                                                required
                                            />
                                        </div>

                                        {/* Dropdown de cursos */}
                                        {showCourseDropdown && !isEditMode && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                {loadingCourses ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <LoadingSpinner size="sm" />
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            Cargando cursos...
                                                        </span>
                                                    </div>
                                                ) : filteredCourses.length === 0 ? (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        No se encontraron cursos
                                                    </div>
                                                ) : (
                                                    filteredCourses.map((course) => (
                                                        <button
                                                            key={course.id}
                                                            type="button"
                                                            onClick={() => handleSelectCourse(course)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {course.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {course.category?.name} • {course.instructor?.firstName} {course.instructor?.lastName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Curso seleccionado */}
                                    {selectedCourse && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                            <p className="text-sm font-medium text-blue-900">
                                                {selectedCourse.title}
                                            </p>
                                            <p className="text-xs text-blue-700 mt-1">
                                                {selectedCourse.category?.name} • {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                                            </p>
                                        </div>
                                    )}

                                    {isEditMode && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            No puedes cambiar el curso de una sesión existente
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Botones */}
                            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Guardando...</span>
                                        </>
                                    ) : isEditMode ? (
                                        'Actualizar'
                                    ) : (
                                        'Crear Sesión'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}