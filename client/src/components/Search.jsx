import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';

const Search = () => {
    const { playTrack, searchTracks, searchResults, isLoading } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const categories = [
        { name: 'Podcasts', color: '#E13300', query: 'podcasts' },
        { name: 'Made For You', color: '#1E3264', query: 'made for you' },
        { name: 'Charts', color: '#8D67AB', query: 'top charts' },
        { name: 'New Releases', color: '#E8115B', query: 'latest releases' },
        { name: 'Discover', color: '#FD67AA', query: 'discover' },
        { name: 'Bollywood', color: '#D84000', query: 'bollywood' },
        { name: 'Punjabi', color: '#503750', query: 'punjabi' },
        { name: 'Tamil', color: '#A56752', query: 'tamil tracks' },
        { name: 'Telugu', color: '#BA5D07', query: 'telugu songs' },
        { name: 'Party', color: '#8D67AB', query: 'party mix' },
        { name: 'Lofi', color: '#7358FF', query: 'lofi hindi' },
        { name: 'Workout', color: '#FD67AA', query: 'bollywood workout hits' },
        { name: 'Romantic', color: '#E91E63', query: 'bollywood romantic' },
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

    const handleCategoryClick = (cat) => {
        setSearchQuery(cat.name);
        searchTracks(cat.query);
        setHasSearched(true);
    };

    const handleBackToBrowse = () => {
        setHasSearched(false);
        setSearchQuery('');
    };

    const handlePlayTrack = (track, e) => {
        e.stopPropagation();
        if (track.preview_url) {
            playTrack(track);
        }
    };

    return (
        <div className='fade-in' style={{ padding: '24px 32px' }}>
            <div style={{ position: 'sticky', top: '70px', zIndex: 10, background: 'rgba(18, 18, 18, 0.9)', backdropFilter: 'blur(20px)', paddingBottom: '24px', transition: 'all 0.3s ease' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#535353' }} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '500px',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            backgroundColor: 'white',
                            color: 'black',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {hasSearched ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Results for "{searchQuery}"</h2>
                        <button 
                            onClick={handleBackToBrowse}
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid var(--melodify-dim-white)', 
                                color: 'white', 
                                padding: '6px 16px', 
                                borderRadius: '500px', 
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Back to Browse
                        </button>
                    </div>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <div className="loader"></div>
                            <p style={{ marginTop: '20px', color: 'var(--melodify-dim-white)' }}>Finding the best music...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                            {searchResults.map((track) => (
                                <div
                                    key={track.id}
                                    className='card'
                                    onClick={() => playTrack(track)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img src={track.image} alt={track.name} className='card-image' />
                                        <div className='card-overlay'></div>
                                    </div>
                                    <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                                    
                                    <div className='play-button-overlay' onClick={(e) => handlePlayTrack(track, e)}>
                                        <div className='play-icon' style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid black', marginLeft: '4px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ fontSize: '1.2rem', color: 'var(--melodify-dim-white)' }}>No results found. Try something else!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Browse all</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                        {categories.map((cat, i) => (
                            <div
                                key={i}
                                onClick={() => handleCategoryClick(cat)}
                                className="category-card"
                                style={{
                                    backgroundColor: cat.color,
                                    aspectRatio: '1',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease, filter 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.filter = 'brightness(1)';
                                }}
                            >
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{cat.name}</h3>
                                <div style={{
                                    position: 'absolute',
                                    right: '-15px',
                                    bottom: '-5px',
                                    width: '100px',
                                    height: '100px',
                                    background: `url(https://picsum.photos/seed/${cat.name}/150/150)`,
                                    backgroundSize: 'cover',
                                    transform: 'rotate(25deg)',
                                    borderRadius: '4px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                                    transition: 'transform 0.3s ease'
                                }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
};

export default Search;

