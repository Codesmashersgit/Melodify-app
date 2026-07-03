import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';

const SeeAllScreen = ({ route, navigation }) => {
    const { type, title } = route.params;
    const { artists, albums, playTrack } = usePlayback();
    const insets = useSafeAreaInsets();

    const data = type === 'artists' ? artists : albums;

    const renderArtist = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
        >
            <Image source={{ uri: item.image }} style={styles.artistImage} />
            <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderAlbum = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Album', { albumId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.albumImage} />
            <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.subText} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={data}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                numColumns={2}
                renderItem={type === 'artists' ? renderArtist : renderAlbum}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.row}
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
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        padding: 4,
    },
    title: {
        flex: 1,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 120,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: '47%',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12,
    },
    artistImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    albumImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 12,
    },
    nameText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    subText: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default SeeAllScreen;
