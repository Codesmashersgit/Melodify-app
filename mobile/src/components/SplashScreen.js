import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { user } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      // This will be handled automatically by conditional rendering in AppNavigator
      // No need to navigate manually
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Melodify Icon */}
        <Image
          source={require('../assets/melodify.png')}
          style={styles.icon}
        />

        {/* Title */}
        <Text style={styles.title}>Melodify</Text>
        <Text style={styles.subtitle}>Your Music, Your Way</Text>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="large"
          color="#FF8C00"
          style={styles.loader}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 40,
    letterSpacing: 1,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
