import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaCheck, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config';

const AddToPlaylistModal = ({ isOpen = true, track, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [addedPlaylistId, setAddedPlaylistId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/playlists`, { withCredentials: true });
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    }
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.post(`${API_BASE_URL}/api/user/playlists/${playlistId}/songs`, {
        song_id: track.id,
        song_name: track.name,
        song_artist: track.artist,
        song_image: track.image,
        song_preview: track.preview_url
      }, { withCredentials: true });
      setAddedPlaylistId(playlistId);
      setTimeout(() => {
        setAddedPlaylistId(null);
        onClose();
      }, 1200);
    } catch (err) {
      if (err.response?.data?.error === 'Song already in playlist') {
        setAddedPlaylistId(playlistId);
        setTimeout(() => {
          setAddedPlaylistId(null);
          onClose();
        }, 1200);
      } else {
        console.error("Failed to add song to playlist", err);
      }
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/playlists`, { name: newPlaylistName }, { withCredentials: true });
      await handleAddToPlaylist(res.data.id);
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  if (!isOpen || !track) return null;

  return createPortal(
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999998,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(30, 30, 30, 0.95)',
          borderRadius: '16px', padding: '28px', minWidth: '320px', maxWidth: '400px', width: '90%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>Add to Playlist</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>
            <FaTimes />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px' }}>
          <img src={track.image} alt={track.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
          </div>
        </div>

        {showCreate ? (
          <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              autoFocus
              type="text" 
              placeholder="Playlist Name" 
              value={newPlaylistName} 
              onChange={e => setNewPlaylistName(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#1DB954', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>Create</button>
            </div>
          </form>
        ) : (
          <>
            <button 
              onClick={() => setShowCreate(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FaPlus /> New Playlist
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {playlists.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', padding: '20px 0' }}>No existing playlists</div>
              ) : (
                playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={(e) => handleAddToPlaylist(p.id, e)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: addedPlaylistId === p.id ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${addedPlaylistId === p.id ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: 'white', borderRadius: '10px', padding: '12px 16px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (addedPlaylistId !== p.id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { if (addedPlaylistId !== p.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ff6b35, #1DB954)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>♪</div>
                      {p.name}
                    </div>
                    {addedPlaylistId === p.id && <FaCheck style={{ color: '#1DB954' }} />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddToPlaylistModal;
