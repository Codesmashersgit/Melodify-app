import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';

const { width } = Dimensions.get('window');

// type: 'artists' | 'albums' | 'tracks'
const SeeAllScreen = ({ route, navigation }) => {
    const { type, title } = route.params;
    const { artists, albums, tracks, playTrack } = usePlayback();
    const insets = useSafeAreaInsets();

    const data = type === 'artists' ? artists : type === 'albums' ? albums : tracks;

    const renderArtist = ({ item }) => (
        <TouchableOpacity
            style={styles.artistCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
        >
            <Image source={{ uri: item.image }} style={styles.artistImage} />
            <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderAlbum = ({ item }) => (
        <TouchableOpacity
            style={styles.albumCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Album', { albumId: item.id })}
        >
            <View style={styles.albumImageContainer}>
                <Image source={{ uri: item.image }} style={styles.albumImage} />
                <View style={styles.albumImageOverlay}>
                    <Text style={styles.albumCenterText} numberOfLines={2}>{item.name}</Text>
                </View>
            </View>
            <Text style={styles.albumTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.albumSubtitle} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    const renderTrack = ({ item, index }) => (
        <TouchableOpacity style={styles.trackRow} activeOpacity={0.7} onPress={() => playTrack(item, tracks)}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <Image source={{ uri: item.image }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Ionicons name="play-circle" size={30} color="#1DB954" />
        </TouchableOpacity>
    );

    const renderItem = type === 'artists' ? renderArtist : type === 'albums' ? renderAlbum : renderTrack;
    const numColumns = type === 'artists' ? 3 : type === 'albums' ? 2 : 1;
    const keyExtractor = (item) => item.id.toString();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={data || []}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                numColumns={numColumns}
                key={numColumns}
                columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start', gap: 16 } : undefined}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="albums-outline" size={56} color="#333" />
                        <Text style={styles.emptyText}>Kuch nahi mila yahan abhi.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 160,
        gap: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        color: '#8A9A90',
        fontSize: 14,
        marginTop: 12,
    },

    // Artists (3-column grid)
    artistCard: {
        alignItems: 'center',
        width: (width - 32 - 32) / 3,
        marginBottom: 4,
    },
    artistImage: {
        width: (width - 32 - 32) / 3 - 8,
        height: (width - 32 - 32) / 3 - 8,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#1DB954',
        marginBottom: 8,
    },
    artistName: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Albums (2-column grid)
    albumCard: {
        width: (width - 32 - 16) / 2,
        marginBottom: 4,
    },
    albumImageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    albumImage: {
        width: '100%',
        height: '100%',
    },
    albumImageOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    albumCenterText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    albumTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    albumSubtitle: {
        color: '#999',
        fontSize: 11,
    },

    // Tracks (vertical list)
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
        borderRadius: 8,
    },
    trackIndex: {
        color: '#8A9A90',
        fontSize: 13,
        fontWeight: '600',
        width: 24,
        textAlign: 'center',
    },
    trackImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginLeft: 8,
    },
    trackInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 10,
    },
    trackName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    trackArtist: {
        color: '#999',
        fontSize: 12,
    },
});

export default SeeAllScreen;