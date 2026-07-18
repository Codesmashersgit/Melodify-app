import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/playlists`);
        setPlaylists(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <div style={{ padding: '24px', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Your Playlists</h2>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {playlists.map(p => (
          <Link to={`/playlist-detail/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', width: '200px', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.1)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, #ff6b35, #1DB954)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>♪</div>
              <div style={{ fontWeight: 'bold', color: 'white' }}>{p.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Playlists;
