// src/app/(student)/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses';
import {
    BookOpen,
    Search,
    Filter,
    TrendingUp,
    Award,
    LayoutGrid,
    List,
    SlidersHorizontal
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import CourseCard from '@/components/student/course-card';

interface CourseFilters {
    status: 'all' | 'active' | 'completed' | 'in-progress';
    search: string;
}

export default function StudentCoursesPage() {
    const [filters, setFilters] = useState<CourseFilters>({
        status: 'all',
        search: ''
    });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    // Calcular estadísticas
    const stats = {
        total: enrollments.length,
        completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        inProgress: enrollments.filter(e =>
            e.status === 'ACTIVE' &&
            e.progress &&
            e.progress.completionPercentage > 0 &&
            e.progress.completionPercentage < 100
        ).length,
        notStarted: enrollments.filter(e =>
            e.status === 'ACTIVE' &&
            (!e.progress || e.progress.completionPercentage === 0)
        ).length
    };

    // Filtrar cursos según los filtros aplicados
    const filteredEnrollments = enrollments.filter(enrollment => {
        // Filtro por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = enrollment.course.title.toLowerCase().includes(searchLower);
            const instructorMatch = enrollment.course.instructor
                ? `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`.toLowerCase().includes(searchLower)
                : false;
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
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-[#001F3F]/60">Cargando tus cursos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Hero Header mejorado */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F] via-[#001F3F]/95 to-[#00364D] rounded-3xl" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                <div className="relative px-8 py-10">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        {/* Título y descripción */}
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                                <BookOpen className="w-4 h-4 text-[#00B4D8]" />
                                <span className="text-sm font-medium text-white/90">
                                    Mi Biblioteca de Cursos
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-3">
                                Mis Cursos
                            </h1>
                            <p className="text-lg text-white/70 max-w-2xl">
                                Gestiona tu progreso y continúa tu camino de aprendizaje
                            </p>
                        </div>

                        {/* Estadísticas cards mini */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <p className="text-xs font-medium text-white/60 mb-1">Total</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                            <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-4 border border-emerald-500/20">
                                <p className="text-xs font-medium text-emerald-100 mb-1">Completados</p>
                                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                            </div>
                            <div className="bg-[#00B4D8]/20 backdrop-blur-md rounded-xl p-4 border border-[#00B4D8]/20">
                                <p className="text-xs font-medium text-[#00B4D8] mb-1">En progreso</p>
                                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <p className="text-xs font-medium text-white/60 mb-1">Sin iniciar</p>
                                <p className="text-2xl font-bold text-white">{stats.notStarted}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda mejorados */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Barra de búsqueda mejorada */}
                    <div className="flex-1">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#001F3F]/40 w-5 h-5 group-hover:text-[#00B4D8] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por curso o instructor..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] transition-all duration-300 text-[#001F3F] placeholder:text-[#001F3F]/40"
                            />
                        </div>
                    </div>

                    {/* Filtro por estado mejorado */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 rounded-xl">
                            <SlidersHorizontal className="w-5 h-5 text-[#001F3F]/60" />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                                className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-[#001F3F] cursor-pointer"
                            >
                                <option value="all">Todos</option>
                                <option value="active">Activos</option>
                                <option value="in-progress">En progreso</option>
                                <option value="completed">Completados</option>
                            </select>
                        </div>

                        {/* Toggle de vista (grid/list) */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all duration-300 ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-[#00B4D8] shadow-sm'
                                        : 'text-[#001F3F]/40 hover:text-[#001F3F]/60'
                                }`}
                                title="Vista de cuadrícula"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all duration-300 ${
                                    viewMode === 'list'
                                        ? 'bg-white text-[#00B4D8] shadow-sm'
                                        : 'text-[#001F3F]/40 hover:text-[#001F3F]/60'
                                }`}
                                title="Vista de lista"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resultados de búsqueda */}
                {filters.search && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-[#001F3F]/60">
                            Mostrando <span className="font-bold text-[#00B4D8]">{filteredEnrollments.length}</span> de <span className="font-bold">{enrollments.length}</span> cursos
                        </p>
                    </div>
                )}
            </div>

            {/* Lista de cursos */}
            {filteredEnrollments.length === 0 ? (
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent" />

                    <div className="relative">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#001F3F] mb-3">
                            {enrollments.length === 0
                                ? 'No tienes cursos enrollados'
                                : 'No se encontraron cursos'
                            }
                        </h3>
                        <p className="text-[#001F3F]/60 max-w-md mx-auto mb-6">
                            {enrollments.length === 0
                                ? 'Contacta al administrador para inscribirte en cursos y comenzar tu viaje de aprendizaje'
                                : 'Intenta ajustar los filtros de búsqueda para encontrar tus cursos'
                            }
                        </p>
                        {filters.search && (
                            <button
                                onClick={() => setFilters({ status: 'all', search: '' })}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00B4D8]/25 transition-all duration-300"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid de cursos */}
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'grid grid-cols-1 gap-4'
                    }>
                        {filteredEnrollments.map((enrollment) => (
                            <CourseCard key={enrollment.id} enrollment={enrollment} />
                        ))}
                    </div>

                    {/* Info adicional */}
                    {filteredEnrollments.length > 0 && (
                        <div className="flex items-center justify-center pt-8">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200">
                                <Award className="w-5 h-5 text-[#00B4D8]" />
                                <span className="text-sm font-semibold text-[#001F3F]">
                                    {filteredEnrollments.length} {filteredEnrollments.length === 1 ? 'curso disponible' : 'cursos disponibles'}
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}