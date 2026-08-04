import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getTrackBlobUrl } from '../services/WebDownloadService';
import API_BASE_URL from '../config';

const PlaybackContext = createContext();
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

    // ─── Fetch home data on mount ────────────────────────────────
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [tracksRes, albumsRes, artistsRes] = await Promise.allSettled([
                    axios.get(`${API_BASE_URL}/api/top-tracks`,      { timeout: REQUEST_TIMEOUT_MS }),
                    axios.get(`${API_BASE_URL}/api/recommendations`,  { timeout: REQUEST_TIMEOUT_MS }),
                    axios.get(`${API_BASE_URL}/api/artists`,          { timeout: REQUEST_TIMEOUT_MS }),
                ]);
                if (tracksRes.status  === 'fulfilled') setTracks(tracksRes.value.data);
                if (albumsRes.status  === 'fulfilled') setAlbums(albumsRes.value.data);
                if (artistsRes.status === 'fulfilled') setArtists(artistsRes.value.data);
            } catch (e) {
                console.error('fetchInitialData error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // ─── Audio event listeners (bound once) ─────────────────────
    useEffect(() => {
        const audio = audioRef.current;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onDuration   = () => setDuration(audio.duration || 0);
        const onCanPlay    = () => setIsTrackLoading(false);
        const onWaiting    = () => setIsTrackLoading(true);
        const onPlaying    = () => { setIsTrackLoading(false); setIsPlaying(true); };
        const onPause      = () => setIsPlaying(false);
        const onError      = () => setIsTrackLoading(false);

        audio.addEventListener('timeupdate',     onTimeUpdate);
        audio.addEventListener('loadedmetadata', onDuration);
        audio.addEventListener('canplay',        onCanPlay);
        audio.addEventListener('waiting',        onWaiting);
        audio.addEventListener('playing',        onPlaying);
        audio.addEventListener('pause',          onPause);
        audio.addEventListener('error',          onError);

        return () => {
            audio.removeEventListener('timeupdate',     onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onDuration);
            audio.removeEventListener('canplay',        onCanPlay);
            audio.removeEventListener('waiting',        onWaiting);
            audio.removeEventListener('playing',        onPlaying);
            audio.removeEventListener('pause',          onPause);
            audio.removeEventListener('error',          onError);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Volume sync ─────────────────────────────────────────────
    useEffect(() => { audioRef.current.volume = volume; }, [volume]);

    // ─── togglePlay ──────────────────────────────────────────────
    const togglePlay = useCallback(() => {
        if (!currentTrack) return;
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play().catch(e => console.warn('play() blocked:', e));
        } else {
            audio.pause();
        }
    }, [currentTrack]);

    // ─── playTrack ───────────────────────────────────────────────
    const playTrack = useCallback(async (track, newPlaylist = null) => {
        if (!track?.id) return;
        if (newPlaylist && Array.isArray(newPlaylist)) setTracks(newPlaylist);

        // Same track → toggle play/pause
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        // ✅ Show track in footer IMMEDIATELY (no await before this)
        setCurrentTrack(track);
        setIsTrackLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        audioRef.current.pause();

        const streamUrl = `${API_BASE_URL}/api/stream?id=${encodeURIComponent(track.id)}&name=${encodeURIComponent(track.name || '')}&artist=${encodeURIComponent(track.artist || '')}`;

        // Check for offline download (fast IndexedDB)
        let audioSrc = streamUrl;
        try {
            const blobUrl = await getTrackBlobUrl(track.id);
            if (blobUrl) { audioSrc = blobUrl; console.log('🎵 Playing offline'); }
        } catch (_) {}

        const audio = audioRef.current;
        audio.src = audioSrc;
        audio.load();

        // Play — isTrackLoading cleared by 'canplay'/'playing' events
        audio.play().catch(e => {
            console.warn('Autoplay blocked:', e.message);
            if (audioSrc !== streamUrl) {
                audio.src = streamUrl;
                audio.load();
                audio.play().catch(() => {});
            }
        });
    }, [currentTrack, togglePlay]);

    // ─── Queue & navigation ──────────────────────────────────────
    const addToQueue    = useCallback((t) => setQueue(p => [...p, t]), []);
    const playNextInQueue = useCallback((t) => setQueue(p => [t, ...p]), []);

    const handleNext = useCallback(() => {
        if (queue.length > 0) {
            const next = queue[0];
            setQueue(p => p.slice(1));
            playTrack(next);
            return;
        }
        if (!tracks.length) return;
        const idx = tracks.findIndex(t => t.id === currentTrack?.id);
        playTrack(tracks[(idx + 1) % tracks.length]);
    }, [queue, tracks, currentTrack, playTrack]);

    const handlePrev = useCallback(() => {
        if (!tracks.length) return;
        const idx = tracks.findIndex(t => t.id === currentTrack?.id);
        playTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
    }, [tracks, currentTrack, playTrack]);

    // ─── Auto-advance on end ─────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        const onEnd = () => {
            if (isRepeat) { audio.currentTime = 0; audio.play().catch(() => {}); }
            else handleNext();
        };
        audio.addEventListener('ended', onEnd);
        return () => audio.removeEventListener('ended', onEnd);
    }, [handleNext, isRepeat]);

    // ─── Misc helpers ────────────────────────────────────────────
    const toggleRepeat = useCallback(() => setIsRepeat(p => !p), []);
    const toggleExpand = useCallback(() => setIsExpanded(p => !p), []);

    const seekTo = useCallback((time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }, []);

    const formatTime = useCallback((time) => {
        if (!time || isNaN(time)) return '0:00';
        const m = Math.floor(time / 60), s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }, []);

    const playArtistTracks = useCallback(async (artistId) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/artist/${artistId}/tracks`, { timeout: REQUEST_TIMEOUT_MS });
            const list = Array.isArray(res.data?.tracks) ? res.data.tracks.filter(t => t.preview_url) : [];
            if (list.length) playTrack(list[0], list);
        } catch (e) { console.error('playArtistTracks:', e); }
        finally { setIsLoading(false); }
    }, [playTrack]);

    const searchTracks = useCallback(async (query) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/search?query=${query}`, { timeout: REQUEST_TIMEOUT_MS });
            const list = Array.isArray(res.data) ? res.data.filter(t => t.preview_url) : [];
            setSearchResults(list);
            setTracks(list);
        } catch (e) { console.error('searchTracks:', e); }
        finally { setIsLoading(false); }
    }, []);

    const selectAlbumPlaylist = useCallback((albumData) => {
        setSelectedAlbum(albumData);
        if (albumData.tracks?.length) setTracks(albumData.tracks);
    }, []);

    return (
        <PlaybackContext.Provider value={{
            tracks, currentTrack, isPlaying, isRepeat, volume, currentTime, duration,
            isLoading, isTrackLoading, isExpanded, queue,
            playTrack, playArtistTracks, togglePlay, toggleRepeat,
            setVolume, setCurrentTime, handleNext, handlePrev,
            formatTime, seekTo, searchTracks, toggleExpand,
            addToQueue, playNextInQueue, setQueue,
            albums, artists, selectedAlbum, selectAlbumPlaylist, searchResults,
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);
