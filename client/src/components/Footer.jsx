import React, { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaVolumeUp, FaVolumeMute, FaListUl, FaHeart, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { usePlayback, usePlaybackProgress } from '../context/PlaybackContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import AddToPlaylistModal from './AddToPlaylistModal';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const {
    currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
    volume, setVolume, formatTime, seekTo, toggleExpand, isExpanded, isTrackLoading
  } = usePlayback();
  const { currentTime, duration } = usePlaybackProgress();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const scrubberRef = useRef(null);
  const navigate = useNavigate();

  if (!currentTrack || isExpanded) return null;

  const showLoadingState = isTrackLoading;

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

  const handleShowPlaylistModal = (e) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to add songs to a playlist");
    setShowPlaylistModal(true);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const displayedProgress = isScrubbing ? scrubProgress : progressPercentage;

  const getPointerProgress = (event) => {
    const rect = scrubberRef.current?.getBoundingClientRect();
    if (!rect?.width) return 0;
    return Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
  };

  const startScrubbing = (event) => {
    if (showLoadingState || !duration) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setScrubProgress(getPointerProgress(event));
    setIsScrubbing(true);
  };

  const updateScrubbing = (event) => {
    if (!isScrubbing) return;
    setScrubProgress(getPointerProgress(event));
  };

  const finishScrubbing = (event) => {
    if (!isScrubbing) return;
    event.stopPropagation();
    const nextProgress = getPointerProgress(event);
    setScrubProgress(nextProgress);
    setIsScrubbing(false);
    seekTo((nextProgress / 100) * duration);
  };

  return (
    <>
      {/* CSS animations for shimmer + loading dots */}
      <style>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes loadingDots {
          0%, 20% { opacity: 0.3; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0.3; }
        }
        .loading-dot { display: inline-block; animation: loadingDots 1.2s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal 
          track={currentTrack} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}

      <div
        className='player-container'
        onClick={toggleExpand}
        style={{
          background: 'rgba(0,0,0,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        title="Click to expand"
      >
        {/* ✅ Animated shimmer bar at the TOP while loading */}
        {showLoadingState && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '3px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
            zIndex: 10,
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #1DB954, #4ade80, transparent)',
              animation: 'shimmerSlide 1.4s ease-in-out infinite',
              borderRadius: '2px',
            }} />
          </div>
        )}

        {/* Left: Track Info */}
        <div className='track-info'>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
            <img
              src={currentTrack.image}
              alt={currentTrack.name}
              className='track-img'
              style={{ transition: 'transform 0.3s ease, opacity 0.3s', opacity: showLoadingState ? 0.6 : 1 }}
            />
            {showLoadingState && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(29,185,84,0.3)',
                  borderTopColor: '#1DB954',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
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
              opacity: showLoadingState ? 1 : 0.7,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '11px',
              color: showLoadingState ? '#1DB954' : 'inherit',
              transition: 'color 0.3s',
            }} title={currentTrack.artist}>
              {showLoadingState ? (
                <>
                  Fetching audio
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                </>
              ) : (currentTrack.artist.split(',').length > 3
                ? currentTrack.artist.split(',').slice(0, 3).join(', ') + " & more"
                : currentTrack.artist)}
            </p>
          </div>
          {!showLoadingState && (
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
          )}
        </div>

        {/* Middle: Controls */}
        <div className='player-controls' onClick={(e) => e.stopPropagation()}>
          <div className='control-buttons'>
            <FaRandom className='control-icon' title="Shuffle" style={{ fontSize: '12px' }} />
            <FaStepBackward className='control-icon main-icon' onClick={handlePrev} title="Previous" />
            <div
              onClick={showLoadingState ? undefined : togglePlay}
              className='play-pause-btn'
              title={showLoadingState ? "Preparing track..." : (isPlaying ? "Pause" : "Play")}
              style={{ width: '32px', height: '32px', opacity: showLoadingState ? 0.8 : 1, cursor: showLoadingState ? 'wait' : 'pointer' }}
            >
              {showLoadingState ? (
                <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'black', animation: 'spin 0.7s linear infinite' }} />
              ) : isPlaying ? (
                <FaPause style={{ color: 'black', fontSize: '12px' }} />
              ) : (
                <FaPlay style={{ color: 'black', fontSize: '12px', marginLeft: '1px' }} />
              )}
            </div>
            <FaStepForward className='control-icon main-icon' onClick={handleNext} title="Next" />
            <FaUndoAlt className='control-icon' title="Enable repeat" style={{ fontSize: '12px' }} />
          </div>

          <div className='progress-bar-container'>
            <span>{formatTime(showLoadingState ? 0 : currentTime)}</span>
            <div
              ref={scrubberRef}
              className={`progress-bar ${isScrubbing ? 'is-scrubbing' : ''}`}
              onPointerDown={startScrubbing}
              onPointerMove={updateScrubbing}
              onPointerUp={finishScrubbing}
              onPointerCancel={finishScrubbing}
              style={{ cursor: showLoadingState ? 'wait' : 'pointer' }}
              role="slider"
              aria-label="Song progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(displayedProgress)}
            >
              <div className='progress-fill' style={{ width: `${showLoadingState ? 0 : displayedProgress}%` }}></div>
              <div className='progress-knob' style={{ left: `${showLoadingState ? 0 : displayedProgress}%` }}></div>
            </div>
            <span>{formatTime(showLoadingState ? 0 : duration)}</span>
          </div>
        </div>

        {/* Right: Extra Controls */}
        <div className='volume-controls' onClick={(e) => e.stopPropagation()}>
          <FaListUl 
            className='control-icon queue-icon' 
            style={{ fontSize: '16px', opacity: 0.8, cursor: 'pointer', transition: 'color 0.2s' }} 
            title="Queue"
            onClick={(e) => { e.stopPropagation(); navigate('/queue'); }}
            onMouseEnter={e => e.target.style.color = '#1DB954'}
            onMouseLeave={e => e.target.style.color = 'inherit'}
          />
        </div>
      </div>
    </>
  )
}

export default Footer
