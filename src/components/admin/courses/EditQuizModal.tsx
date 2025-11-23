'use client';

import { useEffect, useState } from 'react';
import { X, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useQuizzesAdmin } from '@/hooks/use-quizzes-admin';
import { Quiz, UpdateQuizDto, QuizStatus } from '@/types/quiz';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz | null;
    onSuccess?: () => void;
}

export default function EditQuizModal({ isOpen, onClose, quiz, onSuccess }: Props) {
    const { updateQuiz, isLoading } = useQuizzesAdmin();
    const [form, setForm] = useState<UpdateQuizDto>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && quiz) {
            setForm({
                title: quiz.title,
                description: quiz.description,
                passingScore: quiz.passingScore,
                timeLimit: quiz.timeLimit,
                isRequired: quiz.isRequired,
                status: quiz.status,
                order: quiz.order,
            });
        }
    }, [isOpen, quiz]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title?.trim()) e.title = 'El título es requerido';
        if (
            form.passingScore !== undefined &&
            (form.passingScore < 0 || form.passingScore > 100)
        ) {
            e.passingScore = 'La puntuación debe estar entre 0 y 100';
        }
        if (form.timeLimit && form.timeLimit <= 0) {
            e.timeLimit = 'El tiempo debe ser mayor a 0';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !quiz) return;

        try {
            await updateQuiz(quiz.id, form);
            toast.success('Quiz actualizado correctamente');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar quiz');
        }
    };

    const handleClose = () => {
        setForm({});
        setErrors({});
        onClose();
    };

    if (!isOpen || !quiz) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <HelpCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Editar Quiz</h3>
                                <p className="text-sm text-gray-500">
                                    Actualiza los detalles del quiz
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title || ''}
                                        onChange={(e) =>
                                            setForm({ ...form, title: e.target.value })
                                        }
                                        className={cn(
                                            'w-full rounded-md border border-gray-300 shadow-sm p-2',
                                            errors.title && 'border-red-300'
                                        )}
                                        placeholder="Ej: Quiz de la Lección 1"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={form.description || ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                        placeholder="Describe el propósito del quiz..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Puntuación para aprobar (%) *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.passingScore ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    passingScore: parseInt(e.target.value),
                                                })
                                            }
                                            className={cn(
                                                'w-full rounded-md border border-gray-300 shadow-sm p-2',
                                                errors.passingScore && 'border-red-300'
                                            )}
                                        />
                                        {errors.passingScore && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.passingScore}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Tiempo límite (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.timeLimit ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    timeLimit: e.target.value
                                                        ? parseInt(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                            className={cn(
                                                'w-full rounded-md border border-gray-300 shadow-sm p-2',
                                                errors.timeLimit && 'border-red-300'
                                            )}
                                            placeholder="Sin límite"
                                        />
                                        {errors.timeLimit && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.timeLimit}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isRequired"
                                        checked={form.isRequired ?? false}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isRequired: e.target.checked,
                                            })
                                        }
                                        className="rounded"
                                    />
                                    <label
                                        htmlFor="isRequired"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Este quiz es obligatorio para completar el módulo
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={form.status || QuizStatus.DRAFT}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value as QuizStatus,
                                            })
                                        }
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    >
                                        <option value={QuizStatus.DRAFT}>Borrador</option>
                                        <option value={QuizStatus.PUBLISHED}>
                                            Publicado
                                        </option>
                                        <option value={QuizStatus.ARCHIVED}>Archivado</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                        Actualizar Quiz
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

