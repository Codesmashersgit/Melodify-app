import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const PlaybackContext = createContext();
import API_BASE_URL from '../config';


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

    const audioRef = useRef(new Audio());

    useEffect(() => {
        // Fetch initial tracks, albums and artists
        const fetchInitialData = async () => {
            try {
                const [tracksResponse, albumsResponse, artistsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/top-tracks`),
                    axios.get(`${API_BASE_URL}/api/recommendations`),
                    axios.get(`${API_BASE_URL}/api/artists`)
                ]);


                // All Jamendo tracks have full audio (not just preview)
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
        if (!currentTrack) return;
        setIsPlaying(prev => !prev);
    }, [currentTrack]);

    const playTrack = useCallback((track, newPlaylist = null) => {
        if (!track || !track.preview_url) {
            console.error("Cannot play track: No preview URL found", track);
            return;
        }

        if (newPlaylist && Array.isArray(newPlaylist)) {
            setTracks(newPlaylist);
        }

        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            audioRef.current.pause();
            audioRef.current.src = track.preview_url;
            audioRef.current.load();

            setCurrentTrack(track);
            setIsPlaying(true);

            audioRef.current.play().catch(e => {
                console.warn("Autoplay blocked or stream interrupted:", e.message);
            });
        }
    }, [currentTrack, togglePlay]);

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

    // Handle audio end event using useCallback and reference to dependencies
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnd = () => handleNext();
        audio.addEventListener('ended', handleEnd);
        return () => audio.removeEventListener('ended', handleEnd);
    }, [handleNext]);

    const playArtistTracks = useCallback(async (artistId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/artist/${artistId}/tracks`);
            const playableTracks = response.data.tracks.filter(t => t.preview_url);
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
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);
            const playableTracks = response.data.filter(t => t.preview_url);
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
            tracks, currentTrack, isPlaying, volume, currentTime, duration, isLoading, isExpanded,
            playTrack, playArtistTracks, togglePlay, setVolume, setCurrentTime, handleNext, handlePrev, formatTime, seekTo, searchTracks, toggleExpand,
            albums, artists, selectedAlbum, selectAlbumPlaylist, searchResults
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);
