'use client';

import { useState } from 'react';
import { Lesson, LessonType } from '@/types/course';
import { Video, FileText, File, Download, Trash2, Plus, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { validateFile, UploadProgress } from '@/lib/api/upload';

interface Props {
    lesson: Lesson;
    onUpdate?: () => void;
}

export default function LessonDetailsCard({ lesson, onUpdate }: Props) {
    const { createResource, deleteResource } = useCoursesAdmin();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showResourceForm, setShowResourceForm] = useState(false);

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
            // Enviar archivo al backend para que use bunny.service y cree el recurso
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const url = `${apiBase}/resources/upload`;
            const fd = new FormData();
            // El backend/proxy espera un campo llamado 'file'
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
                throw new Error(txt || `Upload failed: ${res.status}`);
            }

            // Backend debe retornar el recurso creado
            const created = await res.json();
            toast.success('Recurso agregado correctamente');
            setSelectedFile(null);
            setShowResourceForm(false);
            if (onUpdate) onUpdate();
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
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar recurso');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Información básica */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Tipo: {lesson.type === LessonType.VIDEO ? '📹 Video' : '📄 Texto'}
                </p>
            </div>

            {/* Contenido según tipo */}
            {lesson.type === LessonType.VIDEO ? (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Contenido de Video</h3>
                    </div>
                    {lesson.videoUrl ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm text-blue-800 mb-2">✓ URL del video:</p>
                            <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                            >
                                {lesson.videoUrl}
                            </a>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No hay video cargado</p>
                    )}
                    {lesson.durationSec && (
                        <div className="text-sm text-gray-600">
                            <strong>Duración:</strong> {Math.floor(lesson.durationSec / 60)} min {lesson.durationSec % 60} seg
                        </div>
                    )}
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Contenido de Texto</h3>
                    </div>
                    {lesson.markdownContent ? (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{lesson.markdownContent}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No hay contenido</p>
                    )}
                </div>
            )}

            {/* Recursos */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <File className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium">Recursos ({lesson.resources?.length || 0})</h3>
                    </div>
                    {!showResourceForm && (
                        <button
                            onClick={() => setShowResourceForm(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                        </button>
                    )}
                </div>

                {/* Lista de recursos */}
                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="space-y-2">
                        {lesson.resources.map(resource => (
                            <div
                                key={resource.id}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{resource.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                            {resource.fileType} • {resource.sizeKb && `${(resource.sizeKb / 1024).toFixed(2)} MB`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                        title="Descargar"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDeleteResource(resource.id)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {lesson.resources && lesson.resources.length === 0 && !showResourceForm && (
                    <p className="text-sm text-gray-500">No hay recursos agregados</p>
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
        </div>
    );
}
