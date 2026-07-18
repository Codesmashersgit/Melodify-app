import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';

const AddToPlaylistSheet = ({ visible, onClose, track }) => {
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchPlaylists();
        }
    }, [visible]);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('melodify_token');
            const response = await axios.get(`${API_BASE_URL}/api/user/playlists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlaylists(response.data);
        } catch (error) {
            console.error('Error fetching playlists', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToPlaylist = async (playlistId) => {
        try {
            const token = await AsyncStorage.getItem('melodify_token');
            const trackData = {
                id: track.id,
                name: track.name,
                artist: track.artist,
                image: track.image || track.thumbnail,
                preview_url: track.preview_url
            };
            // Try standard add-song endpoint
            await axios.post(`${API_BASE_URL}/api/user/playlists/${playlistId}/add`, trackData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.log('Error adding to playlist', error);
        } finally {
            onClose();
        }
    };

    if (!track) return null;

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.playlistRow} onPress={() => addToPlaylist(item.id)}>
            <Ionicons name="musical-notes" size={24} color="#b3b3b3" />
            <Text style={styles.playlistName}>{item.name}</Text>
        </TouchableOpacity>
    );

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
                    <Text style={styles.title}>Add to Playlist</Text>
                    
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={playlists}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            ListEmptyComponent={<Text style={styles.emptyText}>No playlists found.</Text>}
                            style={styles.list}
                        />
                    )}
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
        maxHeight: '60%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
    },
    list: {
        marginTop: 10,
    },
    playlistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    playlistName: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 15,
        fontFamily: 'Montserrat-Medium',
    },
    emptyText: {
        color: '#b3b3b3',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Montserrat-Regular',
    }
});

export default AddToPlaylistSheet;
