import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View, Text, ScrollView, FlatList, Image, TouchableOpacity,
    StyleSheet, StatusBar, Dimensions, Animated, ImageBackground,
    RefreshControl, LinearGradient
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import NotificationsModal from '../components/NotificationsModal';
import { ArtistSkeletonRow, AlbumSkeletonRow, TrackSkeletonRow } from '../components/Skeleton';
import API_BASE_URL from '../config';

const { width } = Dimensions.get('window');

// ─── Mood Selector ──────────────────────────────────────────────
const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#F59E0B' },
    { id: 'sad', emoji: '😔', label: 'Sad', color: '#3B82F6' },
    { id: 'energetic', emoji: '🔥', label: 'Energetic', color: '#EF4444' },
    { id: 'chill', emoji: '😌', label: 'Chill', color: '#8B5CF6' },
];

// ─── HomeScreen ───────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
    const { artists, albums, tracks, playTrack, isLoading, refetchHomeData } = usePlayback();
    const { user } = useAuth();
    const [notifVisible, setNotifVisible] = useState(false);
    const [selectedMood, setSelectedMood] = useState('energetic');

    // Animated equalizer bars
    const barAnim1 = useRef(new Animated.Value(0.4)).current;
    const barAnim2 = useRef(new Animated.Value(0.7)).current;
    const barAnim3 = useRef(new Animated.Value(0.5)).current;
    const barAnim4 = useRef(new Animated.Value(0.9)).current;
    const barAnim5 = useRef(new Animated.Value(0.3)).current;

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const animateBar = (anim, toVal, duration) => {
            Animated.sequence([
                Animated.timing(anim, { toValue: toVal, duration, useNativeDriver: false }),
                Animated.timing(anim, { toValue: 0.2, duration, useNativeDriver: false }),
            ]).start(() => animateBar(anim, toVal, duration));
        };
        animateBar(barAnim1, 0.9, 400);
        animateBar(barAnim2, 0.5, 300);
        animateBar(barAnim3, 1.0, 500);
        animateBar(barAnim4, 0.6, 350);
        animateBar(barAnim5, 0.8, 250);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning ☀️';
        if (hour < 18) return 'Good afternoon 🎵';
        return 'Good evening 🌙';
    };

    const getVibeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'What are we feeling this morning? 🌅';
        if (hour < 18) return 'What are we feeling this afternoon? ☀️';
        return 'What are we feeling tonight? ✨';
    };

    const getMoodTracks = () => {
        if (!tracks || tracks.length === 0) return [];
        switch (selectedMood) {
            case 'happy': return tracks.slice(0, 10);
            case 'sad': return tracks.slice(2, 12);
            case 'energetic': return tracks.slice(4, 14);
            case 'chill': return tracks.slice(6, 16);
            default: return tracks.slice(0, 10);
        }
    };

    // Stable shuffle — only re-shuffles when tracks list itself changes
    const madeForYouTracks = useMemo(() => {
        if (!tracks || tracks.length === 0) return [];
        return [...tracks].sort(() => Math.random() - 0.5).slice(0, 10);
    }, [tracks]);

    // Track card (horizontal)
    const renderTrackCard = ({ item }) => (
        <TouchableOpacity
            style={styles.trackCard}
            activeOpacity={0.75}
            onPress={() => playTrack(item, tracks)}
        >
            <Image source={{ uri: item.image }} style={styles.trackCardImage} />
            <View style={styles.trackCardOverlay} />
            <View style={styles.trackCardInfo}>
                <Text style={styles.trackCardTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.trackCardArtist} numberOfLines={1}>{item.artist?.split(' - ')[0]}</Text>
            </View>
            <View style={styles.trackCardPlayBtn}>
                <Ionicons name="play" size={14} color="black" />
            </View>
        </TouchableOpacity>
    );

    // Album card — click plays the album's first song
    const [loadingAlbumId, setLoadingAlbumId] = useState(null);

    const handleAlbumPress = async (album) => {
        setLoadingAlbumId(album.id);
        try {
            const response = await fetch(`${API_BASE_URL}/api/album/${album.id}`);
            const data = await response.json();
            const albumTracks = (data.tracks || []).filter(t => {
                if (!t?.name) return false;
                const name = t.name.toLowerCase();
                // Filter out trailers, samples, promos etc.
                const junk = ['trailer', 'sample', 'testing', 'promo', 'making', 'teaser', 'dialogue', 'jukebox'];
                return !junk.some(j => name.includes(j));
            });

            if (albumTracks.length > 0) {
                // Play all valid album tracks
                playTrack(albumTracks[0], albumTracks);
            } else {
                // Fallback: play a random song from home screen tracks
                const homeTracks = tracks || [];
                if (homeTracks.length > 0) {
                    const random = homeTracks[Math.floor(Math.random() * homeTracks.length)];
                    playTrack(random, homeTracks);
                }
            }
        } catch (e) {
            console.error('Album fetch error:', e);
            // On error also fallback to random home track
            const homeTracks = tracks || [];
            if (homeTracks.length > 0) {
                const random = homeTracks[Math.floor(Math.random() * homeTracks.length)];
                playTrack(random, homeTracks);
            }
        } finally {
            setLoadingAlbumId(null);
        }
    };


    const renderAlbumCard = ({ item }) => (
        <TouchableOpacity
            style={styles.albumCard}
            activeOpacity={0.75}
            onPress={() => handleAlbumPress(item)}
        >
            <View style={{ position: 'relative' }}>
                <Image source={{ uri: item.image }} style={styles.albumImage} />
                {loadingAlbumId === item.id && (
                    <View style={styles.albumLoadingOverlay}>
                        <Ionicons name="musical-notes" size={22} color="#1DB954" />
                    </View>
                )}
            </View>
            <Text style={styles.albumTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.albumSubtitle} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    // Top hit row card
    const renderTopHitCard = ({ item }) => (
        <TouchableOpacity
            style={styles.topHitCard}
            activeOpacity={0.75}
            onPress={() => playTrack(item, tracks)}
        >
            <Image source={{ uri: item.image }} style={styles.topHitImage} />
            <View style={styles.topHitInfo}>
                <Text style={styles.topHitTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.topHitSubtitle} numberOfLines={1}>{item.artist?.split(' - ')[0]}</Text>
            </View>
            <Ionicons name="play-circle" size={32} color="#1DB954" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 170 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refetchHomeData}
                        tintColor="#1DB954"
                        colors={['#1DB954']}
                    />
                }
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.brandRow}>
                        <Image source={require('../assets/melodify.png')} style={styles.brandLogo} />
                        <Text style={styles.brandName}>Melodify</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setNotifVisible(true)} activeOpacity={0.75}>
                            <Ionicons name="notifications-outline" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.avatarBtn}
                            onPress={() => navigation.navigate('About')}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.avatarText}>
                                {(user?.name || user?.email || 'M')[0].toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Greeting ── */}
                <View style={styles.greetingBlock}>
                    <Text style={styles.greetingSmall}>{getGreeting()}</Text>
                    <Text style={styles.greetingName}>{user?.name?.split(' ')[0] || 'Welcome'}</Text>
                    <Text style={styles.greetingVibe}>{getVibeGreeting()}</Text>
                </View>

                {/* ── Hero Banner — Girl With Headphones ── */}
                <TouchableOpacity
                    activeOpacity={0.92}
                    style={styles.heroCard}
                    onPress={() => tracks?.length > 0 && playTrack(tracks[0], tracks)}
                >
                    <Image
                        source={require('../assets/girl_hero.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <ExpoLinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroTag}>
                            <Text style={styles.heroTagText}>🎵 YOUR VIBE</Text>
                        </View>
                        <View style={styles.heroBottom}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.heroTitle}>Lost In The Music</Text>
                                <Text style={styles.heroSub}>Your personal escape awaits</Text>
                            </View>
                            <View style={styles.heroPlayBtn}>
                                <Ionicons name="play" size={20} color="black" style={{ marginLeft: 2 }} />
                            </View>
                        </View>
                    </ExpoLinearGradient>
                </TouchableOpacity>

                {/* ── Quote Strip with Equalizer ── */}
                <View style={styles.quoteStrip}>
                    <View style={styles.equalizerRow}>
                        {[barAnim1, barAnim2, barAnim3, barAnim4, barAnim5].map((anim, i) => (
                            <Animated.View
                                key={i}
                                style={[styles.eqBar, { transform: [{ scaleY: anim }] }]}
                            />
                        ))}
                    </View>
                    <Text style={styles.quoteText}>Music is what feelings sound like... 🎧</Text>
                </View>

                {/* ── Trending Right Now ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <View>
                            <Text style={styles.sectionTitle}>🔥 Trending Right Now</Text>
                            <Text style={styles.sectionSubtitle}>Songs everyone's talking about</Text>
                        </View>
                    </View>
                    {isLoading ? <TrackSkeletonRow /> : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={tracks || []}
                            keyExtractor={(item) => 'trend-' + item.id}
                            renderItem={renderTrackCard}
                            contentContainerStyle={styles.horizontalList}
                        />
                    )}
                </View>

                {/* ── Your Vibe Today (Genre Cards) ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <View>
                            <Text style={styles.sectionTitle}>💫 Your Vibe Today</Text>
                            <Text style={styles.sectionSubtitle}>Based on your preferences</Text>
                        </View>
                    </View>
                    <View style={styles.genreRow}>
                        {(() => {
                            const prefs = user?.preferences?.length > 0 ? user.preferences : ['bollywood', 'hiphop'];
                            const getGenreDetails = (p) => {
                                switch(p.toLowerCase()) {
                                    case 'bollywood': return { label: 'Bollywood', emoji: '🎬', colors: ['#FF6B35', '#D62828'] };
                                    case 'hollywood': return { label: 'Hollywood', emoji: '🌟', colors: ['#3A86FF', '#004E98'] };
                                    case 'punjabi': return { label: 'Punjabi', emoji: '🥁', colors: ['#FFBE0B', '#E56B6F'] };
                                    case 'bhojpuri': return { label: 'Bhojpuri', emoji: '🔥', colors: ['#FB5607', '#9D0208'] };
                                    case 'tamil': return { label: 'Tamil', emoji: '🌴', colors: ['#8338EC', '#3A0CA3'] };
                                    case 'lofi': return { label: 'Lo-Fi', emoji: '☕', colors: ['#9D4EDD', '#5A189A'] };
                                    case 'hiphop': return { label: 'Hip Hop', emoji: '🎧', colors: ['#4C1D95', '#1e1b4b'] };
                                    case 'indie': return { label: 'Indie', emoji: '🎸', colors: ['#06D6A0', '#073B4C'] };
                                    default: return { label: p.charAt(0).toUpperCase() + p.slice(1), emoji: '🎵', colors: ['#1DB954', '#0d5926'] };
                                }
                            };

                            const card1 = getGenreDetails(prefs[0]);
                            const card2 = getGenreDetails(prefs[1] || prefs[0]);

                            return (
                                <>
                                    <TouchableOpacity style={[styles.genreCard, { backgroundColor: '#0d0d0d' }]} activeOpacity={0.85}
                                        onPress={() => tracks?.length > 0 && playTrack(tracks[0], tracks)}>
                                        <ExpoLinearGradient colors={card1.colors} style={styles.genreGradient} start={{x:0,y:0}} end={{x:1,y:1}}>
                                            <Text style={styles.genreEmoji}>{card1.emoji}</Text>
                                            <Text style={styles.genreLabel}>{card1.label}</Text>
                                            <Text style={styles.genreTap}>Tap to explore →</Text>
                                        </ExpoLinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.genreCard, { backgroundColor: '#0d0d0d' }]} activeOpacity={0.85}
                                        onPress={() => tracks?.length > 5 && playTrack(tracks[5], tracks)}>
                                        <ExpoLinearGradient colors={card2.colors} style={styles.genreGradient} start={{x:0,y:0}} end={{x:1,y:1}}>
                                            <Text style={styles.genreEmoji}>{card2.emoji}</Text>
                                            <Text style={styles.genreLabel}>{card2.label}</Text>
                                            <Text style={styles.genreTap}>Tap to explore →</Text>
                                        </ExpoLinearGradient>
                                    </TouchableOpacity>
                                </>
                            );
                        })()}
                    </View>
                </View>

                {/* ── Popular Artists ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>🧑‍🎤 Artists You'll Love</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { type: 'artists', title: 'Popular Artists' })} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? <ArtistSkeletonRow /> : (
                        <View style={styles.artistRow}>
                            {(artists || []).slice(0, 4).map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.artistCard}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
                                >
                                    <Image source={{ uri: item.image }} style={styles.artistImage} />
                                    <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* ── Mood Selector ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <View>
                            <Text style={styles.sectionTitle}>🎭 How Are You Feeling?</Text>
                            <Text style={styles.sectionSubtitle}>We'll find perfect songs for you</Text>
                        </View>
                    </View>
                    <View style={styles.moodRow}>
                        {MOODS.map((mood) => (
                            <TouchableOpacity
                                key={mood.id}
                                style={[
                                    styles.moodPill,
                                    selectedMood === mood.id
                                        ? { backgroundColor: '#1DB954', borderColor: '#1DB954' }
                                        : { borderColor: mood.color }
                                ]}
                                onPress={() => {
                                    setSelectedMood(mood.id);
                                    const moodTracks = getMoodTracks();
                                    if (moodTracks.length > 0) playTrack(moodTracks[0], moodTracks);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                <Text style={[
                                    styles.moodLabel,
                                    selectedMood === mood.id ? { color: 'black' } : { color: 'white' }
                                ]}>{mood.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Popular Albums ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>💿 Popular Albums</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { type: 'albums', title: 'Popular Albums' })} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? <AlbumSkeletonRow /> : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={albums || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderAlbumCard}
                            contentContainerStyle={styles.horizontalList}
                        />
                    )}
                </View>

                {/* ── Top Hits ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>🎵 Top Hits</Text>
                        <TouchableOpacity onPress={() => tracks?.length > 0 && playTrack(tracks[0], tracks)} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>Play all ▶</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? <TrackSkeletonRow /> : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={tracks || []}
                            keyExtractor={(item) => 'hit-' + item.id}
                            renderItem={renderTopHitCard}
                            contentContainerStyle={styles.horizontalList}
                        />
                    )}
                </View>

                {/* ── Late Night Listens ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <View>
                            <Text style={styles.sectionTitle}>🌙 Late Night Listens</Text>
                            <Text style={styles.sectionSubtitle}>Perfect for the night 🌃</Text>
                        </View>
                    </View>
                    {isLoading ? <TrackSkeletonRow /> : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={[...(tracks || [])].reverse()}
                            keyExtractor={(item, i) => 'night-' + item.id + i}
                            renderItem={renderTrackCard}
                            contentContainerStyle={styles.horizontalList}
                        />
                    )}
                </View>

                {/* ── Concert Banner ── */}
                <TouchableOpacity
                    activeOpacity={0.92}
                    style={styles.concertCard}
                    onPress={() => tracks?.length > 3 && playTrack(tracks[3], tracks)}
                >
                    <Image
                        source={{ uri: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=900' }}
                        style={styles.concertImage}
                        resizeMode="cover"
                    />
                    <ExpoLinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
                        style={styles.concertGradient}
                    >
                        <View style={styles.concertContent}>
                            <View>
                                <Text style={styles.concertLabel}>🎤 LIVE VIBES</Text>
                                <Text style={styles.concertTitle}>Feel The Energy</Text>
                                <Text style={styles.concertSub}>Stage lights, crowd, pure music magic</Text>
                            </View>
                            <View style={styles.concertPlayBtn}>
                                <Ionicons name="play" size={22} color="black" style={{ marginLeft: 2 }} />
                            </View>
                        </View>
                    </ExpoLinearGradient>
                </TouchableOpacity>

                {/* ── Your Daily Mix ── */}
                <TouchableOpacity
                    style={styles.dailyMixCard}
                    activeOpacity={0.88}
                    onPress={() => tracks?.length > 0 && playTrack(tracks[Math.floor(Math.random() * tracks.length)], tracks)}
                >
                    <ExpoLinearGradient
                        colors={['#0f3d20', '#0a1a10']}
                        style={styles.dailyMixGradient}
                        start={{x:0,y:0}} end={{x:1,y:1}}
                    >
                        <Ionicons name="disc-outline" size={50} color="#1DB954" style={{ marginRight: 16 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dailyMixTitle}>🎯 Your Daily Mix</Text>
                            <Text style={styles.dailyMixSub}>Handpicked just for you today</Text>
                        </View>
                        <View style={styles.dailyMixBtn}>
                            <Ionicons name="shuffle" size={18} color="black" />
                        </View>
                    </ExpoLinearGradient>
                </TouchableOpacity>

                {/* ── Made For You ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>✨ Made For You</Text>
                        <TouchableOpacity onPress={() => tracks?.length > 0 && playTrack(tracks[tracks.length - 1], tracks)} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>Play all ▶</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? <TrackSkeletonRow /> : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={madeForYouTracks}
                            keyExtractor={(item, i) => 'made-' + item.id + i}
                            renderItem={renderTopHitCard}
                            contentContainerStyle={styles.horizontalList}
                        />
                    )}
                </View>

                {/* ── Developer Footer ── */}
                <View style={styles.devFooter}>
                    <Text style={styles.devFooterText}>Made with ❤️ by Sudhanshu</Text>
                    <Text style={styles.devFooterSub}>Melodify Version 3.0</Text>
                </View>

            </ScrollView>

            <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#08080f' },
    scrollContent: {},

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandLogo: { width: 32, height: 32, borderRadius: 8 },
    brandName: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        fontFamily: 'Montserrat_800ExtraBold',
        letterSpacing: -0.5,
    },
    headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(29,185,84,0.4)',
    },
    avatarText: { color: 'black', fontWeight: '800', fontSize: 16 },

    // Greeting
    greetingBlock: { paddingHorizontal: 20, marginBottom: 22 },
    greetingSmall: {
        color: '#888', fontSize: 12,
        fontWeight: '500',
        letterSpacing: 1.5, textTransform: 'uppercase',
        marginBottom: 4,
    },
    greetingName: {
        color: 'white', fontSize: 38,
        fontWeight: '800',
        fontFamily: 'Montserrat_800ExtraBold',
        letterSpacing: -1, marginBottom: 6,
    },
    greetingVibe: {
        color: '#888', fontSize: 15,
        fontStyle: 'italic',
        fontWeight: '400',
    },

    // Hero Card
    heroCard: {
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        height: 220,
        marginBottom: 14,
    },
    heroImage: { width: '100%', height: '100%', position: 'absolute' },
    heroGradient: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '70%',
        padding: 16,
        justifyContent: 'space-between',
    },
    heroTag: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(29,185,84,0.85)',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20,
    },
    heroTagText: { color: 'white', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    heroBottom: { flexDirection: 'row', alignItems: 'flex-end' },
    heroTitle: {
        color: 'white', fontSize: 22, fontWeight: '800',
        fontFamily: 'Montserrat_800ExtraBold',
        marginBottom: 4,
    },
    heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '400' },
    heroPlayBtn: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
        elevation: 6,
    },

    // Quote Strip
    quoteStrip: {
        marginHorizontal: 16,
        marginBottom: 28,
        backgroundColor: '#0d0a1e',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    equalizerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 24 },
    eqBar: {
        width: 3, height: 24, borderRadius: 2,
        backgroundColor: '#1DB954',
        transformOrigin: 'bottom',
    },
    quoteText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13, fontStyle: 'italic',
        fontWeight: '400', flex: 1,
        lineHeight: 19,
    },

    // Sections
    sectionContainer: { marginBottom: 28 },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    sectionTitle: {
        color: 'white', fontSize: 18, fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
    },
    sectionSubtitle: { color: '#666', fontSize: 12, fontWeight: '400', marginTop: 2 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
    seeAll: { color: '#1DB954', fontSize: 13, fontWeight: '600' },
    horizontalList: { paddingLeft: 16, paddingRight: 8 },

    // Track Card (large)
    trackCard: {
        width: 140, height: 180,
        borderRadius: 14, overflow: 'hidden',
        marginRight: 12,
    },
    trackCardImage: { width: '100%', height: '100%', position: 'absolute' },
    trackCardOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        backgroundColor: 'rgba(0,0,0,0.75)',
    },
    trackCardInfo: {
        position: 'absolute', bottom: 36, left: 10, right: 10,
    },
    trackCardTitle: { color: 'white', fontSize: 13, fontWeight: '700', marginBottom: 2 },
    trackCardArtist: { color: '#aaa', fontSize: 11 },
    trackCardPlayBtn: {
        position: 'absolute', bottom: 8, right: 8,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
    },

    // Album Card
    albumCard: { width: 130, marginRight: 12 },
    albumImage: { width: 130, height: 130, borderRadius: 12, marginBottom: 8 },
    albumLoadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 8,
        borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    albumTitle: { color: 'white', fontSize: 12, fontWeight: '600', marginBottom: 2 },

    albumSubtitle: { color: '#777', fontSize: 11 },

    // Top Hit Card
    topHitCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#111118',
        borderRadius: 12, padding: 10,
        width: 250, marginRight: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    topHitImage: { width: 50, height: 50, borderRadius: 10 },
    topHitInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
    topHitTitle: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 3 },
    topHitSubtitle: { color: '#888', fontSize: 12 },

    // Artist Card
    artistRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
    artistCard: { alignItems: 'center', width: (width - 64) / 4 },
    artistImage: {
        width: (width - 80) / 4,
        height: (width - 80) / 4,
        borderRadius: 100, marginBottom: 8,
        borderWidth: 2, borderColor: '#1DB954',
    },
    artistName: { color: 'white', fontSize: 11, fontWeight: '600', textAlign: 'center' },

    // Mood Selector
    moodRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, flexWrap: 'wrap' },
    moodPill: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.04)',
        gap: 5,
    },
    moodEmoji: { fontSize: 16 },
    moodLabel: { fontSize: 13, fontWeight: '600' },

    // Genre Cards
    genreRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
    genreCard: { flex: 1, borderRadius: 16, overflow: 'hidden', height: 110 },
    genreGradient: { flex: 1, padding: 16, justifyContent: 'space-between' },
    genreEmoji: { fontSize: 28 },
    genreLabel: { color: 'white', fontSize: 17, fontWeight: '800', fontFamily: 'Montserrat_800ExtraBold' },
    genreTap: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

    // Concert Banner
    concertCard: {
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        height: 200,
        marginBottom: 16,
    },
    concertImage: { width: '100%', height: '100%', position: 'absolute' },
    concertGradient: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '80%',
        padding: 18,
        justifyContent: 'flex-end',
    },
    concertContent: { flexDirection: 'row', alignItems: 'flex-end' },
    concertLabel: { color: '#1DB954', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
    concertTitle: {
        color: 'white', fontSize: 24, fontWeight: '800',
        fontFamily: 'Montserrat_800ExtraBold', marginBottom: 4,
    },
    concertSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
    concertPlayBtn: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
        elevation: 8,
        shadowColor: '#1DB954', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
    },

    // Daily Mix Card
    dailyMixCard: {
        marginHorizontal: 16,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 28,
    },
    dailyMixGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    dailyMixTitle: {
        color: 'white', fontSize: 17, fontWeight: '700',
        fontFamily: 'Montserrat_700Bold', marginBottom: 4,
    },
    dailyMixSub: { color: '#888', fontSize: 12 },
    dailyMixBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
    },

    // Developer Footer
    devFooter: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
        opacity: 0.6,
    },
    devFooterText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    devFooterSub: {
        color: '#888',
        fontSize: 10,
        marginTop: 4,
    },
});

export default HomeScreen;