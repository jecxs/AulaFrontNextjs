// src/lib/providers/query-client-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

// Tipos para mejor type safety
interface ErrorWithResponse {
    response?: {
        status?: number;
    };
}

export function QueryProvider({ children }: { children: ReactNode }) {
    // Crear el cliente de React Query una sola vez
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Tiempo en cache por defecto
                        staleTime: 60 * 1000, // 1 minuto
                        // Tiempo antes de que la data se considere como "garbage collected"
                        gcTime: 10 * 60 * 1000, // 10 minutos
                        // Reintentos en caso de error
                        retry: (failureCount, error: unknown) => {
                            // No reintentar para errores 404 o 401
                            if (error && typeof error === 'object' && 'response' in error) {
                                const errorWithResponse = error as ErrorWithResponse;
                                const status = errorWithResponse.response?.status;
                                if (status === 404 || status === 401) {
                                    return false;
                                }
                            }
                            // Reintentar máximo 3 veces para otros errores
                            return failureCount < 3;
                        },
                        // No refetch automático al hacer focus en la ventana
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        // Reintentos para mutaciones
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    position="bottom"
                />
            )}
        </QueryClientProvider>
    );
}