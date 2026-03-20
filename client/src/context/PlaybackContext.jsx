import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
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

                if (tracksResponse.data.length > 0) {
                    setCurrentTrack(tracksResponse.data[0]);
                    audioRef.current.src = tracksResponse.data[0].preview_url;
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
        const handleEnd = () => handleNext();
        const handleError = (e) => {
            console.error("Audio playback error:", e);
            console.error("Audio error code:", audio.error?.code);
            console.error("Audio error message:", audio.error?.message);
            console.error("Current src:", audio.src);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnd);
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', () => console.warn("Audio stalled..."));
        audio.addEventListener('waiting', () => console.log("Audio waiting for data..."));

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnd);
            audio.removeEventListener('error', handleError);
        };
    }, [tracks]); // Re-bind if tracks change, though logic mostly relies on refs

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

    const togglePlay = () => {
        if (!currentTrack) return;
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
    };

    const handlePrev = () => {
        if (tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = tracks.length - 1;
        playTrack(tracks[prevIndex]);
    };

    const playTrack = (track, newPlaylist = null) => {
        if (!track || !track.preview_url) {
            console.error("Cannot play track: No preview URL found", track);
            return;
        }

        // Update the global tracks list if a new one is provided
        if (newPlaylist && Array.isArray(newPlaylist) && newPlaylist.length > 0) {
            setTracks(newPlaylist);
        }

        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            // Set source first to pre-load
            audioRef.current.pause();
            audioRef.current.src = track.preview_url;
            audioRef.current.load();

            setCurrentTrack(track);
            setIsPlaying(true);

            // Explicitly call play() after setting src
            audioRef.current.play().catch(e => {
                console.warn("Autoplay blocked or stream interrupted:", e.message);
            });
        }
    };

    const playArtistTracks = async (artistId) => {
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
    };

    const searchTracks = async (query) => {
        if (!query) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);

            const playableTracks = response.data.filter(t => t.preview_url);
            setTracks(playableTracks);
            setSearchResults(playableTracks);
            // Optionally auto-play the first result
            // if (playableTracks.length > 0) playTrack(playableTracks[0]);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectAlbumPlaylist = (albumData) => {
        setSelectedAlbum(albumData);
        // Set the album's tracks as the current tracklist
        if (albumData.tracks && albumData.tracks.length > 0) {
            setTracks(albumData.tracks);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const seekTo = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

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
