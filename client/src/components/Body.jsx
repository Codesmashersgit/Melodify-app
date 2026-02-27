import React from 'react'
import { useNavigate } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';

const Body = () => {
  const { playTrack, artists, albums, tracks } = usePlayback();
  const navigate = useNavigate();

  const handlePlay = (item, e) => {
    e.stopPropagation();
    if (item.preview_url) {
      playTrack(item);
    }
  };

  return (
    <div className='fade-in'>
      {/* Artists Section */}
      <section className='section-container'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h2 className='section-title' style={{ margin: 0 }}>Popular artists</h2>
          <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
        </div>
        <div className='grid-container'>
          {artists.map(artist => (
            <div key={artist.id} className='card' onClick={() => navigate(`/artist/${artist.id}`)}>
              <img src={artist.image} alt={artist.name} className='card-image' style={{ borderRadius: '50%' }} />
              <h4 style={{ marginBottom: '4px' }}>{artist.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>Artist</p>
            </div>
          ))}
        </div>
      </section>

      {/* Albums Section */}
      <section className='section-container'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h2 className='section-title' style={{ margin: 0 }}>Popular albums</h2>
          <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
        </div>
        <div className='grid-container'>
          {albums.map(album => (
            <div key={album.id} className='card' onClick={() => navigate('/album')}>
              <img src={album.image} alt={album.name} className='card-image' />
              <h4 style={{ marginBottom: '4px' }}>{album.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>{album.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Charts Section - Using actual tracks */}
      <section className='section-container'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h2 className='section-title' style={{ margin: 0 }}>Top hits</h2>
          <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
        </div>
        <div className='grid-container'>
          {tracks.slice(0, 6).map(track => (
            <div key={track.id} className='card' onClick={() => playTrack(track)}>
              <img src={track.image} alt={track.name} className='card-image' />
              <h4 style={{ marginBottom: '4px' }}>{track.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>{track.artist}</p>
              {track.preview_url && (
                <div className='play-button-overlay' onClick={(e) => handlePlay(track, e)}>
                  <div className='play-icon'></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Body
