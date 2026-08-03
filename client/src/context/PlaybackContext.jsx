import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getTrackBlobUrl } from '../services/WebDownloadService';

const PlaybackContext = createContext();
import API_BASE_URL from '../config';

const REQUEST_TIMEOUT_MS = 15000;

export const PlaybackProvider = ({ children }) => {
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isTrackLoading, setIsTrackLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [queue, setQueue] = useState([]);

    const audioRef = useRef(new Audio());

    useEffect(() => {
        // Fetch initial tracks, albums and artists
        const fetchInitialData = async () => {
            try {
                const [tracksResponse, albumsResponse, artistsResponse] = await Promise.allSettled([
                    axios.get(`${API_BASE_URL}/api/top-tracks`, { timeout: REQUEST_TIMEOUT_MS }),
                    axios.get(`${API_BASE_URL}/api/recommendations`, { timeout: REQUEST_TIMEOUT_MS }),
                    axios.get(`${API_BASE_URL}/api/artists`, { timeout: REQUEST_TIMEOUT_MS })
                ]);

                const tracksResult = tracksResponse.status === 'fulfilled' ? tracksResponse.value : null;
                const albumsResult = albumsResponse.status === 'fulfilled' ? albumsResponse.value : null;
                const artistsResult = artistsResponse.status === 'fulfilled' ? artistsResponse.value : null;

                if (tracksResult) setTracks(tracksResult.data);
                if (albumsResult) setAlbums(albumsResult.data);
                if (artistsResult) setArtists(artistsResult.data);

                const failedRequests = [tracksResponse, albumsResponse, artistsResponse].filter(result => result.status === 'rejected');
                if (failedRequests.length > 0) {
                    console.error("Error fetching initial data:", failedRequests.map(result => result.reason?.message || result.reason));
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []); 

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (!currentTrack) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => console.log("Playback blocked:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!currentTrack) return;

    if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
    } else {
        audio.play().catch(err => {
            console.error("Playback failed:", err);
        });
        setIsPlaying(true);
    }
}, [currentTrack, isPlaying]);
    // Audio event listeners for loading state
    useEffect(() => {
        const audio = audioRef.current;

        // Clear loading when browser has enough data to play
        const handleCanPlay = () => {
            setIsTrackLoading(false);
        };
        // Re-show loading if browser stalls/rebuffers
        const handleWaiting = () => {
            setIsTrackLoading(true);
        };
        // Also clear on playing (belt + suspenders)
        const handlePlaying = () => {
            setIsTrackLoading(false);
            setIsPlaying(true);
        };
        const handleError = () => {
            setIsTrackLoading(false);
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const playTrack = useCallback(async (track, newPlaylist = null) => {
        if (!track || !track.id) {
            console.error("Cannot play track: Missing track ID", track);
            return;
        }

        if (newPlaylist && Array.isArray(newPlaylist)) {
            setTracks(newPlaylist);
        }

        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        // ✅ IMMEDIATELY show the track in footer with loading state
        // This is the first thing that happens — no await before this
        setCurrentTrack(track);
        setIsTrackLoading(true);
        setIsPlaying(false);

        audioRef.current.pause();

        // Build the stream proxy URL (always use our server proxy)
        const streamUrl = `${API_BASE_URL}/api/stream?id=${encodeURIComponent(track.id)}&name=${encodeURIComponent(track.name || '')}&artist=${encodeURIComponent(track.artist || '')}`;

        // Check if user has this song downloaded offline (fast IndexedDB lookup)
        let audioSrc = streamUrl;
        try {
            const blobUrl = await getTrackBlobUrl(track.id);
            if (blobUrl) {
                audioSrc = blobUrl;
                console.log('🎵 Playing from offline download');
            }
        } catch (_) {}

        // Set the audio source and start loading
        // isTrackLoading will be cleared by the 'canplay' or 'playing' event above
        audioRef.current.src = audioSrc;
        audioRef.current.load();

        audioRef.current.play().catch(e => {
            console.warn('Autoplay blocked or stream interrupted:', e.message);
            // Try the stream URL as fallback if blob failed
            if (audioSrc !== streamUrl) {
                audioRef.current.src = streamUrl;
                audioRef.current.load();
                audioRef.current.play().catch(() => {});
            }
        });

    }, [currentTrack, togglePlay]);


    const handleNext = useCallback(() => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            setQueue(prev => prev.slice(1));
            playTrack(nextTrack);
            return;
        }
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
    }, [queue, tracks, currentTrack, playTrack]);

    const addToQueue = useCallback((track) => {
        setQueue(prev => [...prev, track]);
    }, []);

    const playNextInQueue = useCallback((track) => {
        setQueue(prev => [track, ...prev]);
    }, []);

    const handlePrev = useCallback(() => {
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = tracks.length - 1;
        playTrack(tracks[prevIndex]);
    }, [tracks, currentTrack, playTrack]);

    // Handle audio end event using useCallback and reference to dependencies
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnd = () => {
            if (isRepeat) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log("Replay blocked:", e));
            } else {
                handleNext();
            }
        };
        audio.addEventListener('ended', handleEnd);
        return () => audio.removeEventListener('ended', handleEnd);
    }, [handleNext, isRepeat]);

    const toggleRepeat = useCallback(() => setIsRepeat(prev => !prev), []);

    const playArtistTracks = useCallback(async (artistId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/artist/${artistId}/tracks`, { timeout: REQUEST_TIMEOUT_MS });
            const playableTracks = Array.isArray(response.data?.tracks) ? response.data.tracks.filter(t => t.preview_url) : [];
            if (playableTracks.length > 0) {
                playTrack(playableTracks[0], playableTracks);
            }
        } catch (error) {
            console.error("Failed to play artist tracks:", error);
        } finally {
            setIsLoading(false);
        }
    }, [playTrack]);

    const searchTracks = useCallback(async (query) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`, { timeout: REQUEST_TIMEOUT_MS });
            const playableTracks = Array.isArray(response.data) ? response.data.filter(t => t.preview_url) : [];
            setSearchResults(playableTracks);
            // We set current tracks list for seamless play-next in search results
            setTracks(playableTracks);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectAlbumPlaylist = useCallback((albumData) => {
        setSelectedAlbum(albumData);
        if (albumData.tracks && albumData.tracks.length > 0) {
            setTracks(albumData.tracks);
        }
    }, []);

    const formatTime = useCallback((time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, []);

    const seekTo = useCallback((time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);

    return (
        <PlaybackContext.Provider value={{
            tracks, currentTrack, isPlaying, isRepeat, volume, currentTime, duration, isLoading, isTrackLoading, isExpanded, queue,
            playTrack, playArtistTracks, togglePlay, toggleRepeat, setVolume, setCurrentTime, handleNext, handlePrev, formatTime, seekTo, searchTracks, toggleExpand, addToQueue, playNextInQueue, setQueue,
            albums, artists, selectedAlbum, selectAlbumPlaylist, searchResults
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);
