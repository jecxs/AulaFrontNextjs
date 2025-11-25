// src/hooks/use-live-sessions-student.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { getErrorMessage } from '@/types/api';
import { liveSessionsApi } from '@/lib/api/live-sessions';
import { LiveSessionForStudent } from '@/types/live-session';

/**
 * Hook personalizado para operaciones de ESTUDIANTE en live sessions
 */
export function useLiveSessionsStudent() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener todas mis sesiones (de todos mis cursos)
    const getMySessions = useCallback(async (): Promise<LiveSessionForStudent[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await liveSessionsApi.getMySessions();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar tus sesiones');
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener mis próximas sesiones
    const getMyUpcoming = useCallback(async (): Promise<LiveSessionForStudent[]> => {
        setIsLoading(true);
        setError(null);
        try {
            return await liveSessionsApi.getMyUpcoming();
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(
                err,
                'Error al cargar tus próximas sesiones'
            );
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return useMemo(
        () => ({
            isLoading,
            error,
            getMySessions,
            getMyUpcoming,
        }),
        [isLoading, error, getMySessions, getMyUpcoming]
    );
}