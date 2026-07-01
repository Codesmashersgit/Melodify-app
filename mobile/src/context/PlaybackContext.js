import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import axios from 'axios';
import { Audio } from 'expo-av';
import API_BASE_URL from '../config';

const PlaybackContext = createContext();

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

    // Video Mode State
    const [mode, setMode] = useState('audio'); // 'audio' | 'video'
    const [videoId, setVideoId] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [videoPlaying, setVideoPlaying] = useState(false);

    const soundRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [tracksResponse, albumsResponse, artistsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/top-tracks`),
                    axios.get(`${API_BASE_URL}/api/recommendations`),
                    axios.get(`${API_BASE_URL}/api/artists`)
                ]);

                setTracks(tracksResponse.data);
                setAlbums(albumsResponse.data);
                setArtists(artistsResponse.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Cleanup sound on unmount and configure background audio
    useEffect(() => {
        const configureAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    playsInSilentModeIOS: true,
                    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
                });
            } catch (error) {
                console.error('Error configuring audio mode:', error);
            }
        };
        configureAudio();

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && appStateRef.current !== 'active' && soundRef.current && isPlaying) {
                soundRef.current.playAsync().catch(() => {});
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [isPlaying]);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);
            setDuration(status.durationMillis / 1000);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                handleNext();
            }
        } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
        }
    };

    const playTrack = useCallback(async (track, newPlaylist = null) => {
        if (!track || !track.preview_url) {
            console.error("Cannot play track: No preview URL found", track);
            return;
        }

        if (newPlaylist && Array.isArray(newPlaylist)) {
            setTracks(newPlaylist);
        }

        try {
            // Force reset to audio mode and stop any video playing
            setMode('audio');
            setVideoPlaying(false);
            setVideoId(null);
            setVideoError(null);

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: track.preview_url },
                { shouldPlay: true, volume: volume },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    }, [volume]);

    const togglePlay = useCallback(async () => {
        if (!soundRef.current) return;

        if (isPlaying) {
            await soundRef.current.pauseAsync();
        } else {
            await soundRef.current.playAsync();
        }
    }, [isPlaying]);

    const handleNext = useCallback(() => {
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
    }, [tracks, currentTrack, playTrack]);

    const handlePrev = useCallback(() => {
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = tracks.length - 1;
        playTrack(tracks[prevIndex]);
    }, [tracks, currentTrack, playTrack]);

    const seekTo = useCallback(async (time) => {
        if (soundRef.current) {
            await soundRef.current.setPositionAsync(time * 1000);
        }
    }, []);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const toggleExpand = () => setIsExpanded(prev => !prev);

    const searchTracks = async (query) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);
            const playableTracks = response.data.filter(t => t.preview_url);
            setSearchResults(playableTracks);
            setTracks(playableTracks);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = async (newMode) => {
        if (newMode === mode) return;

        if (newMode === 'video') {
            // Pause audio first
            if (soundRef.current) {
                try { await soundRef.current.pauseAsync(); } catch (e) {}
            }
            setIsPlaying(false);

            setMode('video');
            setVideoLoading(true);
            setVideoError(null);
            setVideoPlaying(false);

            try {
                const query = `${currentTrack.name} ${currentTrack.artist} official music video`;
                const response = await axios.get(`${API_BASE_URL}/api/video?q=${encodeURIComponent(query)}`);
                const id = response.data.videoId;
                setVideoId(id);
                // Small delay to ensure YoutubeIframe is mounted before autoplay
                setTimeout(() => {
                    setVideoPlaying(true);
                }, 500);
            } catch (e) {
                setVideoError('Video nahi mila 😔 Try kar baad mein');
                setMode('audio');
                setVideoId(null);
            } finally {
                setVideoLoading(false);
            }
        } else {
            // Switch back to audio
            setVideoPlaying(false);
            setVideoId(null);
            setMode('audio');
            // Resume audio playback
            if (soundRef.current) {
                try { await soundRef.current.playAsync(); } catch (e) {}
            }
        }
    };

    return (
        <PlaybackContext.Provider value={{
            tracks, currentTrack, isPlaying, volume, currentTime, duration, isLoading, isExpanded,
            playTrack, togglePlay, handleNext, handlePrev, formatTime, seekTo, searchTracks, toggleExpand,
            albums, artists, selectedAlbum, searchResults,
            // Video states
            mode, videoId, videoLoading, videoError, videoPlaying, setVideoPlaying, switchMode
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);
