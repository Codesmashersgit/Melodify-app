import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    SafeAreaView, Dimensions, Modal, Alert, Animated,
    ActivityIndicator, StatusBar, Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { usePlayback } from '../context/PlaybackContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';

const { width, height } = Dimensions.get('window');

const FullPlayerScreen = ({ visible, onClose }) => {
    const {
        currentTrack, isPlaying, togglePlay, handleNext, handlePrev,
        currentTime, duration, formatTime, seekTo,
        mode, videoId, videoLoading, videoError, videoPlaying, setVideoPlaying, switchMode,
        tracks
    } = usePlayback();
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [progressBarWidth, setProgressBarWidth] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);
    const insets = useSafeAreaInsets();

    // Animated values
    const toggleAnim = useRef(new Animated.Value(mode === 'video' ? 1 : 0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Sync toggle pill animation with mode
    useEffect(() => {
        Animated.spring(toggleAnim, {
            toValue: mode === 'video' ? 1 : 0,
            useNativeDriver: false,
            tension: 60,
            friction: 8,
        }).start();
    }, [mode]);

    // Album art pulse animation when playing
    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            scaleAnim.stopAnimation();
            Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
    }, [isPlaying]);

    const handleLike = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to like songs.');
            return;
        }
        setIsLiking(true);
        try {
            const token = await AsyncStorage.getItem('melodify_token');
            await axios.post(`${API_BASE_URL}/api/user/liked-songs`, {
                song_id: currentTrack.id,
                song_name: currentTrack.name,
                song_artist: currentTrack.artist,
                song_image: currentTrack.image,
                song_preview: currentTrack.preview_url,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setIsLiked(true);
            Alert.alert('❤️ Added!', 'Song added to Liked Songs!');
        } catch (error) {
            if (error.response?.data?.error === 'Song already liked') {
                setIsLiked(true);
                Alert.alert('Info', 'Song is already in your Liked Songs.');
            } else {
                Alert.alert('Error', 'Could not like the song.');
            }
        } finally {
            setIsLiking(false);
        }
    };

    // Reset liked state on track change
    useEffect(() => {
        setIsLiked(false);
    }, [currentTrack?.id]);

    const toggleWidth = width * 0.52;
    const pillWidth = toggleWidth / 2 - 3;

    const pillTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, pillWidth + 2],
    });

    if (!currentTrack) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Sync slider with currentTime unless user is scrubbing
    useEffect(() => {
        if (!isSliding) {
            setSliderValue(currentTime);
        }
    }, [currentTime, isSliding]);

    const handleSeek = async (event) => {
        if (!duration || progressBarWidth <= 0) return;
        const offset = event.nativeEvent.locationX;
        const percent = Math.max(0, Math.min(1, offset / progressBarWidth));
        await seekTo(duration * percent);
    };

    // ─────────────────────────────────────────────────────────
    // Full Screen VIDEO View
    // ─────────────────────────────────────────────────────────
    if (mode === 'video') {
        return (
            <Modal visible={visible} animationType="fade" statusBarTranslucent
                presentationStyle="fullScreen"
                hardwareAccelerated
            >
                <View style={styles.fullVideoContainer}>
                    <StatusBar hidden={true} />

                    {videoLoading ? (
                        <View style={styles.videoLoader}>
                            <ActivityIndicator size="large" color="#1DB954" />
                            <Text style={styles.loadingText}>Loading video...</Text>
                        </View>
                    ) : videoError ? (
                        <View style={styles.videoLoader}>
                            <Ionicons name="alert-circle-outline" size={56} color="#ff4444" />
                            <Text style={styles.errorText}>{videoError}</Text>
                            <TouchableOpacity style={styles.backToAudioBtn} onPress={() => switchMode('audio')}>
                                <Ionicons name="musical-notes" size={18} color="black" style={{ marginRight: 6 }} />
                                <Text style={styles.backToAudioText}>Back to Audio</Text>
                            </TouchableOpacity>
                        </View>
                    ) : videoId ? (
                        <View style={{ width: width, height: width * (9 / 16) }}>
                            <YoutubeIframe
                                height={width * (9 / 16)}
                                width={width}
                                videoId={videoId}
                            play={videoPlaying}
                            initialPlayerParams={{
                                autoplay: 1,
                                controls: 1,
                                modestbranding: 1,
                                playsinline: 1,
                                rel: 0,
                                showinfo: 0,
                            }}
                            webViewProps={{
                                mediaPlaybackRequiresUserAction: false,
                                allowsInlineMediaPlayback: true,
                                allowsFullscreenVideo: true,
                            }}
                            onChangeState={(state) => {
                                if (state === 'ended') setVideoPlaying(false);
                                if (state === 'paused') setVideoPlaying(false);
                            }}
                            onReady={() => {
                                // Guarantee autoplay when iframe is fully loaded
                                setVideoPlaying(true);
                            }}
                        />
                        </View>
                    ) : null}

                    {/* Floating Top Bar */}
                    <View style={styles.floatingTopBar}>
                        <TouchableOpacity onPress={onClose} style={styles.floatingIconBtn}>
                            <Ionicons name="chevron-down" size={26} color="white" />
                        </TouchableOpacity>
                        <View style={styles.floatingTrackInfo}>
                            <Text style={styles.floatingTrackName} numberOfLines={1}>{currentTrack.name}</Text>
                            <Text style={styles.floatingArtistName} numberOfLines={1}>{currentTrack.artist}</Text>
                        </View>
                    </View>

                    {/* Floating Bottom - Switch Button */}
                    <View style={styles.floatingBottomBar}>
                        <TouchableOpacity style={styles.floatingSwitchBtn} onPress={() => switchMode('audio')}>
                            <Ionicons name="musical-notes" size={18} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.floatingSwitchText}>Switch to Audio</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // ─────────────────────────────────────────────────────────
    // Standard AUDIO View
    // ─────────────────────────────────────────────────────────
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
            <StatusBar hidden={false} barStyle="light-content" backgroundColor="#0b0b12" translucent />

            {/* Gradient Background */}
            <View style={styles.container}>
                <View style={styles.bgGradient} />

                <View style={{ flex: 1 }}>
                    {/* ── Header ── */}
                    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                        <TouchableOpacity onPress={onClose} style={styles.headerIconBtn}>
                            <Ionicons name="chevron-down" size={28} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerLabel}>NOW PLAYING</Text>
                            <Text style={styles.headerTrackName} numberOfLines={1}>{currentTrack.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Audio / Video Toggle ── */}
                    <View style={styles.toggleWrapper}>
                        <View style={[styles.toggleContainer, { width: toggleWidth }]}>
                            <Animated.View style={[styles.togglePill, {
                                width: pillWidth,
                                transform: [{ translateX: pillTranslate }]
                            }]} />
                            <TouchableOpacity style={styles.toggleOption} onPress={() => switchMode('audio')}>
                                <Ionicons name="musical-notes" size={14} color={mode === 'audio' ? 'white' : '#666'} />
                                <Text style={[styles.toggleText, mode === 'audio' && styles.toggleTextActive]}>Audio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toggleOption} onPress={() => switchMode('video')}>
                                <Ionicons name="videocam" size={14} color={mode === 'video' ? 'white' : '#666'} />
                                <Text style={[styles.toggleText, mode === 'video' && styles.toggleTextActive]}>Video</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Album Art ── */}
                    <View style={styles.albumArtWrapper}>
                        <Animated.View style={[styles.albumArtShadow, { transform: [{ scale: scaleAnim }] }]}>
                            <Image source={{ uri: currentTrack.image }} style={styles.albumArt} />
                        </Animated.View>
                    </View>

                    {/* ── Track Info + Like ── */}
                    <View style={styles.infoContainer}>
                        <View style={styles.textContainer}>
                            <Text style={styles.trackName} numberOfLines={1}>{currentTrack.name}</Text>
                            <Text style={styles.artistName} numberOfLines={1}>{currentTrack.artist}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLike}
                            disabled={isLiking}
                            style={styles.likeButton}
                        >
                            {isLiking ? (
                                <ActivityIndicator size="small" color="#1DB954" />
                            ) : (
                                <Ionicons
                                    name={isLiked ? 'heart' : 'heart-outline'}
                                    size={28}
                                    color={isLiked ? '#1DB954' : 'white'}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* ── Progress Bar ── */}
                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration > 0 ? duration : 1}
                            value={sliderValue}
                            onSlidingStart={() => setIsSliding(true)}
                            onValueChange={(val) => setSliderValue(val)}
                            onSlidingComplete={async (value) => {
                                await seekTo(value);
                                // Delay turning off sliding state so native player can catch up
                                setTimeout(() => {
                                    setIsSliding(false);
                                }, 400);
                            }}
                            minimumTrackTintColor="#1DB954"
                            maximumTrackTintColor="rgba(255,255,255,0.12)"
                            thumbTintColor="white"
                            tapToSeek={true}
                        />
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formatTime(isSliding ? sliderValue : currentTime)}</Text>
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    </View>

                    {/* ── Playback Controls ── */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity style={styles.controlBtn} onPress={() => handlePrev(tracks, currentTrack)}>
                            <Ionicons name="play-skip-back" size={32} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                            <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={36}
                                color="black"
                                style={!isPlaying && { marginLeft: 4 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtn} onPress={() => handleNext(tracks, currentTrack)}>
                            <Ionicons name="play-skip-forward" size={32} color="white" />
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a14',
    },
    bgGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: 'rgba(29, 185, 84, 0.07)',
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    headerLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 3,
    },
    headerTrackName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Toggle
    toggleWrapper: {
        alignItems: 'center',
        marginBottom: 28,
        marginTop: 6,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 30,
        padding: 3,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    togglePill: {
        position: 'absolute',
        top: 3,
        height: '100%',
        backgroundColor: '#1DB954',
        borderRadius: 30,
    },
    toggleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 5,
        zIndex: 1,
    },
    toggleText: {
        color: '#666',
        fontSize: 13,
        fontWeight: '700',
    },
    toggleTextActive: {
        color: 'white',
    },

    // Album Art
    albumArtWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    albumArtShadow: {
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    albumArt: {
        width: width - 64,
        height: width - 64,
        borderRadius: 16,
    },

    // Info
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        marginBottom: 22,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    trackName: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 5,
        letterSpacing: -0.5,
    },
    artistName: {
        color: '#999',
        fontSize: 15,
        fontWeight: '500',
    },
    likeButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Progress
    progressContainer: {
        paddingHorizontal: 28,
        marginBottom: 28,
    },
    slider: {
        width: '100%',
        height: 40,
        marginLeft: -10, // Account for default slider padding
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
    },

    // Controls
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        gap: 32,
    },
    controlBtn: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },

    // Volume
    volumeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        gap: 12,
        marginBottom: 8,
    },
    volumeBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    volumeFill: {
        width: '70%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 2,
    },

    // ─── Full Video Screen ───
    fullVideoContainer: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    videoLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#ccc',
        marginTop: 14,
        fontSize: 15,
        fontWeight: '500',
    },
    errorText: {
        color: '#ccc',
        marginTop: 14,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    backToAudioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
    },
    backToAudioText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 15,
    },

    // Floating overlays on video
    floatingTopBar: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 48 : 56,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 10,
    },
    floatingIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingTrackInfo: {
        flex: 1,
        marginLeft: 12,
    },
    floatingTrackName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    floatingArtistName: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        marginTop: 2,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    floatingBottomBar: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 40 : 56,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    floatingSwitchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    floatingSwitchText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default FullPlayerScreen;
