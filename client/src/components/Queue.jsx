import React from 'react';
import { usePlayback } from '../context/PlaybackContext';

const Queue = () => {
  const { queue, currentTrack, playTrack, setQueue } = usePlayback();

  const handlePlayFromQueue = (track, index) => {
    const newQueue = queue.slice(index + 1);
    setQueue(newQueue);
    playTrack(track);
  };

  return (
    <div style={{ padding: '24px', color: 'white', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Queue</h2>
      
      {currentTrack && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Now Playing</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <img src={currentTrack.image} alt={currentTrack.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1DB954' }}>{currentTrack.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{currentTrack.artist}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Next Up</h3>
        {queue.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Your queue is empty.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {queue.map((track, idx) => (
              <div 
                key={`${track.id}-${idx}`}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', transition: 'background 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onClick={() => handlePlayFromQueue(track, idx)}
              >
                <div style={{ width: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{idx + 1}</div>
                <img src={track.image} alt={track.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
