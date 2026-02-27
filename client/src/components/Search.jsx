import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';

const Search = () => {
    const { playTrack, searchTracks, searchResults, isLoading } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const categories = [
        { name: 'Podcasts', color: '#E13300' },
        { name: 'Made For You', color: '#1E3264' },
        { name: 'Charts', color: '#8D67AB' },
        { name: 'New Releases', color: '#E8115B' },
        { name: 'Discover', color: '#8D67AB' },
        { name: 'Live Events', color: '#7358FF' },
        { name: 'Bollywood', color: '#D84000' },
        { name: 'Punjabi', color: '#503750' },
        { name: 'Tamil', color: '#A56752' },
        { name: 'Telugu', color: '#BA5D07' },
    ];

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length > 0) {
            searchTracks(query);
            setHasSearched(true);
        } else {
            setHasSearched(false);
        }
    };

    const handlePlayTrack = (track, e) => {
        e.stopPropagation();
        if (track.preview_url) {
            playTrack(track);
        }
    };

    return (
        <div className='fade-in' style={{ padding: '24px 32px' }}>
            <div style={{ position: 'sticky', top: '70px', zIndex: 10, background: '#121212', paddingBottom: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '500px',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    />
                </div>
            </div>

            {hasSearched && searchResults.length > 0 ? (
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Search Results</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                        {searchResults.map((track) => (
                            <div
                                key={track.id}
                                className='card'
                                onClick={() => playTrack(track)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={track.image} alt={track.name} className='card-image' />
                                <h4 style={{ marginBottom: '4px' }}>{track.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>{track.artist}</p>
                                {track.preview_url && (
                                    <div className='play-button-overlay' onClick={(e) => handlePlayTrack(track, e)}>
                                        <div className='play-icon'></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : hasSearched && isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--melodify-dim-white)' }}>Searching...</p>
                </div>
            ) : hasSearched && searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--melodify-dim-white)' }}>No results found for "{searchQuery}"</p>
                </div>
            ) : (
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Browse all</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                        {categories.map((cat, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: cat.color,
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{cat.name}</h3>
                                <img
                                    src={`https://picsum.photos/seed/${cat.name}/100/100`}
                                    alt={cat.name}
                                    style={{
                                        position: 'absolute',
                                        right: '-20px',
                                        bottom: '-20px',
                                        width: '100px',
                                        transform: 'rotate(25deg)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
};

export default Search;
