import React from 'react';
import { FaPlay, FaClock, FaArrowLeft, FaEllipsisH } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';

const Album = () => {
  const { playTrack, currentTrack, tracks, selectedAlbum, albums } = usePlayback();

  // Use selected album if available, else use first album
  const displayAlbum = selectedAlbum || (albums && albums[0]) || { name: 'Top Hits 2024', artist: 'Melodify', image: 'https://i.scdn.co/image/ab67616d0000b273b7a54a7c8585675f9e2b1464' };

  return (
    <div className='fade-in'>
      <div className='nav-header' style={{ background: 'transparent', border: 'none' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className='arrow-btn' title="Go back">
            <FaArrowLeft />
          </button>
        </Link>
      </div>

      <div className='album-banner'>
        <img
          src={displayAlbum.image || 'https://i.scdn.co/image/ab67616d0000b273b7a54a7c8585675f9e2b1464'}
          alt="Album Art"
        />
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Playlist</p>
          <h1 style={{ fontSize: '4rem', margin: '8px 0', fontWeight: '900' }}>{displayAlbum.name}</h1>
          <p style={{ color: 'var(--melodify-dim-white)' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{displayAlbum.artist || 'Melodify'}</span> • {tracks.length} songs
          </p>
        </div>
      </div>

      <div style={{ padding: '0 32px 24px', display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div className='play-button-overlay' style={{ position: 'static', opacity: 1, transform: 'none', width: '56px', height: '56px' }}>
          <FaPlay style={{ marginLeft: '4px', fontSize: '20px', color: 'black' }} />
        </div>
        <FaEllipsisH style={{ fontSize: '24px', color: 'var(--melodify-dim-white)', cursor: 'pointer' }} />
      </div>

      <div className='song-list'>
        <div className='song-item' style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '16px', cursor: 'default' }}>
          <span className='song-number'>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span style={{ textAlign: 'right' }}><FaClock /></span>
        </div>

        {tracks.length > 0 ? (
          tracks.map((song, index) => {
            const durationMin = Math.floor(song.duration_ms / 60000);
            const durationSec = Math.floor((song.duration_ms % 60000) / 1000);
            const duration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

            return (
              <div key={song.id} className={`song-item ${currentTrack?.id === song.id ? 'active' : ''}`} onClick={() => playTrack(song)}>
                <span className='song-number'>{index + 1}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'white', fontWeight: '500' }}>{song.name}</span>
                  <span style={{ fontSize: '0.85rem' }}>{song.artist}</span>
                </div>
                <span>{song.artist}</span>
                <span style={{ textAlign: 'right' }}>{duration}</span>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--melodify-dim-white)' }}>
            <p>No songs available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Album;