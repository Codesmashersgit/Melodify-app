import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';

const ShowAll = () => {
    const { category } = useParams();
    const { artists, albums, tracks, playTrack, playArtistTracks } = usePlayback();
    const navigate = useNavigate();

    // For albums: load album songs lazily on hover
    const [albumSongsCache, setAlbumSongsCache] = useState({});
    const [loadingAlbumId, setLoadingAlbumId] = useState(null);

    let data = [];
    let title = '';
    let subtitle = '';

    if (category === 'artists') {
        data = artists;
        title = 'Popular Artists';
        subtitle = `${artists.length} artists`;
    } else if (category === 'albums') {
        data = albums;
        title = 'Popular Albums';
        subtitle = `${albums.length} albums`;
    } else if (category === 'tracks') {
        data = tracks;
        title = 'Top Hits';
        subtitle = `${tracks.length} songs`;
    }

    // Fetch album tracks and play instantly
    const handlePlayAlbum = async (album, e) => {
        e.stopPropagation();
        if (albumSongsCache[album.id]) {
            const songs = albumSongsCache[album.id];
            if (songs.length > 0) playTrack(songs[0], songs);
            return;
        }
        setLoadingAlbumId(album.id);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/album/${album.id}`);
            const songs = res.data.tracks.filter(t => t.preview_url);
            setAlbumSongsCache(prev => ({ ...prev, [album.id]: songs }));
            if (songs.length > 0) playTrack(songs[0], songs);
        } catch (err) {
            console.error('Failed to fetch album tracks:', err);
        } finally {
            setLoadingAlbumId(null);
        }
    };

    const handlePlayTrack = (track, e) => {
        e.stopPropagation();
        if (track.preview_url) playTrack(track, tracks);
    };

    const handlePlayArtist = (artistId, e) => {
        e.stopPropagation();
        playArtistTracks(artistId);
    };

    return (
        <div className='fade-in' style={{ paddingBottom: '120px' }}>

            {/* Header */}
            <div style={{
                padding: '32px 40px 24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '8px',
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', padding: 0,
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                    <FaArrowLeft /> Back
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '6px' }}>{title}</h1>
                <p style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem' }}>{subtitle}</p>
            </div>

            {/* === TRACKS — Table View === */}
            {category === 'tracks' && (
                <div style={{ padding: '0 40px' }}>
                    {/* Play All button */}
                    {tracks.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <button
                                onClick={() => playTrack(tracks[0], tracks)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: '#1DB954', border: 'none', color: 'black',
                                    padding: '14px 28px', borderRadius: '50px',
                                    fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                                    transition: 'transform 0.2s, background 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = '#1ed760'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#1DB954'; }}
                            >
                                <FaPlay /> Play All
                            </button>
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--melodify-dim-white)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                <th style={{ textAlign: 'left', padding: '10px 16px 10px 0', width: '40px' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '10px 0' }}>TITLE</th>
                                <th style={{ textAlign: 'left', padding: '10px 0' }}>ALBUM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((track, i) => (
                                <tr
                                    key={track.id}
                                    onClick={() => playTrack(track, tracks)}
                                    style={{ cursor: 'pointer', borderRadius: '8px', transition: 'background 0.15s' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        const btn = e.currentTarget.querySelector('.row-play');
                                        if (btn) btn.style.opacity = '1';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        const btn = e.currentTarget.querySelector('.row-play');
                                        if (btn) btn.style.opacity = '0';
                                    }}
                                >
                                    <td style={{ padding: '10px 16px 10px 8px', color: 'var(--melodify-dim-white)', position: 'relative' }}>
                                        <span className="row-num" style={{ fontSize: '0.9rem' }}>{i + 1}</span>
                                        <div className="row-play" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0, transition: 'opacity 0.15s' }}>
                                            <FaPlay style={{ color: 'white', fontSize: '11px' }} />
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <img src={track.image} alt={track.name} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{track.name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{track.artist}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 0', color: 'var(--melodify-dim-white)', fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {track.album || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* === ALBUMS — Grid with play overlay === */}
            {category === 'albums' && (
                <div style={{ padding: '16px 40px 0' }}>
                    <div className='grid-container'>
                        {albums.map(album => (
                            <div
                                key={album.id}
                                className='card'
                                onClick={() => navigate(`/album/${album.id}`)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img src={album.image} alt={album.name} className='card-image' style={{ borderRadius: '10px' }} />
                                    {/* Spinner or play overlay */}
                                    <div
                                        className='play-button-overlay'
                                        onClick={(e) => handlePlayAlbum(album, e)}
                                        style={{ bottom: '8px', right: '8px' }}
                                    >
                                        {loadingAlbumId === album.id ? (
                                            <div style={{ width: '18px', height: '18px', border: '2px solid black', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        ) : (
                                            <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
                                        )}
                                    </div>
                                </div>
                                <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>{album.name}</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.artist}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === ARTISTS — Circular Grid === */}
            {category === 'artists' && (
                <div style={{ padding: '16px 40px 0' }}>
                    <div className='grid-container'>
                        {artists.map(artist => (
                            <div
                                key={artist.id}
                                className='card'
                                onClick={() => navigate(`/artist/${artist.id}`)}
                            >
                                <img src={artist.image} alt={artist.name} className='card-image' style={{ borderRadius: '50%' }} />
                                <h4 style={{ marginBottom: '4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist.name}</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--melodify-dim-white)', textAlign: 'center' }}>Artist</p>
                                <div className='play-button-overlay' onClick={(e) => handlePlayArtist(artist.id, e)}>
                                    <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowAll;
