import React from 'react'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaUndoAlt, FaVolumeUp, FaVolumeMute, FaListUl } from "react-icons/fa";
import { usePlayback } from '../context/PlaybackContext';

const Footer = () => {
  const {
    currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
    currentTime, duration, volume, setVolume, formatTime, seekTo
  } = usePlayback();

  const [playbackError, setPlaybackError] = React.useState(false);

  React.useEffect(() => {
    // Check if there's an error on the audio object
    // This is a bit of a hack since we don't have a global error state yet
    const checkError = setInterval(() => {
      // We can't easily reach the audioRef from here if it's in context only
      // But we can add it to the context
    }, 1000);
    return () => clearInterval(checkError);
  }, []);

  if (!currentTrack) return null;

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
    <div className='player-container'>
      {/* Left: Track Info */}
      <div className='track-info'>
        <img
          src={currentTrack.image}
          alt={currentTrack.name}
          className='track-img'
        />
        <div className='track-details'>
          <h5>{currentTrack.name} {currentTrack.preview_url === '' && <span style={{ color: 'red', fontSize: '10px' }}>(No Stream)</span>}</h5>
          <p>{currentTrack.artist}</p>
        </div>
      </div>

      {/* Middle: Controls */}
      <div className='player-controls'>
        <div className='control-buttons'>
          <FaRandom className='control-icon' title="Shuffle" />
          <FaStepBackward className='control-icon main-icon' onClick={handlePrev} title="Previous" />
          <div
            onClick={togglePlay}
            className='play-pause-btn'
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <FaPause style={{ color: 'black', fontSize: '14px' }} />
            ) : (
              <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
            )}
          </div>
          <FaStepForward className='control-icon main-icon' onClick={handleNext} title="Next" />
          <FaUndoAlt className='control-icon' title="Enable repeat" />
        </div>
        <div className='progress-bar-container'>
          <span>{formatTime(currentTime)}</span>
          <div
            className='progress-bar'
            onClick={handleSeek}
            style={{ '--progress-pos': `${progressPercentage}%` }}
          >
            <div className='progress-fill' style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className='volume-controls'>
        <FaListUl className='control-icon' />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
          {volume === 0 ? <FaVolumeMute className='control-icon' /> : <FaVolumeUp className='control-icon' />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className='volume-slider'
          />
        </div>
      </div>
    </div>
  )
}

export default Footer
