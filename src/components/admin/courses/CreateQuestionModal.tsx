'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useQuizzesAdmin } from '@/hooks/use-quizzes-admin';
import { CreateQuestionSimpleDto, QuestionType, AnswerOption } from '@/types/quiz';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    quizId: string;
    onSuccess?: () => void;
}

export default function CreateQuestionModal({ isOpen, onClose, quizId, onSuccess }: Props) {
    const { createQuestionSimple, createAnswerOption, getQuestionNextOrder, isLoading } =
        useQuizzesAdmin();
    const [form, setForm] = useState<CreateQuestionSimpleDto>({
        quizId,
        text: '',
        type: 'MULTIPLE',
        order: 1,
        weight: 1,
    });
    const [answerOptions, setAnswerOptions] = useState<
        Array<{ optionText: string; isCorrect: boolean }>
    >([{ optionText: '', isCorrect: false }]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
        if (isOpen) {
            (async () => {
                setLoadingOrder(true);
                try {
                    const nextOrder = await getQuestionNextOrder(quizId);
                    setForm((f) => ({ ...f, order: nextOrder }));
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingOrder(false);
                }
            })();
        }
    }, [isOpen, quizId, getQuestionNextOrder]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.text.trim()) e.text = 'El texto de la pregunta es requerido';
        if (form.weight && form.weight <= 0) e.weight = 'Los puntos deben ser mayor a 0';

        // Validar opciones de respuesta para preguntas de opción múltiple
        if (form.type === 'MULTIPLE' || form.type === 'TRUEFALSE') {
            const filledOptions = answerOptions.filter((o) => o.optionText.trim());
            if (filledOptions.length < 2) {
                e.answerOptions = 'Se requieren al menos 2 opciones de respuesta';
            }
            if (!filledOptions.some((o) => o.isCorrect)) {
                e.correctAnswer = 'Se debe marcar al menos una respuesta como correcta';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const question = await createQuestionSimple(form);

            // Crear opciones de respuesta si aplica
            if (form.type === 'MULTIPLE' || form.type === 'TRUEFALSE') {
                const filledOptions = answerOptions.filter((o) => o.optionText.trim());
                for (let i = 0; i < filledOptions.length; i++) {
                    await createAnswerOption({
                        questionId: question.id,
                        text: filledOptions[i].optionText,
                        isCorrect: filledOptions[i].isCorrect,
                    });
                }
            }

            toast.success('Pregunta creada correctamente');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err: unknown) {
            console.error('Error completo:', err);
            console.log('Datos enviados:', form);

            // Extraer información detallada del error
            if (err && typeof err === 'object') {
                const error = err as any;
                if (error.response?.data) {
                    console.error('Error del servidor:', error.response.data);
                    const serverError = error.response.data;
                    if (serverError.message) {
                        toast.error(`Error: ${serverError.message}`);
                    }
                    if (serverError.errors) {
                        console.error('Errores de validación:', serverError.errors);
                        Object.entries(serverError.errors).forEach(([field, messages]: [string, any]) => {
                            console.error(`${field}:`, messages);
                            if (Array.isArray(messages)) {
                                messages.forEach((msg: string) => toast.error(`${field}: ${msg}`));
                            }
                        });
                    }
                }
            }
            toast.error('Error al crear pregunta');
        }
    };

    const handleClose = () => {
        setForm({
            quizId,
            text: '',
            type: 'MULTIPLE',
            order: 1,
            weight: 1,
        });
        setAnswerOptions([{ optionText: '', isCorrect: false }]);
        setErrors({});
        onClose();
    };

    const addAnswerOption = () => {
        setAnswerOptions([...answerOptions, { optionText: '', isCorrect: false }]);
    };

    const removeAnswerOption = (index: number) => {
        if (answerOptions.length > 1) {
            setAnswerOptions(answerOptions.filter((_, i) => i !== index));
        }
    };

    const updateAnswerOption = (index: number, optionText: string, isCorrect: boolean) => {
        const newOptions = [...answerOptions];
        newOptions[index] = { optionText, isCorrect };
        setAnswerOptions(newOptions);
    };

    if (!isOpen) return null;

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
                                <h3 className="text-lg font-medium">Crear Pregunta</h3>
                                <p className="text-sm text-gray-500">
                                    Agrega una nueva pregunta al quiz
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
                        {loadingOrder ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tipo de pregunta *
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                type: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    >
                                        <option value="MULTIPLE">
                                            Opción múltiple
                                        </option>
                                        <option value="TRUEFALSE">
                                            Verdadero/Falso
                                        </option>
                                        <option value="SINGLE">
                                            Respuesta corta
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Pregunta *
                                    </label>
                                    <textarea
                                        value={form.text}
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
                                        value={form.weight || 1}
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

                                {(form.type === 'MULTIPLE' ||
                                    form.type === 'TRUEFALSE') && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Opciones de respuesta *
                                        </label>
                                        <div className="space-y-2">
                                            {answerOptions.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={option.isCorrect}
                                                        onChange={(e) =>
                                                            updateAnswerOption(
                                                                index,
                                                                option.optionText,
                                                                e.target.checked
                                                            )
                                                        }
                                                        title="Marcar como respuesta correcta"
                                                        className="rounded"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option.optionText}
                                                        onChange={(e) =>
                                                            updateAnswerOption(
                                                                index,
                                                                e.target.value,
                                                                option.isCorrect
                                                            )
                                                        }
                                                        placeholder={`Opción ${index + 1}`}
                                                        className="flex-1 rounded-md border border-gray-300 shadow-sm p-2"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeAnswerOption(index)
                                                        }
                                                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Eliminar opción"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.answerOptions && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.answerOptions}
                                            </p>
                                        )}
                                        {errors.correctAnswer && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.correctAnswer}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addAnswerOption}
                                            className="mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Agregar opción
                                        </button>
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
                                        {isLoading ? 'Creando...' : 'Crear Pregunta'}
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
