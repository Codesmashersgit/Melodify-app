import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FaTrash, FaMusic } from 'react-icons/fa';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/playlists`);
      setPlaylists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (e, playlistId, playlistName) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/user/playlists/${playlistId}`);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (err) {
      console.error('Failed to delete playlist', err);
      alert('Failed to delete playlist');
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Your Playlists</h2>
      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--melodify-dim-white)' }}>
          <FaMusic style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem' }}>No playlists created yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {playlists.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <Link to={`/playlist-detail/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', width: '200px', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.1)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, #ff6b35, #1DB954)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>♪</div>
                  <div style={{ fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDeletePlaylist(e, p.id, p.name)}
                title="Delete Playlist"
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ff4444',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 5
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ff4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.color = '#ff4444'; }}
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Playlists;
