import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
    const { playTrack, searchTracks, searchResults, searchArtists, isLoading } = usePlayback();
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const insets = useSafeAreaInsets();

    // Debouncing
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setHasSearched(false);
            return;
        }

        const handler = setTimeout(() => {
            searchTracks(searchQuery);
            setHasSearched(true);
        }, 600);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const renderArtistItem = ({ item }) => (
        <TouchableOpacity
            style={styles.artistChip}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
        >
            <Image source={{ uri: item.image }} style={styles.artistChipImage} />
            <Text style={styles.artistChipName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderTrackItem = ({ item }) => (
        <TouchableOpacity style={styles.trackCard} activeOpacity={0.7} onPress={() => playTrack(item)}>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <View style={styles.playIconContainer}>
                <Ionicons name="play" size={16} color="black" style={{ marginLeft: 3 }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
            </View>

            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="What do you want to listen to?"
                    placeholderTextColor="#535353"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#535353" />
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loaderText}>Searching the universe...</Text>
                </View>
            ) : hasSearched ? (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTrackItem}
                    contentContainerStyle={styles.listContainer}
                    ListHeaderComponent={
                        searchArtists.length > 0 ? (
                            <View style={{ marginBottom: 8 }}>
                                <Text style={styles.sectionLabel}>Artists</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={searchArtists}
                                    keyExtractor={(item) => `artist-${item.id}`}
                                    renderItem={renderArtistItem}
                                    contentContainerStyle={{ paddingBottom: 4 }}
                                />
                                {searchResults.length > 0 && <Text style={styles.sectionLabel}>Songs</Text>}
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Ionicons name="search-outline" size={60} color="#333" />
                            <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="musical-notes-outline" size={80} color="#222" />
                    <Text style={styles.initialTitle}>Find your favorite songs</Text>
                    <Text style={styles.initialSubtitle}>Search for Melodify's best music</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 52,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: 'black',
        fontWeight: '600',
        height: '100%',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 130, // For PlayerBar
    },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    trackImage: {
        width: 56,
        height: 56,
        borderRadius: 6,
    },
    trackInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 10,
    },
    trackName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    trackArtist: {
        color: '#b3b3b3',
        fontSize: 13,
        fontWeight: '500',
    },
    playIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    loaderText: {
        color: '#b3b3b3',
        marginTop: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        color: '#b3b3b3',
        fontSize: 16,
        marginTop: 16,
        fontWeight: '500',
    },
    initialTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 24,
        letterSpacing: -0.5,
    },
    initialSubtitle: {
        color: '#b3b3b3',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    sectionLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 4,
    },
    artistChip: {
        width: 84,
        marginRight: 14,
        alignItems: 'center',
    },
    artistChipImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    artistChipName: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default SearchScreen;