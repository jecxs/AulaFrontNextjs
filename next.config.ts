import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.bunny.net', // Bunny CDN (tu storage)
            },
            {
                protocol: 'https',
                hostname: 'storage.bunnycdn.com', // Bunny Storage alternativo
            },
            {
                protocol: 'https',
                hostname: '**.b-cdn.net', // Bunny CDN alternativo
            },
            {
                protocol: 'https',
                hostname: 'external-preview.redd.it', // Reddit (temporal para testing)
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com', // Imgur (por si usas)
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com', // Unsplash (por si usas)
            },
        ],
        // Opcional: Configuración adicional de optimización
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    eslint: {
        // Ignora errores de ESLint durante el build
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignora errores de TypeScript durante el build
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
