import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const GENRES = [
    { id: 'bollywood', label: 'Bollywood', emoji: '🎬' },
    { id: 'hollywood', label: 'Hollywood', emoji: '🌟' },
    { id: 'punjabi', label: 'Punjabi', emoji: '🥁' },
    { id: 'bhojpuri', label: 'Bhojpuri', emoji: '🔥' },
    { id: 'tamil', label: 'Tamil', emoji: '🌴' },
    { id: 'telugu', label: 'Telugu', emoji: '🌶️' },
    { id: 'lofi', label: 'Lo-Fi / Chill', emoji: '☕' },
    { id: 'hiphop', label: 'Hip-Hop', emoji: '🎧' },
    { id: 'indie', label: 'Indie', emoji: '🎸' },
    { id: 'devotional', label: 'Devotional', emoji: '🙏' },
    { id: 'kpop', label: 'K-Pop', emoji: '✨' },
    { id: 'rock', label: 'Rock', emoji: '🤘' },
    { id: 'electronic', label: 'Electronic', emoji: '⚡' },
    { id: 'workout', label: 'Workout', emoji: '💪' },
];

const PreferencesScreen = ({ navigation }) => {
    const { user, updatePreferences } = useAuth();
    const [selected, setSelected] = useState(user?.preferences || []);
    const insets = useSafeAreaInsets();

    const toggleGenre = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleContinue = async () => {
        await updatePreferences(selected);
        // If navigating from Profile, we might want to go back, else replace
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.replace('MainApp');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>What do you like?</Text>
                <Text style={styles.subtitle}>Pick your favorite languages and genres to get better recommendations.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {GENRES.map((genre) => {
                        const isSelected = selected.includes(genre.id);
                        return (
                            <TouchableOpacity
                                key={genre.id}
                                style={[styles.genreCard, isSelected && styles.genreCardSelected]}
                                onPress={() => toggleGenre(genre.id)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={isSelected ? ['#1DB954', '#0d5926'] : ['#1a1a24', '#111118']}
                                    style={styles.genreGradient}
                                >
                                    <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                                    <Text style={[styles.genreLabel, isSelected && { color: 'black' }]}>{genre.label}</Text>
                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <Ionicons name="checkmark-circle" size={20} color="black" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
                <TouchableOpacity
                    style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
                    onPress={handleContinue}
                    disabled={selected.length === 0}
                >
                    <Text style={styles.continueText}>
                        {selected.length === 0 ? 'Select at least one' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#08080f' },
    header: { padding: 24, marginTop: 20 },
    title: { color: 'white', fontSize: 32, fontWeight: '800', fontFamily: 'Montserrat_800ExtraBold', marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 16, lineHeight: 22 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    genreCard: {
        width: '48%',
        height: 120,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    genreCardSelected: {
        borderColor: '#1DB954',
        transform: [{ scale: 0.98 }]
    },
    genreGradient: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
    genreEmoji: { fontSize: 32, marginBottom: 8 },
    genreLabel: { color: 'white', fontSize: 15, fontWeight: '700', fontFamily: 'Montserrat_700Bold' },
    checkIcon: { position: 'absolute', top: 10, right: 10 },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#08080f',
        paddingHorizontal: 24, paddingVertical: 16,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    },
    continueBtn: {
        backgroundColor: '#1DB954',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueBtnDisabled: { backgroundColor: '#333' },
    continueText: { color: 'black', fontSize: 16, fontWeight: '700', fontFamily: 'Montserrat_700Bold' },
});

export default PreferencesScreen;
