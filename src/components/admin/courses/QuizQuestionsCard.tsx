'use client';

import { useEffect, useState, useCallback } from 'react';
import { HelpCircle, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuizzesAdmin } from '@/hooks/use-quizzes-admin';
import { Question, Quiz } from '@/types/quiz';
import CreateQuestionModal from './CreateQuestionModal';
import EditQuestionModal from './EditQuestionModal';

interface Props {
    quiz: Quiz;
    onQuizChanged?: () => void;
}

export default function QuizQuestionsCard({ quiz, onQuizChanged }: Props) {
    const { getQuestionsByQuiz, deleteQuestion, isLoading } = useQuizzesAdmin();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
    const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const loadQuestions = useCallback(async () => {
        setLoadingQuestions(true);
        try {
            const data = await getQuestionsByQuiz(quiz.id);
            setQuestions(data);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar preguntas');
        } finally {
            setLoadingQuestions(false);
        }
    }, [quiz.id, getQuestionsByQuiz]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) return;

        try {
            await deleteQuestion(questionId);
            toast.success('Pregunta eliminada');
            loadQuestions();
            if (onQuizChanged) onQuizChanged();
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar pregunta');
        }
    };

    const handleEditQuestion = (question: Question) => {
        setSelectedQuestion(question);
        setShowEditQuestionModal(true);
    };

    const handleQuestionSuccess = () => {
        loadQuestions();
        if (onQuizChanged) onQuizChanged();
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">
                        Preguntas ({questions.length})
                    </h3>
                </div>
                <button
                    onClick={() => setShowCreateQuestionModal(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                    <Plus className="h-4 w-4" /> Agregar pregunta
                </button>
            </div>

            {loadingQuestions ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No hay preguntas aún. Agrega la primera pregunta.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm font-medium text-gray-900">
                                        {question.text}
                                    </p>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {question.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Puntos: {question.weight || 1} | Opciones:{' '}
                                    {question._count?.answerOptions || 0}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => handleEditQuestion(question)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar pregunta"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    disabled={isLoading}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                    title="Eliminar pregunta"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateQuestionModal
                isOpen={showCreateQuestionModal}
                onClose={() => setShowCreateQuestionModal(false)}
                quizId={quiz.id}
                onSuccess={handleQuestionSuccess}
            />

            <EditQuestionModal
                isOpen={showEditQuestionModal}
                onClose={() => setShowEditQuestionModal(false)}
                question={selectedQuestion}
                onSuccess={handleQuestionSuccess}
            />
        </div>
    );
}
