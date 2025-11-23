'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Edit, Trash2, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuizzesAdmin } from '@/hooks/use-quizzes-admin';
import { Quiz, Module } from '@/types/quiz';
import CreateQuizModal from './CreateQuizModal';
import EditQuizModal from './EditQuizModal';
import QuizQuestionsCard from './QuizQuestionsCard';

interface Props {
    module: Module;
    onModuleChanged?: () => void;
}

export default function ModuleQuizzesCard({ module, onModuleChanged }: Props) {
    const { getQuizzesByModule, deleteQuiz, isLoading } = useQuizzesAdmin();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
    const [showEditQuizModal, setShowEditQuizModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());

    const loadQuizzes = async () => {
        setLoadingQuizzes(true);
        try {
            const data = await getQuizzesByModule(module.id);
            setQuizzes(data);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar quizzes');
        } finally {
            setLoadingQuizzes(false);
        }
    };

    useEffect(() => {
        loadQuizzes();
    }, [module.id]);

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este quiz y todas sus preguntas?'))
            return;

        try {
            await deleteQuiz(quizId);
            toast.success('Quiz eliminado');
            loadQuizzes();
            if (onModuleChanged) onModuleChanged();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar quiz');
        }
    };

    const handleEditQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setShowEditQuizModal(true);
    };

    const toggleQuizExpanded = (quizId: string) => {
        const newExpanded = new Set(expandedQuizzes);
        if (newExpanded.has(quizId)) {
            newExpanded.delete(quizId);
        } else {
            newExpanded.add(quizId);
        }
        setExpandedQuizzes(newExpanded);
    };

    const handleQuizSuccess = () => {
        loadQuizzes();
        if (onModuleChanged) onModuleChanged();
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <HelpCircle className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Quizzes ({quizzes.length})
                        </h3>
                        <p className="text-xs text-gray-600">
                            Módulo: {module.title}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateQuizModal(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 text-sm font-medium transition"
                >
                    <Plus className="h-4 w-4" /> Crear Quiz
                </button>
            </div>

            {loadingQuizzes ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded border border-dashed border-purple-300">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay quizzes en este módulo. Crea uno para comenzar.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded border border-gray-200 overflow-hidden hover:border-purple-300 transition"
                        >
                            {/* Header del Quiz */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleQuizExpanded(quiz.id)}>
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleQuizExpanded(quiz.id);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        {expandedQuizzes.has(quiz.id) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-600" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {quiz.description}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                Aprobación: {quiz.passingScore}%
                                            </span>
                                            {quiz.timeLimit && (
                                                <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                    Tiempo: {quiz.timeLimit} min
                                                </span>
                                            )}
                                            <span
                                                className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                                                    quiz.status === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {quiz.status}
                                            </span>
                                            {quiz.isRequired && (
                                                <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                    Obligatorio
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                        {quiz._count?.questions || 0} preguntas
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditQuiz(quiz);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Editar quiz"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuiz(quiz.id);
                                        }}
                                        disabled={isLoading}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                        title="Eliminar quiz"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenido expandido - Preguntas */}
                            {expandedQuizzes.has(quiz.id) && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <QuizQuestionsCard
                                        quiz={quiz}
                                        onQuizChanged={handleQuizSuccess}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <CreateQuizModal
                isOpen={showCreateQuizModal}
                onClose={() => setShowCreateQuizModal(false)}
                moduleId={module.id}
                onSuccess={handleQuizSuccess}
            />

            <EditQuizModal
                isOpen={showEditQuizModal}
                onClose={() => setShowEditQuizModal(false)}
                quiz={selectedQuiz}
                onSuccess={handleQuizSuccess}
            />
        </div>
    );
}

