import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { usePlayback } from '../context/PlaybackContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';

const LibraryScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { playTrack } = usePlayback();
    const [activeTab, setActiveTab] = useState('liked'); // 'liked' or 'playlists'
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'liked') fetchLikedSongs();
            else fetchPlaylists();
        }, [activeTab])
    );

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('melodify_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchLikedSongs = async () => {
        setIsLoading(true);
        try {
            const config = await getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/api/user/liked-songs`, config);
            setLikedSongs(response.data);
        } catch (error) {
            console.error('Error fetching liked songs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const config = await getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/api/user/playlists`, config);
            setPlaylists(response.data);
        } catch (error) {
            console.error('Error fetching playlists', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSongItem = ({ item }) => (
        <TouchableOpacity style={styles.trackCard} activeOpacity={0.7} onPress={() => playTrack(item)}>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <View style={styles.actionIconContainer}>
                <Ionicons name="heart" size={20} color="#1DB954" />
            </View>
        </TouchableOpacity>
    );

    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity style={styles.trackCard} activeOpacity={0.7} onPress={() => navigation.navigate('Playlist', { playlistId: item.id, playlistName: item.name })}>
            <View style={styles.playlistImageFallback}>
                <Ionicons name="musical-notes" size={28} color="#b3b3b3" />
            </View>
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>Playlist • {user?.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#b3b3b3" style={{ marginRight: 8 }} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileInitials}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerSubtitle}>Your</Text>
                        <Text style={styles.headerTitle}>Library</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Downloads')} style={{ padding: 10 }}>
                        <Ionicons name="download-outline" size={28} color="#1DB954" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.tabs}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'liked' && styles.activeTab]} 
                        onPress={() => setActiveTab('liked')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>❤️  Liked Songs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'playlists' && styles.activeTab]} 
                        onPress={() => setActiveTab('playlists')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>🎵  Playlists</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'liked' ? likedSongs : playlists}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={activeTab === 'liked' ? renderSongItem : renderPlaylistItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons 
                                name={activeTab === 'liked' ? 'heart-outline' : 'albums-outline'} 
                                size={60} 
                                color="#333" 
                            />
                            <Text style={styles.emptyTitle}>
                                {activeTab === 'liked' ? "No liked songs" : "No playlists"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'liked' ? "Songs you like will appear here." : "Playlists you create will appear here."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b0b12' },
    header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    profileIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    profileInitials: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: '#888', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
    headerTitle: { color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    tabs: { flexDirection: 'row' },
    tab: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    activeTab: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    tabText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
    activeTabText: { color: 'black', fontWeight: 'bold' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    listContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 130 },
    trackCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, marginBottom: 12 },
    trackImage: { width: 60, height: 60, borderRadius: 6 },
    playlistImageFallback: { width: 60, height: 60, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    trackInfo: { flex: 1, marginLeft: 16, marginRight: 10 },
    trackName: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 6 },
    trackArtist: { color: '#b3b3b3', fontSize: 13, fontWeight: '500' },
    actionIconContainer: { width: 40, alignItems: 'flex-end', paddingRight: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 24, letterSpacing: -0.5 },
    emptySubtitle: { color: '#b3b3b3', fontSize: 14, marginTop: 8, fontWeight: '500' }
});

export default LibraryScreen;
