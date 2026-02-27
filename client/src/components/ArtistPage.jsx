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
            <div style={{
                padding: '48px 32px 32px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '24px',
                background: 'linear-gradient(180deg, rgba(29,185,84,0.3) 0%, rgba(18,18,18,1) 100%)',
            }}>
                <img
                    src={artist.image}
                    alt={artist.name}
                    style={{
                        width: '200px', height: '200px', borderRadius: '50%',
                        objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                />
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Artist</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '8px' }}>{artist.name}</h1>
                    <p style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem' }}>{tracks.length} songs</p>
                </div>
            </div>

            {/* Play All Button */}
            <div style={{ padding: '24px 32px 8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
                    style={{
                        width: '56px', height: '56px', borderRadius: '50%',
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
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: '16px solid black',
                        marginLeft: '3px',
                    }} />
                </button>
            </div>

            {/* Track List Header */}
            <div style={{ padding: '16px 32px 0' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    padding: '0 16px 8px',
                    borderBottom: '1px solid var(--glass-border)',
                    color: 'var(--melodify-dim-white)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}>
                    <span>#</span>
                    <span>Title</span>
                    <span style={{ textAlign: 'right' }}>Duration</span>
                </div>
            </div>

            {/* Track List */}
            <div style={{ padding: '8px 32px 100px' }}>
                {tracks.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    return (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track, tracks)}
                            className="song-item"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr 100px',
                                padding: '10px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: isCurrentTrack ? 'var(--melodify-green)' : 'var(--melodify-dim-white)',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <span style={{ fontSize: '0.95rem' }}>
                                {isCurrentTrack && isPlaying ? (
                                    <span style={{ color: 'var(--melodify-green)', fontSize: '1rem' }}>♫</span>
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                <img
                                    src={track.image}
                                    alt={track.name}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '4px',
                                        objectFit: 'cover', flexShrink: 0,
                                    }}
                                />
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        color: isCurrentTrack ? 'var(--melodify-green)' : 'var(--melodify-white)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{track.name}</p>
                                    <p style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--melodify-dim-white)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{track.artist}</p>
                                </div>
                            </div>
                            <span style={{ textAlign: 'right', fontSize: '0.85rem' }}>
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
