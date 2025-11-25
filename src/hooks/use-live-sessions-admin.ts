// src/hooks/use-live-sessions-admin.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { getErrorMessage } from '@/types/api';
import { liveSessionsApi } from '@/lib/api/live-sessions';
import {
    LiveSession,
    LiveSessionWithDetails,
    CreateLiveSessionDto,
    UpdateLiveSessionDto,
} from '@/types/live-session';

/**
 * Hook personalizado para operaciones de ADMIN en live sessions
 */
export function useLiveSessionsAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== CRUD DE LIVE SESSIONS ==========

    const createSession = useCallback(
        async (data: CreateLiveSessionDto): Promise<LiveSession> => {
            setIsLoading(true);
            setError(null);
            try {
                return await liveSessionsApi.create(data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al crear sesión en vivo');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getSessions = useCallback(
        async (courseId?: string): Promise<LiveSessionWithDetails[]> => {
            setIsLoading(true);
            setError(null);
            try {
                return await liveSessionsApi.getAll(courseId);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al cargar sesiones en vivo'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const getSessionById = useCallback(
        async (id: string): Promise<LiveSessionWithDetails> => {
            setIsLoading(true);
            setError(null);
            try {
                return await liveSessionsApi.getById(id);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(err, 'Error al cargar sesión');
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const updateSession = useCallback(
        async (id: string, data: UpdateLiveSessionDto): Promise<LiveSession> => {
            setIsLoading(true);
            setError(null);
            try {
                return await liveSessionsApi.update(id, data);
            } catch (err: unknown) {
                const errorMessage = getErrorMessage(
                    err,
                    'Error al actualizar sesión'
                );
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const deleteSession = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await liveSessionsApi.delete(id);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al eliminar sesión');
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
            createSession,
            getSessions,
            getSessionById,
            updateSession,
            deleteSession,
        }),
        [
            isLoading,
            error,
            createSession,
            getSessions,
            getSessionById,
            updateSession,
            deleteSession,
        ]
    );
}