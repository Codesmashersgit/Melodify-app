import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import axios from 'axios';
import { Audio } from 'expo-av';
import API_BASE_URL from '../config';

import CryptoJS from 'crypto-js';

const PlaybackContext = createContext();

// ─── Direct JioSaavn URL resolvers ────────────────────────────
// These bypass the Render server entirely for audio resolution
// so songs play instantly without cold-start delays.

const DES_KEY = '38346591'; // Known JioSaavn DES-ECB key

const decryptDES = (encryptedBase64) => {
    try {
        const key = CryptoJS.enc.Utf8.parse(DES_KEY);
        const decrypted = CryptoJS.DES.decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64)
        }, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
};

const resolveAudioUrl = async (songId, songName, songArtist) => {
    if (!songId) return null;
    
    const proxyUrl = `${API_BASE_URL}/api/stream?id=${songId}&name=${encodeURIComponent(songName || '')}&artist=${encodeURIComponent(songArtist || '')}`;
    
    try {
        // Fetch with HEAD to resolve the 302 redirect in JS safely without downloading the whole file
        const response = await fetch(proxyUrl, { method: 'HEAD', redirect: 'follow' });
        
        let finalUrl = response.url;
        
        // If the backend redirected us to the JioSaavn CDN, check if it's accessible.
        // expo-av natively crashes if it hits a 403 or 404 directly.
        if (finalUrl && finalUrl !== proxyUrl) {
            const headCheck = await fetch(finalUrl, { method: 'HEAD' });
            if (headCheck.ok || headCheck.status === 200) {
                console.log("Verified URL is accessible:", finalUrl.substring(0, 50));
                return finalUrl;
            } else {
                console.warn(`URL returned ${headCheck.status}, native crash prevented!`);
            }
        }
    } catch (e) {
        console.error("Redirect resolution failed:", e);
    }
    
    // Fallback to public APIs if proxy fails or returns 403
    const apis = [
        `https://saavn.dev/api/songs/${songId}`,
        `https://jiosaavn-api-ashutosh.vercel.app/api/songs?id=${songId}`,
    ];

    for (const api of apis) {
        try {
            const response = await axios.get(api, { timeout: 8000 });
            const data = response.data;
            let song = null;
            if (data?.data && Array.isArray(data.data)) song = data.data[0];
            else if (data?.data?.id) song = data.data;
            else if (Array.isArray(data)) song = data[0];

            if (song) {
                const downloadUrls = song.downloadUrl || song.download_url || song.downloadLinks;
                if (downloadUrls && Array.isArray(downloadUrls)) {
                    const hq = downloadUrls.find(d =>
                        d.quality === '320kbps' || d.quality === '320' || d.quality === 'high'
                    ) || downloadUrls[downloadUrls.length - 1];
                    const url = hq?.link || hq?.url || (typeof hq === 'string' ? hq : null);
                    if (url) {
                        const headCheck = await fetch(url, { method: 'HEAD' });
                        if (headCheck.ok) return url.replace('http://', 'https://');
                    }
                }
            }
        } catch (e) {
            continue;
        }
    }
    
    return null;
};

// ─────────────────────────────────────────────────────────────

export const PlaybackProvider = ({ children }) => {
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTrackLoading, setIsTrackLoading] = useState(false);

    // Video Mode State
    const [mode, setMode] = useState('audio'); // 'audio' | 'video'
    const [videoId, setVideoId] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [videoPlaying, setVideoPlaying] = useState(false);

    const [fetchError, setFetchError] = useState(null);

    const soundRef = useRef(null);
    const isLoadingSound = useRef(false);
    const appStateRef = useRef(AppState.currentState);
    const tracksRef = useRef([]);
    const currentTrackRef = useRef(null);

    // Keep refs in sync
    useEffect(() => { tracksRef.current = tracks; }, [tracks]);
    useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

    // Fetch with retry (for initial data fetching from Render)
    const fetchWithRetry = async (url, { firstTimeout = 15000, retryTimeout = 45000 } = {}) => {
        try {
            return await axios.get(url, { timeout: firstTimeout });
        } catch (error) {
            return await axios.get(url, { timeout: retryTimeout });
        }
    };

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const [tracksResponse, albumsResponse, artistsResponse] = await Promise.all([
                fetchWithRetry(`${API_BASE_URL}/api/top-tracks`),
                fetchWithRetry(`${API_BASE_URL}/api/recommendations`),
                fetchWithRetry(`${API_BASE_URL}/api/artists`)
            ]);

            setTracks(tracksResponse.data);
            setAlbums(albumsResponse.data);
            setArtists(artistsResponse.data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            setFetchError('Data fetch failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Configure audio for background playback
    useEffect(() => {
        const configureAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    interruptionModeAndroid: 1,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    playsInSilentModeIOS: true,
                    interruptionModeIOS: 1,
                });
                // Note: handleNext and handlePrev need to be passed or accessed via ref, 
                // but since they are defined later in the component, we'll set up listeners there.

            } catch (error) {
                console.error('Error configuring audio mode:', error);
            }
        };
        configureAudio();

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && appStateRef.current !== 'active' && soundRef.current) {
                // When app comes back to foreground, re-check and sync playing state
                soundRef.current.getStatusAsync().then(status => {
                    if (status.isLoaded) setIsPlaying(status.isPlaying);
                }).catch(() => {});
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(() => {});
            }
        };
    }, []);

    const onPlaybackStatusUpdate = useCallback((status) => {
        if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);
            setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
            setIsPlaying(status.isPlaying);
            
            if (status.didJustFinish) {
                setIsPlaying(false);
                // Auto advance to next track sequentially in the current playlist
                const currentTracks = tracksRef.current;
                const currentTrackVal = currentTrackRef.current;
                if (currentTracks && currentTracks.length > 0 && currentTrackVal) {
                    const idx = currentTracks.findIndex(t => t.id === currentTrackVal.id);
                    const nextIdx = (idx + 1) % currentTracks.length;
                    playTrack(currentTracks[nextIdx]);
                }
            }
        } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
        }
    }, []);

    const playTrack = useCallback(async (track, newPlaylist = null) => {
        if (!track || !track.id) {
            console.error("Cannot play track: No track ID", track);
            return;
        }

        if (isLoadingSound.current) return;
        isLoadingSound.current = true;
        setIsTrackLoading(true);

        if (newPlaylist && Array.isArray(newPlaylist)) {
            setTracks(newPlaylist);
        }

        try {
            // Reset video mode
            setMode('audio');
            setVideoPlaying(false);
            setVideoId(null);
            setVideoError(null);

            // Stop and unload old sound (fire & forget)
            if (soundRef.current) {
                const oldSound = soundRef.current;
                soundRef.current = null;
                oldSound.stopAsync().catch(() => {}).finally(() => oldSound.unloadAsync().catch(() => {}));
            }

            setCurrentTime(0);
            setDuration(0);
            setCurrentTrack(track);
            setIsPlaying(false);

            // Prefetch video in background
            const q = `${track.name} ${track.artist}`;
            axios.get(`${API_BASE_URL}/api/video?q=${encodeURIComponent(q)}`)
                .then(res => setVideoId(res.data.videoId))
                .catch(() => {});

            // ─── Resolve actual audio URL directly from JioSaavn APIs ───
            // Extract the song ID from the preview_url or use track.id directly
            const songId = track.id;
            const songName = track.name;
            const songArtist = track.artist;

            const audioUrl = await resolveAudioUrl(songId, songName, songArtist);
            console.log(`🔗 Audio URL: ${audioUrl?.substring(0, 60)}...`);

            if (!audioUrl) {
                throw new Error('Could not resolve audio URL');
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true, progressUpdateIntervalMillis: 500, volume: volume },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setIsPlaying(true);
        } catch (error) {
            console.error("Error loading sound:", error);
            setIsPlaying(false);
            setFetchError('Please try again');
            // Do not throw the error up, keep it caught to avoid native bridge crashes
        } finally {
            isLoadingSound.current = false;
            setIsTrackLoading(false);
        }
    }, [volume, onPlaybackStatusUpdate]);

    const togglePlay = useCallback(async () => {
        if (!soundRef.current) return;
        try {
            if (isPlaying) {
                await soundRef.current.pauseAsync();
            } else {
                await soundRef.current.playAsync();
            }
        } catch (e) {
            console.error('togglePlay error:', e);
        }
    }, [isPlaying]);

    const handleNext = useCallback((currentTracks, currentTrackArg) => {
        const tList = currentTracks || tracksRef.current;
        const tCurrent = currentTrackArg || currentTrackRef.current;
        if (!tList || tList.length === 0) return;
        const currentIndex = tList.findIndex(t => t.id === tCurrent?.id);
        const nextIndex = (currentIndex + 1) % tList.length;
        playTrack(tList[nextIndex]);
    }, [playTrack]);

    const handlePrev = useCallback((currentTracks, currentTrackArg) => {
        const tList = currentTracks || tracksRef.current;
        const tCurrent = currentTrackArg || currentTrackRef.current;
        if (!tList || tList.length === 0) return;
        const currentIndex = tList.findIndex(t => t.id === tCurrent?.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = tList.length - 1;
        playTrack(tList[prevIndex]);
    }, [playTrack]);

    const seekTo = useCallback(async (time) => {
        if (soundRef.current) {
            await soundRef.current.setPositionAsync(time * 1000);
        }
    }, []);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const toggleExpand = () => setIsExpanded(prev => !prev);

    const [searchArtists, setSearchArtists] = useState([]);

    const searchTracks = async (query) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/api/search/all?query=${encodeURIComponent(query)}`);
            const playableTracks = (response.data.tracks || []).filter(t => t.id);
            setSearchResults(playableTracks);
            setSearchArtists(response.data.artists || []);
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
            setSearchArtists([]);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = async (newMode) => {
        if (newMode === mode) return;

        if (newMode === 'video') {
            if (soundRef.current) {
                try { await soundRef.current.pauseAsync(); } catch (e) {}
            }
            setIsPlaying(false);
            setMode('video');
            setVideoError(null);
            setVideoPlaying(false);

            if (!videoId) {
                setVideoLoading(true);
                try {
                    const query = `${currentTrack.name} ${currentTrack.artist} official music video`;
                    const response = await axios.get(`${API_BASE_URL}/api/video?q=${encodeURIComponent(query)}`, { timeout: 15000 });
                    setVideoId(response.data.videoId);
                } catch (e) {
                    setVideoError('Video not found... Try again..');
                    setMode('audio');
                    setVideoId(null);
                } finally {
                    setVideoLoading(false);
                }
            } else {
                // If prefetched, it will trigger onReady in FullPlayerScreen instantly
                setVideoLoading(false);
            }
        } else {
            setVideoPlaying(false);
            setVideoId(null);
            setMode('audio');
            if (soundRef.current) {
                try { await soundRef.current.playAsync(); } catch (e) {}
            }
        }
    };

    return (
        <PlaybackContext.Provider value={{
            tracks, setTracks, currentTrack, isPlaying, volume, currentTime, duration,
            isLoading, isTrackLoading, isExpanded,
            playTrack, togglePlay,
            handleNext: (t, c) => handleNext(t, c),
            handlePrev: (t, c) => handlePrev(t, c),
            formatTime, seekTo, searchTracks, toggleExpand,
            albums, artists, selectedAlbum, searchResults, searchArtists,
            fetchError, refetchHomeData: fetchInitialData,
            // Video states
            mode, videoId, videoLoading, videoError, videoPlaying, setVideoPlaying, switchMode
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);