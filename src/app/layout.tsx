// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from 'sonner';
import { APP_NAME } from '@/lib/utils/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: APP_NAME,
    description: 'Plataforma de aprendizaje virtual',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
        <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster
                position="top-right"
                richColors
                closeButton
            />
        </AuthProvider>
        </body>
        </html>
    );
}