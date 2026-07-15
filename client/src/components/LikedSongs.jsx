import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { usePlayback } from '../context/PlaybackContext';
import { FaHeart, FaPlay } from 'react-icons/fa';
import './LikedSongs.css';

const LikedSongs = () => {
    const { user } = useAuth();
    const { playTrack } = usePlayback();
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLikedSongs = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/user/liked-songs`);
            setLikedSongs(res.data);
        } catch (err) {
            console.error('Failed to fetch liked songs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLikedSongs();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleUnlike = async (e, songId) => {
        e.stopPropagation();
        try {
            await axios.delete(`${API_BASE_URL}/api/user/liked-songs/${songId}`);
            setLikedSongs(prev => prev.filter(song => song.id !== songId));
        } catch (err) {
            console.error('Failed to unlike', err);
        }
    };

    const handlePlayAll = () => {
        if (likedSongs.length > 0) {
            playTrack(likedSongs[0], likedSongs);
        }
    };

    if (loading) {
        return (
            <div className='liked-songs-container'>
                <div className='loading-spinner'></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className='liked-songs-container empty-state'>
                <FaHeart size={48} color="var(--melodify-dim-white)" />
                <h2>Log in to see your Liked Songs</h2>
                <p>Songs you like will appear here.</p>
            </div>
        );
    }

    return (
        <div className='liked-songs-container fade-in'>
            <div className="liked-header">
                <div className="header-info">
                    <div className="heart-icon-large">
                        <FaHeart />
                    </div>
                    <div className="header-text">
                        <span>Playlist</span>
                        <h1>Liked Songs</h1>
                        <p>{user.name} • {likedSongs.length} songs</p>
                    </div>
                </div>
                {likedSongs.length > 0 && (
                    <button className="play-all-btn" onClick={handlePlayAll}>
                        <FaPlay /> Play
                    </button>
                )}
            </div>

            {likedSongs.length === 0 ? (
                <div className="empty-state">
                    <h2>No songs liked yet</h2>
                    <p>Find some music you love and click the heart icon.</p>
                </div>
            ) : (
                <div className="songs-list">
                    <div className="list-header">
                        <span className="col-hash">#</span>
                        <span className="col-title">Title</span>
                        <span className="col-action"></span>
                    </div>
                    {likedSongs.map((track, index) => (
                        <div key={track.id} className='song-row' onClick={() => playTrack(track, likedSongs)}>
                            <span className="col-hash">{index + 1}</span>
                            <div className="col-title">
                                <img src={track.image} alt={track.name} />
                                <div className="song-info">
                                    <h4 className="truncate">{track.name}</h4>
                                    <p className="truncate">{track.artist}</p>
                                </div>
                            </div>
                            <div className="col-action">
                                <button className="unlike-btn" onClick={(e) => handleUnlike(e, track.id)}>
                                    <FaHeart />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedSongs;
