import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FaPlay, FaPause } from 'react-icons/fa';
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
    const [preferenceTracks, setPreferenceTracks] = useState({});
    const [preferencesLoading, setPreferencesLoading] = useState(true);

    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);

    const handleOpenModal = (track) => {
        setSelectedTrack(track);
        setIsPlaylistModalOpen(true);
    };

    React.useEffect(() => {
        const fetchPreferences = async () => {
            if (!user?.preferences || user.preferences.length === 0) {
                setPreferencesLoading(false);
                return;
            }
            setPreferencesLoading(true);
            const newPrefs = {};
            try {
                await Promise.all(user.preferences.map(async (pref) => {
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
            const songs = res.data.tracks.filter(t => t.preview_url);
            setAlbumSongsCache(prev => ({ ...prev, [albumId]: songs }));
            if (songs.length > 0) playTrack(songs[0], songs);
        } catch (err) {
            console.error('Album fetch error:', err);
        } finally {
            setLoadingAlbumId(null);
        }
    };

    return (
        <div className='fade-in'>
            <SkeletonStyles />

            {/* ── User Preference Sections ── */}
            {preferencesLoading ? (
                <>
                    <SectionSkeleton count={10} />
                    <SectionSkeleton count={10} />
                </>
            ) : Object.entries(preferenceTracks).map(([pref, prefSongs]) => (
                <section key={pref} className='section-container'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 className='section-title' style={{ margin: 0, textTransform: 'capitalize' }}>More of what you like: {pref}</h2>
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
            ))}

            {/* ── Popular Artists ── */}
            <section className='section-container'>
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
                                <img src={artist.image} alt={artist.name} className='card-image' style={{ borderRadius: '50%' }} />
                                <h4 style={{ marginBottom: '4px' }}>{artist.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--melodify-dim-white)' }}>Artist</p>
                                <div className='play-button-overlay' onClick={(e) => handlePlayArtist(artist.id, e)}>
                                    <div className='play-icon' style={{ width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid black', marginLeft: '2px' }}></div>
                                </div>
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
