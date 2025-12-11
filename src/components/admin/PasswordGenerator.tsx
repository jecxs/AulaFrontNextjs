// src/components/admin/PasswordGenerator.tsx
'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'react-hot-toast';

interface PasswordGeneratorProps {
    onPasswordGenerate: (password: string) => void;
    currentPassword?: string;
}

export default function PasswordGenerator({
                                              onPasswordGenerate,
                                              currentPassword
                                          }: PasswordGeneratorProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%&*';
        const allChars = lowercase + uppercase + numbers + symbols;

        let password = '';

        // Asegurar al menos un carácter de cada tipo
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // Completar hasta 12 caracteres
        for (let i = password.length; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Mezclar caracteres
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        onPasswordGenerate(password);
        toast.success('Contraseña generada');
    };

    const copyPassword = () => {
        if (currentPassword) {
            navigator.clipboard.writeText(currentPassword);
            setCopied(true);
            toast.success('Contraseña copiada al portapapeles');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword || ''}
                        readOnly
                        className="w-full pl-3 pr-20 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                        placeholder="Generar contraseña..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title={showPassword ? 'Ocultar' : 'Mostrar'}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-600" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-600" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={copyPassword}
                            disabled={!currentPassword}
                            className={cn(
                                "p-1 rounded transition-colors",
                                currentPassword
                                    ? "hover:bg-gray-200"
                                    : "opacity-50 cursor-not-allowed"
                            )}
                            title="Copiar"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Generar
                </button>
            </div>

            <p className="text-xs text-gray-500">
                Contraseña de 12 caracteres con letras, números y símbolos
            </p>
        </div>
    );
}