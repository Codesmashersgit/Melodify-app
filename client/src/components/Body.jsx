import GaneshSkeleton from './GaneshSkeleton';
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FaPlay, FaPause, FaAndroid, FaGlobe, FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import { CardSkeletonRow, AlbumSkeletonRow, SectionSkeleton, SkeletonStyles } from './Skeleton';
import { useAuth } from '../context/AuthContext';
import SongMenu from './SongMenu';
import AddToPlaylistModal from './AddToPlaylistModal';

const Body = () => {
    const { user } = useAuth();
    const { playTrack, playArtistTracks, artists, albums, tracks, searchTracks, currentTrack, isPlaying, togglePlay, isLoading } = usePlayback();
    const navigate = useNavigate();
    const [albumSongsCache, setAlbumSongsCache] = useState({});
    const [loadingAlbumId, setLoadingAlbumId] = useState(null);
    const [minLoaderTimeElapsed, setMinLoaderTimeElapsed] = useState(false);
    
    const [preferenceTracks, setPreferenceTracks] = useState({});
    const [festivalTracks, setFestivalTracks] = useState([]);
    const [isFestivalLoading, setIsFestivalLoading] = useState(true);
    const [preferencesLoading, setPreferencesLoading] = useState(true);

    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);

    const handleOpenModal = (track) => {
        setSelectedTrack(track);
        setIsPlaylistModalOpen(true);
    };

    const [festivalConfig, setFestivalConfig] = useState(null);

    React.useEffect(() => {
        const fetchFestival = async () => {
            try {
                const confRes = await axios.get(`${API_BASE_URL}/api/user/festival`);
                if (confRes.data && confRes.data.active && confRes.data.playlistId) {
                    setFestivalConfig(confRes.data);
                    const res = await axios.get(`${API_BASE_URL}/api/playlist/${confRes.data.playlistId}`);
                    const tracksData = Array.isArray(res.data) ? res.data : (res.data.tracks || []);
                    const onlySongs = tracksData.filter(t => t.type === 'song' || !t.type);
                    setFestivalTracks(onlySongs.slice(0, 30));
                } else {
                    setFestivalTracks([]);
                }
            } catch (err) {}
            finally { setIsFestivalLoading(false); }
        };
        fetchFestival();

        const fetchPreferences = async () => {
            if (!user?.preferences || user.preferences.length === 0) {
                setPreferencesLoading(false);
                return;
            }
            setPreferencesLoading(true);
            const newPrefs = {};
            const hiddenPrefs = new Set(['hindi', 'english']);
            try {
                await Promise.all(user.preferences.map(async (pref) => {
                    const normalizedPref = pref?.toLowerCase?.();
                    if (hiddenPrefs.has(normalizedPref)) {
                        return;
                    }
                    const res = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(pref)}`);
                    const prefTracks = Array.isArray(res.data) ? res.data : (res.data.tracks || []);
                    if (prefTracks.length > 0) {
                        newPrefs[pref] = prefTracks.filter(t => t.preview_url || t.id);
                    }
                }));
                setPreferenceTracks(newPrefs);
            } catch (err) {
                console.error("Error fetching preference tracks:", err);
            } finally {
                setPreferencesLoading(false);
            }
        };
        fetchPreferences();
    }, [user?.preferences]);

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
        if (item.preview_url) playTrack(item);
    };

    const handlePlayArtist = (artistId, e) => {
        e.stopPropagation();
        playArtistTracks(artistId);
    };

    const handleCategoryClick = (cat) => {
        navigate('/search');
        searchTracks(cat.query);
    };

    const handlePlayAlbum = async (albumId, e) => {
        e.stopPropagation();
        if (albumSongsCache[albumId]) {
            const songs = albumSongsCache[albumId];
            if (songs.length > 0) playTrack(songs[0], songs);
            return;
        }
        setLoadingAlbumId(albumId);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/album/${albumId}`);
            const songs = (res.data.tracks || []).filter(t => t.id && t.name && t.preview_url);
            setAlbumSongsCache(prev => ({ ...prev, [albumId]: songs }));
            if (songs.length > 0) playTrack(songs[0], songs);
        } catch (err) {
            console.error('Album fetch error:', err);
        } finally {
            setLoadingAlbumId(null);
        }
    };

    
    
    const ganeshTrack = {
        id: "GGMI3kq4",
        name: "Deva Shree Ganesha (Ganpati 2026)",
        artist: "Ajay-Atul, Ajay Gogavale",
        image: "https://c.saavncdn.com/317/Agneepath-Hindi-2011-20190603132941-500x500.jpg",
        preview_url: `${API_BASE_URL}/api/stream?id=GGMI3kq4&name=Deva%20Shree%20Ganesha%20(Ganpati%202026)&artist=Ajay-Atul%2C%20Ajay%20Gogavale`
    };

    const handleGaneshFinish = () => {
        sessionStorage.setItem('ganeshLoaderShown', 'true');
        setMinLoaderTimeElapsed(true);
        if (window.confirm("Bappa is here! Continue with Deva Shree Ganesha song?")) {
            playTrack(ganeshTrack, [ganeshTrack]);
        }
    };

    
    const hasSeenGanesh = sessionStorage.getItem('ganeshLoaderShown') === 'true';
    const isInitialDataLoading = isLoading || isFestivalLoading || preferencesLoading;
    const shouldShowGanesh = (!hasSeenGanesh && isInitialDataLoading) || (!hasSeenGanesh && !minLoaderTimeElapsed);

    if (shouldShowGanesh) {
        return (
            <div className='fade-in' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <GaneshSkeleton onFinish={handleGaneshFinish} />
            </div>
        );
    }


    return (
        <div className='fade-in'>
            <SkeletonStyles />

            {/* ── FESTIVAL SPECIAL (Dynamic Admin UI) ── */}
            {festivalConfig && festivalConfig.active && (
            <section key="festival-section" className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>{festivalConfig.festivalName}</h2>
                </div>
                {isFestivalLoading ? (
                    <CardSkeletonRow count={6} />
                ) : festivalTracks.length > 0 ? (
                    <div className='grid-container'>
                        {festivalTracks.map((track, index) => (
                            <div key={track.id + '-' + index} className={`card ${currentTrack?.id === track.id ? 'playing-card' : ''}`} onClick={() => playTrack(track, festivalTracks)}>
                                <div style={{ position: 'relative' }}>
                                    <img src={track.image} alt={track.name} className='card-image' />
                                    {currentTrack?.id === track.id && (
                                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '28px' }}>🎵</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-menu-overlay" onClick={(e) => e.stopPropagation()}>
                                    <SongMenu track={track} onAddToPlaylist={() => handleOpenModal(track)} />
                                </div>
                                <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentTrack?.id === track.id ? '#1DB954' : 'inherit' }}>{track.name}</h4>
                                <p style={{ fontSize: '13px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{track.artist}</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>
            )}

            {/* ── Popular Artists (Moved to Top) ── */}
            <section key="artists-section" className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Popular artists</h2>
                    <Link to="/show-all/artists" style={{ textDecoration: 'none' }}>
                        <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
                    </Link>
                </div>
                {isLoading || artists.length === 0 ? (
                    <CardSkeletonRow count={12} />
                ) : (
                    <div className='grid-container'>
                        {artists.slice(0, 30).map(artist => (
                            <div key={artist.id} className='card' onClick={() => navigate(`/artist/${artist.id}`)}>
                                <img src={artist.image} alt={artist.name} className='card-image' style={{ borderRadius: '50%', aspectRatio: '1/1', objectFit: 'cover' }} />
                                <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>Artist</p>
                                <div className='play-button-overlay' onClick={(e) => handlePlayArtist(artist.id, e)}>
                                    <div className='play-icon' style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid black', marginLeft: '2px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>


            {/* ── Top Hits ── */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Top hits</h2>
                    <Link to="/show-all/tracks" style={{ textDecoration: 'none' }}>
                        <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
                    </Link>
                </div>
                {isLoading || tracks.length === 0 ? (
                    <CardSkeletonRow count={10} />
                ) : (
                    <div className='grid-container'>
                        {tracks.slice(0, 10).map((track) => (
                            <div key={track.id} className={`card ${currentTrack?.id === track.id ? 'playing-card' : ''}`} onClick={() => playTrack(track, tracks)}>
                                <div style={{ position: 'relative' }}>
                                    <img src={track.image} alt={track.name} className='card-image' />
                                    {currentTrack?.id === track.id && (
                                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '28px' }}>🎵</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-menu-overlay" onClick={(e) => e.stopPropagation()}>
                                    <SongMenu track={track} onAddToPlaylist={() => handleOpenModal(track)} />
                                </div>
                                <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentTrack?.id === track.id ? '#1DB954' : 'inherit' }}>{track.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                                {track.preview_url && (
                                    <div className='play-button-overlay' onClick={(e) => { e.stopPropagation(); currentTrack?.id === track.id ? togglePlay() : playTrack(track, tracks); }}>
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <FaPause style={{ color: 'black', fontSize: '14px' }} />
                                        ) : (
                                            <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── User Preference Sections ── */}
            {preferencesLoading ? (
                <>
                    <SectionSkeleton count={10} />
                    <SectionSkeleton count={10} />
                </>
            ) : (
                (() => {
                    const prefEntries = Object.entries(preferenceTracks);
                    if (prefEntries.length === 0) return null;
                    
                    return prefEntries.map(([pref, prefSongs]) => (
                        <section key={pref} className='section-container'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 className='section-title' style={{ margin: 0, textTransform: 'capitalize' }}>More of what you like: {pref}</h2>
                                <Link to={`/search?q=${encodeURIComponent(pref)}`} style={{ textDecoration: 'none' }}>
                                    <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
                                </Link>
                            </div>
                            <div className='grid-container'>
                                {prefSongs.slice(0, 10).map(track => (
                                    <div key={track.id} className={`card ${currentTrack?.id === track.id ? 'playing-card' : ''}`} onClick={() => playTrack(track, prefSongs)}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={track.image} alt={track.name} className='card-image' />
                                            {currentTrack?.id === track.id && (
                                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                                    <span style={{ fontSize: '28px' }}>🎵</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-menu-overlay" onClick={(e) => e.stopPropagation()}>
                                            <SongMenu track={track} onAddToPlaylist={() => handleOpenModal(track)} />
                                        </div>
                                        <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentTrack?.id === track.id ? '#1DB954' : 'inherit' }}>{track.name}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</p>
                                        <div className='play-button-overlay' onClick={(e) => handlePlay(track, e)}>
                                            {currentTrack?.id === track.id && isPlaying ? (
                                                <FaPause style={{ color: 'black', fontSize: '14px' }} />
                                            ) : (
                                                <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ));
                })()
            )}

            {/* ── Popular Albums ── */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Popular albums</h2>
                    <Link to="/show-all/albums" style={{ textDecoration: 'none' }}>
                        <span style={{ color: 'var(--melodify-dim-white)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Show all</span>
                    </Link>
                </div>
                {isLoading || albums.length === 0 ? (
                    <AlbumSkeletonRow count={12} />
                ) : (
                    <div className='grid-container'>
                        {albums.map(album => (
                            <div key={album.id} className='card' onClick={() => navigate(`/album/${album.id}`)}>
                                <div style={{ position: 'relative' }}>
                                    <img src={album.image} alt={album.name} className='card-image' />
                                    <div className='play-button-overlay' onClick={(e) => handlePlayAlbum(album.id, e)} style={{ bottom: '8px', right: '8px' }}>
                                        {loadingAlbumId === album.id ? (
                                            <div style={{ width: '16px', height: '16px', border: '2px solid black', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        ) : (
                                            <FaPlay style={{ color: 'black', fontSize: '14px', marginLeft: '2px' }} />
                                        )}
                                    </div>
                                </div>
                                <h4 style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.artist}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Browse Categories ── */}
            <section className='section-container'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className='section-title' style={{ margin: 0 }}>Browse categories</h2>
                </div>
                <div className='grid-container'>
                    {homeCategories.map((cat, i) => (
                        <div key={i} className='card category-card-home' onClick={() => handleCategoryClick(cat)}
                            style={{ backgroundColor: cat.color, height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', zIndex: 1 }}>{cat.name}</h3>
                            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '60px', height: '60px', background: `url(https://picsum.photos/seed/${cat.name}/100/100)`, backgroundSize: 'cover', transform: 'rotate(25deg)', opacity: 0.6 }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Melodify Platform & Developer Footer ── */}
            <section style={{
                marginTop: '60px',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.08) 0%, rgba(20, 20, 30, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '40px 36px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '16px' }}>
                        <a
                            href="/Melodify.apk"
                            download
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                fontWeight: '400',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                        >
                            <FaAndroid size={16} /> Download Android App (.apk)
                        </a>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            color: 'rgba(255,255,255,0.4)', 
                            fontSize: '0.8rem',
                            fontWeight: '400',
                        }}>
                            Made with <span style={{ color: '#e25555', fontSize: '1rem' }}>♥</span> by Sudhanshu
                        </div>
                </div>
            </section>
            
            {/* Modal for adding track to playlist */}
            <AddToPlaylistModal 
                isOpen={isPlaylistModalOpen} 
                onClose={() => setIsPlaylistModalOpen(false)} 
                track={selectedTrack} 
            />
        </div>
    )
}

export default Body
