import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaSearch, FaMicrophone, FaArrowLeft, FaTimes } from 'react-icons/fa';
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
    { name: 'K-Pop', color: 'linear-gradient(135deg, #FF4081, #F50057)', query: 'kpop bts blackpink 2024', icon: '🇰🇷' },
    { name: 'Classical', color: 'linear-gradient(135deg, #8D6E63, #4E342E)', query: 'classical music hindustani', icon: '🎻' },
    { name: 'Jazz', color: 'linear-gradient(135deg, #546E7A, #263238)', query: 'jazz blues saxophone', icon: '🎷' },
    { name: 'Sufi', color: 'linear-gradient(135deg, #6A1B9A, #38006B)', query: 'sufi qawwali hindi', icon: '🕌' },
];

const SongRow = ({ track, index, queue, playTrack, currentTrack, isPlaying, togglePlay }) => {
    const isCurrent = currentTrack?.id === track.id;
    return (
    <div
        onClick={() => isCurrent ? togglePlay() : playTrack(track, queue)}
        style={{
            display: 'flex', alignItems: 'center',
            padding: '10px 16px', borderRadius: '10px',
            cursor: 'pointer', transition: 'background 0.15s', gap: '14px',
            background: isCurrent ? 'rgba(29,185,84,0.1)' : 'transparent'
        }}
        onMouseEnter={e => {
            if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            const btn = e.currentTarget.querySelector('.play-on-hover');
            if (btn && !isCurrent) btn.style.opacity = '1';
        }}
        onMouseLeave={e => {
            if (!isCurrent) e.currentTarget.style.background = 'transparent';
            const btn = e.currentTarget.querySelector('.play-on-hover');
            if (btn && !isCurrent) btn.style.opacity = '0';
        }}
    >
        {index !== undefined && (
            <span style={{ color: isCurrent ? '#1DB954' : 'var(--melodify-dim-white)', fontSize: '0.82rem', width: '20px', textAlign: 'right', flexShrink: 0 }}>
                {isCurrent && isPlaying ? <div className="bars-equalizer" style={{ display: 'inline-block', width: '12px', height: '12px', backgroundImage: 'url(https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif)', backgroundSize: 'cover' }}></div> : (index + 1)}
            </span>
        )}
        <img src={track.image} alt={track.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrent ? '#1DB954' : 'white' }}>{track.name}</h4>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
        </div>
        <div className="play-on-hover" style={{
            width: '32px', height: '32px', background: '#1DB954', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isCurrent ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0
        }}>
            {isCurrent && isPlaying ? (
                <FaPause style={{ color: 'black', fontSize: '10px' }} />
            ) : (
                <FaPlay style={{ color: 'black', fontSize: '10px', marginLeft: '2px' }} />
            )}
        </div>
    </div>
)};

const Search = () => {
    const { albums, artists, playTrack, currentTrack, isPlaying, togglePlay } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [songResults, setSongResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [albumResults, setAlbumResults] = useState([]);
    const [aiMoodKeywords, setAiMoodKeywords] = useState('');
    const [categoryResults, setCategoryResults] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const debounceRef = useRef(null);
    const aiModeRef = useRef(false);
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchQuery.trim().length === 0) {
            setHasSearched(false);
            setSongResults([]);
            setArtistResults([]);
            setAlbumResults([]);
            setAiMoodKeywords('');
            aiModeRef.current = false;
            return;
        }

        if (aiModeRef.current) return;

        debounceRef.current = setTimeout(() => {
            doSearch(searchQuery.trim());
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery]);

    const doSearch = async (query) => {
        aiModeRef.current = false;
        setAiMoodKeywords('');
        setIsLoading(true);
        setHasSearched(true);
        setCategoryResults(null);
        setActiveCategory(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
            const allResults = response.data || [];
            const songs = allResults.filter(r => r.id);
            setSongResults(songs);

            // Match artists from context
            const q = query.toLowerCase();
            const matchedArtists = (artists || []).filter(a => a.name && a.name.toLowerCase().includes(q)).slice(0, 5);
            setArtistResults(matchedArtists);

            // Match albums from context
            const matchedAlbums = (albums || []).filter(a => a.name && a.name.toLowerCase().includes(q)).slice(0, 5);
            setAlbumResults(matchedAlbums);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiSearch = async (text) => {
        if (!text || !text.trim()) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        aiModeRef.current = true;
        setAiLoading(true);
        setHasSearched(true);
        setCategoryResults(null);
        setActiveCategory(null);
        setSongResults([]);
        setArtistResults([]);
        setAlbumResults([]);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ai-mood?query=${encodeURIComponent(text)}`, { timeout: 10000 });
            const { keywords, tracks } = response.data;
            setAiMoodKeywords(keywords || text);
            setSongResults(tracks || []);
        } catch (error) {
            try {
                setAiMoodKeywords(`🔍 Results for: "${text}"`);
                const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(text)}`);
                const results = response.data || [];
                setSongResults(results.filter(r => r.id));
            } catch (fallbackErr) {
                setAiMoodKeywords('Search failed. Please try again.');
            }
        } finally {
            setAiLoading(false);
            setIsListening(false);
        }
    };

    const startVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice search is not supported in this browser. Try Chrome!');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setSearchQuery(text);
            handleAiSearch(text);
        };
        recognition.start();
    };

    const handleCategoryClick = async (cat) => {
        setSearchQuery('');
        setHasSearched(false);
        setActiveCategory(cat.name);
        setCategoryLoading(true);
        setSongResults([]);
        setArtistResults([]);
        setAlbumResults([]);
        setAiMoodKeywords('');
        try {
            const res = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(cat.query)}`);
            setCategoryResults({ name: cat.name, color: cat.color, icon: cat.icon, songs: res.data });
        } catch (err) {
            console.error(err);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setHasSearched(false);
        setSongResults([]);
        setArtistResults([]);
        setAlbumResults([]);
        setAiMoodKeywords('');
        setCategoryResults(null);
        setActiveCategory(null);
        aiModeRef.current = false;
        inputRef.current?.focus();
    };

    return (
        <div style={{ minHeight: '100%', paddingBottom: '120px' }}>

            {/* ─── STICKY SEARCH BAR ─── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                padding: '20px 28px 16px',
                background: 'linear-gradient(180deg, #121212 70%, transparent)',
            }}>
                {categoryResults && (
                    <button
                        onClick={handleClear}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'none', border: 'none', color: 'var(--melodify-dim-white)',
                            cursor: 'pointer', fontSize: '0.9rem', marginBottom: '12px', padding: 0
                        }}
                    >
                        <FaArrowLeft size={12} /> Back to Browse
                    </button>
                )}
                <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
                    <FaSearch style={{
                        position: 'absolute', left: '18px', top: '50%',
                        transform: 'translateY(-50%)', color: '#888', fontSize: '1rem', zIndex: 1
                    }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search songs, artists, albums…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 96px 14px 50px',
                            borderRadius: '50px',
                            border: `1px solid ${isListening ? 'rgba(29,185,84,0.6)' : 'rgba(255,255,255,0.12)'}`,
                            fontSize: '0.95rem', fontWeight: '500',
                            backgroundColor: 'rgba(255,255,255,0.07)',
                            color: 'white', outline: 'none',
                            backdropFilter: 'blur(20px)',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box',
                            boxShadow: isListening ? '0 0 0 3px rgba(29,185,84,0.2)' : 'none',
                        }}
                        onFocus={e => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.25)';
                        }}
                        onBlur={e => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.07)';
                            e.target.style.borderColor = isListening ? 'rgba(29,185,84,0.6)' : 'rgba(255,255,255,0.12)';
                        }}
                    />
                    {/* Right side buttons */}
                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {searchQuery && (
                            <button onClick={handleClear} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                <FaTimes />
                            </button>
                        )}
                        <button
                            onClick={startVoiceSearch}
                            title="Voice / AI search"
                            style={{
                                background: isListening ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.08)',
                                border: `1px solid ${isListening ? '#1DB954' : 'rgba(255,255,255,0.1)'}`,
                                color: isListening ? '#1DB954' : '#aaa',
                                borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                animation: isListening ? 'pulse 1s infinite' : 'none',
                            }}
                        >
                            <FaMicrophone size={12} />
                        </button>
                    </div>
                </div>
                {isListening && (
                    <p style={{ textAlign: 'center', color: '#1DB954', fontSize: '0.82rem', marginTop: '8px', animation: 'pulse 1s infinite' }}>
                        🎙️ Listening… speak now
                    </p>
                )}
            </div>

            {/* ─── CONTENT (scrolls via parent main-view) ─── */}
            <div style={{ padding: '0 28px' }}>

                {/* Search Results */}
                {hasSearched ? (
                    <div>
                        {aiMoodKeywords && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(29,185,84,0.15), rgba(29,185,84,0.05))',
                                border: '1px solid rgba(29,185,84,0.2)',
                                borderRadius: '14px', padding: '14px 18px', marginBottom: '20px',
                                display: 'flex', alignItems: 'center', gap: '10px',
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: '#1DB954', fontWeight: '700', letterSpacing: '1px', margin: 0 }}>AI MOOD SEARCH</p>
                                    <p style={{ fontSize: '0.9rem', color: 'white', margin: '2px 0 0' }}>{aiMoodKeywords}</p>
                                </div>
                            </div>
                        )}

                        {(isLoading || aiLoading) ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div className="loader"></div>
                                <p style={{ marginTop: '16px', color: 'var(--melodify-dim-white)' }}>
                                    {aiLoading ? 'AI is thinking…' : 'Searching…'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Songs */}
                                {songResults.length > 0 && (
                                    <section style={{ marginBottom: '28px' }}>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>
                                            Songs <span style={{ color: 'var(--melodify-dim-white)', fontWeight: 400, fontSize: '0.9rem' }}>({songResults.length})</span>
                                        </h2>
                                        {songResults.map((track, i) => (
                                            <SongRow key={track.id} track={track} index={i} queue={songResults} playTrack={playTrack} currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={togglePlay} />
                                        ))}
                                    </section>
                                )}

                                {/* Artists */}
                                {artistResults.length > 0 && (
                                    <section style={{ marginBottom: '28px' }}>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>Artists</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {artistResults.map(artist => (
                                                <div
                                                    key={artist.id}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <img src={artist.image} alt={artist.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #1DB954', flexShrink: 0 }} />
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{artist.name}</h4>
                                                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--melodify-dim-white)' }}>Artist</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Albums */}
                                {albumResults.length > 0 && (
                                    <section style={{ marginBottom: '28px' }}>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>Albums</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {albumResults.map(album => (
                                                <div
                                                    key={album.id}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <img src={album.image} alt={album.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{album.name}</h4>
                                                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--melodify-dim-white)' }}>Album</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {songResults.length === 0 && artistResults.length === 0 && albumResults.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--melodify-dim-white)' }}>
                                        <FaSearch style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                                        <p style={{ fontSize: '1.1rem' }}>No results for "{searchQuery}"</p>
                                        <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.6 }}>Try a different spelling or keyword</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                /* Category Songs */
                ) : categoryResults ? (
                    <div>
                        <div style={{
                            background: categoryResults.color,
                            borderRadius: '20px', padding: '36px',
                            marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '24px',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ fontSize: '4.5rem', zIndex: 1 }}>{categoryResults.icon}</div>
                            <div style={{ zIndex: 1 }}>
                                <p style={{ fontSize: '0.72rem', letterSpacing: '3px', fontWeight: '700', opacity: 0.85, marginBottom: '4px' }}>CATEGORY</p>
                                <h1 style={{ fontSize: '2.6rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>{categoryResults.name}</h1>
                                <p style={{ marginTop: '6px', opacity: 0.8 }}>{categoryResults.songs.length} songs</p>
                            </div>
                            <button
                                onClick={() => playTrack(categoryResults.songs[0], categoryResults.songs)}
                                style={{
                                    marginLeft: 'auto',
                                    background: '#1DB954', border: 'none', color: 'black',
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0, zIndex: 1,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <FaPlay style={{ marginLeft: '3px' }} />
                            </button>
                            <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                        </div>

                        {categoryLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loader"></div></div>
                        ) : (
                            categoryResults.songs.map((track, i) => (
                                <SongRow key={track.id} track={track} index={i} queue={categoryResults.songs} playTrack={playTrack} />
                            ))
                        )}
                    </div>

                /* Default: Browse Categories */
                ) : (
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '18px' }}>Browse categories</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                            gap: '14px',
                        }}>
                            {categories.map((cat, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleCategoryClick(cat)}
                                    style={{
                                        background: cat.color,
                                        borderRadius: '14px', height: '125px',
                                        display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        padding: '16px 16px 12px', cursor: 'pointer',
                                        position: 'relative', overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: activeCategory === cat.name ? '0 0 0 3px #1DB954, 0 8px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', zIndex: 1, letterSpacing: '-0.3px' }}>{cat.name}</h3>
                                    <div style={{ fontSize: '3rem', alignSelf: 'flex-end', zIndex: 1, lineHeight: 1 }}>{cat.icon}</div>
                                    <div style={{
                                        position: 'absolute', bottom: '-12px', right: '-12px',
                                        width: '70px', height: '70px',
                                        background: 'rgba(0,0,0,0.15)', borderRadius: '50%'
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default Search;
