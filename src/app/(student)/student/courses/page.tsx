// src/app/(student)/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import { BookOpen, Clock, Users, TrendingUp, Search, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

interface CourseFilters {
    status: 'all' | 'active' | 'completed' | 'in-progress';
    search: string;
}

export default function StudentCoursesPage() {
    const [filters, setFilters] = useState<CourseFilters>({
        status: 'all',
        search: ''
    });

    // Query para obtener los cursos del estudiante
    const {
        data: enrollmentsData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: coursesApi.getMyEnrollments,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const enrollments = enrollmentsData?.data || [];

    // Filtrar cursos según los filtros aplicados
    const filteredEnrollments = enrollments.filter(enrollment => {
        // Filtro por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = enrollment.course.title.toLowerCase().includes(searchLower);
            const instructorMatch = `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`.toLowerCase().includes(searchLower);
            if (!titleMatch && !instructorMatch) return false;
        }

        // Filtro por estado
        if (filters.status !== 'all') {
            switch (filters.status) {
                case 'active':
                    return enrollment.status === 'ACTIVE';
                case 'completed':
                    return enrollment.status === 'COMPLETED';
                case 'in-progress':
                    return enrollment.status === 'ACTIVE' &&
                        enrollment.progress &&
                        enrollment.progress.completionPercentage > 0 &&
                        enrollment.progress.completionPercentage < 100;
                default:
                    return true;
            }
        }

        return true;
    });

    // Manejar errores
    useEffect(() => {
        if (error) {
            console.error('Error loading enrollments:', error);
            toast.error('Error al cargar los cursos');
        }
    }, [error]);

    // Estados de carga
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
                    <p className="text-gray-600">
                        Gestiona y accede a todos tus cursos enrollados
                    </p>
                </div>

                {/* Estadísticas rápidas */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{enrollments.length} cursos</span>
                    </div>
                    <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>
                            {enrollments.filter(e => e.status === 'COMPLETED').length} completados
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Barra de búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filtro por estado */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Todos los cursos</option>
                            <option value="active">Activos</option>
                            <option value="in-progress">En progreso</option>
                            <option value="completed">Completados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de cursos */}
            {filteredEnrollments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {enrollments.length === 0
                            ? 'No tienes cursos enrollados'
                            : 'No se encontraron cursos'
                        }
                    </h3>
                    <p className="text-gray-600">
                        {enrollments.length === 0
                            ? 'Contacta al administrador para inscribirte en cursos'
                            : 'Intenta ajustar los filtros de búsqueda'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredEnrollments.map((enrollment) => (
                        <CourseCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Componente para cada tarjeta de curso
function CourseCard({ enrollment }: { enrollment: any }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                    </span>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Completado
                    </span>
                );
            case 'SUSPENDED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Suspendido
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const progressPercentage = enrollment.progress?.completionPercentage || 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen del curso */}
            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {enrollment.course.thumbnailUrl ? (
                    <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/80" />
                    </div>
                )}

                {/* Badge de estado */}
                <div className="absolute top-3 left-3">
                    {getStatusBadge(enrollment.status)}
                </div>

                {/* Progreso overlay */}
                {enrollment.progress && progressPercentage > 0 && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700">Progreso</span>
                                <span className="font-bold text-gray-900">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {enrollment.course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                        {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                    </span>
                </div>

                {/* Estadísticas del curso */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            <span>{enrollment.course._count?.modules || 0} módulos</span>
                        </div>
                        {enrollment.course.estimatedHours && (
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{enrollment.course.estimatedHours}h</span>
                            </div>
                        )}
                    </div>
                    <div className="text-gray-400">
                        Inscrito: {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                    </div>
                </div>

                {/* Botón de acceso */}
                <Link
                    href={`${ROUTES.STUDENT.COURSES}/${enrollment.course.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center group"
                >
                    {progressPercentage === 100 ? 'Revisar curso' : 'Continuar curso'}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}