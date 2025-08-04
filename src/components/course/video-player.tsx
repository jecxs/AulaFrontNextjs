// src/components/course/video-player.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { useVideoCheckpoint, useAutoCompleteVideo } from '@/hooks/use-student-courses';

interface VideoPlayerProps {
    videoUrl: string;
    lessonId: string;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
    className?: string;
}

export default function VideoPlayer({
                                        videoUrl,
                                        lessonId,
                                        onProgress,
                                        onComplete,
                                        className = ""
                                    }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Video state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);

    // Progress tracking
    const [lastCheckpoint, setLastCheckpoint] = useState(0);
    const videoCheckpointMutation = useVideoCheckpoint();
    const autoCompleteVideoMutation = useAutoCompleteVideo();

    // Auto-hide controls
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            handleProgressTracking(video.currentTime, video.duration);

            // Update buffered
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('volumechange', handleVolumeChange);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('volumechange', handleVolumeChange);
        };
    }, []);

    const handleProgressTracking = (currentTime: number, duration: number) => {
        if (duration === 0) return;

        const progressPercentage = (currentTime / duration) * 100;
        onProgress?.(progressPercentage);

        // Checkpoint tracking every 25%
        const checkpoints = [25, 50, 75, 85];
        for (const checkpoint of checkpoints) {
            if (progressPercentage >= checkpoint && lastCheckpoint < checkpoint) {
                setLastCheckpoint(checkpoint);

                // Send checkpoint to backend
                videoCheckpointMutation.mutate({
                    lessonId,
                    progressPercentage: checkpoint
                });

                // Auto-complete at 85%
                if (checkpoint === 85) {
                    autoCompleteVideoMutation.mutate(lessonId);
                    onComplete?.();
                }
                break;
            }
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (value: number) => {
        if (!videoRef.current) return;

        const newVolume = value / 100;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;

        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;

        if (!isFullscreen) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!videoRef.current) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                videoRef.current.currentTime = Math.max(0, currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                handleVolumeChange(Math.min(100, volume * 100 + 10));
                break;
            case 'ArrowDown':
                e.preventDefault();
                handleVolumeChange(Math.max(0, volume * 100 - 10));
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                toggleMute();
                break;
        }
    };

    return (
        <div
            className={`relative bg-black ${className}`}
            onMouseMove={handleMouseMove}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            >
                <source src={videoUrl} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
            </video>

            {/* Loading overlay */}
            {duration === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Controls overlay */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}>
                {/* Center play button */}
                {!isPlaying && duration > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={togglePlay}
                            className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                        >
                            <Play className="w-8 h-8 text-white ml-1" />
                        </button>
                    </div>
                )}

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress bar */}
                    <div className="mb-4">
                        <div
                            ref={progressBarRef}
                            className="w-full h-2 bg-white/20 rounded-full cursor-pointer group"
                            onClick={handleSeek}
                        >
                            {/* Buffered progress */}
                            <div
                                className="absolute h-2 bg-white/40 rounded-full"
                                style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
                            />
                            {/* Watched progress */}
                            <div
                                className="h-2 bg-blue-500 rounded-full relative"
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            >
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center space-x-2 group">
                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-blue-400 transition-colors"
                                >
                                    {isMuted || volume === 0 ?
                                        <VolumeX className="w-5 h-5" /> :
                                        <Volume2 className="w-5 h-5" />
                                    }
                                </button>
                                <div className="w-0 group-hover:w-20 overflow-hidden transition-all duration-200">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isMuted ? 0 : volume * 100}
                                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <div className="text-white text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Settings (placeholder) */}
                            <button className="text-white hover:text-blue-400 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
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
    );
}