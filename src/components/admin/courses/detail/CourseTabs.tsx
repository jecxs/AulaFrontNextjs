// src/components/admin/courses/detail/CourseTabs.tsx
'use client';

import { cn } from '@/lib/utils/cn';
import { BookOpen, Users, BarChart3 } from 'lucide-react';

type TabType = 'content' | 'students' | 'stats';

interface CourseTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs = [
    {
        id: 'content' as TabType,
        label: 'Contenido del Curso',
        icon: BookOpen,
    },
    {
        id: 'students' as TabType,
        label: 'Estudiantes',
        icon: Users,
    },
    {
        id: 'stats' as TabType,
        label: 'Estadísticas',
        icon: BarChart3,
    },
];

export default function CourseTabs({ activeTab, onTabChange }: CourseTabsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100">
                <nav className="flex -mb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    'relative flex items-center gap-2 py-4 px-6 text-sm font-semibold border-b-2 transition-all',
                                    isActive
                                        ? 'border-[#00B4D8] text-[#001F3F] bg-[#00B4D8]/5'
                                        : 'border-transparent text-gray-500 hover:text-[#001F3F] hover:bg-gray-50'
                                )}
                            >
                                <Icon className={cn(
                                    'h-4 w-4',
                                    isActive ? 'text-[#00B4D8]' : 'text-gray-400'
                                )} />
                                {tab.label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B4D8]" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}