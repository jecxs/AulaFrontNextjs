// src/app/(student)/student/courses/[courseId]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { progressApi } from '@/lib/api/progress';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Settings,
    Maximize,
    BookOpen,
    Clock,
    FileText,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';

interface LessonData {
    lesson: any;
    course: any;
    module: any;
    navigation: {
        previousLesson: any | null;
        nextLesson: any | null;
    };
    progress: {
        isCompleted: boolean;
        completedAt?: string;
    };
}

export default function LessonPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const [lessonData, setLessonData] = useState<LessonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Progress tracking
    const [startTime] = useState(Date.now());
    const [hasStartedLesson, setHasStartedLesson] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [lastCheckpoint, setLastCheckpoint] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (courseId && lessonId) {
            loadLessonData();
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [courseId, lessonId]);

    useEffect(() => {
        if (lessonData && !hasStartedLesson) {
            startLessonSession();
        }
    }, [lessonData, hasStartedLesson]);

    const loadLessonData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cargar datos de la lección
            const [lesson, course] = await Promise.all([
                coursesApi.getLesson(lessonId),
                coursesApi.getCourse(courseId)
            ]);

            // Cargar progreso de la lección
            let progress = { isCompleted: false };
            try {
                progress = await progressApi.checkLessonProgress(lessonId);
            } catch (error) {
                console.warn('Could not load lesson progress:', error);
            }

            // Cargar módulos para navegación
            const modules = await coursesApi.getCourseModules(courseId);
            const navigation = await buildNavigation(modules, lessonId);

            setLessonData({
                lesson,
                course,
                module: modules.find(m => m.id === lesson.moduleId),
                navigation,
                progress
            });

        } catch (err: any) {
            console.error('Error loading lesson data:', err);
            setError('Error al cargar la lección');
            toast.error('Error al cargar la lección');
        } finally {
            setIsLoading(false);
        }
    };

    const buildNavigation = async (modules: any[], currentLessonId: string) => {
        const allLessons = [];

        // Obtener todas las lecciones ordenadas
        for (const module of modules) {
            try {
                const lessons = await coursesApi.getModuleLessons(module.id);
                allLessons.push(...lessons.map(lesson => ({ ...lesson, moduleId: module.id })));
            } catch (error) {
                console.error(`Error loading lessons for module ${module.id}:`, error);
            }
        }

        // Encontrar la lección actual y sus vecinas
        const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);

        return {
            previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
        };
    };

    const startLessonSession = async () => {
        if (!lessonData || hasStartedLesson) return;

        try {
            setHasStartedLesson(true);

            // Iniciar tracking de tiempo
            progressIntervalRef.current = setInterval(() => {
                setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

        } catch (error) {
            console.error('Error starting lesson session:', error);
        }
    };

    const handleVideoProgress = async () => {
        if (!videoRef.current || !lessonData || lessonData.progress.isCompleted) return;

        const video = videoRef.current;
        const progressPercentage = (video.currentTime / video.duration) * 100;

        // Checkpoints cada 25%
        const checkpoints = [25, 50, 75, 85];
        for (const checkpoint of checkpoints) {
            if (progressPercentage >= checkpoint && lastCheckpoint < checkpoint) {
                setLastCheckpoint(checkpoint);

                // Auto-completar al 85%
                if (checkpoint === 85) {
                    try {
                        await progressApi.autoCompleteVideoLesson(lessonId);
                        setLessonData(prev => prev ? {
                            ...prev,
                            progress: { isCompleted: true, completedAt: new Date().toISOString() }
                        } : null);
                        toast.success('¡Video completado automáticamente!');
                    } catch (error) {
                        console.error('Error auto-completing video lesson:', error);
                    }
                }
                break;
            }
        }
    };

    const handleTextLessonExit = async () => {
        if (!lessonData || lessonData.progress.isCompleted || lessonData.lesson.type !== 'TEXT') return;

        const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

        if (totalTimeSpent > 10) {
            try {
                await progressApi.handleLessonExit(lessonId, totalTimeSpent);
            } catch (error) {
                console.error('Error updating lesson progress:', error);
            }
        }
    };

    const markLessonComplete = async () => {
        if (!lessonData || lessonData.progress.isCompleted) return;

        try {
            await progressApi.markLessonComplete(lessonId);
            setLessonData(prev => prev ? {
                ...prev,
                progress: { isCompleted: true, completedAt: new Date().toISOString() }
            } : null);
            toast.success('¡Lección completada!');
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            toast.error('Error al marcar la lección como completada');
        }
    };

    const navigateToLesson = (targetLessonId: string) => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        // Reportar tiempo antes de navegar
        handleTextLessonExit();

        router.push(`${ROUTES.STUDENT.COURSES}/${courseId}/lessons/${targetLessonId}`);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Video player controls
    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;

        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (value: number) => {
        if (!videoRef.current) return;

        const newVolume = value / 100;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleSeek = (value: number) => {
        if (!videoRef.current) return;

        const newTime = (value / 100) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const showControlsTemporarily = () => {
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleMouseMove = () => {
        showControlsTemporarily();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !lessonData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error al cargar la lección
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadLessonData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    const { lesson, course, module, navigation, progress } = lessonData;

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`${ROUTES.STUDENT.COURSES}/${courseId}`}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-white font-medium">{lesson.title}</h1>
                                <p className="text-gray-400 text-sm">{module?.title} • {course.title}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {progress.isCompleted ? (
                                <div className="flex items-center text-green-400">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    <span className="text-sm">Completada</span>
                                </div>
                            ) : (
                                <button
                                    onClick={markLessonComplete}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    Marcar como completada
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1">
                {/* Video/Content area */}
                <div className="flex-1 flex flex-col">
                    {lesson.type === 'VIDEO' ? (
                        <div
                            className="bg-black flex-1 flex items-center justify-center relative"
                            onMouseMove={handleMouseMove}
                        >
                            <div className="w-full max-w-6xl mx-auto">
                                <video
                                    ref={videoRef}
                                    className="w-full aspect-video"
                                    onTimeUpdate={() => {
                                        if (videoRef.current) {
                                            setCurrentTime(videoRef.current.currentTime);
                                            handleVideoProgress();
                                        }
                                    }}
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) {
                                            setDuration(videoRef.current.duration);
                                        }
                                    }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={togglePlay}
                                >
                                    <source src={lesson.videoUrl} type="video/mp4" />
                                    Tu navegador no soporta el elemento de video.
                                </video>

                                {/* Video controls overlay */}
                                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    {/* Progress bar */}
                                    <div className="mb-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={duration > 0 ? (currentTime / duration) * 100 : 0}
                                            onChange={(e) => handleSeek(Number(e.target.value))}
                                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={togglePlay}
                                                className="text-white hover:text-blue-400 transition-colors"
                                            >
                                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={toggleMute}
                                                    className="text-white hover:text-blue-400 transition-colors"
                                                >
                                                    {isMuted || volume === 0 ?
                                                        <VolumeX className="w-5 h-5" /> :
                                                        <Volume2 className="w-5 h-5" />
                                                    }
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={isMuted ? 0 : volume * 100}
                                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                                    className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="text-white text-sm">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <button className="text-white hover:text-blue-400 transition-colors">
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button className="text-white hover:text-blue-400 transition-colors">
                                                <Maximize className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress indicator */}
                                {lastCheckpoint > 0 && (
                                    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm">
                                        {lastCheckpoint}% completado
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Text lesson content
                        <div className="flex-1 bg-white overflow-y-auto">
                            <div className="max-w-4xl mx-auto py-8 px-6">
                                {/* Lesson header */}
                                <div className="mb-8 pb-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        <span>Tiempo: {formatTime(timeSpent)}</span>
                                                    </div>
                                                    {lesson.durationSec && (
                                                        <span>Estimado: {formatTime(lesson.durationSec)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="prose prose-lg max-w-none">
                                    {lesson.markdownContent ? (
                                        <div dangerouslySetInnerHTML={{ __html: lesson.markdownContent }} />
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Contenido no disponible
                                            </h3>
                                            <p className="text-gray-600">
                                                El contenido de esta lección no está disponible por el momento.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                    {/* Lesson info */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            {lesson.type === 'VIDEO' ? (
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Play className="w-5 h-5 text-white" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-white font-medium">{lesson.title}</h3>
                                <p className="text-gray-400 text-sm capitalize">
                                    {lesson.type.toLowerCase()}
                                    {lesson.durationSec && ` • ${formatTime(lesson.durationSec)}`}
                                </p>
                            </div>
                        </div>

                        {progress.isCompleted && (
                            <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
                                <div className="flex items-center text-green-400">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Lección completada</span>
                                </div>
                                {progress.completedAt && (
                                    <p className="text-green-300 text-xs mt-1">
                                        Completada el {new Date(progress.completedAt).toLocaleString('es-ES')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 p-6">
                        <h4 className="text-white font-medium mb-4">Navegación</h4>

                        <div className="space-y-3">
                            {navigation.previousLesson ? (
                                <button
                                    onClick={() => navigateToLesson(navigation.previousLesson.id)}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wide">Anterior</p>
                                            <p className="text-white text-sm font-medium">
                                                {navigation.previousLesson.title}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                    <p className="text-gray-500 text-sm">Primera lección del curso</p>
                                </div>
                            )}

                            {navigation.nextLesson ? (
                                <button
                                    onClick={() => navigateToLesson(navigation.nextLesson.id)}
                                    className="w-full text-left p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-200 text-xs uppercase tracking-wide">Siguiente</p>
                                            <p className="text-white text-sm font-medium">
                                                {navigation.nextLesson.title}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-blue-200 group-hover:text-white" />
                                    </div>
                                </button>
                            ) : (
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                    <p className="text-gray-500 text-sm">Última lección del curso</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Course info */}
                    <div className="p-6 border-t border-gray-700">
                        <h4 className="text-white font-medium mb-3">Información del curso</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-300">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{course.title}</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{course.instructor.firstName} {course.instructor.lastName}</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <FileText className="w-4 h-4 mr-2" />
                                <span>{module?.title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resources (if any) */}
                    {lesson.resources && lesson.resources.length > 0 && (
                        <div className="p-6 border-t border-gray-700">
                            <h4 className="text-white font-medium mb-3">Recursos</h4>
                            <div className="space-y-2">
                                {lesson.resources.map((resource: any) => (
                                    <a
                                        key={resource.id}
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-white text-sm">{resource.fileName}</p>
                                            <p className="text-gray-400 text-xs">
                                                {resource.fileType.toUpperCase()}
                                                {resource.sizeKb && ` • ${Math.round(resource.sizeKb / 1024)} MB`}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}