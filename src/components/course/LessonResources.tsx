// src/components/course/LessonResources.tsx
'use client';

import { FileText, Download } from 'lucide-react';

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

    // Si es VIDEO: mostrar lista compacta de recursos
    if (lessonType === 'VIDEO') {
        return (
            <div className="bg-[#001F3F]/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-[#00B4D8]/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                    </div>
                    <span>Recursos de la lección</span>
                </h2>
                <div className="space-y-3">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-[#00B4D8]/30 group"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-11 h-11 bg-[#00B4D8]/15 rounded-xl flex items-center justify-center border border-[#00B4D8]/20">
                                    <FileText className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                                        {resource.fileName}
                                    </p>
                                    {resource.sizeKb && (
                                        <p className="text-sm text-white/50 mt-0.5">
                                            {formatSize(resource.sizeKb)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <a
                                href={resource.fileUrl || resource.downloadUrl}
                                download={resource.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-white rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-200 text-sm font-semibold shadow-lg shadow-[#00B4D8]/20"
                            >
                                <Download className="w-4 h-4" strokeWidth={2} />
                                <span>Descargar</span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Si es TEXT: mostrar visor completo de PDF
    return (
        <>
            {resources.map((resource) => (
                <div
                    key={resource.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-9 h-9 bg-[#00B4D8]/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#00B4D8]" strokeWidth={2} />
                            </div>
                            <span className="font-semibold">{resource.fileName}</span>
                        </div>
                        <a
                            href={resource.fileUrl || resource.downloadUrl}
                            download={resource.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] text-white rounded-xl hover:bg-[#00B4D8]/90 transition-all duration-200 text-sm font-semibold shadow-lg shadow-[#00B4D8]/20"
                        >
                            <Download className="w-4 h-4" strokeWidth={2} />
                            <span>Descargar PDF</span>
                        </a>
                    </div>
                    <iframe
                        src={`${resource.fileUrl || resource.downloadUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        className="w-full h-[700px]"
                        title={resource.fileName}
                    />
                </div>
            ))}
        </>
    );
}