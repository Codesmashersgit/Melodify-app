import React from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaChevronDown, FaHeart, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { usePlayback } from '../context/PlaybackContext';

const FullPlayer = () => {
    const {
        currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
        currentTime, duration, volume, setVolume, formatTime, seekTo, toggleExpand, isExpanded
    } = usePlayback();

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
                        filter: 'blur(80px) brightness(0.4)',
                        transform: 'scale(1.2)' 
                    }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, #0b0b12 100%)' }}></div>
            </div>

            {/* 2. Top Navigation */}
            <div style={{ position: 'relative', zIndex: 10, padding: '30px 40px', display: 'flex', justifyContent: 'flex-start' }}>
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
            </div>

            {/* 3. Main Modern Content Stack - Ultra Compact for long titles */}
            <div style={{ 
                position: 'relative', zIndex: 10, flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 40px 30px 40px',
                maxHeight: 'calc(100vh - 120px)' // Lock height to prevent overflow
            }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {/* Floating Square Album Art - Smaller 250px */}
                    <div style={{ 
                        width: '250px', height: '250px', 
                        marginBottom: '20px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <img src={currentTrack.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={currentTrack.name} />
                    </div>

                    {/* Track Details - Ultra Slimmed */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', width: '100%', maxWidth: '85%' }}>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '800', 
                            color: 'white', 
                            letterSpacing: '-0.3px', 
                            margin: '0 0 4px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 1, // Single line now for maximum safety
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

                {/* Integrated Control Panel - Pinned to bottom-vibe */}
                <div style={{ width: '100%', maxWidth: '480px' }}>
                    
                    {/* Centered Large Controls */}
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
                            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'white', borderRadius: '10px' }}></div>
                            <div style={{ position: 'absolute', left: `${progressPercentage}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: 'white', borderRadius: '50%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', minWidth: '40px' }}>{formatTime(duration)}</span>
                    </div>

                    {/* Volume Slider - Fixed Pos Vibe */}
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
                                width: '110px', height: '3px', cursor: 'pointer', accentColor: 'white',
                                opacity: 0.5
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};





export default FullPlayer;
