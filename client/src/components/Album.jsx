import React, { useState, useEffect } from 'react';
import { FaPlay, FaClock, FaEllipsisH } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';


const Album = () => {
  const { id } = useParams();
  const { playTrack, currentTrack, albums } = usePlayback();
  const [albumData, setAlbumData] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumData = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await axios.get(`${API_BASE_URL}/api/album/${id}`);

          setAlbumData(response.data.album);
          setAlbumTracks(response.data.tracks || []);
        } else {
          // Fallback if no ID is provided (e.g. direct /album route)
          const fallbackAlbum = (albums && albums[0]) || { name: 'Top Hits 2024', artist: 'Melodify', image: 'https://i.scdn.co/image/ab67616d0000b273b7a54a7c8585675f9e2b1464' };
          setAlbumData(fallbackAlbum);
          setAlbumTracks([]); // We don't have tracks for fallback
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [id, albums]);

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

  if (!albumData) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Album not found</div>;
  }

  return (
    <div className='fade-in'>
      <div className='album-banner'>
        <img
          src={albumData.image}
          alt={albumData.name}
        />
        <div className="album-banner-info">
          <p style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Playlist</p>
          <h1 className='album-title'>{albumData.name}</h1>
          <p style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{albumData.artist}</span> • {albumTracks.length} songs
          </p>
        </div>
      </div>

      <div className='album-controls'>
        <div 
          className='play-button-overlay' 
          style={{ position: 'static', opacity: 1, transform: 'none', width: '56px', height: '56px' }}
          onClick={() => albumTracks.length > 0 && playTrack(albumTracks[0], albumTracks)}
        >
          <FaPlay style={{ marginLeft: '4px', fontSize: '20px', color: 'black' }} />
        </div>
        <FaEllipsisH style={{ fontSize: '24px', color: 'var(--melodify-dim-white)', cursor: 'pointer' }} />
      </div>

      <div className='song-list'>
        <div className='song-item song-item-header'>
          <span className='song-number'>#</span>
          <span>Title</span>
          <span className='song-artist-col'>Artist</span>
          <span style={{ textAlign: 'right' }}><FaClock /></span>
        </div>

        {albumTracks.length > 0 ? (
          albumTracks.map((song, index) => {
            const durationMin = Math.floor(song.duration_ms / 60000);
            const durationSec = Math.floor((song.duration_ms % 60000) / 1000);
            const duration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;
            const isPlaying = currentTrack?.id === song.id;

            return (
              <div key={song.id} className={`song-item ${isPlaying ? 'active' : ''}`} onClick={() => playTrack(song, albumTracks)}>
                <span className='song-number'>
                  {isPlaying ? <span style={{ color: 'var(--melodify-green)', fontSize: '1.2rem' }}>♫</span> : index + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                  <span style={{ color: isPlaying ? 'var(--melodify-green)' : 'white', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.name}</span>
                  <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</span>
                </div>
                <span className='song-artist-col' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</span>
                <span style={{ textAlign: 'right', fontSize: '0.85rem' }}>{duration}</span>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--melodify-dim-white)' }}>
            <p>No songs available in this album</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Album;