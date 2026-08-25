import React from 'react';

// ── CSS animation injected once ──────────────────────────────────
export const SkeletonStyles = () => (
    <style>{`
        @keyframes skeleton-shimmer {
            0%   { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        .skeleton-block {
            background: #181820;
            background-image: linear-gradient(
                to right,
                #181820 0%,
                rgba(255, 255, 255, 0.06) 20%,
                #181820 40%,
                #181820 100%
            );
            background-size: 1000px 100%;
            background-repeat: no-repeat;
            animation: skeleton-shimmer 2s infinite linear forwards;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
    `}</style>
);

// ── Single shimmer block ──────────────────────────────────────────
const SkeletonBlock = ({ style = {} }) => (
    <div className="skeleton-block" style={style} />
);

// ── ONE skeleton card — matches .card exactly
const CardSkeletonItem = () => (
    <div className="card" style={{ cursor: 'default' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', marginBottom: '16px' }}>
            <SkeletonBlock style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid rgba(29, 185, 84, 0.15)',
                boxSizing: 'border-box',
            }} />
        </div>
        {/* Title line */}
        <SkeletonBlock style={{ width: '80%', height: '14px', borderRadius: '6px', marginBottom: '12px' }} />
        {/* Subtitle line */}
        <SkeletonBlock style={{ width: '55%', height: '11px', borderRadius: '6px' }} />
    </div>
);

// ── ONE square album skeleton card ───────────────────────────────
const AlbumSkeletonItem = () => (
    <div className="card" style={{ cursor: 'default' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', marginBottom: '12px' }}>
            <SkeletonBlock style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                boxSizing: 'border-box',
            }} />
        </div>
        {/* Title */}
        <SkeletonBlock style={{ width: '85%', height: '14px', borderRadius: '6px', marginBottom: '10px' }} />
        {/* Artist */}
        <SkeletonBlock style={{ width: '60%', height: '11px', borderRadius: '6px' }} />
    </div>
);

// ── Row of circular skeletons using the SAME grid-container class ─
export const CardSkeletonRow = ({ count = 5 }) => (
    <div className="grid-container">
        {Array.from({ length: count }).map((_, i) => <CardSkeletonItem key={i} />)}
    </div>
);

// ── Row of album (square) skeletons ──────────────────────────────
export const AlbumSkeletonRow = ({ count = 5 }) => (
    <div className="grid-container">
        {Array.from({ length: count }).map((_, i) => <AlbumSkeletonItem key={i} />)}
    </div>
);

// ── Full section: header + skeleton cards ─────────────────────────
export const SectionSkeleton = ({ count = 5, square = false }) => (
    <div style={{ marginBottom: '36px', padding: '0 16px' }}>
        {/* Section title skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <SkeletonBlock style={{ width: '200px', height: '20px', borderRadius: '6px' }} />
            <SkeletonBlock style={{ width: '130px', height: '12px', borderRadius: '6px' }} />
        </div>
        {square ? <AlbumSkeletonRow count={count} /> : <CardSkeletonRow count={count} />}
    </div>
);

// ── Full App Skeleton (used during Auth Loading) ───────────────────
export const AppSkeleton = () => (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', overflow: 'hidden' }}>
        {/* Sidebar Skeleton */}
        <div style={{ width: '250px', backgroundColor: '#0b0b12', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <SkeletonBlock style={{ width: '150px', height: '40px', borderRadius: '8px', marginBottom: '20px' }} />
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} style={{ width: '80%', height: '20px', borderRadius: '4px' }} />
            ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* TopNav Skeleton */}
            <div style={{ height: '70px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0b0b12' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <SkeletonBlock style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <SkeletonBlock style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <SkeletonBlock style={{ width: '120px', height: '36px', borderRadius: '18px' }} />
                    <SkeletonBlock style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                </div>
            </div>
            
            {/* Body Skeletons */}
            <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                <SectionSkeleton count={5} square={false} />
                <SectionSkeleton count={5} square={true} />
            </div>
        </div>
        <SkeletonStyles />
    </div>
);

export default SkeletonBlock;
