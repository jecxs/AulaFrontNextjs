// src/app/(student)/student/courses/[courseId]/lessons/layout.tsx
'use client';

import { StudentGuard } from '@/lib/auth/guards';

export default function LessonsLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <StudentGuard>
            {/* Layout sin padding para lecciones fullscreen */}
            <div className="min-h-screen">
                {children}
            </div>
        </StudentGuard>
    );
}