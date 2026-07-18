import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaCheck, FaDownload, FaSpinner } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';
import { downloadTrackForOffline, isTrackDownloaded } from '../services/WebDownloadService';
import API_BASE_URL from '../config';

const SongMenu = ({ track, onAddToPlaylist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dlState, setDlState] = useState('idle'); // idle | downloading | done | error
  const [dlProgress, setDlProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { addToQueue, playNextInQueue } = usePlayback();
  const menuRef = useRef();

  // Check if already downloaded when menu opens
  useEffect(() => {
    if (isOpen && track?.id) {
      isTrackDownloaded(track.id).then(setIsDownloaded);
    }
  }, [isOpen, track?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
  };

  const handleSaveOffline = async (e) => {
    e.stopPropagation();
    if (dlState === 'downloading' || isDownloaded) return;
    setDlState('downloading');
    setDlProgress(0);

    const success = await downloadTrackForOffline(track, API_BASE_URL, (status, progress) => {
      if (status === 'downloading' && progress !== undefined) setDlProgress(progress);
    });

    if (success) {
      setDlState('done');
      setIsDownloaded(true);
      setTimeout(() => {
        setDlState('idle');
        setIsOpen(false);
      }, 1500);
    } else {
      setDlState('error');
      setTimeout(() => setDlState('idle'), 2000);
    }
  };

  const itemStyle = {
    padding: '11px 16px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13.5px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    whiteSpace: 'nowrap',
  };

  return (
    <div className="song-menu-container" ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleMenu}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <FaEllipsisV size={13} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: '0', top: '100%', marginTop: '4px',
          background: 'rgba(22, 22, 30, 0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px', zIndex: 99999, minWidth: '170px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}>
          {/* Add to Queue */}
          <div
            onClick={(e) => handleAction(e, () => { addToQueue(track); setIsOpen(false); })}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '15px' }}>➕</span> Add to Queue
          </div>

          {/* Play Next */}
          <div
            onClick={(e) => handleAction(e, () => { playNextInQueue(track); setIsOpen(false); })}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '15px' }}>⏭️</span> Play Next
          </div>

          {/* Add to Playlist */}
          <div
            onClick={(e) => handleAction(e, () => { onAddToPlaylist?.(track); setIsOpen(false); })}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '15px' }}>🎵</span> Add to Playlist
          </div>

          {/* Save Offline */}
          <div
            onClick={handleSaveOffline}
            style={{
              ...itemStyle,
              borderBottom: 'none',
              color: isDownloaded ? '#1DB954' : dlState === 'error' ? '#ff4444' : 'white',
              cursor: dlState === 'downloading' || isDownloaded ? 'default' : 'pointer',
              opacity: dlState === 'downloading' ? 0.8 : 1,
            }}
            onMouseEnter={e => { if (!isDownloaded && dlState !== 'downloading') e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {dlState === 'downloading' ? (
              <>
                <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} />
                Saving... {dlProgress > 0 ? `${dlProgress}%` : ''}
              </>
            ) : dlState === 'done' || isDownloaded ? (
              <>
                <FaCheck size={13} color="#1DB954" />
                <span style={{ color: '#1DB954' }}>Saved Offline</span>
              </>
            ) : dlState === 'error' ? (
              <>
                <span style={{ fontSize: '15px' }}>❌</span> Failed, Retry
              </>
            ) : (
              <>
                <FaDownload size={13} />
                Save Offline
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongMenu;
