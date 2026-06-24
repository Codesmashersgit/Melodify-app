import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { usePlayback } from '../context/PlaybackContext';

const LikedSongs = () => {
    const { token, user } = useAuth();
    const { playTrack } = usePlayback();
    const [likedSongs, setLikedSongs] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get(`${API_BASE_URL}/api/user/liked-songs`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setLikedSongs(res.data))
              .catch(err => console.error(err));
        }
    }, [token]);

    return (
        <div className='fade-in section-container'>
            <h2 className='section-title' style={{ marginBottom: '24px' }}>Liked Songs</h2>
            {!user ? (
                <p style={{color: 'var(--melodify-dim-white)'}}>Please log in to see your liked songs.</p>
            ) : likedSongs.length === 0 ? (
                <p style={{color: 'var(--melodify-dim-white)'}}>You haven't liked any songs yet.</p>
            ) : (
                <div className='grid-container'>
                    {likedSongs.map(track => (
                        <div key={track.id} className='card' onClick={() => playTrack(track, likedSongs)}>
                            <img src={track.image} alt={track.name} className='card-image' />
                            <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedSongs;
