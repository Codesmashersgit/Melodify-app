import React, { useEffect, useRef, useState } from 'react';
import API_BASE_URL from '../config';

const GaneshSkeleton = ({ onFinish }) => {
    const audioRef = useRef(null);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Start fading out AUDIO after 7.5 seconds
        const audioFadeTimer = setTimeout(() => {
            if (audioRef.current) {
                let vol = 1.0;
                const interval = setInterval(() => {
                    vol -= 0.05;
                    if (vol <= 0) {
                        vol = 0;
                        clearInterval(interval);
                        if (audioRef.current) audioRef.current.pause();
                    }
                    if (audioRef.current) audioRef.current.volume = vol;
                }, 100);
            }
        }, 7500);

        // Start fading out the ENTIRE COMPONENT VISUALLY at 9.0 seconds
        const visualFadeTimer = setTimeout(() => {
            setOpacity(0);
        }, 9000);

        // Finish loader after 10 seconds
        const finishTimer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 10000);

        return () => {
            clearTimeout(audioFadeTimer);
            clearTimeout(visualFadeTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 99999999, // Make sure it's above EVERYTHING
            backgroundColor: '#0b0b12',
            opacity: opacity,
            transition: 'opacity 1s ease-out'
        }}>
            {/* INJECT GLOBAL CSS TO HIDE SIDEBAR-CONTAINER AND EVERYTHING ELSE */}
            <style>{`
                .sidebar-container, .top-nav, .player-bar, .app-sidebar, nav {
                    display: none !important;
                }
                .app-container {
                    grid-template-columns: 1fr !important; /* Remove sidebar column */
                }
                .main-view {
                    width: 100vw !important;
                    height: 100vh !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    max-width: 100vw !important;
                }
                body {
                    overflow: hidden !important;
                    margin: 0;
                    padding: 0;
                }

                @keyframes pulseYellow {
                    0% { filter: drop-shadow(0 0 20px rgba(255, 204, 0, 0.4)); transform: scale(1); }
                    50% { filter: drop-shadow(0 0 60px rgba(255, 204, 0, 1)) drop-shadow(0 0 100px rgba(255, 150, 0, 0.8)); transform: scale(1.05); }
                    100% { filter: drop-shadow(0 0 20px rgba(255, 204, 0, 0.4)); transform: scale(1); }
                }
                @keyframes radiatingRays {
                    0% { transform: rotate(0deg) scale(1); opacity: 0.5; }
                    50% { transform: rotate(180deg) scale(1.5); opacity: 1; }
                    100% { transform: rotate(360deg) scale(1); opacity: 0.5; }
                }
                @keyframes shimmerSweep {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(150%) skewX(-20deg); }
                }
            `}</style>

            <audio 
                ref={audioRef} 
                src={`${API_BASE_URL}/api/stream?id=GGMI3kq4&name=Deva%20Shree%20Ganesha%20(Ganpati%202026)&artist=Ajay-Atul%2C%20Ajay%20Gogavale`}
                autoPlay 
            />
            
            {/* Radiating background rays */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,204,0,0.15) 20deg, transparent 40deg, rgba(255,204,0,0.15) 60deg, transparent 80deg, rgba(255,204,0,0.15) 100deg, transparent 120deg, rgba(255,204,0,0.15) 140deg, transparent 160deg, rgba(255,204,0,0.15) 180deg, transparent 200deg, rgba(255,204,0,0.15) 220deg, transparent 240deg, rgba(255,204,0,0.15) 260deg, transparent 280deg, rgba(255,204,0,0.15) 300deg, transparent 320deg, rgba(255,204,0,0.15) 340deg, transparent 360deg)',
                borderRadius: '50%',
                animation: 'radiatingRays 8s linear infinite',
                zIndex: 0
            }} />
            
            <div style={{
                position: 'relative',
                animation: 'pulseYellow 2s infinite ease-in-out',
                zIndex: 1,
                borderRadius: '50%',
                overflow: 'hidden',
                width: '300px',
                height: '300px',
                boxShadow: '0 0 30px rgba(255, 204, 0, 0.5)'
            }}>
                <img 
                    src="/ganesh_skeleton.jpg" 
                    alt="Loading..." 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                    animation: 'shimmerSweep 2s infinite',
                }} />
            </div>

            <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '40px',
                fontSize: '20px',
                zIndex: 1,
                fontWeight: 'bold',
                letterSpacing: '4px',
                textTransform: 'uppercase'
            }}>Deva Shree Ganesha...</p>
        </div>
    );
}

export default GaneshSkeleton;
