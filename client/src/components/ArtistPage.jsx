import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';

const ArtistPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack, currentTrack, isPlaying } = usePlayback();
    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/artist/${id}/tracks`);
                setArtist(response.data.artist);
                setTracks(response.data.tracks);
            } catch (error) {
                console.error('Error fetching artist data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtistData();
    }, [id]);

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ padding: '80px 32px', textAlign: 'center' }}>
                <div style={{
                    width: '48px', height: '48px', border: '3px solid var(--glass-border)',
                    borderTopColor: 'var(--melodify-green)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="fade-in" style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--melodify-dim-white)' }}>
                <p>Artist not found</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Artist Banner */}
            <div className="artist-banner">
                <img
                    src={artist.image}
                    alt={artist.name}
                    className="artist-banner-img"
                />
                <div className="artist-banner-info">
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Artist</p>
                    <h1 className="artist-banner-name">{artist.name}</h1>
                    <p style={{ color: 'var(--melodify-dim-white)', fontSize: '0.85rem' }}>{tracks.length} songs</p>
                </div>
            </div>

            {/* Play All Button */}
            <div className="artist-play-section">
                <button
                    onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
                    style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        backgroundColor: 'var(--melodify-green)', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', transition: 'transform 0.2s',
                        boxShadow: '0 8px 16px rgba(29,185,84,0.3)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div style={{
                        width: 0, height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: '14px solid black',
                        marginLeft: '3px',
                    }} />
                </button>
            </div>

            {/* Track List Header */}
            <div className="artist-track-header-wrap">
                <div className="artist-track-header">
                    <span>#</span>
                    <span>Title</span>
                    <span style={{ textAlign: 'right' }}>Duration</span>
                </div>
            </div>

            {/* Track List */}
            <div className="artist-track-list">
                {tracks.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    return (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track, tracks)}
                            className="artist-track-item"
                            style={{
                                color: isCurrentTrack ? 'var(--melodify-green)' : 'var(--melodify-dim-white)',
                            }}
                        >
                            <span style={{ fontSize: '0.9rem', flexShrink: 0, width: '24px' }}>
                                {isCurrentTrack && isPlaying ? (
                                    <span style={{ color: 'var(--melodify-green)', fontSize: '1rem' }}>♫</span>
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                <img
                                    src={track.image}
                                    alt={track.name}
                                    className="artist-track-img"
                                />
                                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '0.88rem',
                                        fontWeight: '500',
                                        color: isCurrentTrack ? 'var(--melodify-green)' : 'var(--melodify-white)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{track.name}</p>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--melodify-dim-white)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{track.artist}</p>
                                </div>
                            </div>
                            <span style={{ textAlign: 'right', fontSize: '0.8rem', flexShrink: 0 }}>
                                {formatDuration(track.duration_ms)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default ArtistPage;
