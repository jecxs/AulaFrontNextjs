'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, AlertCircle, Loader2, Plus, Image as ImageIcon, Upload, XCircle } from 'lucide-react';
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
        uploadQuestionImage,
        removeQuestionImage,
        isLoading,
    } = useQuizzesAdmin();
    const [form, setForm] = useState<UpdateQuestionDto>({});
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    const [newAnswerOptions, setNewAnswerOptions] = useState<
        Array<{ optionText: string; isCorrect: boolean }>
    >([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [useImageUrl, setUseImageUrl] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [removingImage, setRemovingImage] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

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
            // Inicializar imagen actual
            const currentImageUrl = question.imageUrl || null;
            setOriginalImageUrl(currentImageUrl);
            setImagePreview(currentImageUrl);
            setImageUrl(currentImageUrl || '');
            setImageFile(null);
            setUseImageUrl(false);
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
            // Actualizar datos básicos de la pregunta
            const updateData: UpdateQuestionDto = {
                ...form,
                // Si hay una nueva URL de imagen diferente a la original, incluirla
                imageUrl: useImageUrl && imageUrl.trim() && imageUrl !== originalImageUrl
                    ? imageUrl.trim()
                    : undefined,
            };
            
            await updateQuestion(question.id, updateData);

            // Manejar cambios de imagen
            if (imageFile) {
                // Subir nuevo archivo de imagen
                setUploadingImage(true);
                await uploadQuestionImage(question.id, imageFile);
            } else if (!imagePreview && originalImageUrl && !imageFile && !imageUrl) {
                // Si se eliminó la imagen (no hay preview pero había original y no hay nueva imagen)
                await removeQuestionImage(question.id);
            } else if (useImageUrl && imageUrl.trim() && imageUrl !== originalImageUrl) {
                // La URL ya se actualizó en updateData, no necesita acción adicional
            }

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
        } finally {
            setUploadingImage(false);
        }
    };

    const handleClose = () => {
        setForm({});
        setAnswerOptions([]);
        setNewAnswerOptions([]);
        setErrors({});
        setImageFile(null);
        setImageUrl('');
        setImagePreview(null);
        setUseImageUrl(false);
        setOriginalImageUrl(null);
        onClose();
    };

    const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe exceder 5MB');
            return;
        }

        setImageFile(file);
        setUseImageUrl(false);
        setImageUrl('');

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setUseImageUrl(true);
        setImageFile(null);
        setImagePreview(url || originalImageUrl || null);
    };

    const removeImage = () => {
        setImageFile(null);
        setImageUrl('');
        setImagePreview(null);
        setUseImageUrl(false);
    };

    const handleRemoveImage = async () => {
        if (!question || !originalImageUrl) return;

        if (!confirm('¿Estás seguro de que deseas eliminar la imagen de esta pregunta?')) {
            return;
        }

        setRemovingImage(true);
        try {
            await removeQuestionImage(question.id);
            setOriginalImageUrl(null);
            setImagePreview(null);
            setImageUrl('');
            setImageFile(null);
            setUseImageUrl(false);
            toast.success('Imagen eliminada correctamente');
            // Recargar para actualizar el estado
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar imagen');
        } finally {
            setRemovingImage(false);
        }
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

    // Actualizar estado local de opción
    const updateLocalAnswerOption = (
        optionId: string,
        optionText: string,
        isCorrect: boolean
    ) => {
        setAnswerOptions(
            answerOptions.map((o) =>
                o.id === optionId ? { ...o, text: optionText, isCorrect } : o
            )
        );
    };

    // Guardar opción en el backend
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
            // El estado local ya está actualizado, solo confirmamos
            toast.success('Opción actualizada');
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar opción');
            // Recargar opciones desde el backend en caso de error
            if (question) {
                loadAnswerOptions(question.id);
            }
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

                        {/* Campo de imagen */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagen (Opcional)
                            </label>
                            
                            {/* Mostrar imagen actual si existe */}
                            {originalImageUrl && !imageFile && !useImageUrl && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-600 mb-2">Imagen actual:</p>
                                    <div className="relative inline-block">
                                        <img
                                            src={originalImageUrl}
                                            alt="Imagen actual"
                                            className="max-h-48 rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={removingImage}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
                                            title="Eliminar imagen"
                                        >
                                            {removingImage ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tabs para elegir entre subir archivo o URL */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseImageUrl(false);
                                        if (useImageUrl) {
                                            setImageUrl('');
                                            if (!imageFile) {
                                                setImagePreview(originalImageUrl);
                                            }
                                        }
                                    }}
                                    className={cn(
                                        'px-3 py-1 text-sm rounded border',
                                        !useImageUrl
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    )}
                                >
                                    <Upload className="h-4 w-4 inline mr-1" />
                                    Subir archivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseImageUrl(true);
                                        if (!useImageUrl) {
                                            setImageFile(null);
                                            if (!imageUrl) {
                                                setImagePreview(originalImageUrl);
                                            }
                                        }
                                    }}
                                    className={cn(
                                        'px-3 py-1 text-sm rounded border',
                                        useImageUrl
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    )}
                                >
                                    <ImageIcon className="h-4 w-4 inline mr-1" />
                                    Usar URL
                                </button>
                            </div>

                            {!useImageUrl ? (
                                <div>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para subir</span> o arrastra y suelta
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileSelect}
                                            className="hidden"
                                            id="image-upload-edit"
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={handleImageUrlChange}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    />
                                </div>
                            )}

                            {/* Preview de nueva imagen */}
                            {imagePreview && (imageFile || (useImageUrl && imageUrl && imageUrl !== originalImageUrl)) && (
                                <div className="mt-3 relative">
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-48 rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                            title="Eliminar imagen"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {imageFile ? 'Nueva imagen a subir' : 'Nueva URL de imagen'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {(question.type === 'MULTIPLE' ||
                            question.type === 'TRUEFALSE' ||
                            question.type === QuestionType.MULTIPLE_CHOICE ||
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
                                                        onChange={(e) => {
                                                            const newValue = e.target.checked;
                                                            updateLocalAnswerOption(
                                                                option.id,
                                                                option.text,
                                                                newValue
                                                            );
                                                            handleUpdateAnswerOption(
                                                                option.id,
                                                                option.text,
                                                                newValue
                                                            );
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => {
                                                            updateLocalAnswerOption(
                                                                option.id,
                                                                e.target.value,
                                                                option.isCorrect
                                                            );
                                                        }}
                                                        onBlur={async (e) => {
                                                            const newText = e.target.value.trim();
                                                            if (newText) {
                                                                await handleUpdateAnswerOption(
                                                                    option.id,
                                                                    newText,
                                                                    option.isCorrect
                                                                );
                                                            }
                                                        }}
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
                                disabled={isLoading || uploadingImage || removingImage}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploadingImage ? (
                                    <>
                                        <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                                        Subiendo imagen...
                                    </>
                                ) : removingImage ? (
                                    <>
                                        <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                                        Eliminando imagen...
                                    </>
                                ) : isLoading ? (
                                    'Actualizando...'
                                ) : (
                                    'Actualizar Pregunta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}