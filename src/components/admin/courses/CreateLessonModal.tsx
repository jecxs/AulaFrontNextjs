'use client';

import { useEffect, useState } from 'react';
import { X, FileText, AlertCircle, Loader2, Upload, Video, File as FileIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { CreateLessonDto, LessonType } from '@/types/course';
import {validateFile, UploadProgress} from '@/lib/api/upload';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    moduleId: string;
    onSuccess?: () => void;
}

export default function CreateLessonModal({ isOpen, onClose, moduleId, onSuccess }: Props) {
    const { createLesson, getLessonNextOrder, createVideoLesson } = useCoursesAdmin();
    const [form, setForm] = useState<CreateLessonDto>({
        title: '',
        type: LessonType.TEXT,
        order: 0,
        moduleId,
        markdownContent: '',
        videoUrl: '',
        durationSec: 0
    });
    const [loadingData, setLoadingData] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
    const [errors, setErrors] = useState<Record<string,string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Si el proxy /api/bunny-upload no tiene configuración (Bunny API key/zone), lo marcamos
    const [proxyUnavailable, setProxyUnavailable] = useState(false);

    useEffect(() => {
        if (isOpen) {
            (async () => {
                setLoadingData(true);
                try {
                    const next = await getLessonNextOrder(moduleId);
                    setForm((s) => ({ ...s, order: next, moduleId }));
                } catch (err) {
                    console.error(err);
                    toast.error('Error al obtener orden');
                } finally {
                    setLoadingData(false);
                }
            })();
        }
    }, [isOpen, moduleId, getLessonNextOrder]);

    const validate = () => {
        const e: Record<string,string> = {};
        if (!form.title || !form.title.trim()) e.title = 'El título es requerido';

        // Para videos, necesitamos un archivo seleccionado O un videoUrl (si ya estaba subido)
        if (form.type === LessonType.VIDEO && !form.videoUrl && !selectedFile) {
            e.videoUrl = 'El video es requerido para lecciones de video';
        }

        if (form.type === LessonType.TEXT && !form.markdownContent?.trim()) {
            e.markdownContent = 'El contenido es requerido para lecciones de texto';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileType = form.type === LessonType.VIDEO ? 'video' : 'pdf';
        const validation = validateFile(file, fileType);

        if (!validation.valid) {
            toast.error(validation.error ?? 'Archivo inválido');
            return;
        }

        setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setUploading(true);
        try {
            // Si es lección tipo VIDEO y hay un archivo seleccionado, usar el nuevo método del hook
            if (form.type === LessonType.VIDEO && selectedFile) {
                await createVideoLesson(
                    form.title,
                    form.moduleId,
                    form.order,
                    selectedFile,
                    form.durationSec
                );
                toast.success('Lección de video creada correctamente');
                if (onSuccess) onSuccess();
                handleClose();
                return;
            }

            // Para lecciones de texto, seguir usando la API existente que crea la lesson con JSON
            await createLesson(form);
            toast.success('Lección creada');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Error al crear lección');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setForm({ title: '', type: LessonType.TEXT, order: 0, moduleId, markdownContent: '', videoUrl: '', durationSec: 0 });
        setErrors({});
        setSelectedFile(null);
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
                                <h3 className="text-lg font-medium">Crear Lección</h3>
                                <p className="text-sm text-gray-500">Agrega una lección al módulo</p>
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
                                {/* Título */}
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

                                {/* Tipo de lección */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => {
                                            setForm({ ...form, type: e.target.value as LessonType, videoUrl: '', markdownContent: '' });
                                            setSelectedFile(null);
                                        }}
                                        className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                                    >
                                        <option value={LessonType.TEXT}>Texto</option>
                                        <option value={LessonType.VIDEO}>Video</option>
                                    </select>
                                </div>

                                {/* Contenido según tipo */}
                                {form.type === LessonType.VIDEO ? (
                                    // Sección de VIDEO
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                        <h4 className="font-medium flex items-center"><Video className="h-4 w-4 mr-2" />Contenido de Video</h4>

                                        {form.videoUrl && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-sm text-green-800">
                                                    ✓ Video subido correctamente
                                                </p>
                                                <a
                                                    href={form.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-green-600 hover:underline break-all"
                                                >
                                                    {form.videoUrl}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, videoUrl: '' }))}
                                                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                                                >
                                                    Cambiar video
                                                </button>
                                            </div>
                                        )}

                                        {!form.videoUrl && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Selecciona un video *</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handleFileSelect}
                                                        disabled={uploading}
                                                        className="hidden"
                                                        id="video-input"
                                                    />
                                                    <label htmlFor="video-input" className="cursor-pointer">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">
                                                            {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un video'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">MP4, WebM, OGG o MOV (máx. 2GB)</p>
                                                    </label>
                                                </div>

                                                {selectedFile && !uploading && (
                                                    <div>
                                                        <p className="mt-3 text-sm text-gray-700">Archivo seleccionado: <strong>{selectedFile.name}</strong></p>
                                                        <p className="mt-2 text-sm text-gray-600">El archivo se subirá al backend cuando pulses <strong>Crear Lección</strong>.</p>
                                                    </div>
                                                )}

                                                {uploading && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${uploadProgress.percentage}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            Subiendo: {uploadProgress.percentage.toFixed(0)}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {errors.videoUrl && (
                                            <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.videoUrl}</p>
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
                                    </div>
                                ) : (
                                    // Sección de TEXTO
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                        <h4 className="font-medium flex items-center"><FileText className="h-4 w-4 mr-2" />Contenido de Texto</h4>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Contenido (Markdown)</label>
                                            <textarea
                                                value={form.markdownContent || ''}
                                                onChange={(e) => setForm({ ...form, markdownContent: e.target.value })}
                                                rows={6}
                                                className={cn('w-full rounded-md border border-gray-300 shadow-sm p-2', errors.markdownContent && 'border-red-300')}
                                                placeholder="Escribe el contenido en markdown..."
                                            />
                                            {errors.markdownContent && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.markdownContent}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">PDF como recurso (opcional)</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={handleFileSelect}
                                                    disabled={uploading}
                                                    className="hidden"
                                                    id="pdf-input"
                                                />
                                                <label htmlFor="pdf-input" className="cursor-pointer">
                                                    <FileIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un PDF'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF (máx. 100MB)</p>
                                                </label>
                                            </div>

                                            {selectedFile && !uploading && (
                                                <div>
                                                    <p className="mt-3 text-sm text-gray-700">Archivo seleccionado: <strong>{selectedFile.name}</strong></p>
                                                    <p className="mt-2 text-sm text-gray-600">El archivo se subirá al backend cuando pulses <strong>Crear Lección</strong>.</p>
                                                </div>
                                            )}

                                            {uploading && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${uploadProgress.percentage}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Subiendo: {uploadProgress.percentage.toFixed(0)}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Botones */}
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                                        {uploading ? 'Subiendo...' : 'Crear Lección'}
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
