// src/components/course/CompleteButton.tsx
'use client';

import { CheckCircle, ChevronRight } from 'lucide-react';

interface CompleteButtonProps {
    isCompleted: boolean;
    isPending: boolean;
    hasNextItem: boolean;
    nextItemType?: 'lesson' | 'quiz';
    onComplete: () => void;
}

export default function CompleteButton({
                                           isCompleted,
                                           isPending,
                                           hasNextItem,
                                           nextItemType,
                                           onComplete,
                                       }: CompleteButtonProps) {
    const getButtonText = () => {
        if (isCompleted) {
            if (!hasNextItem) return 'Volver al curso';
            if (nextItemType === 'quiz') return 'Ir a evaluación del módulo';
            return 'Ir a siguiente lección';
        }
        return 'Marcar como completada y continuar';
    };

    return (
        <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <button
                onClick={onComplete}
                disabled={isPending}
                className={`w-full font-semibold py-4 px-6 rounded-xl 
                    transition-all duration-300 flex items-center justify-center gap-3
                    disabled:cursor-not-allowed disabled:opacity-60 ${
                    isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30'
                        : 'bg-[#00B4D8] hover:bg-[#00B4D8]/90 shadow-lg shadow-[#00B4D8]/20 hover:shadow-xl hover:shadow-[#00B4D8]/30'
                } text-white hover:scale-[1.01] active:scale-[0.99]`}
            >
                {isPending ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Procesando...</span>
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                        <span>{getButtonText()}</span>
                        {hasNextItem && <ChevronRight className="w-5 h-5" strokeWidth={2.5} />}
                    </>
                )}
            </button>
        </div>
    );
}