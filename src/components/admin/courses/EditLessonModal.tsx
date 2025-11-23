'use client';

import { useEffect, useState } from 'react';
import { X, FileText, AlertCircle, Loader2, Upload, Video, File, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { Lesson, UpdateLessonDto, LessonType } from '@/types/course';
import { validateFile, UploadProgress } from '@/lib/api/upload';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson;
    onSuccess?: () => void;
}

export default function EditLessonModal({ isOpen, onClose, lesson, onSuccess }: Props) {
    const { updateLesson, deleteResource, getLessonWithResources } = useCoursesAdmin();
    const [form, setForm] = useState<UpdateLessonDto>({
        title: '',
        type: LessonType.TEXT,
        markdownContent: '',
        videoUrl: '',
        durationSec: 0
    });
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [loadingData, setLoadingData] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [lessonWithResources, setLessonWithResources] = useState<Lesson>(lesson);

    useEffect(() => {
        if (isOpen && lesson) {
            setLoadingData(true);
            // Cargar la lección con recursos
            (async () => {
                try {
                    const fullLesson = await getLessonWithResources(lesson.id);
                    setLessonWithResources(fullLesson);
                    setForm({
                        title: fullLesson.title,
                        type: fullLesson.type as LessonType,
                        markdownContent: fullLesson.markdownContent || '',
                        videoUrl: fullLesson.videoUrl || '',
                        durationSec: fullLesson.durationSec || 0
                    });
                } catch (err) {
                    console.error('Error cargando lección con recursos:', err);
                    toast.error('Error al cargar la lección');
                    // Fallback: usar la lección sin recursos
                    setLessonWithResources(lesson);
                    setForm({
                        title: lesson.title,
                        type: lesson.type as LessonType,
                        markdownContent: lesson.markdownContent || '',
                        videoUrl: lesson.videoUrl || '',
                        durationSec: lesson.durationSec || 0
                    });
                } finally {
                    setLoadingData(false);
                }
            })();
        }
    }, [isOpen, lesson, getLessonWithResources]);

    const validate = () => {
        const e: Record<string,string> = {};
        if (!form.title || !form.title.trim()) e.title = 'El título es requerido';

        if (form.type === LessonType.VIDEO && !form.videoUrl) {
            e.videoUrl = 'El video es requerido para lecciones de video';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateFile(file, 'pdf');

        if (!validation.valid) {
            toast.error(validation.error ?? 'Archivo inválido');
            return;
        }

        setSelectedFile(file);
    };

    const handleUploadResource = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            // Enviar archivo al backend para que gestione el upload con bunny.service
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const url = `${apiBase}/resources/upload`;
            const fd = new FormData();
            // El backend/proxy espera un campo llamado 'file' (coincide con uploadToProxy)
            fd.append('file', selectedFile);
            fd.append('lessonId', lesson.id);

            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

            const res = await fetch(url, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: fd,
            });

            if (!res.ok) {
                const txt = await res.text();
                const errMsg = txt || `Upload failed: ${res.status}`;
                toast.error(errMsg);
                setUploading(false);
                return;
            }

            const body = await res.json();
            toast.success(body?.fileName ? `Recurso ${body.fileName} agregado correctamente` : 'Recurso agregado correctamente');
            setSelectedFile(null);
            setShowResourceForm(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al subir recurso');
        } finally {
            setUploading(false);
            setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este recurso?')) return;

        try {
            await deleteResource(resourceId);
            toast.success('Recurso eliminado');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar recurso');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await updateLesson(lesson.id, form);
            toast.success('Lección actualizada');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar lección');
        }
    };

    const handleClose = () => {
        setErrors({});
        setSelectedFile(null);
        setShowResourceForm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Editar Lección</h3>
                                <p className="text-sm text-gray-500">Actualiza la información de la lección</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {loadingData ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <>
                                {/* Información básica */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título *</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className={cn('w-full rounded-md border border-gray-300 shadow-sm p-2', errors.title && 'border-red-300')}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                        disabled
                                    >
                                        <option value={LessonType.TEXT}>Texto</option>
                                        <option value={LessonType.VIDEO}>Video</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">No se puede cambiar el tipo después de crear</p>
                                </div>

                                {/* Contenido según tipo */}
                                {form.type === LessonType.VIDEO ? (
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                        <h4 className="font-medium flex items-center"><Video className="h-4 w-4 mr-2" />Video</h4>

                                        {form.videoUrl && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-sm text-green-800">✓ Video actual:</p>
                                                <a
                                                    href={form.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-green-600 hover:underline break-all"
                                                >
                                                    {form.videoUrl}
                                                </a>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Duración del video (segundos)</label>
                                            <input
                                                type="number"
                                                value={form.durationSec || 0}
                                                onChange={(e) => setForm({ ...form, durationSec: parseInt(e.target.value) || 0 })}
                                                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                                min="0"
                                            />
                                        </div>

                                        {errors.videoUrl && (
                                            <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.videoUrl}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                        <h4 className="font-medium flex items-center"><FileText className="h-4 w-4 mr-2" />Contenido</h4>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Contenido (Markdown)</label>
                                            <textarea
                                                value={form.markdownContent || ''}
                                                onChange={(e) => setForm({ ...form, markdownContent: e.target.value })}
                                                rows={4}
                                                className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                                placeholder="Escribe el contenido en markdown..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Recursos */}
                                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium flex items-center"><File className="h-4 w-4 mr-2" />Recursos ({lessonWithResources.resources?.length || 0})</h4>
                                        {!showResourceForm && (
                                            <button
                                                type="button"
                                                onClick={() => setShowResourceForm(true)}
                                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Agregar
                                            </button>
                                        )}
                                    </div>

                                    {/* Lista de recursos */}
                                    {lessonWithResources.resources && lessonWithResources.resources.length > 0 && (
                                        <div className="space-y-2">
                                            {lessonWithResources.resources.map(resource => (
                                                <div key={resource.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{resource.fileName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {resource.fileType} • {resource.sizeKb && `${(resource.sizeKb / 1024).toFixed(2)} MB`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <a
                                                            href={resource.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                                        >
                                                            Ver
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteResource(resource.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Formulario para agregar recurso */}
                                    {showResourceForm && (
                                        <div className="border-t pt-4 space-y-4">
                                            <label className="block text-sm font-medium">Selecciona un PDF</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={handleFileSelect}
                                                    disabled={uploading}
                                                    className="hidden"
                                                    id="resource-input"
                                                />
                                                <label htmlFor="resource-input" className="cursor-pointer">
                                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un PDF'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF (máx. 100MB)</p>
                                                </label>
                                            </div>

                                            {uploading && (
                                                <div className="space-y-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${uploadProgress.percentage}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-gray-600 text-center">
                                                        Subiendo: {uploadProgress.percentage.toFixed(0)}%
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowResourceForm(false);
                                                        setSelectedFile(null);
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleUploadResource}
                                                    disabled={!selectedFile || uploading}
                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {uploading ? 'Subiendo...' : 'Subir'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                                        Guardar Cambios
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
