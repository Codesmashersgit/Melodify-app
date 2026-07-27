import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   MELODIFY AI ORACLE
   A floating cosmic orb that opens a full-screen AI dimension
───────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    id: 'vibe-dna',
    icon: '🧬',
    title: 'Vibe DNA',
    subtitle: 'Your music personality',
    color: '#a855f7',
    glow: '#a855f722',
    angle: 0,
  },
  {
    id: 'therapist',
    icon: '💬',
    title: 'Music Therapist',
    subtitle: 'Healing journey',
    color: '#14b8a6',
    glow: '#14b8a622',
    angle: 60,
  },
  {
    id: 'story',
    icon: '📖',
    title: 'Story Mode',
    subtitle: 'Cinematic playlist',
    color: '#ff6b35',
    glow: '#ff6b3522',
    angle: 120,
  },
  {
    id: 'emotion',
    icon: '🎭',
    title: 'Emotion Mirror',
    subtitle: 'Camera → music',
    color: '#ec4899',
    glow: '#ec489922',
    angle: 180,
  },
  {
    id: 'hum',
    icon: '🎼',
    title: 'Hum Search',
    subtitle: 'Hum any song',
    color: '#3b82f6',
    glow: '#3b82f622',
    angle: 240,
  },
  {
    id: 'collab',
    icon: '🧩',
    title: 'Collab Playlist',
    subtitle: 'Merge two tastes',
    color: '#22c55e',
    glow: '#22c55e22',
    angle: 300,
  },
];

export default function AIOrb({ onSelectFeature }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [orbPulse, setOrbPulse] = useState(false);
  const [particles, setParticles] = useState([]);
  const orbRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const ps = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      color: FEATURES[i % FEATURES.length].color,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setParticles(ps);
  }, []);

  // Orb pulse effect
  useEffect(() => {
    const iv = setInterval(() => setOrbPulse(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  const handleFeatureClick = (feature) => {
    setOpen(false);
    setTimeout(() => onSelectFeature(feature.id), 300);
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(-4px) rotate(240deg); }
        }
        @keyframes orbRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbRingReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-120px) translateX(var(--tx)) scale(0.3); opacity: 0; }
        }
        @keyframes portalOpen {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes featureOrb {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes auroraShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 20px #a855f788, 0 0 40px #a855f744, 0 0 80px #a855f722; }
          50% { box-shadow: 0 0 30px #14b8a6aa, 0 0 60px #14b8a655, 0 0 120px #14b8a622; }
        }
        @keyframes textGlitch {
          0%, 100% { clip-path: inset(0 0 100% 0); }
          20% { clip-path: inset(0 0 60% 0); opacity: 0.8; }
          40% { clip-path: inset(30% 0 40% 0); opacity: 0.6; }
          60% { clip-path: inset(60% 0 0 0); opacity: 0.9; }
          80% { clip-path: inset(80% 0 0 0); opacity: 0.7; }
        }
        @keyframes ripple {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(2.5); opacity: 0; }
        }
        .ai-feature-portal:hover {
          transform: scale(1.1) !important;
        }
        .ai-orb-btn:hover .orb-core {
          filter: brightness(1.3);
        }
      `}</style>

      {/* ── Floating Orb Button ── */}
      <div
        ref={orbRef}
        className="ai-orb-btn"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 58,
          height: 58,
          cursor: 'pointer',
          zIndex: 9998,
          userSelect: 'none',
        }}
      >
        {/* Ripple rings */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1.5px solid ${i % 2 ? '#a855f7' : '#14b8a6'}66`,
            animation: `ripple ${2 + i * 0.7}s ease-out ${i * 0.4}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Rotating outer ring */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '1.5px dashed #a855f766',
          animation: 'orbRing 6s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: -14, borderRadius: '50%',
          border: '1px dashed #14b8a644',
          animation: 'orbRingReverse 10s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Core orb */}
        <div className="orb-core" style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #3b82f6, #14b8a6)',
          backgroundSize: '200% 200%',
          animation: 'orbFloat 4s ease-in-out infinite, breathe 3s ease-in-out infinite, auroraShift 4s ease infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 0 20px #a855f788, 0 0 40px #a855f744',
          transition: 'filter 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: 'scanLine 2s linear infinite',
            pointerEvents: 'none',
          }} />
          🤖
        </div>
      </div>

      {/* ── Full Screen Portal Overlay ── */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'radial-gradient(ellipse at 50% 50%, #0d0020 0%, #000010 60%, #000000 100%)',
          animation: 'portalOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden',
        }}>

          {/* ── Stars ── */}
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              borderRadius: '50%',
              background: '#ffffff',
              animation: `starTwinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* ── Aurora Background ── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 70% 40% at 20% 20%, #a855f714 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 80%, #14b8a614 0%, transparent 60%),
              radial-gradient(ellipse 80% 30% at 50% 100%, #3b82f610 0%, transparent 50%),
              radial-gradient(ellipse 50% 60% at 0% 50%, #ec489910 0%, transparent 50%)
            `,
          }} />

          {/* ── Floating Particles ── */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, bottom: 0,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              '--tx': `${(Math.random() - 0.5) * 80}px`,
              animation: `particleFloat ${p.duration}s ease-out ${p.delay}s infinite`,
              pointerEvents: 'none',
              opacity: p.opacity,
            }} />
          ))}

          {/* ── Grid overlay (holographic effect) ── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />

          {/* ── Close button ── */}
          <button onClick={() => setOpen(false)} style={{
            position: 'absolute', top: 24, right: 24,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', borderRadius: '50%',
            width: 44, height: 44, fontSize: '1.2rem',
            cursor: 'pointer', zIndex: 10,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >✕</button>

          {/* ── Center content ── */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
              <div style={{
                fontSize: '0.75rem', letterSpacing: '0.4em',
                color: '#a855f7', textTransform: 'uppercase', marginBottom: 10,
                fontWeight: 600,
              }}>
                ◆ MELODIFY AI ORACLE ◆
              </div>
              <h1 style={{
                margin: 0, fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px',
                background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 40%, #14b8a6 70%, #ffffff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'auroraShift 4s ease infinite',
              }}>
                Choose Your<br />Dimension
              </h1>
              <p style={{
                margin: '14px 0 0', color: 'rgba(255,255,255,0.4)',
                fontSize: '0.95rem', letterSpacing: '0.02em',
              }}>
                6 AI-powered experiences found nowhere else
              </p>
            </div>

            {/* ── Feature Grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              maxWidth: 720,
              width: '100%',
            }}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.id}
                  className="ai-feature-portal"
                  onClick={() => handleFeatureClick(f)}
                  onMouseEnter={() => setHovered(f.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative', cursor: 'pointer', overflow: 'hidden',
                    borderRadius: 20, padding: '24px 16px',
                    background: hovered === f.id
                      ? `linear-gradient(135deg, ${f.color}22, ${f.color}08)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hovered === f.id ? f.color + '66' : 'rgba(255,255,255,0.08)'}`,
                    backdropFilter: 'blur(16px)',
                    textAlign: 'center',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: hovered === f.id ? `0 8px 40px ${f.color}33, inset 0 0 20px ${f.color}08` : 'none',
                    animation: `featureOrb ${3 + i * 0.3}s ease-in-out ${i * 0.1}s infinite`,
                    animationPlayState: hovered === f.id ? 'paused' : 'running',
                  }}
                >
                  {/* Corner accent */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 60, height: 60,
                    background: `radial-gradient(circle at top right, ${f.color}22, transparent 60%)`,
                    pointerEvents: 'none',
                  }} />

                  {/* Icon ring */}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
                    background: `radial-gradient(circle, ${f.color}22 0%, transparent 70%)`,
                    border: `1.5px solid ${f.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: hovered === f.id ? `0 0 20px ${f.color}55` : 'none',
                    transition: 'all 0.25s',
                    position: 'relative',
                  }}>
                    {/* Rotating ring on hover */}
                    {hovered === f.id && (
                      <div style={{
                        position: 'absolute', inset: -6, borderRadius: '50%',
                        border: `1px dashed ${f.color}88`,
                        animation: 'orbRing 2s linear infinite',
                      }} />
                    )}
                    {f.icon}
                  </div>

                  <div style={{
                    fontWeight: 700, fontSize: '0.95rem', color: '#fff',
                    marginBottom: 4, transition: 'color 0.2s',
                    color: hovered === f.id ? f.color : '#fff',
                  }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)' }}>
                    {f.subtitle}
                  </div>

                  {/* Tap arrow hint */}
                  {hovered === f.id && (
                    <div style={{
                      position: 'absolute', bottom: 10, right: 14,
                      color: f.color, fontSize: '0.8rem', fontWeight: 700,
                      opacity: 0.8,
                    }}>→</div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom tagline */}
            <p style={{
              marginTop: 36, color: 'rgba(255,255,255,0.18)',
              fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              Powered by Gemini 2.5 Flash · Exclusive to Melodify
            </p>
          </div>
        </div>
      )}
    </>
  );
}
