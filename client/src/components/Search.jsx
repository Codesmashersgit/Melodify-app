import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';

const Search = () => {
    const { playTrack, searchTracks, searchResults, isLoading } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Debouncing implementation
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setHasSearched(false);
            return;
        }

        const handler = setTimeout(() => {
            searchTracks(searchQuery);
            setHasSearched(true);
        }, 600); // 600ms debounce for better performance

        return () => clearTimeout(handler);
    }, [searchQuery, searchTracks]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
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
        <div className='fade-in' style={{ width: '100vw', margin: 0, padding: '64px 0 60px 0' }}>

            <div style={{ 
                position: 'sticky', 
                top: '64px', /* Sticky exactly beneath fixed navbar */
                zIndex: 10, 
                background: 'var(--melodify-black)', 
                padding: '0', 
                width: '100vw',
                transition: 'all 0.3s ease',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                boxSizing: 'border-box'
            }}>
                <div style={{ position: 'relative', width: '100vw' }}>
                    <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#535353', fontSize: '1.2rem' }} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                        style={{
                            width: '100vw',
                            padding: '20px 20px 20px 52px',
                            borderRadius: '0', 
                            border: 'none',
                            fontSize: '1.05rem',
                            fontWeight: '600',
                            backgroundColor: '#181818',
                            color: 'white',
                            outline: 'none',
                            margin: 0
                        }}
                    />
                </div>
            </div>


            {hasSearched ? (
                <div style={{ marginTop: '16px', padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Top results</h2>
                    </div>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <div className="loader"></div>
                            <p style={{ marginTop: '20px', color: 'var(--melodify-dim-white)' }}>Searching...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {searchResults.map((track) => (
                                <div
                                    key={track.id}
                                    onClick={() => playTrack(track)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '10px 12px', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ position: 'relative', width: '48px', height: '48px', marginRight: '16px', flexShrink: 0 }}>
                                        <img src={track.image} alt={track.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ 
                                            margin: 0, 
                                            fontSize: '0.95rem', 
                                            fontWeight: '600', 
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>{track.name}</h4>
                                        <p style={{ 
                                            margin: '4px 0 0 0', 
                                            fontSize: '0.82rem', 
                                            color: 'var(--melodify-dim-white)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>{track.artist}</p>
                                    </div>
                                    <div style={{ marginLeft: '12px', opacity: 0.6 }}>
                                        <div style={{ width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid var(--melodify-dim-white)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ fontSize: '1.1rem', color: 'var(--melodify-dim-white)' }}>No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Hide categories when query is empty as requested */
                <div style={{ textAlign: 'center', padding: '120px 20px', opacity: 0.5 }}>
                    <FaSearch style={{ fontSize: '3rem', marginBottom: '20px', color: '#333' }} />
                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>Find your favorite songs & artists</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Search for Melodify's best music</p>
                </div>
            )}
        </div >
    );
};

export default Search;
