// src/components/ui/loading-spinner.tsx
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={cn('animate-spin rounded-full border-b-2 border-current', sizes[size], className)} />
    );
}