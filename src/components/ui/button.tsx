// src/components/ui/button.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
            outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
            ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseClasses, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
