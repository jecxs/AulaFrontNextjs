'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';
import { useCoursesAdmin } from '@/hooks/use-courses-admin';
import { Course, UpdateCourseDto, CourseLevel, CourseStatus, CourseVisibility } from '@/types/course';
import { courseCategoriesApi } from '@/lib/api/course-categories';
import { instructorsApi } from '@/lib/api/instructors';
import { CourseCategory } from '@/types/course-category';
import { Instructor } from '@/types/instructor';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onSuccess?: () => void;
}

export default function EditCourseModal({ isOpen, onClose, course, onSuccess }: Props) {
    const { updateCourse } = useCoursesAdmin();
    const [form, setForm] = useState<UpdateCourseDto>({ title: '', summary: '', description: '', level: CourseLevel.BEGINNER, thumbnailUrl: '', estimatedHours: undefined, price: undefined, status: CourseStatus.DRAFT, visibility: CourseVisibility.PRIVATE, categoryId: '', instructorId: '' });
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    useEffect(() => {
        if (isOpen && course) {
            setForm({
                title: course.title || '',
                summary: course.summary || '',
                description: course.description || '',
                level: course.level || CourseLevel.BEGINNER,
                thumbnailUrl: course.thumbnailUrl || '',
                estimatedHours: course.estimatedHours || undefined,
                price: course.price || undefined,
                status: course.status || CourseStatus.DRAFT,
                visibility: course.visibility || CourseVisibility.PRIVATE,
                categoryId: course.categoryId || '',
                instructorId: course.instructorId || '',
            });
            loadData();
        }
    }, [isOpen, course]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [cats, instr] = await Promise.all([courseCategoriesApi.getActive(), instructorsApi.getAll({ page: 1, limit: 100 })]);
            setCategories(cats);
            setInstructors(instr.data);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar datos');
        } finally {
            setLoadingData(false);
        }
    };

    const validate = () => {
        const e: Record<string,string> = {};
        if (!form.title || !form.title.trim()) e.title = 'El título es requerido';
        if (!form.categoryId) e.categoryId = 'Debes seleccionar categoría';
        if (!form.instructorId) e.instructorId = 'Debes seleccionar instructor';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await updateCourse(course.id, form);
            toast.success('Curso actualizado');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar curso');
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
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
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Editar Curso</h3>
                                <p className="text-sm text-gray-500">Actualiza la información del curso</p>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Título *</label>
                                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={cn('w-full rounded-md border-gray-300 shadow-sm p-2', errors.title && 'border-red-300')} />
                                        {errors.title && (<p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.title}</p>)}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoría *</label>
                                        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={cn('w-full rounded-md border-gray-300 shadow-sm p-2', errors.categoryId && 'border-red-300')}>
                                            <option value="">Seleccionar...</option>
                                            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                        </select>
                                        {errors.categoryId && (<p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>)}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Instructor *</label>
                                        <select value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })} className={cn('w-full rounded-md border-gray-300 shadow-sm p-2', errors.instructorId && 'border-red-300')}>
                                            <option value="">Seleccionar...</option>
                                            {instructors.map((i) => (<option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>))}
                                        </select>
                                        {errors.instructorId && (<p className="mt-1 text-sm text-red-600">{errors.instructorId}</p>)}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nivel</label>
                                        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })} className="w-full rounded-md border-gray-300 shadow-sm p-2">
                                            <option value={CourseLevel.BEGINNER}>Principiante</option>
                                            <option value={CourseLevel.INTERMEDIATE}>Intermedio</option>
                                            <option value={CourseLevel.ADVANCED}>Avanzado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Horas estimadas</label>
                                        <input type="number" value={form.estimatedHours || ''} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-md border-gray-300 shadow-sm p-2" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Precio</label>
                                        <input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-md border-gray-300 shadow-sm p-2" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Visibilidad</label>
                                        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as CourseVisibility })} className="w-full rounded-md border-gray-300 shadow-sm p-2">
                                            <option value={CourseVisibility.PRIVATE}>Privado</option>
                                            <option value={CourseVisibility.PUBLIC}>Público</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Estado</label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })} className="w-full rounded-md border-gray-300 shadow-sm p-2">
                                            <option value={CourseStatus.DRAFT}>Borrador</option>
                                            <option value={CourseStatus.PUBLISHED}>Publicado</option>
                                            <option value={CourseStatus.ARCHIVED}>Archivado</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Resumen</label>
                                    <textarea value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full rounded-md border-gray-300 shadow-sm p-2" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Descripción</label>
                                    <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-md border-gray-300 shadow-sm p-2" />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded border">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

