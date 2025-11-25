// src/types/notification.ts

// ========== ENUMS ==========
export enum NotificationType {
    MODULE_COMPLETED = 'MODULE_COMPLETED',
    QUIZ_PASSED = 'QUIZ_PASSED',
    QUIZ_FAILED = 'QUIZ_FAILED',
    COURSE_COMPLETED = 'COURSE_COMPLETED',
    LIVE_SESSION_REMINDER = 'LIVE_SESSION_REMINDER',
    ENROLLMENT_CREATED = 'ENROLLMENT_CREATED',
    NEW_CONTENT = 'NEW_CONTENT',
}

// ========== NOTIFICATION INTERFACE BASE ==========
export interface NotificationBase {
    id: string;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}

// ========== PAYLOADS POR TIPO ==========
export interface ModuleCompletedPayload {
    moduleTitle: string;
    courseName: string;
    courseId: string;
    moduleId: string;
}

export interface QuizPassedPayload {
    quizTitle: string;
    score: number;
    percentage: number;
    courseName: string;
}

export interface QuizFailedPayload {
    quizTitle: string;
    score: number;
    percentage: number;
    passingScore: number;
    courseName: string;
}

export interface CourseCompletedPayload {
    courseTitle: string;
    courseId: string;
    completedAt: string;
}

export interface LiveSessionReminderPayload {
    sessionId: string;
    sessionTopic: string;
    startsAt: string;
    courseName: string;
    meetingUrl?: string;
    minutesUntilStart: number;
}

export interface EnrollmentCreatedPayload {
    courseTitle: string;
    courseId: string;
    enrolledAt: string;
}

export interface NewContentPayload {
    title: string;
    description?: string;
    courseId?: string;
    courseName?: string;
}

// ========== NOTIFICACIONES TIPADAS (Discriminated Union) ==========
export type Notification =
    | {
    id: string;
    type: NotificationType.MODULE_COMPLETED;
    payload?: ModuleCompletedPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.QUIZ_PASSED;
    payload?: QuizPassedPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.QUIZ_FAILED;
    payload?: QuizFailedPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.COURSE_COMPLETED;
    payload?: CourseCompletedPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.LIVE_SESSION_REMINDER;
    payload?: LiveSessionReminderPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.ENROLLMENT_CREATED;
    payload?: EnrollmentCreatedPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
}
    | {
    id: string;
    type: NotificationType.NEW_CONTENT;
    payload?: NewContentPayload;
    readAt?: string | null;
    sentAt: string;
    userId: string;
};

// Union type para todos los payloads (para referencia)
export type NotificationPayload =
    | ModuleCompletedPayload
    | QuizPassedPayload
    | QuizFailedPayload
    | CourseCompletedPayload
    | LiveSessionReminderPayload
    | EnrollmentCreatedPayload
    | NewContentPayload;

// ========== TYPE GUARDS ==========
export function isModuleCompleted(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.MODULE_COMPLETED }> {
    return notification.type === NotificationType.MODULE_COMPLETED;
}

export function isQuizPassed(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.QUIZ_PASSED }> {
    return notification.type === NotificationType.QUIZ_PASSED;
}

export function isQuizFailed(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.QUIZ_FAILED }> {
    return notification.type === NotificationType.QUIZ_FAILED;
}

export function isCourseCompleted(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.COURSE_COMPLETED }> {
    return notification.type === NotificationType.COURSE_COMPLETED;
}

export function isLiveSessionReminder(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.LIVE_SESSION_REMINDER }> {
    return notification.type === NotificationType.LIVE_SESSION_REMINDER;
}

export function isEnrollmentCreated(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.ENROLLMENT_CREATED }> {
    return notification.type === NotificationType.ENROLLMENT_CREATED;
}

export function isNewContent(
    notification: Notification
): notification is Extract<Notification, { type: NotificationType.NEW_CONTENT }> {
    return notification.type === NotificationType.NEW_CONTENT;
}


// ========== API RESPONSES ==========
export interface NotificationSummary {
    total: number;
    unread: number;
    notifications: Notification[];
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export interface MarkAsReadResponse {
    message: string;
    markedCount: number;
}

// ========== DTOs ==========
export interface MarkAsReadDto {
    notificationIds: string[];
}

export interface QueryNotificationsDto {
    page?: number;
    limit?: number;
    userId?: string;
    type?: NotificationType;
    unreadOnly?: boolean;
    sortOrder?: 'asc' | 'desc';
}