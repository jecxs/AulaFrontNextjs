// src/components/ui/input.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, label, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                        error ? 'border-red-300' : 'border-gray-300',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;