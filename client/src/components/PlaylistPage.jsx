import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { usePlayback } from '../context/PlaybackContext';
import { FaPlay, FaTrash, FaMusic } from 'react-icons/fa';

const PlaylistPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack } = usePlayback();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/user/playlists/${id}`);
            setPlaylist(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (song) => {
        const formattedSong = {
            id: song.song_id,
            name: song.song_name,
            artist: song.song_artist,
            image: song.song_image,
            preview_url: song.song_preview,
        };
        const allSongs = playlist.songs.map(s => ({
            id: s.song_id,
            name: s.song_name,
            artist: s.song_artist,
            image: s.song_image,
            preview_url: s.song_preview,
        }));
        playTrack(formattedSong, allSongs);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ color: 'var(--melodify-dim-white)' }}>Loading playlist...</div>
        </div>
    );

    if (!playlist) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ color: 'var(--melodify-dim-white)' }}>Playlist not found.</div>
        </div>
    );

    return (
        <div className='fade-in'>
            {/* Playlist Header */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(99, 60, 180, 0.5) 0%, transparent 100%)',
                padding: '40px 40px 30px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '30px',
                flexWrap: 'wrap',
            }}>
                {/* Playlist Cover Art (mosaic or solid icon) */}
                <div style={{
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                }}>
                    {playlist.songs && playlist.songs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%' }}>
                            {playlist.songs.slice(0, 4).map((s, i) => (
                                <img key={i} src={s.song_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ))}
                            {[...Array(Math.max(0, 4 - playlist.songs.length))].map((_, i) => (
                                <div key={`empty-${i}`} style={{ background: 'rgba(255,255,255,0.05)' }} />
                            ))}
                        </div>
                    ) : (
                        <FaMusic style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.4)' }} />
                    )}
                </div>

                <div>
                    <p style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--melodify-dim-white)', marginBottom: '8px' }}>PLAYLIST</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>{playlist.name}</h1>
                    <p style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem' }}>
                        {playlist.songs?.length || 0} song{playlist.songs?.length !== 1 ? 's' : ''}
                    </p>
                    {playlist.songs?.length > 0 && (
                        <button
                            className='btn-premium'
                            style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 30px', fontSize: '1rem' }}
                            onClick={() => handlePlay(playlist.songs[0])}
                        >
                            <FaPlay /> Play All
                        </button>
                    )}
                </div>
            </div>

            {/* Song List */}
            <div style={{ padding: '20px 40px' }}>
                {playlist.songs?.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--melodify-dim-white)',
                    }}>
                        <FaMusic style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>This playlist is empty</p>
                        <p style={{ fontSize: '0.85rem' }}>Play a song and click the + button to add it here</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--melodify-dim-white)', fontSize: '0.85rem' }}>
                                <th style={{ textAlign: 'left', padding: '8px 16px 8px 0', width: '40px' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '8px 0' }}>TITLE</th>
                                <th style={{ textAlign: 'left', padding: '8px 0', display: 'none' }} className='hide-mobile'>ARTIST</th>
                            </tr>
                        </thead>
                        <tbody>
                            {playlist.songs.map((song, index) => (
                                <tr
                                    key={song.id}
                                    style={{
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => handlePlay(song)}
                                >
                                    <td style={{ padding: '10px 16px 10px 0', color: 'var(--melodify-dim-white)' }}>{index + 1}</td>
                                    <td style={{ padding: '10px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <img src={song.song_image} alt={song.song_name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.song_name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--melodify-dim-white)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.song_artist}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PlaylistPage;
