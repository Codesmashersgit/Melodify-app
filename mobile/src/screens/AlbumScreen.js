import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { usePlayback } from '../context/PlaybackContext';
import API_BASE_URL from '../config';

const AlbumScreen = ({ route, navigation }) => {
    const { albumId } = route.params;
    const { playTrack } = usePlayback();
    const insets = useSafeAreaInsets();
    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAlbumData();
    }, [albumId]);

    const fetchAlbumData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/album/${albumId}`);
            setAlbum(response.data.album);
            setTracks(response.data.tracks || []);
        } catch (error) {
            console.error('Error fetching album:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTrackItem = ({ item, index }) => (
        <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item, tracks)}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
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

    if (!album) return null;

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
                        <Image source={{ uri: album.image }} style={styles.albumImage} />
                        <Text style={styles.albumName}>{album.name}</Text>
                        <Text style={styles.albumArtist}>Album • {album.artist}</Text>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.playButton} onPress={() => tracks.length > 0 && playTrack(tracks[0], tracks)}>
                                <Ionicons name="play" size={28} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                data={tracks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrackItem}
                contentContainerStyle={styles.listContainer}
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
    albumImage: { width: 220, height: 220, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
    albumName: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    albumArtist: { color: '#b3b3b3', fontSize: 16, marginBottom: 20 },
    actionRow: { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    playButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginRight: 20 },
    listContainer: { paddingBottom: 100 },
    trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    trackIndex: { color: '#b3b3b3', fontSize: 16, width: 30 },
    trackInfo: { flex: 1, marginLeft: 10 },
    trackName: { color: 'white', fontSize: 16, marginBottom: 4 },
    trackArtist: { color: '#b3b3b3', fontSize: 14 }
});

export default AlbumScreen;