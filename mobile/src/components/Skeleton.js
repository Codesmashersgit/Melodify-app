import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ─── Base shimmer block ───────────────────────────────────────
export const SkeletonBlock = ({ width: w, height: h, borderRadius = 8, style }) => {
    const opacity = useRef(new Animated.Value(0.35)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.85,
                    duration: 650,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.35,
                    duration: 650,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: w,
                    height: h,
                    borderRadius,
                    backgroundColor: '#232330',
                    opacity,
                },
                style,
            ]}
        />
    );
};

// ─── Popular Artists skeleton row (4 circles) ─────────────────
export const ArtistSkeletonRow = () => {
    const circleSize = (width - 80) / 4;
    return (
        <View style={styles.artistRow}>
            {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ alignItems: 'center', width: (width - 64) / 4 }}>
                    <SkeletonBlock width={circleSize} height={circleSize} borderRadius={100} />
                    <SkeletonBlock width={circleSize * 0.6} height={10} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
            ))}
        </View>
    );
};

// ─── Popular Albums skeleton row (horizontal cards) ───────────
export const AlbumSkeletonRow = () => (
    <View style={styles.horizontalRow}>
        {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: 120, marginRight: 12 }}>
                <SkeletonBlock width={120} height={120} borderRadius={12} />
                <SkeletonBlock width={80} height={11} borderRadius={4} style={{ marginTop: 8 }} />
                <SkeletonBlock width={60} height={10} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
        ))}
    </View>
);

// ─── Top Hits skeleton row (horizontal list cards) ────────────
export const TrackSkeletonRow = () => (
    <View style={styles.horizontalRow}>
        {[0, 1, 2].map((i) => (
            <View key={i} style={styles.trackCard}>
                <SkeletonBlock width={50} height={50} borderRadius={6} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <SkeletonBlock width={110} height={12} borderRadius={4} />
                    <SkeletonBlock width={70} height={10} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    artistRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    horizontalRow: {
        flexDirection: 'row',
        paddingLeft: 16,
        paddingRight: 8,
    },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 8,
        width: 240,
        marginRight: 12,
    },
});