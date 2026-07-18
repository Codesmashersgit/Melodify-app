import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';
import { useFocusEffect } from '@react-navigation/native';
import { getDownloadedTracks, deleteDownloadedTrack } from '../services/DownloadService';

const DownloadsScreen = ({ navigation }) => {
    const [downloads, setDownloads] = useState([]);
    const { playTrack } = usePlayback();
    const insets = useSafeAreaInsets();

    const fetchDownloads = async () => {
        const tracks = await getDownloadedTracks();
        setDownloads(tracks);
    };

    useFocusEffect(
        useCallback(() => {
            fetchDownloads();
        }, [])
    );

    const handleDelete = async (trackId) => {
        await deleteDownloadedTrack(trackId);
        fetchDownloads();
    };

    const renderSongItem = ({ item }) => (
        <TouchableOpacity style={styles.trackCard} activeOpacity={0.7} onPress={() => playTrack(item)}>
            <Image source={{ uri: item.image || item.thumbnail }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <TouchableOpacity style={styles.actionIconContainer} onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete" size={24} color="#ff4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Downloads</Text>
            </View>

            <FlatList
                data={downloads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSongItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="offline-pin" size={60} color="#333" />
                        <Text style={styles.emptyTitle}>No downloads</Text>
                        <Text style={styles.emptySubtitle}>Songs you download will appear here for offline playback.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b0b12' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: { marginRight: 15 },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    trackImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#222' },
    trackInfo: { flex: 1, marginLeft: 15 },
    trackName: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 4 },
    trackArtist: { color: '#b3b3b3', fontSize: 13, fontFamily: 'Montserrat-Regular' },
    actionIconContainer: { padding: 5 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyTitle: { color: '#fff', fontSize: 20, fontFamily: 'Montserrat-Bold', marginTop: 15 },
    emptySubtitle: { color: '#b3b3b3', fontSize: 14, fontFamily: 'Montserrat-Regular', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});

export default DownloadsScreen;
