import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowLeft, FaPlay, FaPause, FaTrash, FaDownload, FaMusic } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';
import { getDownloadedTracks, deleteDownloadedTrack, getTrackBlobUrl } from '../services/WebDownloadService';

const Downloads = () => {
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();

    const fetchDownloads = useCallback(async () => {
        setLoading(true);
        const tracks = await getDownloadedTracks();
        setDownloads(tracks.sort((a, b) => b.downloadedAt - a.downloadedAt));
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDownloads();
    }, [fetchDownloads]);

    const handlePlay = async (track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }
        // Get local blob URL and play it
        const blobUrl = await getTrackBlobUrl(track.id);
        const offlineTrack = { ...track, preview_url: blobUrl || track.preview_url };
        playTrack(offlineTrack, downloads.map(d => ({ ...d })));
    };

    const handleDelete = async (trackId, e) => {
        e.stopPropagation();
        await deleteDownloadedTrack(trackId);
        setDownloads(prev => prev.filter(t => t.id !== trackId));
    };

    const formatDate = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0d1117 0%, #0b0b12 100%)',
            color: 'white',
            padding: '32px 24px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1DB954, #0f7a34)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <FaDownload size={22} color="white" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Downloads</h1>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        {downloads.length} song{downloads.length !== 1 ? 's' : ''} saved for offline
                    </p>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{
                            height: '70px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                    ))}
                </div>
            ) : downloads.length === 0 ? (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '50vh', gap: '16px', opacity: 0.6
                }}>
                    <FaMusic size={60} color="rgba(255,255,255,0.3)" />
                    <h3 style={{ margin: 0, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>No downloads yet</h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: '300px' }}>
                        Click the ⋮ menu on any song and select "Save Offline" to listen without internet.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {downloads.map((track, idx) => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                            <div
                                key={track.id}
                                onClick={() => handlePlay(track)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                                    background: isCurrent ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.03)',
                                    border: isCurrent ? '1px solid rgba(29,185,84,0.3)' : '1px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                {/* Index / Play Icon */}
                                <span style={{ color: isCurrent ? '#1DB954' : 'rgba(255,255,255,0.4)', width: '20px', textAlign: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                                    {isCurrent && isPlaying
                                        ? <FaPause size={12} color="#1DB954" />
                                        : isCurrent
                                            ? <FaPlay size={12} color="#1DB954" />
                                            : idx + 1}
                                </span>

                                {/* Art */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <img
                                        src={track.image}
                                        alt={track.name}
                                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FaDownload size={7} color="black" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        color: isCurrent ? '#1DB954' : 'white'
                                    }}>{track.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                        {track.artist} · Saved {formatDate(track.downloadedAt)}
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={(e) => handleDelete(track.id, e)}
                                    title="Remove download"
                                    style={{
                                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                                        cursor: 'pointer', padding: '8px', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Downloads;
