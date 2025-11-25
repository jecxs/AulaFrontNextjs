// src/app/(admin)/admin/live-sessions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLiveSessionsAdmin } from '@/hooks/use-live-sessions-admin';
import { LiveSessionWithDetails } from '@/types/live-session';
import CreateLiveSessionModal from '@/components/admin/live-sessions/CreateLiveSessionModal';
import {
    Plus,
    Video,
    Clock,
    Calendar,
    ExternalLink,
    Edit,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminLiveSessionsPage() {
    const { getSessions, deleteSession, isLoading } = useLiveSessionsAdmin();

    const [sessions, setSessions] = useState<LiveSessionWithDetails[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSession, setEditingSession] = useState<LiveSessionWithDetails | null>(
        null
    );
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'past'>(
        'all'
    );

    // Cargar sesiones
    const fetchSessions = async () => {
        try {
            const data = await getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
            toast.error('Error al cargar las sesiones en vivo');
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleDelete = async (sessionId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.'
            )
        )
            return;

        try {
            await deleteSession(sessionId);
            toast.success('Sesión eliminada exitosamente');
            fetchSessions();
        } catch (error) {
            console.error('Error al eliminar sesión:', error);
            toast.error('Error al eliminar la sesión');
        }
    };

    const handleEdit = (session: LiveSessionWithDetails) => {
        setEditingSession(session);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingSession(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchSessions();
    };

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
                text: 'En Vivo',
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
                            Clases en Vivo
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona las sesiones en vivo de tus cursos
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nueva Sesión
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <div className="flex space-x-2">
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
                            ? 'No hay sesiones registradas'
                            : `No hay sesiones ${filterStatus === 'upcoming' ? 'próximas' : filterStatus === 'live' ? 'en vivo' : 'finalizadas'}`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Comienza creando una nueva sesión en vivo
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {filteredSessions.map((session) => {
                            const status = getSessionStatus(
                                session.startsAt,
                                session.endsAt
                            );

                            return (
                                <li key={session.id} className="hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
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

                                                    {/* Info de la sesión */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {session.topic}
                                                        </p>
                                                        <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                            <span>
                                                                {session.course?.title}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {session.course?.instructor
                                                                    ?.firstName}{' '}
                                                                {session.course?.instructor
                                                                    ?.lastName}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            <span>
                                                                {format(
                                                                    new Date(session.startsAt),
                                                                    "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                                                                    { locale: es }
                                                                )}
                                                            </span>
                                                        </div>
                                                        {session.meetingUrl && (
                                                            <a
                                                                href={session.meetingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Ver enlace
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex items-center space-x-4 ml-4">
                                                {/* Badge de estado */}
                                                {getStatusBadge(
                                                    session.startsAt,
                                                    session.endsAt
                                                )}

                                                {/* Botones de acción */}
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(session)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(session.id)
                                                        }
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Info adicional */}
            {sessions.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Nota:</strong> Los estudiantes verán automáticamente
                                las sesiones de sus cursos matriculados en su sección "Mis
                                Clases en Vivo".
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de crear/editar sesión */}
            <CreateLiveSessionModal
                isOpen={showCreateModal}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                session={editingSession || undefined}
            />
        </div>
    );
}