// src/components/admin/CreateStudentForm.tsx - ACTUALIZACIÓN COMPLETA
'use client';

import { useState, useEffect } from 'react';
import { useUsers, CreateStudentDto } from '@/hooks/use-users';
import { coursesApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/auth/context';
import { X, Mail, User, Phone, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import PasswordGenerator from './PasswordGenerator';
import CredentialsDisplay from './CredentialsDisplay';

interface CreateStudentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreateStudentForm({
                                              onSuccess,
                                              onCancel,
                                          }: CreateStudentFormProps) {
    const { user } = useAuth();
    const { createStudent, isLoading } = useUsers();

    const [formData, setFormData] = useState<CreateStudentDto>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        courseIds: [],
    });

    const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCredentials, setShowCredentials] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    } | null>(null);

    // Cargar cursos disponibles
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await coursesApi.getAll({
                    page: 1,
                    limit: 100,
                    status: 'PUBLISHED',
                });
                setAvailableCourses(response.data);
            } catch (error) {
                console.error('Error al cargar cursos:', error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Debe generar una contraseña';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.firstName) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'El apellido es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createStudent(formData, user?.id || '');

            // Guardar credenciales para mostrarlas
            setGeneratedCredentials({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            // Mostrar modal de credenciales
            setShowCredentials(true);
        } catch (error) {
            console.error('Error al crear estudiante:', error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordGenerate = (password: string) => {
        setFormData((prev) => ({
            ...prev,
            password,
        }));
        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: '' }));
        }
    };

    const handleCourseToggle = (courseId: string) => {
        setFormData((prev) => {
            const courseIds = prev.courseIds || [];
            const isSelected = courseIds.includes(courseId);

            return {
                ...prev,
                courseIds: isSelected
                    ? courseIds.filter((id) => id !== courseId)
                    : [...courseIds, courseId],
            };
        });
    };

    const handleCloseCredentials = () => {
        setShowCredentials(false);

        // Limpiar formulario
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            courseIds: [],
        });

        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Información Personal
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Nombre */}
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={cn(
                                        'pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                        errors.firstName && 'border-red-500'
                                    )}
                                    placeholder="Juan"
                                />
                            </div>
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        {/* Apellido */}
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={cn(
                                        'pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                        errors.lastName && 'border-red-500'
                                    )}
                                    placeholder="Pérez"
                                />
                            </div>
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={cn(
                                        'pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                                        errors.email && 'border-red-500'
                                    )}
                                    placeholder="juan.perez@ejemplo.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Teléfono (opcional)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="+51 999 999 999"
                                />
                            </div>
                        </div>

                        {/* Generador de Contraseña */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <PasswordGenerator
                                onPasswordGenerate={handlePasswordGenerate}
                                currentPassword={formData.password}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Asignación de Cursos */}
                <div>
                    <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Asignar Cursos (Opcional)
                        </h3>
                    </div>

                    {loadingCourses ? (
                        <p className="text-sm text-gray-500">Cargando cursos...</p>
                    ) : availableCourses.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay cursos publicados disponibles
                        </p>
                    ) : (
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4 space-y-2">
                            {availableCourses.map((course) => (
                                <label
                                    key={course.id}
                                    className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.courseIds?.includes(course.id)}
                                        onChange={() => handleCourseToggle(course.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {course.title}
                                        </p>
                                        {course.summary && (
                                            <p className="text-xs text-gray-500">{course.summary}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {formData.courseIds && formData.courseIds.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                            {formData.courseIds.length} curso(s) seleccionado(s)
                        </p>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? 'Creando...' : 'Crear Estudiante'}
                    </button>
                </div>
            </form>

            {/* Modal de Credenciales */}
            {showCredentials && generatedCredentials && (
                <CredentialsDisplay
                    email={generatedCredentials.email}
                    password={generatedCredentials.password}
                    firstName={generatedCredentials.firstName}
                    lastName={generatedCredentials.lastName}
                    onClose={handleCloseCredentials}
                />
            )}
        </>
    );
}