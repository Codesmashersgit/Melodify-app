import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { usePlayback } from '../context/PlaybackContext';
import SongMenu from './SongMenu';
import AddToPlaylistModal from './AddToPlaylistModal';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const { playTrack } = usePlayback();
  const [showModal, setShowModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/playlists/${id}`);
        setPlaylist(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlaylist();
  }, [id]);

  const handleOpenModal = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  if (!playlist) return <div style={{ color: 'white', padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', minHeight: '100vh', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'end', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg, #ff6b35, #1DB954)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>♪</div>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Playlist</span>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '8px 0' }}>{playlist.name}</h1>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{playlist.songs?.length || 0} songs</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', padding: '0 16px' }}>
          <div style={{ width: '40px' }}>#</div>
          <div style={{ flex: 1 }}>Title</div>
          <div style={{ width: '50px' }}></div>
        </div>
        
        {playlist.songs?.map((song, idx) => {
          const trackData = {id: song.song_id, name: song.song_name, artist: song.song_artist, image: song.song_image, preview_url: song.song_preview};
          return (
            <div key={song.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '40px', color: 'rgba(255,255,255,0.5)' }}>{idx + 1}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={song.song_image} alt={song.song_name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                <div>
                  <div style={{ color: 'white', fontWeight: '500', cursor: 'pointer' }} onClick={() => playTrack(trackData)}>{song.song_name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{song.song_artist}</div>
                </div>
              </div>
              <div style={{ width: '50px', display: 'flex', justifyContent: 'center' }}>
                <SongMenu track={trackData} onAddToPlaylist={() => handleOpenModal(trackData)} />
              </div>
            </div>
          );
        })}
      </div>
      {showModal && selectedTrack && (
        <AddToPlaylistModal track={selectedTrack} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default PlaylistDetail;
