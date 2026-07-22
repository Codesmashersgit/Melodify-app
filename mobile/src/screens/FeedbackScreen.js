import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config';

const EMOJIS = ['😞', '😕', '😐', '😊', '🤩'];
const LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing!'];

const FeedbackScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before submitting.');
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('melodify_token');
            await axios.post(
                `${API_BASE_URL}/api/user/feedback`,
                { rating, comment: comment.trim(), platform: 'apk' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmitted(true);
        } catch (error) {
            console.error('Feedback error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <View style={styles.successContainer}>
                    <View style={styles.successCircle}>
                        <Text style={styles.successEmoji}>🎉</Text>
                    </View>
                    <Text style={styles.successTitle}>Thank You!</Text>
                    <Text style={styles.successSubtitle}>
                        Your feedback means the world to us. We'll use it to make Melodify even better for you.
                    </Text>
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#000" />
                        <Text style={styles.doneBtnText}>Back to Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0b0b12' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rate & Review</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* App Info Section */}
                    <View style={styles.appSection}>
                        <View style={styles.appIconContainer}>
                            <Text style={styles.appIconEmoji}>🎵</Text>
                        </View>
                        <Text style={styles.appName}>Melodify</Text>
                        <Text style={styles.appTagline}>Your Premium Music Experience</Text>
                    </View>

                    {/* Rating Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>How would you rate your experience?</Text>

                        {/* Emoji Picker */}
                        <View style={styles.emojiRow}>
                            {EMOJIS.map((emoji, index) => {
                                const starValue = index + 1;
                                const isSelected = rating === starValue;
                                const isHighlighted = rating >= starValue;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.emojiBtn,
                                            isSelected && styles.emojiBtnSelected,
                                        ]}
                                        onPress={() => setRating(starValue)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.emojiText, isSelected && styles.emojiTextSelected]}>
                                            {emoji}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Star Rating Row */}
                        <View style={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    style={styles.starBtn}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={rating >= star ? 'star' : 'star-outline'}
                                        size={36}
                                        color={rating >= star ? '#FFD700' : 'rgba(255,255,255,0.2)'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {rating > 0 && (
                            <Text style={styles.ratingLabel}>{LABELS[rating - 1]}</Text>
                        )}
                    </View>

                    {/* Comment Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Share your thoughts (optional)</Text>
                        <TextInput
                            style={styles.commentBox}
                            placeholder="Tell us what you love or what we can improve..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                            returnKeyType="default"
                        />
                        <Text style={styles.charCount}>{comment.length}/500</Text>
                    </View>

                    {/* Quick Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>What stands out?</Text>
                        <View style={styles.tagRow}>
                            {['🎵 Great Music', '⚡ Fast & Smooth', '🎨 Beautiful UI', '🔍 Easy to Search', '📻 Audio Quality', '❤️ Song Discovery'].map((tag) => {
                                const isTagged = comment.includes(tag);
                                return (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[styles.tag, isTagged && styles.tagSelected]}
                                        onPress={() => {
                                            if (isTagged) {
                                                setComment(prev => prev.replace(tag, '').trim().replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/,\s*,/, ','));
                                            } else {
                                                setComment(prev => prev ? `${prev}, ${tag}` : tag);
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.tagText, isTagged && styles.tagTextSelected]}>{tag}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button - Floating */}
                <View style={[styles.submitContainer, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (loading || rating === 0) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || rating === 0}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" size="small" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.submitBtnText}>Submit Feedback</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b12',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    appSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    appIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(29,185,84,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(29,185,84,0.3)',
    },
    appIconEmoji: {
        fontSize: 40,
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    section: {
        marginBottom: 28,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
    },
    emojiRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    emojiBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    emojiBtnSelected: {
        backgroundColor: 'rgba(255,215,0,0.12)',
        borderColor: '#FFD700',
    },
    emojiText: {
        fontSize: 26,
        opacity: 0.5,
    },
    emojiTextSelected: {
        opacity: 1,
    },
    starRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    starBtn: {
        padding: 4,
    },
    ratingLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFD700',
        letterSpacing: 0.5,
    },
    commentBox: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 16,
        color: 'white',
        fontSize: 15,
        minHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    charCount: {
        textAlign: 'right',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        marginTop: 6,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    tagSelected: {
        backgroundColor: 'rgba(29,185,84,0.15)',
        borderColor: '#1DB954',
    },
    tagText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontWeight: '500',
    },
    tagTextSelected: {
        color: '#1DB954',
        fontWeight: '700',
    },
    submitContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: 'rgba(11,11,18,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    submitBtn: {
        backgroundColor: '#1DB954',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: 'rgba(29,185,84,0.3)',
    },
    submitBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    // Success State
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(29,185,84,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        borderWidth: 2,
        borderColor: 'rgba(29,185,84,0.3)',
    },
    successEmoji: {
        fontSize: 56,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    successSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    doneBtn: {
        backgroundColor: '#1DB954',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    doneBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default FeedbackScreen;
