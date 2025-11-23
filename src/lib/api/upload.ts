// src/lib/api/upload.ts
/**
 * Servicio de upload para archivos (videos, PDFs, etc.)
 * Integración con Bunny.net CDN
 */

const BUNNY_API_BASE = process.env.NEXT_PUBLIC_BUNNY_API_URL || 'https://api.bunny.net';
const BUNNY_STORAGE_ZONE = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE || '';
const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY || '';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResponse {
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
}

async function uploadToProxy(file: File, folder = 'lessons', onProgress?: (p: UploadProgress) => void): Promise<UploadResponse> {
    // Usa XMLHttpRequest para poder reportar progreso de upload
    return new Promise<UploadResponse>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/bunny-upload');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress({ loaded: event.loaded, total: event.total, percentage: (event.loaded / event.total) * 100 });
            }
        };

        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && res.url) {
                    resolve({ url: res.url, fileName: res.fileName, fileSize: res.fileSize, fileType: res.fileType });
                } else {
                    reject(new Error(res?.error || `Upload failed with status ${xhr.status}`));
                }
            } catch (err) {
                reject(err);
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during upload'));
        };

        xhr.send(formData);
    });
}

/**
 * Sube un archivo a Bunny.net
 * @param file Archivo a subir
 * @param folder Carpeta destino en el storage zone
 * @param onProgress Callback para actualizar progreso
 * @returns Datos del archivo subido
 */
export async function uploadToBunny(
    file: File,
    folder: string = 'lessons',
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
    // Siempre usar el proxy server-side para subir archivos (no exponer claves en el cliente)
    try {
        return await uploadToProxy(file, folder, onProgress);
    } catch (error) {
        console.error('Error al subir archivo vía proxy:', error);
        if (error instanceof Error) {
            throw new Error(error.message || 'Configuración de Bunny.net no disponible');
        }
        throw new Error('Configuración de Bunny.net no disponible');
    }
}

/**
 * Elimina un archivo de Bunny.net
 * @param fileUrl URL completa del archivo
 */
export async function deleteFromBunny(fileUrl: string): Promise<void> {
    if (!BUNNY_STORAGE_ZONE || !BUNNY_API_KEY) {
        throw new Error('Configuración de Bunny.net no disponible');
    }

    try {
        // Extraer la ruta relativa desde la URL
        const urlObj = new URL(fileUrl);
        const path = urlObj.pathname.substring(1); // Quitar el primer '/'

        const response = await fetch(
            `${BUNNY_API_BASE}/v3/b/${BUNNY_STORAGE_ZONE}/${path}`,
            {
                method: 'DELETE',
                headers: {
                    'AccessKey': BUNNY_API_KEY,
                },
            }
        );

        if (!response.ok && response.status !== 404) {
            throw new Error(`Error al eliminar archivo: ${response.status}`);
        }
    } catch (error) {
        console.error('Error al eliminar archivo de Bunny.net:', error);
        throw error;
    }
}

/**
 * Valida si un archivo es válido para upload
 */
export function validateFile(file: File, type: 'video' | 'pdf'): { valid: boolean; error?: string } {
    const maxSizeVideo = 2 * 1024 * 1024 * 1024; // 2GB para videos
    const maxSizePdf = 100 * 1024 * 1024; // 100MB para PDFs

    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const pdfTypes = ['application/pdf'];

    if (type === 'video') {
        if (!videoTypes.includes(file.type)) {
            return { valid: false, error: 'Por favor sube un video válido (MP4, WebM, OGG o MOV)' };
        }
        if (file.size > maxSizeVideo) {
            return { valid: false, error: 'El video no debe superar 2GB' };
        }
    } else if (type === 'pdf') {
        if (!pdfTypes.includes(file.type)) {
            return { valid: false, error: 'Por favor sube un PDF válido' };
        }
        if (file.size > maxSizePdf) {
            return { valid: false, error: 'El PDF no debe superar 100MB' };
        }
    }

    return { valid: true };
}
