import React, { useState } from 'react';
import {
    View, Text, ScrollView, FlatList, Image, TouchableOpacity,
    StyleSheet, StatusBar, Dimensions,
    Alert, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayback } from '../context/PlaybackContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import NotificationsModal from '../components/NotificationsModal';
import SettingsModal from '../components/SettingsModal';
import { ArtistSkeletonRow, AlbumSkeletonRow, TrackSkeletonRow } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const artistCardWidth = (width - 56) / 2;

// ─── HomeScreen ───────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
    const { artists, albums, tracks, playTrack, isLoading, refetchHomeData } = usePlayback();
    const { user, logout } = useAuth();
    const [notifVisible, setNotifVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    const insets = useSafeAreaInsets();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning ☀️';
        if (hour < 18) return 'Good afternoon 🎵';
        return 'Good evening 🌙';
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => {
                setSettingsVisible(false);
                logout();
            }},
        ]);
    };

    const renderItem = ({ item, type }) => {
        if (type === 'track') {
            return (
                <TouchableOpacity
                    style={styles.topHitCard}
                    activeOpacity={0.75}
                    onPress={() => playTrack(item)}
                >
                    <Image source={{ uri: item.image }} style={styles.topHitImage} />
                    <View style={styles.topHitInfo}>
                        <Text style={styles.topHitTitle} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.topHitSubtitle} numberOfLines={1}>{item.artist}</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
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
    };

    const renderArtistGrid = () => (
        <View style={styles.artistRow}>
            {artists.slice(0, 4).map((item) => (
                <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.artistWrapCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.image })}
                >
                    <Image source={{ uri: item.image }} style={styles.artistWrapCardImage} />
                    <Text style={styles.artistWrapCardTitle} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 32, paddingBottom: 160 }]}
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
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.subGreeting}>
                            {user?.name ? user.name : 'Welcome'}
                        </Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setNotifVisible(true)}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="notifications-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setSettingsVisible(true)}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="settings-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Featured Banner ── */}
                <View style={styles.featuredBanner}>
                    <View style={styles.featuredIconBox}>
                        <Ionicons name="headset" size={28} color="#1DB954" />
                    </View>
                    <View style={styles.featuredTextContent}>
                        <Text style={styles.featuredTitle}>Discover Music</Text>
                        <Text style={styles.featuredSub}>Stream millions of songs</Text>
                    </View>
                </View>

                {/* ── Popular Artists ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Popular Artists</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { type: 'artists', title: 'Popular Artists' })} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? <ArtistSkeletonRow /> : renderArtistGrid()}
                </View>

                {/* ── Popular Albums ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Popular Albums</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SeeAll', { type: 'albums', title: 'Popular Albums' })} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? (
                        <AlbumSkeletonRow />
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={albums || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => renderItem({ item, type: 'album' })}
                            contentContainerStyle={styles.horizontalList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Albums load nahi ho paaye. Neeche kheech kar phir try karein.</Text>
                            }
                        />
                    )}
                </View>

                {/* ── Top Hits ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Top Hits</Text>
                        <TouchableOpacity onPress={() => tracks?.length > 0 && playTrack(tracks[0], tracks)} style={styles.seeAllBtn}>
                            <Text style={styles.seeAll}>Play all</Text>
                            <Ionicons name="play" size={12} color="#1DB954" style={{marginLeft: 4}} />
                        </TouchableOpacity>
                    </View>
                    {isLoading ? (
                        <TrackSkeletonRow />
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={tracks || []}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => renderItem({ item, type: 'track' })}
                            contentContainerStyle={styles.topHitsList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Tracks load nahi ho paaye. Neeche kheech kar phir try karein.</Text>
                            }
                        />
                    )}
                </View>
            </ScrollView>

            {/* ── Modals ── */}
            <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    scrollContent: {
        // dynamic padding applied inline
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1DB954', // Exact Green from mockup
        letterSpacing: -0.5,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    // Featured Banner
    featuredBanner: {
        marginHorizontal: 16,
        marginBottom: 32,
        backgroundColor: '#17221A', // Dark greenish background
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#244530', // Faint green border
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    featuredIconBox: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#203A2B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featuredTextContent: {
        flex: 1,
    },
    featuredTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    featuredSub: {
        color: '#8A9A90',
        fontSize: 13,
        fontWeight: '500',
    },

    // Sections
    sectionContainer: {
        marginBottom: 32,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.3,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAll: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '600',
    },
    horizontalList: {
        paddingLeft: 16,
        paddingRight: 8,
        paddingBottom: 4,
    },
    topHitsList: {
        paddingLeft: 16,
        paddingRight: 8,
        paddingBottom: 4,
    },

    // Album Cards
    albumCard: {
        width: 120,
        marginRight: 12,
    },
    albumImageContainer: {
        width: 120,
        height: 120,
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
        fontSize: 14,
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

    // Top Hit Card
    topHitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 8,
        width: 240,
        marginRight: 12,
    },
    topHitImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    topHitInfo: {
        marginLeft: 12,
        flex: 1,
    },
    topHitTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    topHitSubtitle: {
        color: '#999',
        fontSize: 12,
    },

    // Artist Wrap
    artistRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    artistWrapCard: {
        alignItems: 'center',
        width: (width - 64) / 4, // 4 items with total 32px padding and 3 * 10px gaps
    },
    artistWrapCardImage: {
        width: (width - 80) / 4,
        height: (width - 80) / 4,
        borderRadius: 100,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    artistWrapCardTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Modals (removed - using separate components)

    emptyText: {
        color: '#8A9A90',
        fontSize: 12,
        paddingHorizontal: 16,
        width: width - 32,
    },
});

export default HomeScreen;