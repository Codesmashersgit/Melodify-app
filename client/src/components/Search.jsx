import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlay, FaFire, FaMusic, FaHeadphones, FaDrumstickBite, FaHeart, FaGuitar } from 'react-icons/fa';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';

const categories = [
    { name: 'Bollywood', color: 'linear-gradient(135deg, #D84000, #FF6B35)', query: 'bollywood hits 2024', icon: '🎬' },
    { name: 'Punjabi', color: 'linear-gradient(135deg, #503750, #B74FFF)', query: 'punjabi hits 2024', icon: '🎺' },
    { name: 'Workout', color: 'linear-gradient(135deg, #FD67AA, #FF3366)', query: 'workout gym hits hindi', icon: '💪' },
    { name: 'Lofi', color: 'linear-gradient(135deg, #7358FF, #3A1FC1)', query: 'lofi hindi chill', icon: '🎧' },
    { name: 'Romantic', color: 'linear-gradient(135deg, #E91E63, #880E4F)', query: 'bollywood romantic love songs', icon: '❤️' },
    { name: 'Podcasts', color: 'linear-gradient(135deg, #00BCD4, #006064)', query: 'podcasts india hindi', icon: '🎙️' },
    { name: '90s Hits', color: 'linear-gradient(135deg, #FF9800, #E65100)', query: 'bollywood 90s hits classic', icon: '📻' },
    { name: 'Party', color: 'linear-gradient(135deg, #4CAF50, #1B5E20)', query: 'party hits dance bollywood', icon: '🎉' },
    { name: 'Sad Songs', color: 'linear-gradient(135deg, #607D8B, #263238)', query: 'sad hindi songs emotional', icon: '😢' },
    { name: 'Devotional', color: 'linear-gradient(135deg, #FF6F00, #BF360C)', query: 'bhajan devotional hindi', icon: '🙏' },
    { name: 'Hip Hop', color: 'linear-gradient(135deg, #212121, #616161)', query: 'hindi rap hiphop badshah', icon: '🎤' },
    { name: 'Indie', color: 'linear-gradient(135deg, #00897B, #004D40)', query: 'hindi indie pop folk', icon: '🎸' },
];

const Search = () => {
    const { playTrack, searchTracks, searchResults, isLoading } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryResults, setCategoryResults] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setHasSearched(false);
            return;
        }
        setCategoryResults(null);
        setActiveCategory(null);
        const handler = setTimeout(() => {
            searchTracks(searchQuery);
            setHasSearched(true);
        }, 600);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleCategoryClick = async (cat) => {
        setSearchQuery('');
        setHasSearched(false);
        setActiveCategory(cat.name);
        setCategoryLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(cat.query)}`);
            setCategoryResults({ name: cat.name, color: cat.color, icon: cat.icon, songs: res.data });
        } catch (err) {
            console.error(err);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleBackToBrowse = () => {
        setCategoryResults(null);
        setActiveCategory(null);
        setHasSearched(false);
        setSearchQuery('');
    };

    return (
        <div className='fade-in' style={{ minHeight: '100vh', paddingBottom: '120px' }}>

            {/* Search Bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                padding: '24px 32px 16px',
                background: 'linear-gradient(180deg, var(--melodify-black) 60%, transparent)',
            }}>
                <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
                    <FaSearch style={{
                        position: 'absolute', left: '18px', top: '50%',
                        transform: 'translateY(-50%)', color: '#888', fontSize: '1.1rem', zIndex: 1
                    }} />
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px 16px 50px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            color: 'white',
                            outline: 'none',
                            backdropFilter: 'blur(20px)',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.12)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)';
                        }}
                        onBlur={e => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={handleBackToBrowse}
                            style={{
                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem',
                            }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* Search Results */}
            {hasSearched ? (
                <div style={{ padding: '0 32px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>
                        Results for "<span style={{ color: '#1DB954' }}>{searchQuery}</span>"
                    </h2>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div className="loader"></div>
                            <p style={{ marginTop: '20px', color: 'var(--melodify-dim-white)' }}>Searching...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {searchResults.map((track, i) => (
                                <div
                                    key={track.id}
                                    onClick={() => playTrack(track, searchResults)}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        padding: '10px 16px', borderRadius: '10px',
                                        cursor: 'pointer', transition: 'background 0.15s',
                                        gap: '16px',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.85rem', width: '20px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <img src={track.image} alt={track.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</h4>
                                        <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                                    </div>
                                    <div style={{
                                        width: '32px', height: '32px', background: '#1DB954', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s', flexShrink: 0
                                    }}
                                        className="play-on-hover"
                                    >
                                        <FaPlay style={{ color: 'black', fontSize: '10px', marginLeft: '2px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--melodify-dim-white)' }}>
                            <FaSearch style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ fontSize: '1.1rem' }}>No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>

            /* Category Songs Collection View */
            ) : categoryResults ? (
                <div style={{ padding: '0 32px' }}>
                    {/* Hero Banner */}
                    <div style={{
                        background: categoryResults.color,
                        borderRadius: '20px',
                        padding: '36px',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ fontSize: '5rem', zIndex: 1 }}>{categoryResults.icon}</div>
                        <div style={{ zIndex: 1 }}>
                            <p style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: '700', opacity: 0.8, marginBottom: '6px' }}>CATEGORY</p>
                            <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>{categoryResults.name}</h1>
                            <p style={{ marginTop: '8px', opacity: 0.8 }}>{categoryResults.songs.length} songs</p>
                        </div>
                        <button
                            onClick={() => playTrack(categoryResults.songs[0], categoryResults.songs)}
                            style={{
                                marginLeft: 'auto',
                                background: '#1DB954', border: 'none', color: 'black',
                                width: '60px', height: '60px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0, zIndex: 1,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <FaPlay style={{ marginLeft: '3px' }} />
                        </button>
                        {/* Decorative blobs */}
                        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                        <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                    </div>

                    <button
                        onClick={handleBackToBrowse}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', marginBottom: '24px', fontSize: '0.85rem' }}
                    >
                        ← Browse All Categories
                    </button>

                    {categoryLoading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {categoryResults.songs.map((track, i) => (
                                <div
                                    key={track.id}
                                    onClick={() => playTrack(track, categoryResults.songs)}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        padding: '10px 16px', borderRadius: '10px',
                                        cursor: 'pointer', transition: 'background 0.15s', gap: '16px',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        const btn = e.currentTarget.querySelector('.play-on-hover');
                                        if (btn) btn.style.opacity = '1';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        const btn = e.currentTarget.querySelector('.play-on-hover');
                                        if (btn) btn.style.opacity = '0';
                                    }}
                                >
                                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.85rem', width: '20px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                                    <img src={track.image} alt={track.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                                    </div>
                                    <div className="play-on-hover" style={{
                                        width: '32px', height: '32px', background: '#1DB954', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s', flexShrink: 0
                                    }}>
                                        <FaPlay style={{ color: 'black', fontSize: '10px', marginLeft: '2px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            /* Default Browse Categories */
            ) : (
                <div style={{ padding: '8px 32px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Browse categories</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '16px',
                    }}>
                        {categories.map((cat, i) => (
                            <div
                                key={i}
                                onClick={() => handleCategoryClick(cat)}
                                style={{
                                    background: cat.color,
                                    borderRadius: '14px',
                                    height: '130px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    padding: '18px 18px 14px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: activeCategory === cat.name ? '0 0 0 3px #1DB954' : 'none',
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', zIndex: 1, letterSpacing: '-0.3px' }}>{cat.name}</h3>
                                <div style={{ fontSize: '3.2rem', alignSelf: 'flex-end', zIndex: 1, lineHeight: 1 }}>{cat.icon}</div>
                                {/* Decorative circle */}
                                <div style={{
                                    position: 'absolute', bottom: '-15px', right: '-15px',
                                    width: '80px', height: '80px',
                                    background: 'rgba(0,0,0,0.15)', borderRadius: '50%'
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
