import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator, StatusBar, SectionList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import Constants from 'expo-constants';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import SongOptionsSheet from '../components/SongOptionsSheet';
import AddToPlaylistSheet from '../components/AddToPlaylistSheet';


const SearchScreen = ({ navigation }) => {
    const { playTrack, artists, albums } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [songResults, setSongResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [albumResults, setAlbumResults] = useState([]);
    const insets = useSafeAreaInsets();
    const debounceRef = useRef(null);

    const [selectedTrack, setSelectedTrack] = useState(null);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [playlistVisible, setPlaylistVisible] = useState(false);

    const openOptions = (track) => {
        setSelectedTrack(track);
        setOptionsVisible(true);
    };

    const [isListening, setIsListening] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMoodKeywords, setAiMoodKeywords] = useState('');

    // expo-speech-recognition event handlers
    useSpeechRecognitionEvent('start', () => setIsListening(true));
    useSpeechRecognitionEvent('end', () => setIsListening(false));
    useSpeechRecognitionEvent('result', (event) => {
        if (event.results && event.results.length > 0) {
            const text = event.results[0]?.transcript;
            if (text) {
                setSearchQuery(text);
                handleAiSearch(text);
            }
        }
    });
    useSpeechRecognitionEvent('error', (event) => {
        setIsListening(false);
        console.log('Voice error:', event.error);
    });


    const aiModeRef = useRef(false);

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

        // If in AI mode, don't fire normal search via debounce
        if (aiModeRef.current) return;

        debounceRef.current = setTimeout(() => {
            doSearch(searchQuery.trim());
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery]);

    const startListening = async () => {
        try {
            setAiMoodKeywords('');
            const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Microphone permission is required for voice search.');
                return;
            }
            ExpoSpeechRecognitionModule.start({
                lang: 'en-IN',
                interimResults: false,
                maxAlternatives: 1,
            });
        } catch (e) {
            console.error('Voice start error:', e);
        }
    };

    const handleAiSearch = async (text) => {
        if (!text || !text.trim()) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        aiModeRef.current = true;
        setAiLoading(true);
        setHasSearched(true);
        setSongResults([]);
        setArtistResults([]);
        setAlbumResults([]);
        try {
            // Try AI endpoint first
            const response = await axios.get(`${API_BASE_URL}/api/ai-mood?query=${encodeURIComponent(text)}`, { timeout: 10000 });
            const { keywords, tracks } = response.data;
            setAiMoodKeywords(keywords || text);
            setSongResults(tracks || []);
        } catch (error) {
            console.log('AI endpoint not available, falling back to direct search');
            // Fallback: search directly with the typed query on JioSaavn
            try {
                setAiMoodKeywords(`🔍 Searching: "${text}"`);
                const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(text)}`);
                const results = response.data || [];
                setSongResults(results.filter(r => r.id));
            } catch (fallbackErr) {
                console.error('Fallback search also failed:', fallbackErr);
                setAiMoodKeywords('Search failed. Please try again.');
            }
        } finally {
            setAiLoading(false);
            setIsListening(false);
        }
    };

    const doSearch = async (query) => {
        aiModeRef.current = false;
        setAiMoodKeywords('');
        setIsLoading(true);
        setHasSearched(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
            const allResults = response.data || [];

            // /api/search returns tracks with id field (not preview_url)
            const songs = allResults.filter(r => r.id);
            setSongResults(songs);

            // Filter artists from context that match query
            const matchedArtists = (artists || []).filter(a =>
                a.name.toLowerCase().includes(query.toLowerCase())
            );
            setArtistResults(matchedArtists.slice(0, 5));

            // Filter albums from context that match query
            const matchedAlbums = (albums || []).filter(a =>
                a.name.toLowerCase().includes(query.toLowerCase()) ||
                (a.artist && a.artist.toLowerCase().includes(query.toLowerCase()))
            );
            setAlbumResults(matchedAlbums.slice(0, 5));

        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSong = ({ item }) => (
        <TouchableOpacity style={styles.trackCard} activeOpacity={0.7} onPress={() => playTrack(item, songResults)}>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => openOptions(item)} style={{ padding: 10 }}>
                <Ionicons name="ellipsis-vertical" size={20} color="#b3b3b3" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderArtist = ({ item }) => (
        <TouchableOpacity
            style={styles.artistCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
        >
            <Image source={{ uri: item.image }} style={styles.artistImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist}>Artist</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
    );

    const renderAlbum = ({ item }) => (
        <TouchableOpacity
            style={styles.trackCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Album', { albumId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>Album • {item.artist}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
    );

    const sections = [];
    if (artistResults.length > 0) sections.push({ title: 'Artists', data: artistResults, type: 'artist' });
    if (albumResults.length > 0) sections.push({ title: 'Albums', data: albumResults, type: 'album' });
    if (songResults.length > 0) sections.push({ title: 'Songs', data: songResults, type: 'song' });

    const totalResults = artistResults.length + albumResults.length + songResults.length;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Search</Text>

            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Songs, artists, or 'how you feel'..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        // Only clear AI mode if user actually changes the text
                        if (aiModeRef.current && text !== searchQuery) {
                            setAiMoodKeywords('');
                            aiModeRef.current = false;
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                
                {/* AI Search Text Trigger */}
                <TouchableOpacity onPress={() => handleAiSearch(searchQuery)} style={styles.aiButton}>
                    <Text style={styles.aiButtonText}>✨</Text>
                </TouchableOpacity>

                {/* Voice Search Trigger */}
                <TouchableOpacity onPress={startListening} style={[styles.micButton, isListening && styles.micListening]}>
                    <Ionicons name={isListening ? "mic" : "mic-outline"} size={22} color={isListening ? "white" : "#1DB954"} />
                </TouchableOpacity>

                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close-circle" size={20} color="#555" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}

            {isLoading || aiLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loaderText}>{aiLoading ? '🧠 AI is reading your mood...' : 'Searching...'}</Text>
                </View>
            ) : aiModeRef.current && songResults.length > 0 ? (
                // AI mode: show keyword banner + flat list of songs
                <FlatList
                    data={songResults}
                    keyExtractor={(item) => item.id?.toString()}
                    ListHeaderComponent={
                        <View style={styles.aiResultContainer}>
                            <Text style={styles.aiResultText}>✨ Songs for: <Text style={{fontWeight: 'bold', color: 'white'}}>{aiMoodKeywords}</Text></Text>
                        </View>
                    }
                    renderItem={renderSong}
                    contentContainerStyle={[styles.listContainer, { paddingTop: 0 }]}
                    showsVerticalScrollIndicator={false}
                />
            ) : hasSearched && totalResults === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color="#222" />
                    <Text style={styles.emptyText}>No results for "{searchQuery}"</Text>
                    <Text style={styles.emptySubText}>Try a different keyword</Text>
                </View>
            ) : hasSearched ? (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                    )}
                    renderItem={({ item, section }) => {
                        if (section.type === 'artist') return renderArtist({ item });
                        if (section.type === 'album') return renderAlbum({ item });
                        return renderSong({ item });
                    }}
                    contentContainerStyle={styles.listContainer}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="musical-notes-outline" size={80} color="#1a1a2e" />
                    <Text style={styles.initialTitle}>Find your sound</Text>
                    <Text style={styles.initialSubtitle}>Search for songs, artists, or albums</Text>
                </View>
            )}

            <SongOptionsSheet 
                visible={optionsVisible}
                onClose={() => setOptionsVisible(false)}
                track={selectedTrack}
                onAddToPlaylist={(track) => setPlaylistVisible(true)}
            />
            <AddToPlaylistSheet
                visible={playlistVisible}
                onClose={() => setPlaylistVisible(false)}
                track={selectedTrack}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b0b12' },
    headerTitle: {
        fontSize: 32, fontWeight: '800', color: 'white',
        paddingHorizontal: 20, marginBottom: 16, letterSpacing: -0.5,
    },
    searchBarContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1a1a24', marginHorizontal: 16,
        borderRadius: 12, paddingHorizontal: 14, height: 50,
        marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 15, color: 'white', fontWeight: '500', height: '100%' },
    micButton: { padding: 6, marginLeft: 5, borderRadius: 20 },
    micListening: { backgroundColor: '#1DB954' },
    aiButton: { padding: 6, marginLeft: 5 },
    aiButtonText: { fontSize: 18 },
    aiResultContainer: { backgroundColor: 'rgba(29, 185, 84, 0.1)', marginHorizontal: 16, padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(29, 185, 84, 0.3)' },
    aiResultText: { color: '#1DB954', fontSize: 14, textAlign: 'center' },
    listContainer: { paddingBottom: 160 },
    sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    trackCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10,
        borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    artistCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10,
        borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    trackImage: { width: 52, height: 52, borderRadius: 6 },
    artistImage: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#1DB954' },
    trackInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
    trackName: { color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    trackArtist: { color: '#888', fontSize: 13, fontWeight: '400' },
    playIconContainer: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
    },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    loaderText: { color: '#888', marginTop: 14, fontSize: 14 },
    emptyText: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 20, letterSpacing: -0.3 },
    emptySubText: { color: '#666', fontSize: 14, marginTop: 6 },
    initialTitle: { color: 'white', fontSize: 22, fontWeight: '700', marginTop: 24, letterSpacing: -0.5 },
    initialSubtitle: { color: '#555', fontSize: 14, marginTop: 8 },
});

export default SearchScreen;