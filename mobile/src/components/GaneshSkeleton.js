import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Image } from 'react-native';

const GaneshSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();
    }, [pulseAnim, rotateAnim, shimmerAnim]);

    const scale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05]
    });

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1]
    });

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200]
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.glowContainer, { transform: [{ rotate }] }]}>
                {/* Radiating background rays */}
                {[0, 45, 90, 135].map(deg => (
                    <View key={deg} style={[styles.ray, { transform: [{ rotate: \`\${deg}deg\` }] }]} />
                ))}
            </Animated.View>

            <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
                <Image 
                    source={require('../assets/ganesh_skeleton.jpg')} 
                    style={styles.image} 
                />
                <View style={styles.shimmerContainer}>
                    <Animated.View style={[styles.shimmerSweep, { transform: [{ translateX: shimmerTranslate }] }]} />
                </View>
            </Animated.View>
            
            <Text style={styles.subText}>LOADING MELODIFY...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        minHeight: 500,
    },
    glowContainer: {
        position: 'absolute',
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ray: {
        position: 'absolute',
        width: 300,
        height: 60,
        backgroundColor: 'rgba(255, 204, 0, 0.05)',
        borderRadius: 30,
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: 'hidden',
        shadowColor: '#FFCC00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    shimmerContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shimmerSweep: {
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        transform: [{ skewX: '-20deg' }],
    },
    subText: {
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 30,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});

export default GaneshSkeleton;
