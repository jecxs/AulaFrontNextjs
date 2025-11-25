// src/app/(student)/student/live-sessions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLiveSessionsStudent } from '@/hooks/use-live-sessions-student';
import { LiveSessionForStudent } from '@/types/live-session';
import {
    Video,
    Clock,
    Calendar,
    ExternalLink,
    AlertCircle,
    BookOpen,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { format, isPast, isFuture, isWithinInterval, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function StudentLiveSessionsPage() {
    const { getMySessions, isLoading } = useLiveSessionsStudent();

    const [sessions, setSessions] = useState<LiveSessionForStudent[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'past'>('all');

    // Cargar sesiones
    const fetchSessions = async () => {
        try {
            const data = await getMySessions();
            setSessions(data);
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
            toast.error('Error al cargar tus sesiones en vivo');
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Determinar estado de una sesión
    const getSessionStatus = (
        startsAt: string,
        endsAt: string
    ): 'upcoming' | 'live' | 'past' => {
        const now = new Date();
        const start = new Date(startsAt);
        const end = new Date(endsAt);

        if (isPast(end)) return 'past';
        if (isFuture(start)) return 'upcoming';
        if (isWithinInterval(now, { start, end })) return 'live';
        return 'past';
    };

    // Obtener badge de estado
    const getStatusBadge = (startsAt: string, endsAt: string) => {
        const status = getSessionStatus(startsAt, endsAt);

        const badges = {
            upcoming: {
                className: 'bg-blue-100 text-blue-800',
                icon: Clock,
                text: 'Próxima',
            },
            live: {
                className: 'bg-green-100 text-green-800 animate-pulse',
                icon: Video,
                text: '🔴 En Vivo',
            },
            past: {
                className: 'bg-gray-100 text-gray-800',
                icon: Calendar,
                text: 'Finalizada',
            },
        };

        const badge = badges[status];
        const Icon = badge.icon;

        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    badge.className
                )}
            >
                <Icon className="h-3 w-3 mr-1" />
                {badge.text}
            </span>
        );
    };

    // Obtener tiempo relativo hasta la sesión
    const getTimeUntilSession = (startsAt: string): string => {
        const now = new Date();
        const start = new Date(startsAt);

        if (isPast(start)) return '';

        const minutes = differenceInMinutes(start, now);
        const hours = differenceInHours(start, now);
        const days = differenceInDays(start, now);

        if (minutes < 60) {
            return `Comienza en ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        } else if (hours < 24) {
            return `Comienza en ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
            return `Comienza en ${days} día${days !== 1 ? 's' : ''}`;
        }
    };

    // Filtrar sesiones según el estado seleccionado
    const filteredSessions = sessions.filter((session) => {
        if (filterStatus === 'all') return true;
        const status = getSessionStatus(session.startsAt, session.endsAt);
        return status === filterStatus;
    });

    // Agrupar sesiones por estado para mostrar estadísticas
    const stats = {
        total: sessions.length,
        upcoming: sessions.filter(
            (s) => getSessionStatus(s.startsAt, s.endsAt) === 'upcoming'
        ).length,
        live: sessions.filter(
            (s) => getSessionStatus(s.startsAt, s.endsAt) === 'live'
        ).length,
        past: sessions.filter(
            (s) => getSessionStatus(s.startsAt, s.endsAt) === 'past'
        ).length,
    };

    if (isLoading && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Mis Clases en Vivo
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Participa en sesiones en tiempo real con tus instructores
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <Video className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.total}
                            </p>
                        </div>
                        <Video className="h-8 w-8 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Próximas</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.upcoming}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">En Vivo</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.live}
                            </p>
                        </div>
                        <Video className="h-8 w-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Finalizadas</p>
                            <p className="text-2xl font-bold text-gray-600">
                                {stats.past}
                            </p>
                        </div>
                        <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Filtrar:</span>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'Todas' },
                            { value: 'upcoming', label: 'Próximas' },
                            { value: 'live', label: 'En Vivo' },
                            { value: 'past', label: 'Finalizadas' },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() =>
                                    setFilterStatus(
                                        filter.value as 'all' | 'upcoming' | 'live' | 'past'
                                    )
                                }
                                className={cn(
                                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                                    filterStatus === filter.value
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista de sesiones */}
            {filteredSessions.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {filterStatus === 'all'
                            ? 'No tienes sesiones programadas'
                            : `No tienes sesiones ${
                                filterStatus === 'upcoming'
                                    ? 'próximas'
                                    : filterStatus === 'live'
                                        ? 'en vivo'
                                        : 'finalizadas'
                            }`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Las sesiones en vivo aparecerán aquí cuando tus instructores las programen
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSessions.map((session) => {
                        const status = getSessionStatus(
                            session.startsAt,
                            session.endsAt
                        );
                        const timeUntil = getTimeUntilSession(session.startsAt);

                        return (
                            <div
                                key={session.id}
                                className={cn(
                                    'bg-white rounded-lg shadow hover:shadow-md transition-shadow',
                                    status === 'live' && 'ring-2 ring-green-500'
                                )}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        {/* Contenido principal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start space-x-4">
                                                {/* Icono */}
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={cn(
                                                            'h-12 w-12 rounded-lg flex items-center justify-center',
                                                            status === 'live'
                                                                ? 'bg-green-100'
                                                                : status === 'upcoming'
                                                                    ? 'bg-blue-100'
                                                                    : 'bg-gray-100'
                                                        )}
                                                    >
                                                        <Video
                                                            className={cn(
                                                                'h-6 w-6',
                                                                status === 'live'
                                                                    ? 'text-green-600'
                                                                    : status === 'upcoming'
                                                                        ? 'text-blue-600'
                                                                        : 'text-gray-600'
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Título y estado */}
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {session.topic}
                                                        </h3>
                                                        {getStatusBadge(
                                                            session.startsAt,
                                                            session.endsAt
                                                        )}
                                                    </div>

                                                    {/* Curso */}
                                                    <Link
                                                        href={`/student/courses/${session.course.id}`}
                                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-2"
                                                    >
                                                        <BookOpen className="h-4 w-4 mr-1" />
                                                        {session.course.title}
                                                    </Link>

                                                    {/* Instructor */}
                                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                                        <User className="h-4 w-4 mr-1" />
                                                        <span>
                                                            {session.course.instructor.firstName}{' '}
                                                            {session.course.instructor.lastName}
                                                        </span>
                                                    </div>

                                                    {/* Fecha y hora */}
                                                    <div className="flex items-center text-sm text-gray-700 mb-2">
                                                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                                        <span className="font-medium">
                                                            {format(
                                                                new Date(session.startsAt),
                                                                "EEEE, d 'de' MMMM",
                                                                { locale: es }
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                                        <span>
                                                            {format(
                                                                new Date(session.startsAt),
                                                                'HH:mm'
                                                            )}{' '}
                                                            -{' '}
                                                            {format(
                                                                new Date(session.endsAt),
                                                                'HH:mm'
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Tiempo hasta la sesión */}
                                                    {timeUntil && (
                                                        <div className="mt-2">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {timeUntil}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de acción */}
                                        <div className="flex-shrink-0">
                                            {session.meetingUrl ? (
                                                status === 'live' ? (
                                                    <a
                                                        href={session.meetingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Unirse Ahora
                                                    </a>
                                                ) : status === 'upcoming' ? (
                                                    <a
                                                        href={session.meetingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Ver Enlace
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed">
                                                        Finalizada
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50">
                                                    Sin enlace
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info adicional */}
            {sessions.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Recuerda:</strong> Prepara tu espacio con anticipación,
                                verifica tu conexión a internet y ten listo tu material de
                                estudio. ¡Participa activamente en las sesiones!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}