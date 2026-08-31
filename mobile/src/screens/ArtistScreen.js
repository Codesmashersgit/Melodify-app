import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { usePlayback } from '../context/PlaybackContext';
import API_BASE_URL from '../config';

const ArtistScreen = ({ route, navigation }) => {
    const { artistId, artistName, artistImage } = route.params;
    const { playTrack } = usePlayback();
    const insets = useSafeAreaInsets();
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
        <TouchableOpacity style={styles.trackItem} onPress={() => playTrack(item, tracks)}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.trackImage} />
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
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" translucent={true} />
            
            <View style={[styles.headerBar, { top: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={22} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <View>
                        <View style={styles.heroContainer}>
                            <Image source={{ uri: artistImage || 'https://via.placeholder.com/150' }} style={styles.heroImage} />
                            <View style={styles.heroOverlay}>
                                <Text style={styles.artistName}>{artistName}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.playButton} onPress={() => tracks.length > 0 && playTrack(tracks[0])}>
                                <Ionicons name="play" size={24} color="black" />
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
    headerBar: { position: 'absolute', left: 15, zIndex: 10 },
    backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', paddingRight: 2 },
    heroContainer: { position: 'relative' },
    heroImage: { width: width, height: 240, resizeMode: 'cover' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, width: width, padding: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: 'transparent' },
    artistName: { color: 'white', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    actionRow: { flexDirection: 'row', width: '100%', alignItems: 'center', paddingHorizontal: 20, marginTop: 15, marginBottom: 15 },
    playButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15 },
    listContainer: { paddingBottom: 100 },
    trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    trackIndex: { color: '#b3b3b3', fontSize: 16, width: 30 },
    trackImage: { width: 40, height: 40, marginRight: 10, borderRadius: 4 },
    trackInfo: { flex: 1 },
    trackName: { color: 'white', fontSize: 16, marginBottom: 4 },
    trackArtist: { color: '#b3b3b3', fontSize: 14 }
});

export default ArtistScreen;