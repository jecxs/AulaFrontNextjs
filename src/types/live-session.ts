// src/types/live-session.ts

export interface LiveSession {
    id: string;
    topic: string;
    startsAt: string; // ISO date string
    endsAt: string;   // ISO date string
    meetingUrl?: string;
    courseId: string;
    course?: {
        id: string;
        title: string;
        instructor: {
            firstName: string;
            lastName: string;
        };
    };
}

export interface LiveSessionWithDetails extends LiveSession {
    course: {
        id: string;
        title: string;
        instructor: {
            firstName: string;
            lastName: string;
        };
        _count: {
            enrollments: number;
        };
    };
}

export interface LiveSessionForStudent {
    id: string;
    topic: string;
    startsAt: string;
    endsAt: string;
    meetingUrl?: string;
    course: {
        id: string;
        title: string;
        instructor: {
            firstName: string;
            lastName: string;
        };
    };
    status: 'upcoming' | 'live' | 'past';
}

// ========== DTOs ==========

export interface CreateLiveSessionDto {
    topic: string;
    startsAt: string; // ISO date string
    endsAt: string;   // ISO date string
    meetingUrl?: string;
    courseId: string;
}

export interface UpdateLiveSessionDto {
    topic?: string;
    startsAt?: string;
    endsAt?: string;
    meetingUrl?: string;
}

export interface QueryLiveSessionsDto {
    courseId?: string;
    page?: number;
    limit?: number;
}

// ========== Responses ==========

export interface LiveSessionsResponse {
    data: LiveSessionWithDetails[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LiveSessionStats {
    total: number;
    upcoming: number;
    past: number;
    coursesWithSessions: number;
}