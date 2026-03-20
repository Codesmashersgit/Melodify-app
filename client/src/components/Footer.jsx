import React from 'react'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaVolumeUp, FaVolumeMute, FaListUl, FaHeart } from "react-icons/fa";
import { usePlayback } from '../context/PlaybackContext';

const Footer = () => {
  const {
    currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
    currentTime, duration, volume, setVolume, formatTime, seekTo, toggleExpand, isExpanded
  } = usePlayback();


  if (!currentTrack || isExpanded) return null;


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
        <FaHeart 
          style={{ marginLeft: '12px', color: '#1DB954', cursor: 'pointer', fontSize: '14px' }} 
          onClick={(e) => e.stopPropagation()}
        />
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
            style={{ 
              '--volume-percent': `${volume * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Footer

