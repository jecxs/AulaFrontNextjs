// src/lib/utils/dto-cleaner.ts

export function cleanDto<T extends Record<string, any>>(
    dto: T,
    options: {
        removeEmptyStrings?: boolean;
        removeZeroNumbers?: boolean;
        removeNullValues?: boolean;
        removeUndefined?: boolean;
    } = {}
): Partial<T> {
    const {
        removeEmptyStrings = true,
        removeZeroNumbers = false,
        removeNullValues = true,
        removeUndefined = true,
    } = options;

    const cleaned: any = {};

    Object.keys(dto).forEach((key) => {
        const value = dto[key];

        if (removeUndefined && value === undefined) return;
        if (removeNullValues && value === null) return;
        if (removeEmptyStrings && typeof value === 'string' && value.trim() === '') return;
        if (removeZeroNumbers && typeof value === 'number' && value === 0) return;

        cleaned[key] = value;
    });

    return cleaned as Partial<T>;
}

export function cleanUpdateLessonDto<T extends Record<string, any>>(dto: T): Partial<T> {
    const cleaned: any = {};

    Object.keys(dto).forEach((key) => {
        const value = dto[key];

        // Omitir valores inválidos
        if (value === undefined || value === null) return;
        if (typeof value === 'string' && value.trim() === '') return;
        if (key === 'durationSec' && (!value || value === 0)) return;

        cleaned[key] = value;
    });

    return cleaned as Partial<T>;
}