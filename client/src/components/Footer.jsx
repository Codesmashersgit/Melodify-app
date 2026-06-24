import React, { useState, useEffect } from 'react'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaVolumeUp, FaVolumeMute, FaListUl, FaHeart, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { usePlayback } from '../context/PlaybackContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';

const Footer = () => {
  const {
    currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
    currentTime, duration, volume, setVolume, formatTime, seekTo, toggleExpand, isExpanded
  } = usePlayback();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedPlaylistId, setAddedPlaylistId] = useState(null);

  if (!currentTrack || isExpanded) return null;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to like songs");
    try {
      await axios.post(`${API_BASE_URL}/api/user/liked-songs`, {
        song_id: currentTrack.id,
        song_name: currentTrack.name,
        song_artist: currentTrack.artist,
        song_image: currentTrack.image,
        song_preview: currentTrack.preview_url
      });
      setLiked(true);
      setTimeout(() => setLiked(false), 2000);
    } catch (err) {
      if (err.response?.data?.error === 'Song already liked') {
        setLiked(true);
        setTimeout(() => setLiked(false), 2000);
      } else {
        console.error("Failed to like song", err);
      }
    }
  };

  const handleShowPlaylistModal = async (e) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to add songs to a playlist");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/playlists`);
      setPlaylists(res.data);
      setShowPlaylistModal(true);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    }
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_BASE_URL}/api/user/playlists/${playlistId}/songs`, {
        song_id: currentTrack.id,
        song_name: currentTrack.name,
        song_artist: currentTrack.artist,
        song_image: currentTrack.image,
        song_preview: currentTrack.preview_url
      });
      setAddedPlaylistId(playlistId);
      setTimeout(() => {
        setAddedPlaylistId(null);
        setShowPlaylistModal(false);
      }, 1200);
    } catch (err) {
      if (err.response?.data?.error === 'Song already in playlist') {
        setAddedPlaylistId(playlistId);
        setTimeout(() => {
          setAddedPlaylistId(null);
          setShowPlaylistModal(false);
        }, 1200);
      } else {
        console.error("Failed to add song to playlist", err);
      }
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = x / rect.width;
    seekTo(clickedProgress * duration);
  };

  return (
    <>
      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div
          onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999998,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#282828',
              borderRadius: '16px',
              padding: '28px',
              minWidth: '320px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Add to Playlist</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Current Song Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px' }}>
              <img src={currentTrack.image} alt={currentTrack.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.artist}</div>
              </div>
            </div>

            {playlists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--melodify-dim-white)', fontSize: '0.9rem' }}>
                <p>No playlists yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Create one using the sidebar!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={(e) => handleAddToPlaylist(p.id, e)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: addedPlaylistId === p.id ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${addedPlaylistId === p.id ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: 'white',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (addedPlaylistId !== p.id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { if (addedPlaylistId !== p.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px',
                      }}>♪</div>
                      {p.name}
                    </div>
                    {addedPlaylistId === p.id && <FaCheck style={{ color: '#1DB954' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className='player-container'
        onClick={toggleExpand}
        style={{
          background: 'rgba(0,0,0,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          cursor: 'pointer'
        }}
        title="Click to expand"
      >
        {/* Left: Track Info */}
        <div className='track-info'>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
            <img
              src={currentTrack.image}
              alt={currentTrack.name}
              className='track-img'
              style={{ transition: 'transform 0.3s ease' }}
            />
          </div>
          <div className='track-details' style={{ maxWidth: '200px' }}>
            <h5 style={{
              fontWeight: '600',
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={currentTrack.name}>
              {currentTrack.name}
            </h5>
            <p style={{
              opacity: 0.7,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '11px'
            }} title={currentTrack.artist}>
              {currentTrack.artist.split(',').length > 3
                ? currentTrack.artist.split(',').slice(0, 3).join(', ') + " & more"
                : currentTrack.artist}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
            <FaHeart
              style={{ color: liked ? '#1DB954' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s, transform 0.2s', transform: liked ? 'scale(1.3)' : 'scale(1)' }}
              onClick={handleLike}
              title="Like song"
            />
            <FaPlus
              style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' }}
              onClick={handleShowPlaylistModal}
              title="Add to playlist"
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            />
          </div>
        </div>

        {/* Middle: Controls */}
        <div className='player-controls' onClick={(e) => e.stopPropagation()}>
          <div className='control-buttons'>
            <FaRandom className='control-icon' title="Shuffle" style={{ fontSize: '12px' }} />
            <FaStepBackward className='control-icon main-icon' onClick={handlePrev} title="Previous" />
            <div
              onClick={togglePlay}
              className='play-pause-btn'
              title={isPlaying ? "Pause" : "Play"}
              style={{ width: '32px', height: '32px' }}
            >
              {isPlaying ? (
                <FaPause style={{ color: 'black', fontSize: '12px' }} />
              ) : (
                <FaPlay style={{ color: 'black', fontSize: '12px', marginLeft: '1px' }} />
              )}
            </div>
            <FaStepForward className='control-icon main-icon' onClick={handleNext} title="Next" />
            <FaUndoAlt className='control-icon' title="Enable repeat" style={{ fontSize: '12px' }} />
          </div>

          <div className='progress-bar-container'>
            <span>{formatTime(currentTime)}</span>
            <div
              className='progress-bar'
              onClick={handleSeek}
            >
              <div className='progress-fill' style={{ width: `${progressPercentage}%` }}></div>
              <div className='progress-knob' style={{ left: `${progressPercentage}%` }}></div>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Extra Controls */}
        <div className='volume-controls' onClick={(e) => e.stopPropagation()}>
          <FaListUl className='control-icon' style={{ fontSize: '12px', opacity: 0.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {volume === 0 ? <FaVolumeMute className='control-icon' style={{ fontSize: '14px' }} /> : <FaVolumeUp className='control-icon' style={{ fontSize: '14px' }} />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className='volume-slider'
              style={{ '--volume-percent': `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer
