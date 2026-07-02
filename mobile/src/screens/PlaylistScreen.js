import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayback } from '../context/PlaybackContext';
import API_BASE_URL from '../config';

const PlaylistScreen = ({ route, navigation }) => {
    const { playlistId, playlistName } = route.params;
    const { playTrack } = usePlayback();
    const insets = useSafeAreaInsets();
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlaylistSongs();
    }, [playlistId]);

    const fetchPlaylistSongs = async () => {
        try {
            const token = await AsyncStorage.getItem('melodify_token');
            const response = await axios.get(`${API_BASE_URL}/api/user/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map the db keys back to app track format
            const formattedSongs = response.data.songs.map(s => ({
                id: s.song_id,
                name: s.song_name,
                artist: s.song_artist,
                image: s.song_image,
                preview_url: s.song_preview
            }));
            setSongs(formattedSongs);
        } catch (error) {
            console.error('Error fetching playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSongItem = ({ item, index }) => (
        <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item)}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#b3b3b3" />
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={[styles.headerBar, { top: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.playlistIconContainer}>
                            <Ionicons name="musical-notes" size={80} color="#b3b3b3" />
                        </View>
                        <Text style={styles.playlistName}>{playlistName}</Text>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.playButton} onPress={() => songs.length > 0 && playTrack(songs[0])}>
                                <Ionicons name="play" size={28} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                data={songs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSongItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>This playlist is empty.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    loadingContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    headerBar: { position: 'absolute', left: 15, zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 20, paddingTop: 60, paddingBottom: 10 },
    playlistIconContainer: { width: 220, height: 220, marginBottom: 20, backgroundColor: '#282828', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    playlistName: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    actionRow: { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    playButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginRight: 20 },
    listContainer: { paddingBottom: 100 },
    trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    trackIndex: { color: '#b3b3b3', fontSize: 16, width: 30 },
    trackImage: { width: 40, height: 40, marginRight: 10 },
    trackInfo: { flex: 1 },
    trackName: { color: 'white', fontSize: 16, marginBottom: 4 },
    trackArtist: { color: '#b3b3b3', fontSize: 14 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#b3b3b3', fontSize: 16 }
});

export default PlaylistScreen;