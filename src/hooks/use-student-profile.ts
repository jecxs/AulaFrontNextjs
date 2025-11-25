// src/hooks/use-student-profile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { studentsApi } from '@/lib/api/students';
import { StudentProfile } from '@/types/student';
import { getErrorMessage } from '@/types/api';

/**
 * Hook personalizado para obtener el perfil completo del estudiante
 */
export function useStudentProfile() {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await studentsApi.getProfile();
            setProfile(data);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err, 'Error al cargar el perfil');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        refetch: fetchProfile,
    };
}