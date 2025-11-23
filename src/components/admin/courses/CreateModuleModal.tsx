'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { CreateModuleDto } from '@/types/course';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onSuccess?: () => void;
}

export default function CreateModuleModal({ isOpen, onClose, courseId, onSuccess }: Props) {
    const { createModule, getModuleNextOrder } = useCoursesAdmin();
    const [form, setForm] = useState<CreateModuleDto>({ title: '', description: '', courseId, order: 0 });
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    useEffect(() => {
        if (isOpen) {
            (async () => {
                setLoadingData(true);
                try {
                    const next = await getModuleNextOrder(courseId);
                    setForm((s) => ({ ...s, order: next }));
                    setForm((s) => ({ ...s, courseId }));
                } catch (err) {
                    console.error(err);
                    toast.error('Error al obtener orden');
                } finally {
                    setLoadingData(false);
                }
            })();
        }
    }, [isOpen, courseId, getModuleNextOrder]);

    const validate = () => {
        const e: Record<string,string> = {};
        if (!form.title.trim()) e.title = 'El título es requerido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await createModule(form);
            toast.success('Módulo creado');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error('Error al crear módulo');
        }
    };

    const handleClose = () => {
        setForm({ title: '', description: '', courseId, order: 0 });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Crear Módulo</h3>
                                <p className="text-sm text-gray-500">Agrega un módulo al curso</p>
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
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título *</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className={cn('w-full rounded-md border-gray-300 shadow-sm p-2', errors.title && 'border-red-300')}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm p-2"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded border">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Crear</button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
