import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaChevronDown, FaHeart, FaVolumeUp, FaVolumeMute, FaFilm, FaMusic } from "react-icons/fa";
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';

const FullPlayer = () => {
    const {
        currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
        currentTime, duration, volume, setVolume, formatTime, seekTo, toggleExpand, isExpanded
    } = usePlayback();

    // Video mode state
    const [mode, setMode] = useState('audio');
    const [videoId, setVideoId] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const iframeRef = useRef(null);
    const videoContainerRef = useRef(null);

    if (!isExpanded || !currentTrack) return null;

    const progressPercentage = (currentTime / duration) * 100 || 0;

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedProgress = x / rect.width;
        seekTo(clickedProgress * duration);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    // Prefetch video ID when track changes
    useEffect(() => {
        if (!currentTrack) return;
        let isMounted = true;
        
        const fetchVideo = async () => {
            try {
                const q = `${currentTrack.name} ${currentTrack.artist}`;
                const res = await axios.get(`${API_BASE_URL}/api/video?q=${encodeURIComponent(q)}`);
                if (isMounted && res.data.videoId) {
                    setVideoId(res.data.videoId);
                }
            } catch (e) {
                console.log('Prefetch video failed', e);
            }
        };
        
        fetchVideo();
        
        return () => { isMounted = false; };
    }, [currentTrack]);

    const switchMode = async (newMode) => {
        if (newMode === mode) return;

        if (newMode === 'video') {
            // Pause audio first
            if (isPlaying) togglePlay();

            setMode('video');
            setVideoError(null);
            
            if (!videoId) {
                setVideoLoading(true);
                try {
                    const q = `${currentTrack.name} ${currentTrack.artist}`;
                    const res = await axios.get(`${API_BASE_URL}/api/video?q=${encodeURIComponent(q)}`);
                    setVideoId(res.data.videoId);
                } catch (e) {
                    setVideoError('Music video nahi mila 😔');
                    setMode('audio');
                } finally {
                    setVideoLoading(false);
                }
            }

            // Request true browser fullscreen after video is ready
            setTimeout(() => {
                if (videoContainerRef.current?.requestFullscreen) {
                    videoContainerRef.current.requestFullscreen().catch(() => {});
                }
            }, 300);
            
        } else {
            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            setMode('audio');
        }
    };

    // In video mode, render a completely different full-screen layout
    if (mode === 'video') {
        return (
            <div
                ref={videoContainerRef}
                style={{
                    position: 'fixed', inset: 0, zIndex: 999999,
                    background: '#000',
                    display: 'flex', flexDirection: 'column',
                    animation: 'slideUpCenter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
            >
                {/* Full-screen video area */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {videoLoading && (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                border: '3px solid rgba(29,185,84,0.3)',
                                borderTop: '3px solid #1DB954',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 16px auto',
                            }} />
                            <p style={{ fontSize: '1rem' }}>Video dhundh raha hun...</p>
                        </div>
                    )}
                    {videoError && (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' }}>
                            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>😔</p>
                            <p style={{ fontSize: '1rem' }}>{videoError}</p>
                        </div>
                    )}
                    {videoId && !videoLoading && (
                        <iframe
                            ref={iframeRef}
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                            title="Music Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
                        />
                    )}
                </div>

                {/* Overlay controls at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    padding: '40px 30px 24px 30px',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    zIndex: 10,
                }}>
                    {/* Track info */}
                    <div style={{ flex: 1, marginRight: '20px' }}>
                        <h2 style={{ color: 'white', fontWeight: '800', fontSize: '1.3rem', margin: '0 0 4px 0',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentTrack.name}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentTrack.artist.split(',').slice(0, 3).join(', ')}
                        </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Switch to Audio */}
                        <button
                            onClick={() => switchMode('audio')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '9px 18px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                                fontWeight: '600', fontSize: '0.85rem',
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,185,84,0.7)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <FaMusic style={{ fontSize: '12px' }} /> Audio
                        </button>

                        {/* Close full player */}
                        <button
                            onClick={toggleExpand}
                            style={{
                                width: '42px', height: '42px', borderRadius: '50%', border: 'none',
                                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                color: 'white', cursor: 'pointer', fontSize: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <FaChevronDown />
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes slideUpCenter { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ── AUDIO MODE layout (default) ──
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#0b0b12',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUpCenter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            overflow: 'hidden'
        }}>
            {/* 1. Immersive Blurred Atmosphere BG */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <img
                    src={currentTrack.image}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(80px) brightness(0.3)',
                        transform: 'scale(1.2)'
                    }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, #0b0b12 100%)' }}></div>
            </div>

            {/* 2. Top Navigation */}
            <div style={{ position: 'relative', zIndex: 10, padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={toggleExpand}
                    style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white',
                        width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
                    }}
                >
                    <FaChevronDown style={{ fontSize: '20px' }} />
                </button>

                {/* Audio / Video Toggle */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '30px',
                    padding: '4px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gap: '2px',
                }}>
                    <button
                        onClick={() => switchMode('audio')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.85rem',
                            background: '#1DB954',
                            color: 'white',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        <FaMusic style={{ fontSize: '12px' }} />
                        Audio
                    </button>
                    <button
                        onClick={() => switchMode('video')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '8px 20px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.85rem',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.5)',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        <FaFilm style={{ fontSize: '12px' }} />
                        Video
                    </button>
                </div>

                <div style={{ width: '50px' }} />
            </div>

            {/* 3. Main Content */}
            <div style={{
                position: 'relative', zIndex: 10, flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 40px 30px 40px',
                maxHeight: 'calc(100vh - 120px)'
            }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                    {/* ── AUDIO MODE: Album Art ── */}
                    <div style={{
                        width: '260px', height: '260px',
                        marginBottom: '24px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'fadeInScale 0.4s ease',
                    }}>
                        <img src={currentTrack.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={currentTrack.name} />
                    </div>

                    {/* Track Details */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', width: '100%', maxWidth: '85%' }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: 'white',
                            letterSpacing: '-0.3px',
                            margin: '0 0 4px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.2'
                        }} title={currentTrack.name}>
                            {currentTrack.name}
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.4)',
                            margin: 0,
                            fontWeight: '500',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }} title={currentTrack.artist}>
                            {currentTrack.artist.split(',').length > 3
                                ? currentTrack.artist.split(',').slice(0, 3).join(', ') + " & more"
                                : currentTrack.artist}
                        </p>
                    </div>
                </div>

                {/* Integrated Control Panel — only shown in audio mode */}
                {mode === 'audio' && (
                    <div style={{ width: '100%', maxWidth: '480px' }}>
                        {/* Playback Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginBottom: '25px' }}>
                            <FaRandom style={{ fontSize: '16px', opacity: 0.4, cursor: 'pointer' }} />
                            <FaStepBackward
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                style={{ fontSize: '24px', color: 'white', cursor: 'pointer' }}
                            />
                            <div
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                style={{
                                    width: '68px', height: '68px', background: 'white', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    boxShadow: '0 5px 20px rgba(255,255,255,0.1)'
                                }}
                            >
                                {isPlaying ? (
                                    <FaPause style={{ color: 'black', fontSize: '22px' }} />
                                ) : (
                                    <FaPlay style={{ color: 'black', fontSize: '22px', marginLeft: '3px' }} />
                                )}
                            </div>
                            <FaStepForward
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                style={{ fontSize: '24px', color: 'white', cursor: 'pointer' }}
                            />
                            <FaUndoAlt style={{ fontSize: '16px', opacity: 0.4, cursor: 'pointer' }} />
                        </div>

                        {/* Progress Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', minWidth: '40px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
                            <div
                                onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
                                style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}
                            >
                                <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#1DB954', borderRadius: '10px' }}></div>
                                <div style={{ position: 'absolute', left: `${progressPercentage}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', background: 'white', borderRadius: '50%', boxShadow: '0 0 6px rgba(255,255,255,0.4)' }}></div>
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', minWidth: '40px' }}>{formatTime(duration)}</span>
                        </div>

                        {/* Volume Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            {volume === 0 ? <FaVolumeMute style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }} /> : <FaVolumeUp style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }} />}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '110px', height: '3px', cursor: 'pointer', accentColor: '#1DB954',
                                    opacity: 0.7
                                }}
                            />
                        </div>
                    </div>
                )}


            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideUpCenter {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FullPlayer;
