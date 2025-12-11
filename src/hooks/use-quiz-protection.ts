// src/hooks/use-quiz-protection.ts
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function useQuizProtection(isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return;

        // ========== 1. PREVENIR CLIC DERECHO ==========
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.warning('Acción no permitida', {
                description: 'No puedes copiar el contenido del quiz',
            });
            return false;
        };

        // ========== 2. PREVENIR COPIAR (Ctrl+C, Cmd+C) ==========
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.warning('Acción no permitida', {
                description: 'No puedes copiar el contenido del quiz',
            });
            return false;
        };

        // ========== 3. PREVENIR ATAJOS DE TECLADO ==========
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevenir Ctrl+C, Cmd+C (copiar)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes copiar el contenido del quiz',
                });
                return false;
            }

            // Prevenir Ctrl+U, Cmd+U (ver código fuente)
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes ver el código fuente durante el quiz',
                });
                return false;
            }

            // Prevenir F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes abrir las herramientas de desarrollo',
                });
                return false;
            }

            // Prevenir Ctrl+Shift+I, Cmd+Shift+I (DevTools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes abrir las herramientas de desarrollo',
                });
                return false;
            }

            // Prevenir Ctrl+Shift+J, Cmd+Shift+J (Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes abrir la consola durante el quiz',
                });
                return false;
            }

            // Prevenir Ctrl+Shift+C, Cmd+Shift+C (Inspector)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes usar el inspector durante el quiz',
                });
                return false;
            }

            // Prevenir Print Screen (captura parcial en Windows)
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                toast.warning('Capturas no permitidas', {
                    description: 'No puedes tomar capturas de pantalla del quiz',
                });

                // Tratar de borrar el clipboard (no siempre funciona)
                navigator.clipboard.writeText('').catch(() => {});
                return false;
            }

            // Prevenir Ctrl+P, Cmd+P (imprimir)
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes imprimir el quiz',
                });
                return false;
            }

            // Prevenir Ctrl+S, Cmd+S (guardar)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                toast.warning('Acción no permitida', {
                    description: 'No puedes guardar el contenido del quiz',
                });
                return false;
            }
        };

        // ========== 4. DETECTAR CAMBIO DE PESTAÑA/VENTANA ==========
        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast.warning('⚠️ Atención', {
                    description: 'Se detectó que cambiaste de pestaña. Esta acción está siendo registrada.',
                    duration: 5000,
                });

                // Aquí podrías registrar este evento en tu backend si lo deseas
                // logSuspiciousActivity('tab_switch');
            }
        };

        // ========== 5. PREVENIR SELECCIÓN DE TEXTO ==========
        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;

            // Permitir selección en inputs y textareas (si los hubiera)
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return true;
            }

            e.preventDefault();
            return false;
        };

        // ========== 6. PREVENIR DRAG & DROP ==========
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Agregar event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('dragstart', handleDragStart);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, [isActive]);

    // ========== 7. DETECTAR HERRAMIENTAS DE DESARROLLO ==========
    useEffect(() => {
        if (!isActive) return;

        let devtoolsOpen = false;

        const checkDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    toast.error('🚨 Advertencia de Seguridad', {
                        description: 'Se detectaron herramientas de desarrollo abiertas. Por favor, ciérralas para continuar.',
                        duration: 10000,
                    });
                }
            } else {
                devtoolsOpen = false;
            }
        };

        const interval = setInterval(checkDevTools, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    // ========== 8. MENSAJE DE ADVERTENCIA AL CARGAR ==========
    useEffect(() => {
        if (!isActive) return;

        toast.info('🔒 Modo de Quiz Seguro Activado', {
            description: 'Por seguridad, copiar, capturar pantalla y otras acciones están deshabilitadas.',
            duration: 5000,
        });
    }, [isActive]);
}

// Función auxiliar para registrar actividad sospechosa (opcional)
// Puedes implementar esto si quieres llevar un log en el backend
/*
async function logSuspiciousActivity(activityType: string) {
    try {
        await fetch('/api/quiz-activity-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activityType,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
*/