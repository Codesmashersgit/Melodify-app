import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';
import FullPlayerScreen from './FullPlayerScreen';

const { width } = Dimensions.get('window');

const PlayerBar = () => {
    const { currentTrack, isPlaying, togglePlay, handleNext, currentTime, duration, tracks } = usePlayback();
    const [isFullPlayerVisible, setIsFullPlayerVisible] = React.useState(false);

    if (!currentTrack) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.95}
                onPress={() => setIsFullPlayerVisible(true)}
            >
                {/* Progress Bar at the Top */}
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
                </View>

                <View style={styles.content}>
                    {/* Album Art */}
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: currentTrack.image }} style={styles.image} />
                        {isPlaying && <View style={styles.playingDot} />}
                    </View>

                    {/* Track Info */}
                    <View style={styles.trackInfo}>
                        <Text style={styles.name} numberOfLines={1}>{currentTrack.name}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            onPress={togglePlay}
                            style={styles.playButton}
                            activeOpacity={0.8}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={20}
                                color="black"
                                style={!isPlaying && { marginLeft: 2 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNext}
                            style={styles.nextBtn}
                            activeOpacity={0.7}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons name="play-skip-forward" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            <FullPlayerScreen
                visible={isFullPlayerVisible}
                onClose={() => setIsFullPlayerVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 74,
        width: width - 20,
        marginHorizontal: 10,
        left: 0,
        backgroundColor: '#1e1e2e',
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 46,
        height: 46,
        borderRadius: 8,
    },
    playingDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1DB954',
        borderWidth: 2,
        borderColor: '#1e1e2e',
    },
    trackInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
        justifyContent: 'center',
    },
    name: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 3,
        letterSpacing: 0.1,
    },
    artist: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingRight: 4,
    },
    playButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
    },
    nextBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBackground: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    progressBar: {
        height: 2,
        backgroundColor: '#1DB954',
    },
});

export default PlayerBar;
