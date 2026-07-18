import React from 'react';

// ── CSS animation injected once ──────────────────────────────────
export const SkeletonStyles = () => (
    <style>{`
        @keyframes skeleton-shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .skeleton-block {
            background: linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%);
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.4s infinite;
        }
    `}</style>
);

// ── Single shimmer block ──────────────────────────────────────────
const SkeletonBlock = ({ style = {} }) => (
    <div className="skeleton-block" style={style} />
);

// ── ONE skeleton card — matches .card exactly (circular image + 2 text lines)
const CardSkeletonItem = () => (
    <div style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    }}>
        {/* Circular image — matches .card-image (100% width, 50% radius, green border) */}
        <SkeletonBlock style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '50%',
            border: '3px solid rgba(29, 185, 84, 0.25)',
            marginBottom: '16px',
            boxSizing: 'border-box',
        }} />
        {/* Title line */}
        <SkeletonBlock style={{ width: '80%', height: '13px', borderRadius: '6px', marginBottom: '8px' }} />
        {/* Subtitle line */}
        <SkeletonBlock style={{ width: '55%', height: '10px', borderRadius: '6px' }} />
    </div>
);

// ── ONE square album skeleton card ───────────────────────────────
const AlbumSkeletonItem = () => (
    <div style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    }}>
        {/* Square image */}
        <SkeletonBlock style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '12px',
            marginBottom: '12px',
            boxSizing: 'border-box',
        }} />
        {/* Title */}
        <SkeletonBlock style={{ width: '80%', height: '13px', borderRadius: '6px', marginBottom: '8px' }} />
        {/* Artist */}
        <SkeletonBlock style={{ width: '55%', height: '10px', borderRadius: '6px' }} />
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
