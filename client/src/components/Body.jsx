import React from 'react'
import { useNavigate } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';

const Body = () => {
    const { playTrack, playArtistTracks, artists, albums, tracks, searchTracks } = usePlayback();
    const navigate = useNavigate();

    const homeCategories = [
        { name: 'Podcasts', color: '#E13300', query: 'podcasts' },
        { name: 'Bollywood', color: '#D84000', query: 'bollywood hits' },
        { name: 'Punjabi', color: '#503750', query: 'punjabi search' },
        { name: 'Workout', color: '#FD67AA', query: 'bollywood workout hits' },
        { name: 'Lofi', color: '#7358FF', query: 'lofi hindi' },
        { name: 'Romantic', color: '#E91E63', query: 'bollywood romantic' },
    ];

    const handlePlay = (item, e) => {
        e.stopPropagation();
        if (item.preview_url) {
            playTrack(item);
        }
    };

    const handlePlayArtist = (artistId, e) => {
        e.stopPropagation();
        playArtistTracks(artistId);
    };

    const handleCategoryClick = (cat) => {
        navigate('/search');
        searchTracks(cat.query);
    };

    return (
        <div className='fade-in'>
            {/* Artists Section */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Popular artists</h2>
                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Show all</span>
                </div>
                <div className='grid-container'>
                    {artists.slice(0, 30).map(artist => (
                        <div key={artist.id} className='card' onClick={() => navigate(`/artist/${artist.id}`)}>
                            <img src={artist.image} alt={artist.name} className='card-image' style={{ borderRadius: '50%' }} />
                            <h4 style={{ marginBottom: '4px' }}>{artist.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>Artist</p>
                            <div className='play-button-overlay' onClick={(e) => handlePlayArtist(artist.id, e)}>
                                <div className='play-icon' style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid black', marginLeft: '2px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Browse Categories Section */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Browse categories</h2>
                </div>
                <div className='grid-container'>
                    {homeCategories.map((cat, i) => (
                        <div
                            key={i}
                            className='card category-card-home'
                            onClick={() => handleCategoryClick(cat)}
                            style={{
                                backgroundColor: cat.color,
                                height: '120px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', zIndex: 1 }}>{cat.name}</h3>
                            <div style={{
                                position: 'absolute',
                                right: '-10px',
                                bottom: '-10px',
                                width: '60px',
                                height: '60px',
                                background: `url(https://picsum.photos/seed/${cat.name}/100/100)`,
                                backgroundSize: 'cover',
                                transform: 'rotate(25deg)',
                                opacity: 0.6
                            }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Albums Section */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Popular albums</h2>
                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Show all</span>
                </div>
                <div className='grid-container'>
                    {albums.map(album => (
                        <div key={album.id} className='card' onClick={() => navigate(`/album/${album.id}`)}>
                            <img src={album.image} alt={album.name} className='card-image' />
                            <h4 style={{ marginBottom: '4px' }}>{album.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>{album.artist}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Top Hits Section */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Top hits</h2>
                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Show all</span>
                </div>
                <div className='grid-container'>
                    {tracks.slice(0, 6).map(track => (
                        <div key={track.id} className='card' onClick={() => playTrack(track)}>
                            <img src={track.image} alt={track.name} className='card-image' />
                            <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                            {track.preview_url && (
                                <div className='play-button-overlay' onClick={(e) => handlePlay(track, e)}>
                                    <div className='play-icon' style={{ width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid black', marginLeft: '2px' }}></div>
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

