// components/course/VideoPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onTimeUpdate?: (currentTime: number) => void;
    onEnded?: () => void;
    className?: string;
}

export default function VideoPlayer({
                                        src,
                                        poster,
                                        onTimeUpdate,
                                        onEnded,
                                        className = ''
                                    }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Control de visibilidad de controles
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            if (isPlaying) {
                timeout = setTimeout(() => setShowControls(false), 3000);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, [isPlaying]);

    // Manejar carga del video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onTimeUpdate?.(video.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        const handleError = (e: Event) => {
            setError('Error al cargar el video. Por favor, intenta recargar la página.');
            setIsLoading(false);
        };

        const handleWaiting = () => {
            setIsLoading(true);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('error', handleError);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('error', handleError);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [onTimeUpdate, onEnded]);

    // Play/Pause
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().catch(err => {
                console.error('Error playing video:', err);
                setError('No se pudo reproducir el video.');
            });
            setIsPlaying(true);
        }
    };

    // Saltar tiempo
    const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    };

    // Cambiar volumen
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        const video = videoRef.current;
        if (!video) return;

        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // Mute/Unmute
    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isMuted) {
            video.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            video.volume = 0;
            setIsMuted(true);
        }
    };

    // Cambiar progreso
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progressBar = progressBarRef.current;
        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * duration;
    };

    // Fullscreen
    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (!isFullscreen) {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // Formato de tiempo
    const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Progreso en porcentaje
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full aspect-video cursor-pointer"
                onClick={togglePlay}
                poster={poster}
                preload="metadata"
                crossOrigin="anonymous"
                playsInline
            >
                <source src={src} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
            </video>

            {/* Overlay de carga */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Overlay de error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                    <div className="text-center">
                        <div className="text-red-400 mb-2">⚠️</div>
                        <p className="text-white mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            )}

            {/* Botón de Play grande en el centro */}
            {!isPlaying && !isLoading && !error && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                        <Play className="w-10 h-10 text-black ml-1" />
                    </div>
                </div>
            )}

            {/* Controles */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Barra de progreso */}
                <div
                    ref={progressBarRef}
                    className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-blue-500 rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                    </div>
                </div>

                {/* Controles principales */}
                <div className="flex items-center justify-between text-white">
                    {/* Lado izquierdo: Play/Pause y tiempo */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={togglePlay}
                            className="hover:scale-110 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6" />
                            )}
                        </button>

                        <button
                            onClick={() => skip(-10)}
                            className="hover:scale-110 transition-transform"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => skip(10)}
                            className="hover:scale-110 transition-transform"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        <div className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Lado derecho: Volumen y fullscreen */}
                    <div className="flex items-center space-x-4">
                        {/* Control de volumen */}
                        <div className="flex items-center space-x-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="hover:scale-110 transition-transform"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                                         opacity-0 group-hover/volume:opacity-100 transition-opacity
                                         [&::-webkit-slider-thumb]:appearance-none
                                         [&::-webkit-slider-thumb]:w-3
                                         [&::-webkit-slider-thumb]:h-3
                                         [&::-webkit-slider-thumb]:rounded-full
                                         [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="hover:scale-110 transition-transform"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Atajos de teclado (opcional) */}
            <div className="sr-only">
                Atajos: Espacio = Play/Pause, ← = -10s, → = +10s, F = Pantalla completa
            </div>
        </div>
    );
}




