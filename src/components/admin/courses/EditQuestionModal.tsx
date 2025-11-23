'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, AlertCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useQuizzesAdmin } from '@/hooks/use-quizzes-admin';
import { Question, UpdateQuestionDto, QuestionType, AnswerOption } from '@/types/quiz';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    question: Question | null;
    onSuccess?: () => void;
}

export default function EditQuestionModal({ isOpen, onClose, question, onSuccess }: Props) {
    const {
        updateQuestion,
        getAnswerOptionsByQuestion,
        createAnswerOption,
        updateAnswerOption,
        deleteAnswerOption,
        isLoading,
    } = useQuizzesAdmin();
    const [form, setForm] = useState<UpdateQuestionDto>({});
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    const [newAnswerOptions, setNewAnswerOptions] = useState<
        Array<{ optionText: string; isCorrect: boolean }>
    >([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingOptions, setLoadingOptions] = useState(false);

    const loadAnswerOptions = useCallback(
        async (questionId: string) => {
            setLoadingOptions(true);
            try {
                const options = await getAnswerOptionsByQuestion(questionId);
                setAnswerOptions(options || []);
                setNewAnswerOptions([]);
            } catch (err) {
                console.error(err);
                toast.error('Error al cargar opciones de respuesta');
                setAnswerOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        },
        [getAnswerOptionsByQuestion]
    );

    useEffect(() => {
        if (isOpen && question) {
            setForm({
                text: question.text,
                type: question.type,
                order: question.order,
                weight: question.weight,
                quizId: question.quizId,
            });
            loadAnswerOptions(question.id);
        }
    }, [isOpen, question, loadAnswerOptions]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.text?.trim()) e.text = 'El texto de la pregunta es requerido';
        if (form.weight && form.weight <= 0) e.weight = 'Los puntos deben ser mayor a 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !question) return;

        try {
            console.log('Datos a enviar:', form);
            await updateQuestion(question.id, form);

            // Crear nuevas opciones de respuesta
            for (const newOption of newAnswerOptions) {
                if (newOption.optionText.trim()) {
                    await createAnswerOption({
                        questionId: question.id,
                        text: newOption.optionText,
                        isCorrect: newOption.isCorrect,
                    });
                }
            }

            toast.success('Pregunta actualizada correctamente');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err: unknown) {
            console.error('Error completo:', err);

            // Extraer información detallada del error
            if (err && typeof err === 'object') {
                const error = err as any;
                if (error.response?.data) {
                    console.error('Error del servidor:', error.response.data);
                    const serverError = error.response.data;
                    if (serverError.message) {
                        if (Array.isArray(serverError.message)) {
                            serverError.message.forEach((msg: string) => toast.error(msg));
                        } else {
                            toast.error(`Error: ${serverError.message}`);
                        }
                    }
                }
            }
            toast.error('Error al actualizar pregunta');
        }
    };

    const handleClose = () => {
        setForm({});
        setAnswerOptions([]);
        setNewAnswerOptions([]);
        setErrors({});
        onClose();
    };

    const handleDeleteAnswerOption = async (optionId: string) => {
        try {
            await deleteAnswerOption(optionId);
            setAnswerOptions(answerOptions.filter((o) => o.id !== optionId));
            toast.success('Opción eliminada');
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar opción');
        }
    };

    const handleUpdateAnswerOption = async (
        optionId: string,
        optionText: string,
        isCorrect: boolean
    ) => {
        try {
            await updateAnswerOption(optionId, {
                text: optionText,
                isCorrect,
            });
            setAnswerOptions(
                answerOptions.map((o) =>
                    o.id === optionId ? { ...o, text: optionText, isCorrect } : o
                )
            );
            toast.success('Opción actualizada');
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar opción');
        }
    };

    const addNewAnswerOption = () => {
        setNewAnswerOptions([...newAnswerOptions, { optionText: '', isCorrect: false }]);
    };

    const removeNewAnswerOption = (index: number) => {
        setNewAnswerOptions(newAnswerOptions.filter((_, i) => i !== index));
    };

    const updateNewAnswerOption = (index: number, optionText: string, isCorrect: boolean) => {
        const newOptions = [...newAnswerOptions];
        newOptions[index] = { optionText, isCorrect };
        setNewAnswerOptions(newOptions);
    };

    if (!isOpen || !question) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Editar Pregunta</h3>
                                <p className="text-sm text-gray-500">
                                    Actualiza los detalles de la pregunta
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

                    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tipo de pregunta
                            </label>
                            <input
                                type="text"
                                value={form.type || question.type}
                                disabled
                                className="w-full rounded-md border border-gray-300 shadow-sm p-2 bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Pregunta *
                            </label>
                            <textarea
                                value={form.text || ''}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        text: e.target.value,
                                    })
                                }
                                rows={3}
                                className={cn(
                                    'w-full rounded-md border border-gray-300 shadow-sm p-2',
                                    errors.text && 'border-red-300'
                                )}
                                placeholder="Escribe la pregunta aquí..."
                            />
                            {errors.text && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.text}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Puntos *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.weight ?? question.weight}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        weight: parseInt(e.target.value),
                                    })
                                }
                                className={cn(
                                    'w-full rounded-md border border-gray-300 shadow-sm p-2',
                                    errors.weight && 'border-red-300'
                                )}
                            />
                            {errors.weight && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.weight}
                                </p>
                            )}
                        </div>

                        {(question.type === QuestionType.MULTIPLE_CHOICE ||
                            question.type === QuestionType.TRUE_FALSE) && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Opciones de respuesta
                                </label>

                                {loadingOptions ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-3">
                                            {answerOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={option.isCorrect}
                                                        onChange={(e) =>
                                                            handleUpdateAnswerOption(
                                                                option.id,
                                                                option.text,
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) =>
                                                            handleUpdateAnswerOption(
                                                                option.id,
                                                                e.target.value,
                                                                option.isCorrect
                                                            )
                                                        }
                                                        className="flex-1 rounded-md border border-gray-300 shadow-sm p-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteAnswerOption(option.id)
                                                        }
                                                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {newAnswerOptions.length > 0 && (
                                            <div className="space-y-2 mb-3 border-t pt-2">
                                                <p className="text-xs text-gray-500">
                                                    Nuevas opciones
                                                </p>
                                                {newAnswerOptions.map((option, index) => (
                                                    <div
                                                        key={`new-${index}`}
                                                        className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={option.isCorrect}
                                                            onChange={(e) =>
                                                                updateNewAnswerOption(
                                                                    index,
                                                                    option.optionText,
                                                                    e.target.checked
                                                                )
                                                            }
                                                            className="rounded"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option.optionText}
                                                            onChange={(e) =>
                                                                updateNewAnswerOption(
                                                                    index,
                                                                    e.target.value,
                                                                    option.isCorrect
                                                                )
                                                            }
                                                            placeholder={`Nueva opción ${index + 1}`}
                                                            className="flex-1 rounded-md border border-gray-300 shadow-sm p-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeNewAnswerOption(index)
                                                            }
                                                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={addNewAnswerOption}
                                            className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Agregar opción
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

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
                                disabled={isLoading}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Actualizando...' : 'Actualizar Pregunta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}