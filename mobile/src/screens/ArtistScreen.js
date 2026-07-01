import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { usePlayback } from '../context/PlaybackContext';
import API_BASE_URL from '../config';

const ArtistScreen = ({ route, navigation }) => {
    const { artistId, artistName, artistImage } = route.params;
    const { playTrack } = usePlayback();
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArtistData();
    }, [artistId]);

    const fetchArtistData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/artist/${artistId}/tracks`);
            setTracks(response.data.tracks || []);
        } catch (error) {
            console.error('Error fetching artist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTrackItem = ({ item, index }) => (
        <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item)}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.album || item.artist}</Text>
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <View>
                        <Image source={{ uri: artistImage }} style={styles.heroImage} />
                        <View style={styles.heroOverlay}>
                            <Text style={styles.artistName}>{artistName}</Text>
                        </View>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.playButton} onPress={() => tracks.length > 0 && playTrack(tracks[0])}>
                                <Ionicons name="play" size={28} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionTitle}>Popular</Text>
                    </View>
                }
                data={tracks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrackItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    loadingContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    headerBar: { position: 'absolute', top: 50, left: 15, zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    heroImage: { width: width, height: 300, resizeMode: 'cover' },
    heroOverlay: { position: 'absolute', bottom: 0, width: width, padding: 20, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.4)' },
    artistName: { color: 'white', fontSize: 40, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', width: '100%', alignItems: 'center', paddingHorizontal: 20, marginTop: 15, marginBottom: 15 },
    playButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15 },
    listContainer: { paddingBottom: 100 },
    trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    trackIndex: { color: '#b3b3b3', fontSize: 16, width: 30 },
    trackImage: { width: 40, height: 40, marginRight: 10 },
    trackInfo: { flex: 1 },
    trackName: { color: 'white', fontSize: 16, marginBottom: 4 },
    trackArtist: { color: '#b3b3b3', fontSize: 14 }
});

export default ArtistScreen;
