// src/components/course/LessonResources.tsx
'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

interface Resource {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl?: string;
    downloadUrl?: string;
    sizeKb?: number;
}

interface LessonResourcesProps {
    resources: Resource[];
    lessonType: string;
}

export default function LessonResources({ resources, lessonType }: LessonResourcesProps) {
    if (resources.length === 0) return null;

    const formatSize = (sizeKb: number) => {
        if (sizeKb < 1024) {
            return `${sizeKb} KB`;
        }
        return `${(sizeKb / 1024).toFixed(2)} MB`;
    };

    // ✅ PARA VIDEOS: Lista compacta con botones de descarga y vista
    if (lessonType === 'VIDEO') {
        return (
            <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-3 text-white">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00B4D8]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#00B4D8]" strokeWidth={2} />
                    </div>
                    <span>Recursos de la lección</span>
                </h2>
                <div className="space-y-3">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-[#00B4D8]/30 group"
                        >
                            <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
                                {/* Info del archivo */}
                                <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#00B4D8]/15 rounded-xl flex items-center justify-center border border-[#00B4D8]/20">
                                        <FileText className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white text-sm sm:text-base truncate group-hover:text-[#00B4D8] transition-colors">
                                            {resource.fileName}
                                        </p>
                                        {resource.sizeKb && (
                                            <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                                                {formatSize(resource.sizeKb)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {/* Botón Ver PDF */}
                                    <a
                                        href={resource.fileUrl || resource.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-semibold border border-white/10"
                                    >
                                        <ExternalLink className="w-4 h-4" strokeWidth={2} />
                                        <span>Ver</span>
                                    </a>

                                    {/* Botón Descargar */}
                                    <a
                                        href={resource.fileUrl || resource.downloadUrl}
                                        download={resource.fileName}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00B4D8] text-white rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-200 text-sm font-semibold shadow-lg shadow-[#00B4D8]/20"
                                    >
                                        <Download className="w-4 h-4" strokeWidth={2} />
                                        <span>Descargar</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ✅ PARA LECCIONES DE TEXTO: Visor de PDF responsivo
    return (
        <>
            {resources.map((resource) => (
                <div
                    key={resource.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                >
                    {/* Header del PDF */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-gray-700 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#00B4D8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#00B4D8]" strokeWidth={2} />
                                </div>
                                <span className="font-semibold text-sm sm:text-base truncate">{resource.fileName}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {/* Botón Ver en nueva pestaña */}
                                <a
                                    href={resource.fileUrl || resource.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-semibold border border-gray-200"
                                >
                                    <ExternalLink className="w-4 h-4" strokeWidth={2} />
                                    <span>Abrir</span>
                                </a>

                                {/* Botón Descargar */}
                                <a
                                    href={resource.fileUrl || resource.downloadUrl}
                                    download={resource.fileName}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00B4D8] text-white rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-200 text-sm font-semibold shadow-lg shadow-[#00B4D8]/20"
                                >
                                    <Download className="w-4 h-4" strokeWidth={2} />
                                    <span>Descargar</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Visor de PDF responsivo */}
                    <div className="relative w-full bg-gray-100">
                        {/* Altura responsiva */}
                        <iframe
                            src={`${resource.fileUrl || resource.downloadUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                            className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]"
                            title={resource.fileName}
                        />
                    </div>
                </div>
            ))}
        </>
    );
}