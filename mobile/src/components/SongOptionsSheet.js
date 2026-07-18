import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';
import { downloadTrack, isTrackDownloaded, deleteDownloadedTrack } from '../services/DownloadService';

const SongOptionsSheet = ({ visible, onClose, track, onAddToPlaylist }) => {
    const { playNext, addToQueue } = usePlayback();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    useEffect(() => {
        if (track && visible) {
            isTrackDownloaded(track.id).then(setIsDownloaded);
        }
    }, [track, visible]);

    const handleDownloadToggle = async () => {
        if (isDownloaded) {
            Alert.alert('Remove Download', 'Are you sure you want to remove this download?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: async () => {
                    await deleteDownloadedTrack(track.id);
                    setIsDownloaded(false);
                }}
            ]);
        } else {
            setIsDownloading(true);
            setDownloadProgress(0);
            try {
                await downloadTrack(track, (progress) => {
                    setDownloadProgress(Math.round(progress * 100));
                });
                setIsDownloaded(true);
                Alert.alert('Success', 'Track downloaded successfully!');
            } catch (error) {
                Alert.alert('Error', 'Failed to download track.');
            } finally {
                setIsDownloading(false);
            }
        }
    };

    if (!track) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.sheetContainer} activeOpacity={1}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Image source={{ uri: track.image || track.thumbnail }} style={styles.trackImage} />
                        <View style={styles.trackInfo}>
                            <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    
                    <TouchableOpacity style={styles.optionRow} onPress={() => { playNext(track); onClose(); }}>
                        <MaterialIcons name="playlist-play" size={28} color="#fff" />
                        <Text style={styles.optionText}>Play Next</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.optionRow} onPress={() => { addToQueue(track); onClose(); }}>
                        <MaterialIcons name="queue-music" size={28} color="#fff" />
                        <Text style={styles.optionText}>Add to Queue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionRow} onPress={() => { onAddToPlaylist(track); onClose(); }}>
                        <MaterialIcons name="playlist-add" size={28} color="#fff" />
                        <Text style={styles.optionText}>Add to Playlist</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionRow} onPress={handleDownloadToggle} disabled={isDownloading}>
                        {isDownloading ? (
                            <ActivityIndicator size="small" color="#1DB954" style={{ marginRight: 15 }} />
                        ) : (
                            <MaterialIcons name={isDownloaded ? "offline-pin" : "file-download"} size={28} color={isDownloaded ? "#1DB954" : "#fff"} />
                        )}
                        <Text style={[styles.optionText, isDownloaded && { color: '#1DB954' }]}>
                            {isDownloading ? `Downloading ${downloadProgress}%` : isDownloaded ? 'Remove Download' : 'Download'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    trackImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: '#333',
    },
    trackInfo: {
        flex: 1,
    },
    trackName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    trackArtist: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Montserrat-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 15,
        fontFamily: 'Montserrat-Medium',
    }
});

export default SongOptionsSheet;
